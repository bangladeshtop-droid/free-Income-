import { useAuthStore } from "../store/useAuthStore";
import { User, ShieldCheck, Mail, LogOut, Settings, HelpCircle, ChevronRight, Copy, Wallet, Activity, Coins, Globe, FileText, Crown, Users, Code, Info, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const displayUser = user || {
    uid: '---',
    username: 'Guest',
    telegramId: 'none',
    role: 'user',
    totalEarned: 0,
    referralCount: 0,
    usdtBalance: 0,
    vaBalance: 0
  };

  const handleMenuClick = async (path: string, label: string) => {
    if (label === 'Logout') {
       const { signOut } = await import('firebase/auth');
       const { auth } = await import('../lib/firebase');
       await signOut(auth);
       logout();
       return;
    }
    navigate(path);
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold text-[#2C334A]">Profile</h1>
        <button className="text-crypto-primary text-sm font-medium">Edit</button>
      </header>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#2C334A] to-[#0f172a] rounded-[32px] p-8 border-b-[6px] border-[#0f172a] relative overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.15)] transform transition-transform hover:scale-[1.01] flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="w-24 h-24 rounded-full border-[4px] border-white/20 overflow-hidden relative shadow-[0_8px_16px_rgba(0,0,0,0.2)] flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
          <User className="w-12 h-12 text-white drop-shadow-md" />
        </div>
        
        <div className="z-10 flex flex-col items-center">
          <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-sm mb-1">{displayUser.username}</h2>
          
          <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1 rounded-xl border border-white/10 mb-2">
            <span className="opacity-70 text-gray-300 text-xs font-medium">ID:</span>
            <span className="text-blue-200 text-sm font-bold tracking-wider">{displayUser.uid}</span>
            <Copy className="w-3.5 h-3.5 cursor-pointer text-gray-400 hover:text-white transition-colors ml-1" />
          </div>
          
          <span className="text-purple-200 font-medium text-sm mb-3">
            <span className="opacity-70 mr-0.5">@</span>{displayUser.telegramId}
          </span>
          
          <div className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold border-b-2 border-green-700 shadow-sm">
            <ShieldCheck className="w-4 h-4 drop-shadow-sm" />
            <span className="drop-shadow-sm">Verified Account</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="pt-2">
        <h3 className="font-extrabold text-xl text-[#2C334A] tracking-tight mb-3">My Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-[0_6px_0_rgb(229,231,235)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 blur-[30px] rounded-full pointer-events-none group-hover:bg-blue-100 transition-colors" />
            <div className="relative z-10 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3 shadow-inner">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Balance</p>
              <p className="font-black text-2xl text-[#2C334A]">{(displayUser.vaBalance || 0).toLocaleString()} <span className="text-sm font-bold text-gray-400">VA</span></p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border-2 border-gray-100 shadow-[0_6px_0_rgb(229,231,235)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 blur-[30px] rounded-full pointer-events-none group-hover:bg-purple-100 transition-colors" />
            <div className="relative z-10 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-3 shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Referrals</p>
              <p className="font-black text-2xl text-[#2C334A]">{displayUser.referralCount || 0} <span className="text-sm font-bold text-gray-400">Users</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Links */}
      <div className="space-y-4 pt-4">
        <h3 className="font-extrabold text-xl text-[#2C334A] tracking-tight">Main Menu</h3>
        
        {/* 3x Grid Menu */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Wallet", icon: Wallet, color: "text-blue-600", bg: "bg-gradient-to-br from-blue-100 to-blue-200", path: "/wallet" },
            { label: "Earn VA", icon: Coins, color: "text-yellow-600", bg: "bg-gradient-to-br from-yellow-100 to-yellow-200", path: "/earn" },
            { label: "Activity", icon: Activity, color: "text-purple-600", bg: "bg-gradient-to-br from-purple-100 to-purple-200", path: "/activity" },
            { label: "VIP Plan", icon: Crown, color: "text-amber-600", bg: "bg-gradient-to-br from-amber-100 to-amber-200", path: "/vip" },
            { label: "Refer", icon: Users, color: "text-green-600", bg: "bg-gradient-to-br from-green-100 to-green-200", path: "/refer" },
            { label: "Language", icon: Globe, color: "text-indigo-600", bg: "bg-gradient-to-br from-indigo-100 to-indigo-200", path: "/language" },
            { label: "About", icon: Info, color: "text-pink-600", bg: "bg-gradient-to-br from-pink-100 to-pink-200", path: "/about" },
            { label: "Developer", icon: Code, color: "text-gray-700", bg: "bg-gradient-to-br from-gray-200 to-gray-300", path: "/developer" },
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => handleMenuClick(item.path, item.label)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.06),inset_0_4px_8px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.9)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.4)] transform transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${item.bg} mb-2.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color} drop-shadow-sm`} />
              </div>
              <span className="font-extrabold text-[11px] text-[#2C334A] text-center leading-tight tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Settings */}
      <div className="space-y-4 pt-6">
        <h3 className="font-extrabold text-xl text-[#2C334A] tracking-tight pb-1">Settings</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {(displayUser.uid === 'z92DRLkGrpNZea5HpWIiHTC1QGa2' || displayUser.role === 'super_admin' || displayUser.role === 'admin') && (
            <button 
              onClick={() => navigate('/admin')} 
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/60 shadow-[0_8px_16px_rgba(147,51,234,0.1),inset_0_4px_8px_rgba(255,255,255,0.8)] hover:shadow-[0_12px_24px_rgba(147,51,234,0.15),inset_0_4px_8px_rgba(255,255,255,0.9)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_4px_rgba(147,51,234,0.06)] transform transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-300/20 blur-xl rounded-full"></div>
              <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-300 mb-2.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(147,51,234,0.2)] group-hover:scale-110 transition-transform z-10">
                <ShieldCheck className="w-6 h-6 text-purple-700 drop-shadow-sm" />
              </div>
              <span className="font-extrabold text-[11px] text-[#2C334A] text-center leading-tight tracking-wide z-10">Admin<br/>Panel</span>
            </button>
          )}

          {[
            { label: "Account", path: "/settings", icon: Settings, color: "text-gray-600", bg: "bg-gradient-to-br from-gray-100 to-gray-200" },
            { label: "Support", path: "/support", icon: HelpCircle, color: "text-indigo-600", bg: "bg-gradient-to-br from-indigo-100 to-indigo-200" },
            { label: "Logout", path: "#", icon: LogOut, color: "text-red-600", bg: "bg-gradient-to-br from-red-100 to-red-200" },
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => handleMenuClick(item.path, item.label)}
              className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50/80 rounded-2xl border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.06),inset_0_4px_8px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_4px_8px_rgba(255,255,255,0.9)] hover:-translate-y-1 active:translate-y-0 active:shadow-[0_2px_4px_rgba(0,0,0,0.06),inset_0_2px_4px_rgba(255,255,255,0.4)] transform transition-all duration-200 group"
            >
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${item.bg} mb-2.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 ${item.color} drop-shadow-sm`} />
              </div>
              <span className="font-extrabold text-[11px] text-[#2C334A] text-center leading-tight tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-4" /> {/* pad */}
    </div>
  );
}
