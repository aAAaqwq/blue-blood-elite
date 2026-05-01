import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ConnectButton } from "@/features/connections/components/connect-button";
import type { DiscoverUserCard } from "@/repositories/discover.repository";
import { Search } from "lucide-react";

type DiscoverPageShellProps = {
  users: DiscoverUserCard[];
  connections: Record<string, { status: "pending" | "accepted" | "rejected"; isIncoming: boolean }>;
  currentUserId?: string;
};

const interestGroups = [
  { tag: "Quant", name: "量化交易研究", members: 128, color: "#3B8AFF" },
  { tag: "AI", name: "AIGC 开发组", members: 342, color: "#A78BFA" },
  { tag: "IOT", name: "智能硬件社", members: 89, color: "#10B981" },
  { tag: "Web3", name: "区块链研究", members: 76, color: "#D4A853" },
];

const matchedUsers = [
  { name: "张云飞", field: "人工智能", school: "清华大学", match: 98, skills: ["Python", "NLP", "模型训练"], color: "from-blue-400 to-blue-600" },
  { name: "李艾米", field: "量化金融", school: "北京理工大学", match: 95, skills: ["Java", "Spring", "数据分析"], color: "from-purple-400 to-blue-400" },
  { name: "王浩然", field: "软件工程", school: "复旦大学", match: 91, skills: ["React", "Vue", "Node.js"], color: "from-emerald-400 to-blue-400" },
  { name: "陈小明", field: "产品设计", school: "浙江大学", match: 88, skills: ["Figma", "用户研究", "AI产品"], color: "from-amber-400 to-purple-400" },
];

export function DiscoverPageShell({ users, connections, currentUserId }: DiscoverPageShellProps) {
  const displayUsers = users.length > 0 ? users : matchedUsers.map((u, i) => ({
    id: `mock-${i}`,
    nickname: u.name,
    direction: u.field,
    school: u.school,
    company: null,
    isVerified: true,
    skills: u.skills,
    matchRate: u.match,
    avatarColor: `from-${['blue', 'purple', 'emerald', 'amber'][i % 4]}-400 to-${['blue', 'blue', 'blue', 'purple'][i % 4]}-600`,
  })) as DiscoverUserCard[];

  const filteredUsers = currentUserId
    ? displayUsers.filter((u) => u.id !== currentUserId)
    : displayUsers;

  return (
    <AppShell>
      {/* Header */}
      <div className="section-gap flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">发现</h1>
          <p className="mt-1 text-sm text-text-secondary">
            探索精英社区
          </p>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-600 bg-blue-800 text-text-secondary transition-all hover:border-blue-500 hover:bg-blue-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="section-gap">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            placeholder="搜索姓名、技术栈、领域..."
            className="search-input pl-12"
          />
        </div>
      </div>

      {/* Interest Groups */}
      <section className="section-gap">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">兴趣小组</h2>
          <button className="text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors">
            查看全部
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {interestGroups.map((group) => (
            <div
              key={group.tag}
              className="card-interactive group cursor-pointer"
            >
              {/* Tag */}
              <div className="mb-3 inline-flex">
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    color: group.color,
                    backgroundColor: `${group.color}20`,
                  }}
                >
                  #{group.tag}
                </span>
              </div>

              {/* Name */}
              <h3 className="text-[15px] font-semibold text-text-primary mb-1 group-hover:text-gold-400 transition-colors">
                {group.name}
              </h3>

              {/* Members */}
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-5 w-5 rounded-full border-2 border-blue-800"
                      style={{ backgroundColor: `${group.color}${40 + i * 20}` }}
                    />
                  ))}
                </div>
                <span className="text-[12px] text-text-tertiary">
                  {group.members} 位成员
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Match */}
      <section className="section-gap">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary">智能匹配</h2>
            <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[11px] font-medium text-gold-500">
              基于技能
            </span>
          </div>
          <button className="p-2 rounded-lg hover:bg-blue-700 text-text-secondary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {matchedUsers.map((user, i) => (
            <div
              key={i}
              className="card-interactive flex flex-col items-center text-center"
            >
              {/* Match Rate */}
              <div className={`text-[12px] font-bold mb-3 ${user.match >= 95 ? 'text-emerald-400' : 'text-gold-400'}`}>
                {user.match}% MATCH
              </div>

              {/* Avatar */}
              <div
                className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${user.color} text-[20px] font-bold text-white shadow-lg`}
              >
                {user.name[0]}
              </div>

              {/* Name */}
              <div className="text-[16px] font-semibold text-text-primary mb-0.5">
                {user.name}
              </div>

              {/* Field */}
              <div className="text-[13px] text-text-secondary mb-3">
                {user.field}
              </div>

              {/* Skills */}
              <div className="mb-4 flex flex-wrap justify-center gap-1">
                {user.skills.slice(0, 2).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-blue-700/50 px-2 py-0.5 text-[11px] text-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Connect Button */}
              <ConnectButton
                toUserId={`mock-${i}`}
                toUserName={user.name}
                initialStatus="none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* All Elites */}
      <section className="section-gap">
        <h2 className="text-lg font-semibold text-text-primary mb-4">全部精英</h2>
        <div className="ios-group">
          {filteredUsers.map((user) => {
            const conn = connections[user.id];
            const isReal = !user.id.startsWith("mock-");

            const itemContent = (
              <>
                {/* Avatar */}
                <div
                  className={`mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${user.avatarColor || 'from-blue-400 to-blue-600'} text-[16px] font-semibold text-white shadow-lg`}
                >
                  {user.nickname[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-text-primary truncate">
                      {user.nickname}
                    </span>
                    {user.isVerified && (
                      <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-blue-400">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="text-[14px] text-text-secondary">
                    {user.direction} · {user.school}
                  </div>
                  {/* Skills */}
                  {user.skills && user.skills.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-blue-700 px-2 py-0.5 text-[11px] text-blue-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="ml-3 w-[72px] flex-shrink-0">
                  <ConnectButton
                    toUserId={user.id}
                    toUserName={user.nickname}
                    initialStatus={conn?.status || "none"}
                    isIncoming={conn?.isIncoming}
                  />
                </div>
              </>
            );

            if (isReal) {
              return (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  className="ios-list-item"
                >
                  {itemContent}
                </Link>
              );
            }

            return (
              <div key={user.id} className="ios-list-item">
                {itemContent}
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
