import { NavLink } from "react-router-dom";
import { Home, Trophy, User, ClipboardList, MonitorPlay } from "lucide-react";
import { cn } from "../../lib/utils";

export default function BottomNav() {
  const navItems = [
    { to: "/task", icon: ClipboardList, label: "Task" },
    { to: "/ads", icon: MonitorPlay, label: "Ads" },
    { to: "/", icon: Home, label: "Home" },
    { to: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.06)] mx-auto max-w-md rounded-t-[32px]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      <nav className="flex justify-around items-center h-[80px] px-2 pb-1 relative">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex flex-col items-center justify-center w-[60px] h-[60px] transition-all duration-300 relative",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute inset-0 bg-blue-50/50 rounded-2xl scale-110 transition-transform -z-10 border border-blue-100/50"></div>
                )}
                <item.icon
                  className={cn("w-6 h-6 mb-1.5 transition-all duration-300", isActive ? "scale-110 drop-shadow-sm text-blue-600" : "scale-100")}
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 1.5 : 2}
                />
                <span className={cn("text-[10px] font-semibold transition-all duration-300", isActive ? "font-bold text-blue-600" : "font-medium")}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
