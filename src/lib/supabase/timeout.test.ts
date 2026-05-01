import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  checkBountyTimeout,
  getOverdueBounties,
  requestRefund,
  getExpiringBounties,
  getGracePeriodBounties,
  type TimeoutCheckResult,
  type OverdueBounty,
} from "./timeout";

describe("timeout", () => {
  const mockSupabase = {
    from: vi.fn(),
    rpc: vi.fn(),
  } as unknown as SupabaseClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("checkBountyTimeout", () => {
    it("should return canRefund=false when deadline has not passed", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const mockBounty = {
        id: "bounty-1",
        deadline: futureDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-1");

      expect(result.canRefund).toBe(false);
      expect(result.reason).toBe("任务尚未超过截止日期");
    });

    it("should return canRefund=false within grace period", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 days past deadline

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-1");

      expect(result.canRefund).toBe(false);
      expect(result.reason).toContain("宽限期");
    });

    it("should return canRefund=true after grace period", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10); // 10 days past deadline

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-1");

      expect(result.canRefund).toBe(true);
      expect(result.gracePeriodEnded).toBe(true);
    });

    it("should return error when bounty not found", async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-1");

      expect(result.error).toBe("任务不存在");
    });

    it("should return error when user is not publisher", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "publisher-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-2");

      expect(result.error).toBe("只有发布方可以申请退款");
    });
  });

  describe("getOverdueBounties", () => {
    it("should return list of overdue bounties", async () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const mockBounties = [
        {
          id: "bounty-1",
          title: "Task 1",
          deadline: tenDaysAgo.toISOString(),
          status: "in_progress",
          publisher_id: "user-1",
          claimed_by: "user-2",
          reward_usdc: "100.00",
        },
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              lt: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: mockBounties, error: null }),
              })),
            })),
          })),
        })),
      }));

      const result = await getOverdueBounties(mockSupabase, "user-1");

      expect(result.bounties).toHaveLength(1);
      expect(result.bounties[0].id).toBe("bounty-1");
    });

    it("should return empty list when no overdue bounties", async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              lt: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: [], error: null }),
              })),
            })),
          })),
        })),
      }));

      const result = await getOverdueBounties(mockSupabase, "user-1");

      expect(result.bounties).toHaveLength(0);
    });
  });

  describe("requestRefund", () => {
    it("should process refund after grace period", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
        claimed_by: "user-2",
      };

      mockSupabase.from = vi.fn((table: string) => {
        if (table === "bounties") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          };
        }
        if (table === "reputation") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: { id: "rep-1", tasks_completed: 5 }, error: null }),
              })),
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            })),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      });

      const result = await requestRefund(mockSupabase, "bounty-1", "user-1");

      expect(result.success).toBe(true);
    });

    it("should fail refund before grace period ends", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await requestRefund(mockSupabase, "bounty-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("宽限期");
    });

    it("should fail when bounty fetch fails", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
      };

      let callCount = 0;
      mockSupabase.from = vi.fn((table: string) => {
        callCount++;
        if (callCount === 1) {
          // first call: checkBountyTimeout select
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
              })),
            })),
          };
        }
        if (callCount === 2) {
          // second call: fetch bounty for refund
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
              })),
            })),
          };
        }
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      });

      const result = await requestRefund(mockSupabase, "bounty-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("任务不存在");
    });

    it("should fail when update fails", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "in_progress",
        publisher_id: "user-1",
        claimed_by: null,
      };

      const selectChain = {
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
        })),
      };
      const updateChain = {
        eq: vi.fn().mockResolvedValue({ error: { message: "Update failed" } }),
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => selectChain),
        update: vi.fn(() => updateChain),
      }));

      const result = await requestRefund(mockSupabase, "bounty-1", "user-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("退款失败");
    });
  });

  describe("checkBountyTimeout additional cases", () => {
    it("should return error when status is not in_progress", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const mockBounty = {
        id: "bounty-1",
        deadline: pastDate.toISOString(),
        status: "completed",
        publisher_id: "user-1",
      };

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockBounty, error: null }),
          })),
        })),
      }));

      const result = await checkBountyTimeout(mockSupabase, "bounty-1", "user-1");

      expect(result.canRefund).toBe(false);
      expect(result.error).toBe("只有进行中的任务可以申请退款");
    });
  });

  describe("getExpiringBounties", () => {
    it("should return bounties expiring within given days", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);

      const mockBounties = [
        {
          id: "bounty-1",
          publisher_id: "user-1",
          deadline: tomorrow.toISOString(),
        },
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lt: vi.fn().mockResolvedValue({ data: mockBounties, error: null }),
            })),
          })),
        })),
      }));

      const result = await getExpiringBounties(mockSupabase, 1);

      expect(result).toHaveLength(1);
      expect(result[0].bountyId).toBe("bounty-1");
      expect(result[0].publisherId).toBe("user-1");
    });

    it("should return empty array when query fails", async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              lt: vi.fn().mockResolvedValue({ data: null, error: { message: "Query failed" } }),
            })),
          })),
        })),
      }));

      const result = await getExpiringBounties(mockSupabase, 1);

      expect(result).toEqual([]);
    });
  });

  describe("getGracePeriodBounties", () => {
    it("should return bounties in grace period", async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockBounties = [
        {
          id: "bounty-1",
          publisher_id: "user-1",
          claimed_by: "user-2",
          deadline: threeDaysAgo.toISOString(),
        },
      ];

      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => ({
              gte: vi.fn().mockResolvedValue({ data: mockBounties, error: null }),
            })),
          })),
        })),
      }));

      const result = await getGracePeriodBounties(mockSupabase);

      expect(result).toHaveLength(1);
      expect(result[0].bountyId).toBe("bounty-1");
      expect(result[0].executorId).toBe("user-2");
      expect(result[0].daysOverdue).toBe(3);
    });

    it("should return empty array when query fails", async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            lt: vi.fn(() => ({
              gte: vi.fn().mockResolvedValue({ data: null, error: { message: "Query failed" } }),
            })),
          })),
        })),
      }));

      const result = await getGracePeriodBounties(mockSupabase);

      expect(result).toEqual([]);
    });
  });

  describe("getOverdueBounties error handling", () => {
    it("should return error when query fails", async () => {
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              lt: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
              })),
            })),
          })),
        })),
      }));

      const result = await getOverdueBounties(mockSupabase, "user-1");

      expect(result.bounties).toHaveLength(0);
      expect(result.error).toBe("DB error");
    });
  });
});
