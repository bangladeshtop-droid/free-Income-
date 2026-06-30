import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center border-4 border-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] transform rotate-3">
        <Icon
          className="w-10 h-10 text-blue-500 drop-shadow-sm"
          strokeWidth={2}
        />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-[260px] leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
