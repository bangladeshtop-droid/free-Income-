import {
  ArrowRight,
  Bell,
  Plus,
  Crown,
  CheckCircle,
  Video,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { playSound } from "../lib/sounds";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Daily Bonus Modal States
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [isWatchingBonusAd, setIsWatchingBonusAd] = useState(false);
  const [bonusAdTimer, setBonusAdTimer] = useState(15);
  const [bonusAdReward] = useState(30);

  const slides = [
    {
      id: 0,
      title: "Daily Bonus",
      headline: "Claim Free Coins",
      desc: "Get your daily free coins just by watching a quick ad!",
      btn: "Daily Bonus",
      path: "bonus_modal",
      icon: "🎁",
      gradient: "from-[#FDF4FF] to-[#FAE8FF]",
      btnColor: "bg-[#C026D3]",
    },
    {
      id: 1,
      title: "Complete Tasks",
      headline: "Earn More Coins",
      desc: "Watch Ads, Complete Tasks & Earn Unlimited Coins",
      btn: "Start Earning",
      path: "/task",
      icon: "📋",
      gradient: "from-[#F2F6FE] to-[#E3EAFB]",
      btnColor: "bg-[#0A64FF]",
    },
    {
      id: 2,
      title: "Free daily draw",
      headline: "Spin The Wheel",
      desc: "Invite friends, get free daily draws, up to 10,000 Coins",
      btn: "Draw Now",
      path: "/spin",
      icon: "🎡",
      gradient: "from-[#FDF4FF] to-[#FAE8FF]",
      btnColor: "bg-[#C026D3]",
    },
    {
      id: 3,
      title: "Daily Rewards",
      headline: "Check-in to earn",
      desc: "Consecutive check-in rewards to boost your earnings",
      btn: "Check-in",
      path: "/checkin",
      icon: "📅",
      gradient: "from-[#F0FDF4] to-[#DCFCE7]",
      btnColor: "bg-[#16A34A]",
    },
    {
      id: 4,
      title: "Invite and Earn",
      headline: "Refer Bonus",
      desc: "Invite your friends and earn bonus coins for every successful signup",
      btn: "Refer Now",
      path: "/refer",
      icon: "🤝",
      gradient: "from-[#FEF2F2] to-[#FEE2E2]",
      btnColor: "bg-[#DC2626]",
    },
    {
      id: 5,
      title: "Upgrade Account",
      headline: "VIP Plan",
      desc: "Get exclusive benefits, faster withdrawals, and premium support",
      btn: "Upgrade Now",
      path: "/vip",
      icon: "👑",
      gradient: "from-[#F3E8FF] to-[#E9D5FF]",
      btnColor: "bg-[#9333EA]",
    },
  ];

  useEffect(() => {
    if (showBonusModal || isWatchingBonusAd) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [slides.length, showBonusModal, isWatchingBonusAd]);

  // Bonus Ad Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingBonusAd && bonusAdTimer > 0) {
      interval = setInterval(() => {
        setBonusAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (isWatchingBonusAd && bonusAdTimer === 0) {
      handleBonusAdComplete();
    }
    return () => clearInterval(interval);
  }, [isWatchingBonusAd, bonusAdTimer]);

  const handleSlideClick = (path: string) => {
    if (path === "bonus_modal") {
      setShowBonusModal(true);
      playSound("click");
    } else {
      navigate(path);
    }
  };

  const startBonusAd = () => {
    setIsWatchingBonusAd(true);
    setBonusAdTimer(15);
    
    // Trigger ad SDK
    const scriptId = "ad-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const triggerAd = () => {
      // @ts-ignore
      if (window.show_9955574) {
        // @ts-ignore
        window.show_9955574();
      } else {
        window.open('https://google.com', '_blank'); // fallback
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "//libtl.com/sdk.js";
      script.setAttribute("data-zone", "9955574");
      script.setAttribute("data-sdk", "show_9955574");
      script.onload = () => {
        script.setAttribute("data-loaded", "true");
        triggerAd();
      };
      document.body.appendChild(script);
    } else {
      if (script.getAttribute("data-loaded") === "true") {
        triggerAd();
      } else {
        script.addEventListener("load", triggerAd, { once: true });
      }
    }
  };

  const [bonusModalState, setBonusModalState] = useState<{
    show: boolean;
    type: "success" | "early_exit";
    reward?: number;
    timeSpent?: number;
    remaining?: number;
  }>({ show: false, type: "success" });

  const closeBonusAdEarly = () => {
    setIsWatchingBonusAd(false);
    setShowBonusModal(false);
    const timeSpent = 15 - bonusAdTimer;
    setBonusModalState({ show: true, type: "early_exit", timeSpent, remaining: bonusAdTimer });
  };

  const handleBonusAdComplete = async () => {
    setIsWatchingBonusAd(false);
    setShowBonusModal(false);
    const { user: currentUser, updateBalances } = useAuthStore.getState();
    if (currentUser) {
      updateBalances(
        currentUser.usdtBalance,
        currentUser.vaBalance + bonusAdReward,
      );

      await addDoc(collection(db, "task_history"), {
        userId: currentUser.uid,
        timestamp: new Date().toISOString(),
        reward: bonusAdReward,
        taskType: "daily_bonus",
        title: "Daily Bonus"
      });

      await addDoc(collection(db, "transactions"), {
        userId: currentUser.uid,
        type: "Daily Bonus",
        amount: bonusAdReward,
        currency: "VA",
        timestamp: new Date().toISOString(),
        status: "completed"
      });
    }
    playSound("reward");
    setBonusModalState({ show: true, type: "success", reward: bonusAdReward });
  };

  const stats = [
    {
      id: 1,
      icon: "💰",
      title: "Total Earned",
      value: (user?.totalEarned || 0).toLocaleString(),
      sub: "Coins",
      color: "text-indigo-600",
      bg: "to-indigo-50",
      arrBg: "bg-indigo-500",
    },
    {
      id: 2,
      icon: "📋",
      title: "Total Tasks",
      value: ((user as any)?.totalTasks || 0).toLocaleString(),
      sub: "Tasks",
      color: "text-blue-600",
      bg: "to-blue-50",
      arrBg: "bg-blue-500",
    },
    {
      id: 3,
      icon: "👥",
      title: "Total Referrals",
      value: (user?.referralCount || 0).toLocaleString(),
      sub: "Users",
      color: "text-emerald-500",
      bg: "to-emerald-50",
      arrBg: "bg-emerald-500",
    },
    {
      id: 4,
      icon: "📺",
      title: "Ads Watched",
      value: (user?.dailyAdsWatched || 0).toLocaleString(),
      sub: "Ads",
      color: "text-red-500",
      bg: "to-red-50",
      arrBg: "bg-red-500",
    },
    {
      id: 5,
      icon: "🎁",
      title: "Total Rewards",
      value: (user?.vaBalance || 0).toLocaleString(),
      sub: "Coins",
      color: "text-amber-500",
      bg: "to-amber-50",
      arrBg: "bg-amber-500",
    },
    {
      id: 6,
      icon: "🔥",
      title: "Daily Streak",
      value: ((user as any)?.currentStreak || 0).toLocaleString(),
      sub: "Days",
      color: "text-orange-500",
      bg: "to-orange-50",
      arrBg: "bg-orange-500",
    },
    {
      id: 7,
      icon: "⏳",
      title: "Pending Tasks",
      value: ((user as any)?.pendingTasks || 0).toLocaleString(),
      sub: "Tasks",
      color: "text-blue-600",
      bg: "to-blue-50",
      arrBg: "bg-blue-500",
    },
    {
      id: 8,
      icon: "✅",
      title: "Completed",
      value: ((user as any)?.tasksCompleted || 0).toLocaleString(),
      sub: "Tasks",
      color: "text-green-500",
      bg: "to-green-50",
      arrBg: "bg-green-500",
    },
    {
      id: 9,
      icon: "🏆",
      title: "Global Rank",
      value: `#${(user as any)?.globalRank || "—"}`,
      sub: "Leaderboard",
      color: "text-purple-600",
      bg: "to-purple-50",
      arrBg: "bg-purple-500",
    },
    {
      id: 10,
      icon: "🎯",
      title: "Active Tasks",
      value: ((user as any)?.activeTasks || 0).toLocaleString(),
      sub: "Tasks",
      color: "text-cyan-500",
      bg: "to-cyan-50",
      arrBg: "bg-cyan-500",
    },
    {
      id: 11,
      icon: "🎮",
      title: "Games Played",
      value: ((user as any)?.gamesPlayed || 0).toLocaleString(),
      sub: "Games",
      color: "text-violet-500",
      bg: "to-violet-50",
      arrBg: "bg-violet-500",
    },
    {
      id: 12,
      icon: "⭐",
      title: "User Level",
      value: (user?.currentLevel || 1).toLocaleString(),
      sub: "Level",
      color: "text-yellow-600",
      bg: "to-yellow-50",
      arrBg: "bg-yellow-500",
    },
  ];

  return (
    <div className="flex flex-col pb-6">
      {/* Hero Slider */}
      <div className="relative w-full overflow-hidden rounded-[24px] shadow-[0_12px_30px_rgba(200,210,240,0.4)] border border-white h-[180px] mb-4 bg-white block">
        <AnimatePresence mode="wait">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -40) {
                setCurrentSlide((prev) => (prev + 1) % slides.length);
              } else if (offset.x > 40) {
                setCurrentSlide(
                  (prev) => (prev - 1 + slides.length) % slides.length,
                );
              }
            }}
            key={currentSlide}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 flex items-center p-5 bg-gradient-to-r ${slides[currentSlide].gradient} cursor-grab active:cursor-grabbing`}
          >
            <div className="w-2/3 pr-2 z-10">
              <h3 className="text-[#0A2540] font-bold text-base mb-0.5">
                {slides[currentSlide].title}
              </h3>
              <h2 className="text-[#0A64FF] font-extrabold text-[22px] leading-tight mb-2 tracking-tight">
                {slides[currentSlide].headline}
              </h2>
              <p className="text-gray-600 text-[10px] font-medium leading-relaxed mb-4 max-w-[90%]">
                {slides[currentSlide].desc}
              </p>
              <button
                onClick={() => handleSlideClick(slides[currentSlide].path)}
                className={`${slides[currentSlide].btnColor} text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center space-x-1 shadow-lg shadow-blue-500/20 transform transition active:scale-95`}
              >
                <span>{slides[currentSlide].btn}</span>
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
            {/* 3D Appended Icon */}
            <div className="absolute right-[-20px] top-[10px] opacity-95 transform -rotate-12 w-36 h-36 text-8xl flex items-center justify-center filter drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] pointer-events-none">
              {slides[currentSlide].icon}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center space-x-1.5 mb-6">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === currentSlide ? "w-4 bg-blue-500" : "w-1.5 bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            key={stat.id}
            className="bg-gradient-to-b from-white to-gray-50/90 rounded-[24px] border border-white/60 shadow-[0_8px_16px_rgba(0,0,0,0.06),inset_0_4px_8px_rgba(255,255,255,0.8),0_2px_4px_rgba(0,0,0,0.04)] p-3 flex flex-col items-center relative overflow-hidden transition-all group"
          >
            {/* Glossy reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-[24px]" />
            
            <div
              className={`absolute inset-0 bg-gradient-to-b from-white/20 ${stat.bg} pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
            ></div>

            <div
              className={`w-11 h-11 rounded-2xl mb-2.5 flex items-center justify-center text-[22px] filter drop-shadow-md bg-gradient-to-br from-white ${stat.bg} border border-white shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_4px_8px_rgba(0,0,0,0.08)] z-10 transform transition-transform duration-300 group-hover:scale-110`}
            >
              <span className="drop-shadow-sm">{stat.icon}</span>
            </div>
            
            <div className="text-[10px] font-extrabold text-[#2C334A] text-center leading-[1.1] min-h-[24px] flex items-center justify-center -mx-1 z-10 tracking-wide opacity-90">
              {stat.title}
            </div>
            
            <div
              className={`font-black text-[16px] mt-0.5 z-10 ${stat.color} drop-shadow-sm tracking-tight`}
            >
              {stat.value}
            </div>
            
            <div className={`text-[8px] font-extrabold z-10 block mt-1 uppercase tracking-widest bg-gradient-to-b from-white ${stat.bg} px-2 py-0.5 rounded-lg border border-white/80 shadow-[0_2px_4px_rgba(0,0,0,0.05)] ${stat.color} opacity-90`}>
              {stat.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bonus Modal */}
      <AnimatePresence>
        {showBonusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col items-center border border-gray-100"
            >
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-50 to-white pointer-events-none" />

              <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-3xl mb-6 shadow-lg shadow-yellow-500/30 flex items-center justify-center relative z-10 rotate-3 border-4 border-white">
                <span className="text-5xl filter drop-shadow-md">🎁</span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10 text-center">
                Daily Bonus
              </h2>
              <p className="text-sm text-gray-500 text-center mb-8 relative z-10 font-medium">
                Claim your free daily coins by watching a short video.
              </p>

              <div className="w-full flex flex-col space-y-3 relative z-10">
                {isWatchingBonusAd ? (
                  <button
                    onClick={closeBonusAdEarly}
                    className="w-full py-4 bg-red-100 text-red-600 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                  >
                    Cancel Ad (Wait {bonusAdTimer}s)
                  </button>
                ) : (
                  <>
                    <button
                      onClick={startBonusAd}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
                    >
                      Claim Reward
                    </button>
                    <button
                      onClick={() => setShowBonusModal(false)}
                      className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors active:scale-95"
                    >
                      Skip for now
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {bonusModalState.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col items-center border border-gray-100"
            >
              <div
                className={`absolute top-0 inset-x-0 h-32 ${bonusModalState.type === "success" ? "bg-gradient-to-b from-green-50 to-white" : "bg-gradient-to-b from-red-50 to-white"} pointer-events-none`}
              />

              <div
                className={`w-24 h-24 ${bonusModalState.type === "success" ? "bg-gradient-to-br from-green-300 to-green-500 shadow-green-500/30" : "bg-gradient-to-br from-red-300 to-red-500 shadow-red-500/30"} rounded-3xl mb-6 shadow-lg flex items-center justify-center relative z-10 rotate-3 border-4 border-white`}
              >
                <span className="text-5xl filter drop-shadow-md">
                  {bonusModalState.type === "success" ? "🎉" : "⚠️"}
                </span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10 text-center">
                {bonusModalState.type === "success" ? "Congratulations!" : "Early Exit"}
              </h2>

              <div className="text-sm text-gray-500 text-center mb-8 relative z-10 font-medium">
                {bonusModalState.type === "success" ? (
                  <>
                    <p className="mb-2">Daily Bonus claimed!</p>
                    <p className="text-green-600 font-bold text-lg">
                      You received {bonusModalState.reward} Coins!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-red-600 font-bold">আপনি ১৫ সেকেন্ড সম্পূর্ণ দেখেননি।</p>
                    <p>আপনি দেখেছেন: <span className="font-bold text-gray-800">{bonusModalState.timeSpent}</span> সেকেন্ড</p>
                    <p>বাকি ছিল: <span className="font-bold text-gray-800">{bonusModalState.remaining}</span> সেকেন্ড</p>
                    <p className="mt-2 text-xs">তাই আপনি কোনো Coin পাননি।</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setBonusModalState({ ...bonusModalState, show: false })}
                className="w-full py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold shadow-sm hover:bg-gray-200 transition-all active:scale-95"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
