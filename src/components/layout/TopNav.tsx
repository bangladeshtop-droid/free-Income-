import { CheckCircle, Bell } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import AnimatedCounter from "../AnimatedCounter";

export default function TopNav() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-4 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-blue-200 to-purple-200">
          <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white shadow-xl">
            <img
              src="https://i.pravatar.cc/150?u=sayed"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-1">
            <h1 className="font-extrabold text-[14px] uppercase tracking-wide text-gray-800">
              {user?.username || "MD OBAIDULLAH"}
            </h1>
            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full flex items-center justify-center text-white">
              <CheckCircle className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="flex items-center space-x-1.5 bg-white rounded-full pl-1.5 pr-3 py-1.5 shadow-sm border border-gray-100 text-sm font-bold text-gray-800 active:scale-95 transition-transform">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] bg-yellow-100 border border-yellow-200 shadow-inner">
            💰
          </div>
          <span className="text-[12px] leading-tight flex items-center pt-0.5 tracking-wide">
            <AnimatedCounter value={user?.vaBalance || 0} />
          </span>
        </button>
        <button
          onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 text-gray-600 active:scale-95 transition-transform"
        >
          <Bell className="w-4 h-4 fill-current text-gray-700" />
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white text-white text-[8px] font-bold flex items-center justify-center z-10 shadow-sm">
            !
          </span>
        </button>
      </div>
    </header>
  );
}
