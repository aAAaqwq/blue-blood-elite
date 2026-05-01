import { describe, expect, it } from "vitest";

import { normalizeUserRecord } from "@/domains/users/mappers";

describe("normalizeUserRecord", () => {
  it("maps database shape into profile shape with skills", () => {
    expect(
      normalizeUserRecord(
        {
          id: "user-id",
          nickname: "张云飞",
          bio: "专注企业级大模型落地。",
          school: "清华大学",
          company: "独立开发者",
          direction: "AI模型",
          github_url: "https://github.com/example",
          linkedin_url: "https://linkedin.com/in/example",
          is_verified: true,
        },
        ["Python", "RAG", "Docker"],
      ),
    ).toEqual({
      id: "user-id",
      nickname: "张云飞",
      bio: "专注企业级大模型落地。",
      school: "清华大学",
      company: "独立开发者",
      direction: "AI模型",
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      isVerified: true,
      skills: ["Python", "RAG", "Docker"],
    });
  });

  it("maps database shape with empty skills", () => {
    expect(
      normalizeUserRecord({
        id: "user-id",
        nickname: "张云飞",
        bio: "专注企业级大模型落地。",
        school: "清华大学",
        company: "独立开发者",
        direction: "AI模型",
        github_url: "https://github.com/example",
        linkedin_url: "https://linkedin.com/in/example",
        is_verified: true,
      }),
    ).toEqual({
      id: "user-id",
      nickname: "张云飞",
      bio: "专注企业级大模型落地。",
      school: "清华大学",
      company: "独立开发者",
      direction: "AI模型",
      githubUrl: "https://github.com/example",
      linkedinUrl: "https://linkedin.com/in/example",
      isVerified: true,
      skills: [],
    });
  });
});
