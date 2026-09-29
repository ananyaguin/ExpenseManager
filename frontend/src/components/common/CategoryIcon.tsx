import React from "react";
import { Wallet, TrendingUp, TrendingDown, Layers } from "lucide-react";

interface CategoryIconProps {
  icon?: string | null;
  type?: "income" | "expense" | "general";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  icon,
  type = "expense",
  className = "",
  size = "md",
}) => {
  const isUrl = icon && (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:"));

  const sizeClasses = {
    sm: "w-8 h-8 text-base",
    md: "w-10 h-10 text-xl",
    lg: "w-12 h-12 text-2xl",
  };

  const bgClasses =
    type === "income"
      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
      : type === "expense"
      ? "bg-rose-50 text-rose-600 border border-rose-100"
      : "bg-indigo-50 text-indigo-600 border border-indigo-100";

  return (
    <div
      className={`rounded-xl flex items-center justify-center flex-shrink-0 select-none ${sizeClasses[size]} ${bgClasses} ${className}`}
    >
      {isUrl ? (
        <img
          src={icon}
          alt="icon"
          className="w-5 h-5 object-contain"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : icon && icon.trim() !== "" ? (
        <span>{icon}</span>
      ) : type === "income" ? (
        <TrendingUp className="w-5 h-5" />
      ) : type === "expense" ? (
        <TrendingDown className="w-5 h-5" />
      ) : (
        <Layers className="w-5 h-5" />
      )}
    </div>
  );
};

export default CategoryIcon;
