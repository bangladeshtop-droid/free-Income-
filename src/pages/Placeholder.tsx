import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Placeholder() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathName = location.pathname.split('/').pop()?.replace('-', ' ') || 'Page';

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-6 py-8 bg-[#040A18] text-white pt-12">
      <header className="flex items-center mb-8 relative z-10 w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-[#111A30] border border-[#2A375A] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold ml-4 capitalize">{pathName}</h1>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-sm">This section is currently under development.</p>
      </div>
    </div>
  );
}
