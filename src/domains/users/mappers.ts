export type UserProfileRecord = {
  id: string;
  nickname: string;
  bio: string | null;
  school: string | null;
  company: string | null;
  direction: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  is_verified: boolean;
};

export type UserProfile = {
  id: string;
  nickname: string;
  bio: string | null;
  school: string | null;
  company: string | null;
  direction: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  isVerified: boolean;
  skills: string[];
};

export function normalizeUserRecord(
  record: UserProfileRecord,
  skills: string[] = [],
): UserProfile {
  return {
    id: record.id,
    nickname: record.nickname,
    bio: record.bio,
    school: record.school,
    company: record.company,
    direction: record.direction,
    githubUrl: record.github_url,
    linkedinUrl: record.linkedin_url,
    isVerified: record.is_verified,
    skills,
  };
}
