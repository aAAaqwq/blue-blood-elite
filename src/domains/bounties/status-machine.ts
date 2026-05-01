import { z } from "zod";

const bountyStatusValues = [
  "open",
  "in_progress",
  "delivered",
  "completed",
  "cancelled",
  "disputed",
] as const;

export const BOUNTY_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  DELIVERED: "delivered",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;

export type BountyStatus = (typeof bountyStatusValues)[number];

export const bountyStatusSchema = z.enum(bountyStatusValues);

const allowedTransitions: Record<BountyStatus, readonly BountyStatus[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["delivered", "disputed"],
  delivered: ["completed", "disputed", "in_progress"],
  completed: [],
  cancelled: [],
  disputed: ["completed", "cancelled"],
};

export function canTransitionBountyStatus(
  currentStatus: BountyStatus,
  nextStatus: BountyStatus,
): boolean {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function transitionBountyStatus(
  currentStatus: BountyStatus,
  nextStatus: BountyStatus,
): BountyStatus {
  if (!canTransitionBountyStatus(currentStatus, nextStatus)) {
    throw new Error(
      `Illegal bounty status transition: ${currentStatus} -> ${nextStatus}`,
    );
  }

  return nextStatus;
}
