import {
  Brain,
  Code2,
  Palette,
  Gamepad2,
  Music,
  Camera,
  BookOpen,
  Briefcase,
  Heart,
  Globe,
  Laptop,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { InterestGroup } from "../types";

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Code2,
  Palette,
  Gamepad2,
  Music,
  Camera,
  BookOpen,
  Briefcase,
  Heart,
  Globe,
  Laptop,
  Sparkles,
};

interface InterestGroupCardProps {
  group: InterestGroup;
  onClick: (id: string) => void;
  isSelected?: boolean;
  size?: "sm" | "lg";
}

export function InterestGroupCard({
  group,
  onClick,
  isSelected = false,
  size = "sm",
}: InterestGroupCardProps) {
  const IconComponent = iconMap[group.icon] || Sparkles;

  const sizeClasses = {
    sm: "p-3",
    lg: "p-6",
  };

  return (
    <button
      onClick={() => onClick(group.id)}
      className={`
        ${sizeClasses[size]}
        w-full rounded-xl
        bg-blue-800 border
        transition-all duration-200
        hover:border-blue-500
        hover:-translate-y-0.5
        hover:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-gold-500/50
        ${isSelected ? "border-gold-500 shadow-[0_0_20px_rgba(212,168,83,0.15)]" : "border-blue-600"}
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
            flex items-center justify-center rounded-lg
            ${size === "sm" ? "h-10 w-10" : "h-12 w-12"}
            bg-blue-700 text-gold-500
          `}
        >
          <IconComponent className={size === "sm" ? "h-5 w-5" : "h-6 w-6"} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <h3
            className={`
              font-semibold truncate
              ${size === "sm" ? "text-[15px]" : "text-[17px]"}
              text-gray-100
            `}
          >
            {group.name}
          </h3>
          <p className="text-[13px] text-gray-400 mt-0.5">
            {group.memberCount.toLocaleString()}人
          </p>
          {size === "lg" && (
            <p className="text-[14px] text-gray-400 mt-2 line-clamp-2">
              {group.description}
            </p>
          )}
        </div>
      </div>
      {size === "sm" && (
        <p className="text-[13px] text-gray-400 mt-2 line-clamp-1">
          {group.description}
        </p>
      )}
    </button>
  );
}
