import { Link } from "react-router";
import { AppShell } from "@/components/layout/app-shell";

const features = [
  {
    to: "/discover",
    label: "发现精英",
    desc: "浏览并连接顶尖人才",
    icon: "compass",
    accent: "#3B8AFF",
    gradient: "from-blue-400/20 to-blue-600/10",
  },
  {
    to: "/tasks",
    label: "任务池",
    desc: "发布悬赏或认领实战任务",
    icon: "briefcase",
    accent: "#D4A853",
    gradient: "from-gold-500/20 to-gold-600/10",
  },
  {
    to: "/growth",
    label: "成长体系",
    desc: "课程、黑客松、AI岗位",
    icon: "trending",
    accent: "#10B981",
    gradient: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    to: "/verify",
    label: "VERIFIED",
    desc: "获取精英认证标识",
    icon: "shield",
    accent: "#A78BFA",
    gradient: "from-purple-500/20 to-purple-600/10",
  },
];

const stats = [
  { value: "2,400+", label: "认证精英", icon: "users" },
  { value: "¥180万", label: "已发放悬赏", icon: "coins" },
  { value: "96%", label: "好评率", icon: "star" },
];

function FeatureIcon({ name, color }: { name: string; color: string }) {
  const icons: Record<string, React.ReactElement> = {
    compass: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    briefcase: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    trending: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    shield: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function StatIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactElement> = {
    users: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    coins: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
    star: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function HomePage() {
  return (
    <AppShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,138,255,0.15),transparent)]" />

        {/* Decorative Elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gold-500/10 blur-3xl" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Content */}
        <div className="relative px-6 py-10 md:px-8 md:py-12">
          {/* Eyebrow */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-8 rounded-full bg-gold-500" />
            <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-gold-400/80">
              AI 超级个体的精英平台
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
              蓝血菁英
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-xl text-base leading-relaxed text-blue-200 md:text-lg">
            连接顶尖 AI 人才，释放超凡潜能。
            在这里，每一个技能都被看见，每一份才华都能变现。
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register"
              className="btn-primary inline-flex items-center gap-2 shadow-glow hover:shadow-glow-lg"
            >
              <span>立即加入</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              to="/discover"
              className="btn-secondary"
            >
              探索社区
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="section-gap">
        <h2 className="text-lg font-semibold text-text-primary mb-4">核心功能</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {features.map((feature, index) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group card-interactive relative overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

              {/* Icon */}
              <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700/50 transition-transform duration-300 group-hover:scale-110">
                <FeatureIcon name={feature.icon} color={feature.accent} />
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-[16px] font-semibold text-text-primary mb-1">
                  {feature.label}
                </h3>
                <p className="text-[13px] text-text-secondary leading-snug">
                  {feature.desc}
                </p>
              </div>

              {/* Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={feature.accent} strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-gap">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="card-interactive text-center animate-slide-up"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              {/* Icon */}
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10 text-gold-500">
                <StatIcon name={stat.icon} />
              </div>

              {/* Value */}
              <div className="text-xl font-bold text-gold-500 md:text-2xl">
                {stat.value}
              </div>

              {/* Label */}
              <div className="mt-1 text-[12px] text-text-tertiary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="section-gap">
        <div className="rounded-2xl border border-blue-600/50 bg-blue-800/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            为什么选择蓝血菁英？
          </h3>

          <div className="space-y-4">
            {[
              {
                title: "链上信誉体系",
                desc: "不可篡改的实战履历，形成你的区块链简历",
                icon: "shield",
                color: "#10B981",
              },
              {
                title: "Escrow 资金托管",
                desc: "任务悬赏资金安全透明，解决信任痛点",
                icon: "lock",
                color: "#3B82F6",
              },
              {
                title: "AI 精准匹配",
                desc: "基于技能与兴趣的智能推荐，找到最合适的伙伴",
                icon: "sparkles",
                color: "#A78BFA",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="1.5">
                    {item.icon === "shield" && (
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    )}
                    {item.icon === "lock" && (
                      <>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </>
                    )}
                    {item.icon === "sparkles" && (
                      <>
                        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                        <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                      </>
                    )}
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">{item.title}</h4>
                  <p className="mt-0.5 text-[14px] text-text-secondary">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="section-gap text-center">
        <div className="rounded-full bg-blue-800/50 px-4 py-2 inline-block">
          <span className="text-[12px] text-text-tertiary">
            蓝血菁英 · OPENCAIO · AI 超级个体的精英社区
          </span>
        </div>
      </footer>
    </AppShell>
  );
}
