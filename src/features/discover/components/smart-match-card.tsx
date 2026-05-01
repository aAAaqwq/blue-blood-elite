import { User } from "lucide-react";
import type { UserMatch } from "../types";

interface SmartMatchCardProps {
  user: UserMatch;
  onConnect: (id: string) => void;
}

export function SmartMatchCard({ user, onConnect }: SmartMatchCardProps) {
  const isHighMatch = user.matchScore > 90;
  const displaySkills = user.skills.slice(0, 3);
  const extraSkillsCount = user.skills.length - 3;

  return (
    <div
      className={`
        rounded-xl p-4
        bg-blue-800 border
        transition-all duration-200
        hover:border-blue-500
        hover:-translate-y-0.5
        hover:shadow-lg
        ${isHighMatch ? "border-gold-500 shadow-[0_0_20px_rgba(212,168,83,0.15)]" : "border-blue-600"}
      `}
    >
      {/* Match Score Badge */}
      <div className="text-center mb-3">
        <span
          className={`
            text-[12px] font-bold
            ${isHighMatch ? "text-gold-500" : "text-blue-300"}
          `}
        >
          {user.matchScore}%匹配
        </span>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-blue-600"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-blue-700 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* User Info */}
      <div className="text-center mb-3">
        <h3 className="text-[16px] font-semibold text-gray-100 truncate">
          {user.name}
        </h3>
        <p className="text-[13px] text-gray-400 mt-0.5">{user.field}</p>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
        {displaySkills.map((skill) => (
          <span
            key={skill}
            className="px-2.5 py-0.5 rounded-full bg-blue-700 text-[11px] text-gray-300"
          >
            {skill}
          </span>
        ))}
        {extraSkillsCount > 0 && (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-700 text-[11px] text-gold-500 font-medium">
            +{extraSkillsCount}
          </span>
        )}
      </div>

      {/* Connect Button */}
      <button
        onClick={() => onConnect(user.id)}
        className="
          w-full py-2 px-4
          rounded-lg
          bg-blue-700 hover:bg-blue-600
          text-[14px] font-medium text-gray-100
          transition-colors duration-200
          border border-blue-600 hover:border-blue-500
        "
      >
        建立联系
      </button>
    </div>
  );
}
