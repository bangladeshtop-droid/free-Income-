import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";
import { playPremiumClick } from "../utils/audio";

export default function PremiumBackButton({
  className = "",
  fallbackPath = "/",
  theme = "light",
}: {
  className?: string;
  fallbackPath?: string;
  theme?: "light" | "dark";
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    playPremiumClick();
    setTimeout(() => {
      if (window.history.length > 1 && window.history.state?.idx > 0) {
        navigate(-1);
      } else {
        navigate(fallbackPath, { replace: true });
      }
    }, 150);
  };

  // Do not show on main dashboard or bottom nav roots if we don't want to
  const isRoot = location.pathname === "/";
  if (isRoot) return null;

  const isDark = theme === "dark";

  return (
    <div className={`inline-block ${className}`}>
      <button
        onClick={handleBack}
        className="group relative w-8 h-8 flex items-center justify-center outline-none transition-transform active:scale-90"
      >
        <div
          className={`absolute inset-0 rounded-[10px] shadow-sm border transition-all duration-200 group-hover:shadow-md ${
            isDark
              ? "bg-gradient-to-tr from-[#1E2330] to-[#2A3143] border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
              : "bg-gradient-to-tr from-white to-gray-50 border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,1)]"
          }`}
        ></div>
        <ChevronLeft
          className={`w-4 h-4 relative z-10 -ml-0.5 ${isDark ? "text-gray-300 group-hover:text-white" : "text-gray-700 group-hover:text-black"}`}
          strokeWidth={2.5}
        />
      </button>
    </div>
  );
}
