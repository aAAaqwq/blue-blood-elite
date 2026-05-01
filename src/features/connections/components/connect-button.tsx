import { useState } from "react";

import { ConnectionForm } from "./connection-form";

interface ConnectButtonProps {
  toUserId: string;
  toUserName: string;
  initialStatus?: "none" | "pending" | "accepted" | "rejected";
  isIncoming?: boolean;
}

export function ConnectButton({
  toUserId,
  toUserName,
  initialStatus = "none",
  isIncoming = false,
}: ConnectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(initialStatus);

  if (status === "accepted") {
    return (
      <a
        href={`/me/messages/${toUserId}`}
        className="w-full rounded-full bg-[var(--green)] py-2 text-[15px] font-semibold text-white text-center block"
      >
        发消息
      </a>
    );
  }

  if (status === "pending") {
    return (
      <button
        disabled
        className="w-full rounded-full bg-[var(--bg-tertiary)] py-2 text-[15px] font-medium text-[var(--label-tertiary)] disabled:opacity-70"
      >
        {isIncoming ? "等待确认" : "已发送"}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full rounded-full bg-[var(--blue)] py-2 text-[15px] font-semibold text-white"
      >
        连接
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="w-full max-w-[360px] rounded-2xl bg-[var(--bg)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-title-3">建立连接</h3>
              <button
                onClick={() => setShowModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--label-tertiary)]"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <ConnectionForm
              toUserId={toUserId}
              toUserName={toUserName}
              onSuccess={() => {
                setStatus("pending");
                setTimeout(() => setShowModal(false), 1500);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
