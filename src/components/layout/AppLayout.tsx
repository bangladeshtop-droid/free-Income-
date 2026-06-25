import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] max-w-md mx-auto relative overflow-hidden flex flex-col font-sans">
      <main className="flex-1 overflow-y-auto pb-28 pt-2 hide-scrollbar">
        <div className="px-4 py-4">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
