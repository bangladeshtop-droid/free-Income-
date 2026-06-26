import { User, Hash, Smartphone, Mail, Lock, Calendar, Eye, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import PremiumBackButton from "../components/PremiumBackButton";

export default function AccountSettings() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#101217] text-white -mx-4 -my-6 px-4 py-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-8 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/profile" className="scale-90 origin-left mr-4" />
        <div className="flex items-center space-x-2">
           <Sparkles className="w-5 h-5 text-yellow-400" />
           <h1 className="text-[14px] font-bold tracking-[0.2em] text-gray-200">ACCOUNT SPECIFICATIONS</h1>
        </div>
      </div>

      <div className="space-y-4 relative z-10 pb-20">
        {/* Full Name */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#2C2140] flex items-center justify-center mr-4">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Full Name</p>
            <p className="font-bold text-base text-gray-200">{user?.username || 'User'}</p>
          </div>
        </div>

        {/* User Handle */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#202540] flex items-center justify-center mr-4">
            <Hash className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">User Handle</p>
            <p className="font-bold text-base text-indigo-400">@{user?.telegramId || user?.username || 'user'}</p>
          </div>
          <div className="bg-[#202540] text-indigo-400 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
            Active
          </div>
        </div>

        {/* Mobile Number */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#1A332C] flex items-center justify-center mr-4">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Mobile Number</p>
            <p className="font-bold text-base text-gray-200">{user?.phoneNumber || 'Not Set'}</p>
          </div>
          <div className="bg-[#1A332C] text-emerald-400 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
            Verified
          </div>
        </div>

        {/* Email Address */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#1B2B3D] flex items-center justify-center mr-4">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</p>
            <p className="font-bold text-base text-gray-200 truncate">{user?.email || 'member@payout.com'}</p>
          </div>
        </div>

        {/* Security Password */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#3D2E1B] flex items-center justify-center mr-4">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Security Password</p>
            <p className="font-bold text-2xl text-amber-500 tracking-[0.2em] -mt-1 leading-none">........</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Registration Date */}
        <div className="bg-[#1A1D24] rounded-2xl p-4 flex items-center border border-white/5 shadow-lg">
          <div className="w-12 h-12 rounded-[14px] bg-[#3D1F2A] flex items-center justify-center mr-4">
            <Calendar className="w-6 h-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Registration Date</p>
            <p className="font-bold text-base text-gray-200">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 15, 2026'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
