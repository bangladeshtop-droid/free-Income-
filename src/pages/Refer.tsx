import { Gift, Users, Coins, Share2, Copy, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PremiumBackButton from "../components/PremiumBackButton";
import EmptyState from "../components/EmptyState";

export default function Refer() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const inviteCode = user?.uid
    ? `R_${user.uid.substring(0, 6).toUpperCase()}`
    : "R_206474";
  const inviteLink = `https://${window.location.hostname}/register?ref=${inviteCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-gray-50 text-gray-900 pb-10 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center mb-6 relative z-10 pt-2">
        <PremiumBackButton
          fallbackPath="/profile"
          className="scale-90 origin-left mr-4"
        />
        <h1 className="text-[14px] font-bold tracking-[0.2em] text-gray-800">
          REFER & EARN
        </h1>
      </div>

      {/* Banner */}
      <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm relative overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />

        <div className="flex items-start justify-between mb-3 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center shadow-sm">
            <Users className="w-3 h-3 mr-1" />
            EARN 250 COINS
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Referral Platform
          </p>
          <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">
            Invite Friends & Level Up Together!
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Invite your friends to join GoalTube BD and earn a premium bonus of{" "}
            <span className="text-yellow-500 font-bold">250 🟡 Coins</span> for
            every successful registration!
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              My Referrals
            </p>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {user?.referralCount || 0}
          </p>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
            Friends Joined
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Rewards Earned
            </p>
            <Coins className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex items-center text-yellow-500">
            <p className="text-2xl font-black mr-2">
              +{(user?.referralCount || 0) * 250}
            </p>
            <div className="w-6 h-6 rounded-full bg-yellow-400/20 flex items-center justify-center border border-yellow-400/30">
              <span className="text-[10px]">🪙</span>
            </div>
          </div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-1">
            Bonus Credits
          </p>
        </div>
      </div>

      {/* Code & URL Section */}
      <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-4">
        <div className="flex items-center space-x-2 mb-6">
          <Share2 className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold tracking-widest text-gray-900 uppercase">
            Your Unique Invite Code & URL
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Share Invitation Code
            </p>
            <div className="bg-gray-50 rounded-xl flex items-center justify-between p-1.5 border border-gray-100">
              <span className="font-bold text-purple-600 pl-3 tracking-widest">
                {inviteCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-white text-gray-700 hover:text-gray-900 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center border border-gray-100 transition-colors shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                {copiedCode ? "COPIED!" : "COPY CODE"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Direct Referral Register Link
            </p>
            <div className="bg-gray-50 rounded-xl flex items-center justify-between p-1.5 border border-gray-100">
              <span className="text-gray-600 pl-3 text-xs truncate max-w-[160px]">
                {inviteLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="bg-purple-50 text-purple-600 hover:text-purple-700 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide flex items-center border border-purple-100 transition-colors shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                {copiedLink ? "COPIED!" : "COPY LINK"}
              </button>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3.5 text-xs font-bold tracking-widest uppercase flex items-center justify-center shadow-lg shadow-purple-500/20 active:translate-y-0.5 transition-transform">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Telegram Friends
          </button>
        </div>
      </div>

      {/* Policy */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-start space-x-3 mb-6">
        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-orange-800 leading-relaxed">
          <strong className="text-orange-600">Referral Policy (Rules):</strong>{" "}
          The invited friend must register a new account using your referral
          link or code. Once registered, an instant bonus of 250 Coins will be
          credited to your main balance immediately.
        </p>
      </div>

      {/* Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold tracking-widest text-gray-600 uppercase">
            Referred Friends Log (0)
          </h3>
          <button className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase border border-purple-100 shadow-sm">
            All Invite
          </button>
        </div>

        <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm">
          <EmptyState
            icon={Users}
            title="No friends have registered yet"
            description="Copy and send your link above to start generating team level-ups!"
          />
        </div>
      </div>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
