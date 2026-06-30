import { User, Hash, Smartphone, Mail, Lock, Calendar, Eye, Sparkles, Bell } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import PremiumBackButton from "../components/PremiumBackButton";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function AccountSettings() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [pushEnabled, setPushEnabled] = useState(user?.pushEnabled ?? true);
  const [updating, setUpdating] = useState(false);

  const togglePushNotifications = async () => {
    if (!user || updating) return;
    setUpdating(true);
    const newValue = !pushEnabled;
    setPushEnabled(newValue);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        pushEnabled: newValue
      });
      useAuthStore.getState().updateUser({ pushEnabled: newValue });
    } catch (error) {
      console.error("Failed to update push settings", error);
      setPushEnabled(!newValue); // revert on failure
    } finally {
      setUpdating(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] bg-[#0B0D14] text-white -mx-4 -my-6 px-4 py-8 relative overflow-hidden">
      {/* 3D Ambient Background */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center mb-8 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/profile" className="scale-90 origin-left mr-4" />
        <div className="flex items-center space-x-2">
           <Sparkles className="w-5 h-5 text-blue-400" />
           <h1 className="text-[14px] font-bold tracking-[0.2em] text-gray-200">ACCOUNT SPECIFICATIONS</h1>
        </div>
      </div>

      <div className="space-y-4 relative z-10 pb-20">
        {/* Full Name */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mr-4 border border-purple-500/30">
            <User className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
            <p className="font-bold text-base text-gray-100">{user?.fullName || user?.username || 'User'}</p>
          </div>
        </div>

        {/* User Handle */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center mr-4 border border-indigo-500/30">
            <Hash className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User Handle</p>
            <p className="font-bold text-base text-indigo-400">@{user?.telegramId || user?.username || 'user'}</p>
          </div>
          <div className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm">
            Active
          </div>
        </div>

        {/* Mobile Number */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mr-4 border border-emerald-500/30">
            <Smartphone className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mobile Number</p>
            <p className="font-bold text-base text-gray-100">{user?.phone || user?.phoneNumber || 'Not Set'}</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm">
            Verified
          </div>
        </div>

        {/* Email Address */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mr-4 border border-blue-500/30">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email Address</p>
            <p className="font-bold text-base text-gray-100 truncate">{user?.email || 'member@payout.com'}</p>
          </div>
        </div>

        {/* Security Password */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mr-4 border border-amber-500/30">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Security Password</p>
            <p className="font-bold text-2xl text-amber-400 tracking-[0.2em] -mt-1 leading-none">........</p>
          </div>
          <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Registration Date */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mr-4 border border-pink-500/30">
            <Calendar className="w-6 h-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registration Date</p>
            <p className="font-bold text-base text-gray-100">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jun 15, 2026'}
            </p>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center mr-4 border border-teal-500/30">
            <Bell className="w-6 h-6 text-teal-400" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Push Notifications</p>
            <p className="text-xs text-gray-400 mt-1">Receive new task alerts</p>
          </div>
          <button 
            onClick={togglePushNotifications}
            disabled={updating}
            className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${pushEnabled ? 'bg-teal-500' : 'bg-gray-600'} ${updating ? 'opacity-50' : ''}`}
          >
             <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300 ${pushEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
