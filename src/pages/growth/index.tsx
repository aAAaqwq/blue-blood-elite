import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { BookOpen, Trophy, Briefcase, Users, Clock, Star, ChevronRight, Brain, Target, TrendingUp } from "lucide-react";

const courses = [
  {
    icon: BookOpen,
    title: "本地化部署架构实战",
    level: "中级",
    color: "#3B8AFF",
    bgColor: "rgba(59, 138, 255, 0.15)",
    students: 1234,
    rating: 4.9,
  },
  {
    icon: Brain,
    title: "企业级 RAG 方案精讲",
    level: "高级",
    color: "#A78BFA",
    bgColor: "rgba(167, 139, 250, 0.15)",
    students: 856,
    rating: 4.8,
  },
  {
    icon: Target,
    title: "CAIO 商业思维与管理",
    level: "顶级",
    color: "#D4A853",
    bgColor: "rgba(212, 168, 83, 0.15)",
    students: 234,
    rating: 4.9,
  },
  {
    icon: TrendingUp,
    title: "AI Agent 从零到一",
    level: "中级",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    students: 2156,
    rating: 4.7,
  },
];

const schedule = [
  { date: "03/01-03/07", event: "组队报名", color: "#3B8AFF" },
  { date: "03/08-03/21", event: "开发冲刺", color: "#10B981" },
  { date: "03/22-03/23", event: "Demo Day", color: "#D4A853" },
  { date: "03/24", event: "颁奖 & CAIO内推", color: "#EF4444" },
];

const jobs = [
  {
    tag: "CAIO需求",
    tagColor: "#EF4444",
    salary: "¥50k+",
    title: "CAIO 首席AI官候选人内推",
    desc: "为某独角兽企业寻访首席AI官，需具备全栈AI架构能力与商业敏锐度。",
    source: "蓝血俱乐部直发",
  },
  {
    tag: "企业需求",
    tagColor: "#3B8AFF",
    salary: "¥35-60k",
    title: "AI产品总监 — 大模型方向",
    desc: "负责企业级大模型产品从0到1，需有AIGC/RAG落地经验。base上海。",
    source: "某AI上市公司HR直招",
  },
];


type TabKey = "courses" | "hackathon" | "jobs";

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("courses");

  return (
    <AppShell>
      {/* Header */}
      <div className="section-gap">
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">成长</h1>
        <p className="text-sm text-text-secondary">掌握 AI 技能，提升竞争力</p>
      </div>

      {/* Hero Banner */}
      <section className="section-gap">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, #0A1628 0%, #152238 50%, #0F1D32 100%)",
            }}
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, transparent 30%, rgba(10, 22, 40, 0.95) 100%)",
            }}
          />

          {/* Glow Effects */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl" />

          {/* Content */}
          <div className="relative p-6 md:p-8">
            {/* Badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-400/20 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-medium uppercase tracking-wider text-blue-400">
                {activeTab === "courses" ? "精品课程" : activeTab === "hackathon" ? "热力比赛" : "精品岗位"}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-text-primary md:text-2xl mb-2">
              {activeTab === "courses"
                ? "零基础 AIGC 实战课程"
                : activeTab === "hackathon"
                  ? "蓝血春季黑客松 V2.0"
                  : "AI岗位直通车"}
            </h2>

            {/* Subtitle */}
            <p className="text-sm text-text-secondary">
              {activeTab === "courses"
                ? "从 Prompt 到本地化部署全流程"
                : activeTab === "hackathon"
                  ? "赢取 CAIO 岗位内推名额"
                  : "俱乐部直推，快速入职"}
            </p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="section-gap">
        <div className="flex rounded-full border border-blue-600/50 bg-blue-800/50 p-1">
          {[
            { key: "courses", label: "精品课程", icon: BookOpen },
            { key: "hackathon", label: "黑客松", icon: Trophy },
            { key: "jobs", label: "AI岗位", icon: Briefcase },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-medium transition-all ${
                  isActive
                    ? "bg-gold-500 text-blue-900 shadow-glow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <section className="section-gap">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {courses.map((course, index) => {
              const Icon = course.icon;
              return (
                <div
                  key={course.title}
                  className="card-interactive group animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: course.bgColor }}
                    >
                      <Icon className="w-7 h-7" style={{ color: course.color }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-gold-400 transition-colors">
                          {course.title}
                        </h3>
                        <span
                          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            color: course.color,
                            backgroundColor: course.bgColor,
                          }}
                        >
                          {course.level}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="mt-3 flex items-center gap-4 text-[12px] text-text-tertiary">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                          <span className="text-gold-500">{course.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="mt-4 flex items-center justify-between border-t border-blue-600/50 pt-4">
                    <span className="text-lg font-bold text-gold-500">¥199</span>
                    <button disabled className="flex items-center gap-1 text-[13px] font-medium text-blue-400 opacity-60 cursor-not-allowed">
                      即将开放
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hackathon Tab */}
      {activeTab === "hackathon" && (
        <section className="section-gap space-y-4">
          {/* Hackathon Card */}
          <div className="card-interactive relative overflow-hidden">
            {/* Glow Effects */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-gold-500/10 blur-3xl" />

            <div className="relative">
              {/* Header */}
              <div className="flex items-start gap-4 mb-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-gold-500 text-2xl">
                  🏆
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary">
                    蓝血春季黑客松 V2.0
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    聚焦于"超级个体项目商业化"，将你的原型变为生产力。
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl bg-blue-700/50 p-4 text-center">
                  <div className="text-[12px] text-text-tertiary mb-1">奖金池</div>
                  <div className="text-xl font-bold text-gold-500">¥100,000</div>
                </div>
                <div className="rounded-xl bg-blue-700/50 p-4 text-center">
                  <div className="text-[12px] text-text-tertiary mb-1">参赛名额</div>
                  <div className="text-xl font-bold text-text-primary">仅限 20 组</div>
                </div>
              </div>

              {/* CTA */}
              <button className="btn-primary w-full" disabled>
                即将开放
              </button>
            </div>
          </div>

          {/* Schedule */}
          <div className="card-interactive">
            <h4 className="mb-4 text-[15px] font-semibold text-text-primary flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              赛事日程
            </h4>
            <div className="space-y-3">
              {schedule.map((item, index) => (
                <div key={item.date} className="flex items-center gap-3">
                  <div
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 text-[14px] text-text-primary">
                    <span className="font-medium">{item.date}</span>
                    <span className="text-text-secondary ml-2">{item.event}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <section className="section-gap">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text-primary">俱乐部岗位对接</h3>
            <span className="rounded-full bg-blue-400/20 px-3 py-1 text-[11px] font-medium text-blue-400">
              CLUB SOURCES
            </span>
          </div>

          <div className="space-y-4">
            {jobs.map((job, index) => (
              <div
                key={job.title}
                className="card-interactive animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                      style={{ backgroundColor: job.tagColor }}
                    >
                      {job.tag}
                    </span>
                  </div>
                  <div className="text-lg font-bold text-emerald-400">
                    {job.salary}
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-[16px] font-semibold text-text-primary mb-2">
                  {job.title}
                </h4>

                {/* Description */}
                <p className="text-[14px] text-text-secondary mb-4 leading-relaxed">
                  {job.desc}
                </p>

                {/* Source */}
                <div className="flex items-center justify-between border-t border-blue-600/50 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-700 text-[11px] font-medium text-blue-200">
                      {job.source[0]}
                    </div>
                    <span className="text-[12px] text-text-tertiary">{job.source}</span>
                  </div>
                  <button disabled className="btn-secondary text-[13px] py-2 px-4 opacity-60 cursor-not-allowed">
                    即将开放
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
