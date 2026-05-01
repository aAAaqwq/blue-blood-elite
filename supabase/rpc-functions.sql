-- ============================================================
-- 蓝血菁英 - Vite 迁移所需的 Supabase RPC 函数
-- 这些函数用 SECURITY DEFINER 运行，绕过 RLS 执行事务性操作
-- 在 Supabase SQL Editor 中执行此脚本
-- ============================================================

-- 1. 接受申请（发布者操作）
-- 更新申请状态 + 拒绝其他申请 + 更新任务状态 + 创建通知
CREATE OR REPLACE FUNCTION accept_application(p_app_id uuid, p_bounty_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_applicant_id uuid;
  v_publisher_id uuid;
BEGIN
  -- 获取申请信息
  SELECT applicant_id INTO v_applicant_id FROM applications WHERE id = p_app_id;
  -- 获取发布者
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;

  -- 验证调用者是发布者
  IF v_publisher_id IS NULL OR v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作：只有任务发布者可以接受申请';
  END IF;

  -- 验证申请状态
  IF NOT EXISTS (SELECT 1 FROM applications WHERE id = p_app_id AND status = 'pending') THEN
    RAISE EXCEPTION '申请不存在或已处理';
  END IF;

  -- 验证任务状态
  IF NOT EXISTS (SELECT 1 FROM bounties WHERE id = p_bounty_id AND status = 'open') THEN
    RAISE EXCEPTION '任务状态不允许此操作';
  END IF;

  -- 更新申请状态
  UPDATE applications SET status = 'accepted', reviewed_at = now() WHERE id = p_app_id;

  -- 拒绝其他待处理申请
  UPDATE applications SET status = 'rejected', reviewed_at = now()
    WHERE bounty_id = p_bounty_id AND status = 'pending' AND id != p_app_id;

  -- 更新任务状态为进行中
  UPDATE bounties SET status = 'in_progress', claimed_by = v_applicant_id, claimed_at = now()
    WHERE id = p_bounty_id;

  -- 通知申请者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_applicant_id, 'application_accepted', '申请已通过',
            '恭喜！您的任务申请已被接受，请尽快开始工作。', p_bounty_id);
END;
$$;

-- 2. 拒绝申请（发布者操作）
CREATE OR REPLACE FUNCTION reject_application(p_app_id uuid, p_bounty_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_applicant_id uuid;
  v_publisher_id uuid;
BEGIN
  SELECT applicant_id INTO v_applicant_id FROM applications WHERE id = p_app_id;
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;

  IF v_publisher_id IS NULL OR v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM applications WHERE id = p_app_id AND status = 'pending') THEN
    RAISE EXCEPTION '申请不存在或已处理';
  END IF;

  -- 更新申请状态
  UPDATE applications SET status = 'rejected', reviewed_at = now() WHERE id = p_app_id;

  -- 通知申请者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_applicant_id, 'application_rejected', '申请未通过',
            '您的任务申请未被接受，继续寻找其他机会吧。', p_bounty_id);
END;
$$;

-- 3. 接受交付（发布者操作）
CREATE OR REPLACE FUNCTION accept_delivery(p_delivery_id uuid, p_bounty_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_claimed_by uuid;
BEGIN
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;
  SELECT claimed_by INTO v_claimed_by FROM bounties WHERE id = p_bounty_id;

  IF v_publisher_id IS NULL OR v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作';
  END IF;

  -- 验证交付状态
  IF NOT EXISTS (SELECT 1 FROM deliveries WHERE id = p_delivery_id AND status = 'submitted') THEN
    RAISE EXCEPTION '交付不存在或已处理';
  END IF;

  -- 验证任务状态
  IF NOT EXISTS (SELECT 1 FROM bounties WHERE id = p_bounty_id AND status = 'delivered') THEN
    RAISE EXCEPTION '任务状态不允许此操作';
  END IF;

  -- 更新交付状态
  UPDATE deliveries SET status = 'accepted', reviewed_at = now() WHERE id = p_delivery_id;

  -- 更新任务状态为已完成
  UPDATE bounties SET status = 'completed', completed_at = now() WHERE id = p_bounty_id;

  -- 通知交付者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_claimed_by, 'delivery_accepted', '交付已确认',
            '您的任务交付已被确认通过！', p_bounty_id);
END;
$$;

-- 4. 拒绝交付（发布者操作）
CREATE OR REPLACE FUNCTION reject_delivery(p_delivery_id uuid, p_bounty_id uuid, p_review_note text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_claimed_by uuid;
  v_content text;
BEGIN
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;
  SELECT claimed_by INTO v_claimed_by FROM bounties WHERE id = p_bounty_id;

  IF v_publisher_id IS NULL OR v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM deliveries WHERE id = p_delivery_id AND status = 'submitted') THEN
    RAISE EXCEPTION '交付不存在或已处理';
  END IF;

  -- 更新交付状态
  UPDATE deliveries SET status = 'rejected', review_note = p_review_note, reviewed_at = now()
    WHERE id = p_delivery_id;

  -- 恢复任务状态为进行中
  UPDATE bounties SET status = 'in_progress', delivered_at = NULL WHERE id = p_bounty_id;

  -- 通知交付者
  v_content := CASE WHEN p_review_note IS NOT NULL
    THEN '您的任务交付未通过审核。原因：' || p_review_note
    ELSE '您的任务交付未通过审核，请重新提交。' END;

  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_claimed_by, 'delivery_rejected', '交付未通过', v_content, p_bounty_id);
END;
$$;

-- 5. 取消任务（发布者操作）
CREATE OR REPLACE FUNCTION cancel_bounty(p_bounty_id uuid, p_cancel_reason text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_applicant RECORD;
BEGIN
  SELECT publisher_id INTO v_publisher_id FROM bounties WHERE id = p_bounty_id;

  IF v_publisher_id IS NULL OR v_publisher_id != auth.uid() THEN
    RAISE EXCEPTION '无权操作';
  END IF;

  -- 更新任务状态
  UPDATE bounties SET status = 'cancelled', cancel_reason = p_cancel_reason, cancelled_at = now()
    WHERE id = p_bounty_id;

  -- 通知所有待处理申请者
  FOR v_applicant IN
    SELECT applicant_id FROM applications WHERE bounty_id = p_bounty_id AND status = 'pending'
  LOOP
    INSERT INTO notifications (user_id, type, title, content, related_id)
      VALUES (v_applicant.applicant_id, 'bounty_cancelled', '任务已取消',
              '您申请的任务已被发布者取消。', p_bounty_id);
  END LOOP;
END;
$$;

-- 6. 申请任务（认证用户）
CREATE OR REPLACE FUNCTION apply_for_bounty(p_bounty_id uuid, p_message text, p_applicant_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_bounty_status text;
  v_new_id uuid;
BEGIN
  -- 验证调用者身份
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '请先登录';
  END IF;

  IF auth.uid() != p_applicant_id THEN
    RAISE EXCEPTION '身份验证失败';
  END IF;

  -- 获取任务信息
  SELECT publisher_id, status INTO v_publisher_id, v_bounty_status FROM bounties WHERE id = p_bounty_id;

  IF v_publisher_id IS NULL THEN
    RAISE EXCEPTION '任务不存在';
  END IF;

  IF v_bounty_status != 'open' THEN
    RAISE EXCEPTION '该任务已被认领或已结束，无法申请';
  END IF;

  IF v_publisher_id = p_applicant_id THEN
    RAISE EXCEPTION '不能认领自己发布的任务';
  END IF;

  -- 检查重复申请
  IF EXISTS (SELECT 1 FROM applications WHERE bounty_id = p_bounty_id AND applicant_id = p_applicant_id) THEN
    RAISE EXCEPTION '您已经申请过该任务，请勿重复申请';
  END IF;

  -- 创建申请
  INSERT INTO applications (bounty_id, applicant_id, message, status)
    VALUES (p_bounty_id, p_applicant_id, p_message, 'pending')
    RETURNING id INTO v_new_id;

  -- 通知任务发布者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_publisher_id, 'new_application', '收到新的任务申请',
            '有人申请认领您发布的任务，请前往查看。', p_bounty_id);

  RETURN v_new_id;
END;
$$;

-- 7. 提交交付（认领者）
CREATE OR REPLACE FUNCTION submit_delivery(p_bounty_id uuid, p_content text, p_links text[] DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_bounty_status text;
  v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '请先登录';
  END IF;

  -- 获取任务信息
  SELECT publisher_id, status INTO v_publisher_id, v_bounty_status FROM bounties WHERE id = p_bounty_id;

  IF v_bounty_status IS NULL THEN
    RAISE EXCEPTION '任务不存在';
  END IF;

  IF v_bounty_status != 'in_progress' THEN
    RAISE EXCEPTION '任务状态不允许提交交付';
  END IF;

  -- 检查是否已有交付
  IF EXISTS (SELECT 1 FROM deliveries WHERE bounty_id = p_bounty_id) THEN
    RAISE EXCEPTION '该任务已有交付，不能重复提交';
  END IF;

  -- 创建交付
  INSERT INTO deliveries (bounty_id, content, links, status)
    VALUES (p_bounty_id, p_content, p_links, 'submitted')
    RETURNING id INTO v_new_id;

  -- 更新任务状态
  UPDATE bounties SET status = 'delivered', updated_at = now() WHERE id = p_bounty_id;

  -- 通知发布者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (v_publisher_id, 'delivery_submitted', '收到任务交付',
            '认领者已提交任务交付，请前往审核。', p_bounty_id);

  RETURN v_new_id;
END;
$$;

-- 8. 创建评价（参与者）
CREATE OR REPLACE FUNCTION create_review(
  p_bounty_id uuid,
  p_reviewer_id uuid,
  p_reviewee_id uuid,
  p_rating integer,
  p_comment text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_publisher_id uuid;
  v_claimed_by uuid;
  v_bounty_status text;
  v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '请先登录';
  END IF;

  IF auth.uid() != p_reviewer_id THEN
    RAISE EXCEPTION '身份验证失败';
  END IF;

  -- 获取任务信息
  SELECT publisher_id, claimed_by, status INTO v_publisher_id, v_claimed_by, v_bounty_status
    FROM bounties WHERE id = p_bounty_id;

  IF v_bounty_status IS NULL THEN
    RAISE EXCEPTION '任务不存在';
  END IF;

  IF v_bounty_status NOT IN ('completed', 'delivered') THEN
    RAISE EXCEPTION '任务状态不允许评价';
  END IF;

  -- 验证参与者关系
  IF p_reviewer_id = v_publisher_id THEN
    -- 发布者评价认领者
    IF p_reviewee_id != v_claimed_by THEN
      RAISE EXCEPTION '只能评价任务参与者';
    END IF;
  ELSIF p_reviewer_id = v_claimed_by THEN
    -- 认领者评价发布者
    IF p_reviewee_id != v_publisher_id THEN
      RAISE EXCEPTION '只能评价任务参与者';
    END IF;
  ELSE
    RAISE EXCEPTION '只有任务参与者可以评价';
  END IF;

  -- 创建评价
  INSERT INTO reviews (bounty_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (p_bounty_id, p_reviewer_id, p_reviewee_id, p_rating, p_comment)
    RETURNING id INTO v_new_id;

  -- 通知被评价者
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (p_reviewee_id, 'new_review', '收到新的评价',
            '您收到了一条任务评价。', p_bounty_id);

  RETURN v_new_id;
END;
$$;

-- 9. 创建连接请求（认证用户）
CREATE OR REPLACE FUNCTION create_connection(p_from_user_id uuid, p_to_user_id uuid, p_message text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION '请先登录';
  END IF;

  IF auth.uid() != p_from_user_id THEN
    RAISE EXCEPTION '身份验证失败';
  END IF;

  IF p_to_user_id IS NULL THEN
    RAISE EXCEPTION '请指定连接目标用户';
  END IF;

  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION '不能与自己建立连接';
  END IF;

  -- 创建连接
  INSERT INTO connections (from_user_id, to_user_id, message, status)
    VALUES (p_from_user_id, p_to_user_id, p_message, 'pending')
    RETURNING id INTO v_new_id;

  -- 通知目标用户
  INSERT INTO notifications (user_id, type, title, content, related_id)
    VALUES (p_to_user_id, 'connection_request', '新的连接请求',
            '有人想与您建立连接。', v_new_id);

  RETURN v_new_id;
END;
$$;
