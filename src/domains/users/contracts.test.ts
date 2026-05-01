import { describe, expect, it } from "vitest";

import {
  registrationInputSchema,
  profileUpdateInputSchema,
  verifyApplicationInputSchema,
  verifyTypeValues,
} from "@/domains/users/contracts";

const validRegistration = {
  identifier: "elite@example.com",
  loginMethod: "email",
};

const validProfileUpdate = {
  nickname: "张云飞",
  bio: "专注企业级大模型落地。",
  school: "清华大学",
  company: "独立开发者",
  direction: "AI模型",
  githubUrl: "https://github.com/example",
  linkedinUrl: "https://linkedin.com/in/example",
  skills: ["Python", "RAG", "Docker"],
};

const validVerifyApplication = {
  verifyType: verifyTypeValues[0],
  evidenceUrl: "https://github.com/example/repo",
};

describe("user contracts", () => {
  it("accepts a valid registration input", () => {
    expect(registrationInputSchema.parse(validRegistration)).toEqual(validRegistration);
  });

  it("rejects unsupported login methods", () => {
    expect(() =>
      registrationInputSchema.parse({
        ...validRegistration,
        loginMethod: "telegram",
      }),
    ).toThrow();
  });

  it("accepts a valid profile update", () => {
    expect(profileUpdateInputSchema.parse(validProfileUpdate)).toEqual(validProfileUpdate);
  });

  it("rejects too many skills", () => {
    expect(() =>
      profileUpdateInputSchema.parse({
        ...validProfileUpdate,
        skills: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      }),
    ).toThrow();
  });

  it("accepts a valid verification request", () => {
    expect(verifyApplicationInputSchema.parse(validVerifyApplication)).toEqual(validVerifyApplication);
  });

  it("rejects invalid evidence urls", () => {
    expect(() =>
      verifyApplicationInputSchema.parse({
        ...validVerifyApplication,
        evidenceUrl: "not-a-url",
      }),
    ).toThrow();
  });
});
