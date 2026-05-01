import { describe, expect, it } from "vitest";

import {
  BOUNTY_STATUS,
  canTransitionBountyStatus,
  transitionBountyStatus,
  type BountyStatus,
} from "@/domains/bounties/status-machine";

const openStatus: BountyStatus = BOUNTY_STATUS.OPEN;
const inProgressStatus: BountyStatus = BOUNTY_STATUS.IN_PROGRESS;
const deliveredStatus: BountyStatus = BOUNTY_STATUS.DELIVERED;
const completedStatus: BountyStatus = BOUNTY_STATUS.COMPLETED;
const cancelledStatus: BountyStatus = BOUNTY_STATUS.CANCELLED;
const disputedStatus: BountyStatus = BOUNTY_STATUS.DISPUTED;

describe("bounty status machine", () => {
  it("allows the core happy-path transitions", () => {
    expect(canTransitionBountyStatus(openStatus, inProgressStatus)).toBe(true);
    expect(canTransitionBountyStatus(inProgressStatus, deliveredStatus)).toBe(true);
    expect(canTransitionBountyStatus(deliveredStatus, completedStatus)).toBe(true);
  });

  it("allows revision flow from delivered back to in_progress", () => {
    expect(canTransitionBountyStatus(deliveredStatus, inProgressStatus)).toBe(true);
  });

  it("allows cancellation only from open", () => {
    expect(canTransitionBountyStatus(openStatus, cancelledStatus)).toBe(true);
    expect(canTransitionBountyStatus(inProgressStatus, cancelledStatus)).toBe(false);
  });

  it("allows dispute from in_progress and delivered", () => {
    expect(canTransitionBountyStatus(inProgressStatus, disputedStatus)).toBe(true);
    expect(canTransitionBountyStatus(deliveredStatus, disputedStatus)).toBe(true);
  });

  it("rejects illegal transitions", () => {
    expect(canTransitionBountyStatus(openStatus, deliveredStatus)).toBe(false);
    expect(canTransitionBountyStatus(completedStatus, openStatus)).toBe(false);
    expect(canTransitionBountyStatus(cancelledStatus, inProgressStatus)).toBe(false);
  });

  it("returns the next status for legal transitions", () => {
    expect(transitionBountyStatus(openStatus, inProgressStatus)).toBe(inProgressStatus);
  });

  it("throws for illegal transitions", () => {
    expect(() => transitionBountyStatus(openStatus, deliveredStatus)).toThrow(
      "Illegal bounty status transition",
    );
  });
});
