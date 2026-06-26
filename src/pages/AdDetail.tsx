import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Video, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { collection, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import PremiumBackButton from "../components/PremiumBackButton";

declare global {
  interface Window {
    show_9955574?: () => void;
  }
}

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [adCount, setAdCount] = useState(0); // 0 out of 5
  const [dailyWatched, setDailyWatched] = useState(0); // limit 50
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adTimer, setAdTimer] = useState(15);
  const [adReward, setAdReward] = useState(50); // Fetch from admin/db if needed

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setAdCount(user.currentAdCount || 0);
      setDailyWatched(user.dailyAdsWatched || 0);

      if (user.adCountdownUntil && user.adCountdownUntil > Date.now()) {
        setCountdown(Math.floor((user.adCountdownUntil - Date.now()) / 1000));
      } else if (user.adCountdownUntil && user.adCountdownUntil <= Date.now()) {
        // Reset daily if countdown passed
        updateUserAdStats(0, 0, null);
      }
    }
  }, [user?.uid]);

  const updateUserAdStats = async (
    newWatched: number,
    newCount: number,
    countdownUntil: number | null,
  ) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        dailyAdsWatched: newWatched,
        currentAdCount: newCount,
        adCountdownUntil: countdownUntil,
      });
    } catch (e) {
      console.error("Failed to update ad stats", e);
    }
  };

  // Daily limit countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => (prev ? prev - 1 : null));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Ad watching timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWatchingAd && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (isWatchingAd && adTimer === 0) {
      handleAdComplete();
    }
    return () => clearInterval(interval);
  }, [isWatchingAd, adTimer]);

  const handleAdComplete = async () => {
    setIsWatchingAd(false);
    setIsLoading(false);

    const newWatched = dailyWatched + 1;
    const newCount = adCount + 1;
    setDailyWatched(newWatched);

    let nextCountdown: number | null = null;
    if (newWatched >= 50) {
      setCountdown(24 * 60 * 60); // 24 hours countdown
      nextCountdown = Date.now() + 24 * 60 * 60 * 1000;
    }

    const { user: currentUser, updateBalances } = useAuthStore.getState();

    if (newCount === 5) {
      setAdCount(0);
      updateUserAdStats(newWatched, 0, nextCountdown);
      // Give coins
      if (currentUser) {
        updateBalances(
          currentUser.usdtBalance,
          currentUser.vaBalance + adReward,
        );

        // Record history and transaction
        await addDoc(collection(db, "task_history"), {
          userId: currentUser.uid,
          timestamp: new Date().toISOString(),
          reward: adReward,
          taskType: "ad",
          title: "Watched Ad Group"
        });

        await addDoc(collection(db, "transactions"), {
          userId: currentUser.uid,
          type: "Ad Reward",
          amount: adReward,
          currency: "VA",
          timestamp: new Date().toISOString(),
          status: "completed"
        });
      }
      setModalState({ show: true, type: "success", reward: adReward });
    } else {
      setAdCount(newCount);
      updateUserAdStats(newWatched, newCount, nextCountdown);
      // Give 0 coin modal just to indicate progress
      setModalState({ show: true, type: "success", reward: 0 });
    }
  };

  const [modalState, setModalState] = useState<{
    show: boolean;
    type: "success" | "early_exit";
    reward?: number;
    timeSpent?: number;
    remaining?: number;
  }>({ show: false, type: "success" });

  const closeAdEarly = () => {
    setIsWatchingAd(false);
    setIsLoading(false);
    const timeSpent = 15 - adTimer;
    setModalState({ show: true, type: "early_exit", timeSpent, remaining: adTimer });
  };

  const handleWatchAd = () => {
    if (dailyWatched >= 50 || countdown !== null) return;
    setIsLoading(true);
    setAdTimer(15);
    setIsWatchingAd(true);

    const scriptId = "ad-sdk-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const triggerAd = () => {
      if (window.show_9955574) {
        window.show_9955574();
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

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-gray-50 text-gray-900 relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/ads" className="scale-90 origin-left" />
        <button className="flex items-center space-x-2 bg-white border-2 border-gray-100 rounded-2xl px-3 py-2 shadow-[0_4px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-[4px] transition-all">
          <span className="text-[10px] text-blue-600 font-black border-2 border-blue-200 rounded-lg flex items-center justify-center w-6 h-6 bg-blue-50">
            A
          </span>
          <span className="text-xs font-black text-[#2C334A] uppercase tracking-wider">ENG</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col items-center flex-1 w-full pt-4 relative animate-in fade-in slide-in-from-bottom-4">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-48 h-48 bg-blue-400/20 blur-[60px] pointer-events-none rounded-full" />

        {/* 3D Icon */}
        <div className="relative mb-6">
          <div className="w-28 h-28 bg-gradient-to-br from-white to-blue-50 rounded-[32px] flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.1)] border-4 border-white transform rotate-[-3deg] hover:rotate-0 transition-transform duration-300">
            {countdown !== null ? (
              <Clock className="w-12 h-12 text-yellow-500 drop-shadow-md" />
            ) : (
              <Video
                className="w-12 h-12 text-blue-500 drop-shadow-md"
                fill="currentColor"
              />
            )}
          </div>
        </div>

        <h1 className="text-3xl font-black mb-2 text-[#2C334A] tracking-tight text-center leading-tight">
          {countdown !== null ? "Daily Limit Reached" : "Rewarded Ad"}
        </h1>
        <p className="text-gray-500 text-sm mb-10 font-bold text-center px-4 max-w-[280px]">
          {countdown !== null
            ? "You have watched all 50 ads for today. Come back tomorrow!"
            : "Earn 50 Coins for each 5 advertisements."}
        </p>

        {/* Details Card */}
        <div className="w-full bg-white border-2 border-gray-100 rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-black text-[#2C334A] tracking-wide text-sm uppercase">
                Ad Progress
              </h3>
              <span className="text-blue-600 font-black text-sm tracking-widest">
                {adCount} / 5
              </span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-4 bg-gray-100 rounded-full mb-8 shadow-inner overflow-hidden relative border-2 border-white">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full relative transition-all duration-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]"
                style={{ width: `${(adCount / 5) * 100}%` }}
              ></div>
            </div>

            {/* Daily Limit Progress */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-1.5 text-green-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[11px] font-black tracking-wider uppercase">
                    Daily Limit
                  </span>
                </div>
                <span className="text-[#2C334A] font-black text-sm tracking-widest">
                  {dailyWatched} / 50
                </span>
              </div>
              <div className="w-full h-4 bg-gray-100 rounded-full shadow-inner overflow-hidden relative border-2 border-white">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full relative transition-all duration-500 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.2)]"
                  style={{ width: `${(dailyWatched / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {countdown !== null ? (
          <div className="w-full mt-auto relative overflow-hidden pb-4">
            <div className="w-full bg-gray-50 border-2 border-gray-200 py-4 rounded-2xl font-black text-lg text-yellow-600 flex flex-col items-center justify-center pointer-events-none shadow-inner">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Time Remaining
              </span>
              <span className="font-mono text-2xl tracking-widest drop-shadow-sm">
                {formatTime(countdown)}
              </span>
            </div>
          </div>
        ) : isWatchingAd ? (
          <button
            onClick={closeAdEarly}
            className="w-full mt-auto relative overflow-hidden pb-4 group"
          >
            <div className="w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-4 rounded-2xl font-black text-[15px] tracking-wide shadow-[0_6px_0_rgb(153,27,27)] h-[60px] flex items-center justify-center transition-transform active:translate-y-[6px] active:shadow-[0_0px_0_rgb(153,27,27)] z-10 relative uppercase">
              Cancel Ad (Wait {adTimer}s)
            </div>
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={handleWatchAd}
            className={`w-full mt-auto relative overflow-hidden pb-4 group ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <div className={`w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-2xl font-black text-[15px] tracking-wide shadow-[0_6px_0_rgb(30,58,138)] h-[60px] flex items-center justify-center transition-transform ${isLoading ? '' : 'active:translate-y-[6px] active:shadow-[0_0px_0_rgb(30,58,138)]'} z-10 relative uppercase`}>
              {isLoading ? "Loading Ad..." : "Watch Ad Now"}
            </div>
          </button>
        )}

        {countdown === null && (
          <p className="text-center text-gray-500 text-xs font-bold mt-2 mb-4 max-w-[250px] tracking-wide">
            Stay on the ad for 15 seconds to progress towards the reward.
          </p>
        )}
      </div>

      <AnimatePresence>
        {modalState.show && (
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
              <div
                className={`absolute top-0 inset-x-0 h-32 ${modalState.type === "success" ? "bg-gradient-to-b from-green-50 to-white" : "bg-gradient-to-b from-red-50 to-white"} pointer-events-none`}
              />

              <div
                className={`w-24 h-24 ${modalState.type === "success" ? "bg-gradient-to-br from-green-300 to-green-500 shadow-green-500/30" : "bg-gradient-to-br from-red-300 to-red-500 shadow-red-500/30"} rounded-3xl mb-6 shadow-lg flex items-center justify-center relative z-10 rotate-3 border-4 border-white`}
              >
                <span className="text-5xl filter drop-shadow-md">
                  {modalState.type === "success" ? "🎉" : "⚠️"}
                </span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10 text-center">
                {modalState.type === "success" ? "Congratulations!" : "Early Exit"}
              </h2>

              <div className="text-sm text-gray-500 text-center mb-8 relative z-10 font-medium">
                {modalState.type === "success" ? (
                  <>
                    <p className="mb-2">Ad watched successfully!</p>
                    {modalState.reward! > 0 ? (
                      <p className="text-green-600 font-bold text-lg">
                        You received {modalState.reward} Coins!
                      </p>
                    ) : (
                      <p>Progress: {adCount}/5 towards reward.</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-red-600 font-bold">আপনি ১৫ সেকেন্ড সম্পূর্ণ দেখেননি।</p>
                    <p>আপনি দেখেছেন: <span className="font-bold text-gray-800">{modalState.timeSpent}</span> সেকেন্ড</p>
                    <p>বাকি ছিল: <span className="font-bold text-gray-800">{modalState.remaining}</span> সেকেন্ড</p>
                    <p className="mt-2 text-xs">তাই আপনি কোনো Coin পাননি।</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setModalState({ ...modalState, show: false })}
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
