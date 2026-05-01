import { describe, expect, it } from "vitest";

import {
  createBountyInputSchema,
  bountyCategoryValues,
  type CreateBountyInput,
} from "@/domains/bounties/contracts";

const validInput: CreateBountyInput = {
  title: "企业知识库本地化部署",
  description: "需要完成模型部署与知识库对接。",
  category: bountyCategoryValues[0],
  techTags: ["Llama-3", "RAG", "Docker"],
  rewardUsdc: "100.000000",
  deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
  deliveryStandard: "部署文档、代码仓库、演示地址",
};

describe("createBountyInputSchema", () => {
  it("accepts a valid bounty creation payload", () => {
    expect(createBountyInputSchema.parse(validInput)).toEqual(validInput);
  });

  it("rejects titles longer than 50 characters", () => {
    expect(() =>
      createBountyInputSchema.parse({
        ...validInput,
        title: "x".repeat(51),
      }),
    ).toThrow();
  });

  it("rejects rewards lower than 50 USDC", () => {
    expect(() =>
      createBountyInputSchema.parse({
        ...validInput,
        rewardUsdc: "49.999999",
      }),
    ).toThrow();
  });

  it("rejects deadlines shorter than three days away", () => {
    expect(() =>
      createBountyInputSchema.parse({
        ...validInput,
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      }),
    ).toThrow();
  });

  it("rejects empty technology tags", () => {
    expect(() =>
      createBountyInputSchema.parse({
        ...validInput,
        techTags: [],
      }),
    ).toThrow();
  });
});
