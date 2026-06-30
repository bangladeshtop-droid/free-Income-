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
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-[#070514] text-white relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="flex items-center justify-between mb-8 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/ads" theme="dark" className="scale-90 origin-left" />
        <button className="flex items-center space-x-2 bg-[#12142B] border border-white/10 rounded-2xl px-3 py-2 shadow-sm">
          <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-[8px] text-white font-black">🌐</span>
          </div>
          <span className="text-xs font-bold text-white tracking-wider">ENG</span>
          <span className="text-xs text-gray-500">▼</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full relative z-10 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Podium and Icon */}
        <div className="relative flex justify-center mb-6">
            <div className="w-32 h-32 relative">
               <div className="absolute inset-0 bg-blue-500/20 blur-[30px] rounded-full" />
               <div className="absolute bottom-0 w-[120%] left-[-10%] h-8 bg-indigo-900/50 rounded-[100%] shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-500/30"></div>
               <div className="absolute bottom-2 w-full left-0 h-6 bg-[#1A1A32] rounded-[100%] flex items-center justify-center">
                  <div className="w-[80%] h-[70%] bg-[#242442] rounded-[100%]"></div>
               </div>
               {countdown !== null ? (
                 <Clock className="w-20 h-20 text-yellow-400 absolute top-1 left-6 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
               ) : (
                 <div className="w-20 h-20 absolute top-0 left-6 bg-gradient-to-b from-purple-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-[0_10px_25px_rgba(99,102,241,0.5)] border border-white/20">
                    <Video className="w-10 h-10 text-white drop-shadow-md" fill="currentColor" />
                 </div>
               )}
            </div>
        </div>

        <h1 className="text-3xl font-black mb-1 text-white tracking-tight text-center leading-tight">
          {countdown !== null ? "Daily Limit Reached" : "Rewarded Ad"}
        </h1>
        <p className="text-gray-400 text-[13px] mb-8 text-center px-4">
          {countdown !== null
            ? "You have watched all 50 ads for today."
            : "Earn 50 Coins for each 5 advertisements."}
        </p>

        {/* Progress Cards */}
        <div className="w-full bg-[#12142B]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 mb-4 relative shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          {/* Ad Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-500/30">
                     <Video className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                     <h3 className="text-white text-[13px] font-bold uppercase tracking-wider">Ad Progress</h3>
                     <p className="text-gray-400 text-[10px]">Watch ads to earn coins</p>
                  </div>
               </div>
               <div className="bg-[#1E1B3A] text-purple-300 font-bold text-[13px] px-3 py-1.5 rounded-lg border border-purple-500/20">
                  {adCount} / 5
               </div>
            </div>
            <div className="w-full h-3 bg-[#1A1A32] rounded-full overflow-hidden border border-white/5 shadow-inner">
               <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] relative transition-all duration-500" style={{ width: `${(adCount / 5) * 100}%` }}></div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-white/5 mb-6"></div>

          {/* Daily Limit */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center border border-emerald-500/30">
                     <Calendar className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                     <h3 className="text-white text-[13px] font-bold uppercase tracking-wider">Daily Limit</h3>
                     <p className="text-gray-400 text-[10px]">Maximum ads you can watch</p>
                  </div>
               </div>
               <div className="bg-[#1A2E26] text-emerald-400 font-bold text-[13px] px-3 py-1.5 rounded-lg border border-emerald-500/20">
                  {dailyWatched} / 50
               </div>
            </div>
            <div className="w-full h-3 bg-[#1A1A32] rounded-full overflow-hidden border border-white/5 shadow-inner">
               <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] relative transition-all duration-500" style={{ width: `${(dailyWatched / 50) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Earn More Coins Promo */}
        <div className="w-full bg-[#12142B]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 flex items-center justify-between mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
           <div className="flex items-center space-x-3">
              <div className="w-12 h-12 relative flex items-center justify-center">
                 <div className="absolute w-8 h-8 bg-yellow-400 rounded-full shadow-[inset_0_-4px_4px_rgba(180,100,0,0.5)] border-2 border-yellow-200 top-1 left-0 z-10" />
                 <div className="absolute w-8 h-8 bg-yellow-400 rounded-full shadow-[inset_0_-4px_4px_rgba(180,100,0,0.5)] border-2 border-yellow-200 bottom-0 left-2 z-20" />
                 <div className="absolute w-8 h-8 bg-yellow-500 rounded-full shadow-[inset_0_-4px_4px_rgba(180,100,0,0.5)] border-2 border-yellow-200 top-2 right-0 z-30" />
              </div>
              <div>
                 <h4 className="text-purple-300 font-bold text-[15px] mb-0.5">Earn More Coins</h4>
                 <p className="text-gray-400 text-[10px] leading-tight">Watch ads daily and<br/>boost your earnings!</p>
              </div>
           </div>
           <div className="w-12 h-12 flex items-end justify-end space-x-1 opacity-20">
              <div className="w-2 h-4 bg-purple-400 rounded-sm"></div>
              <div className="w-2 h-6 bg-purple-400 rounded-sm"></div>
              <div className="w-2 h-10 bg-purple-400 rounded-sm"></div>
              <div className="absolute w-12 h-12 border-t-2 border-r-2 border-purple-400 rounded-tr-[100%] right-0 top-0"></div>
           </div>
        </div>

        {/* Action Button */}
        {countdown !== null ? (
          <div className="w-full mt-auto relative overflow-hidden pb-4">
            <div className="w-full bg-[#1A1A32] border border-white/10 py-4 rounded-full font-black text-lg text-yellow-500 flex flex-col items-center justify-center pointer-events-none shadow-inner">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                Time Remaining
              </span>
              <span className="font-mono text-xl tracking-widest drop-shadow-sm">
                {formatTime(countdown)}
              </span>
            </div>
          </div>
        ) : isWatchingAd ? (
          <button
            onClick={closeAdEarly}
            className="w-full mt-auto relative overflow-hidden pb-4"
          >
            <div className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full font-bold text-[15px] shadow-[0_0_20px_rgba(220,38,38,0.4)] h-[55px] flex items-center justify-center transition-transform active:scale-95 z-10 relative uppercase tracking-wider">
              Cancel (Wait {adTimer}s)
            </div>
          </button>
        ) : (
          <button
            disabled={isLoading}
            onClick={handleWatchAd}
            className={`w-full mt-auto relative overflow-hidden pb-4 group ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <div className={`w-full bg-gradient-to-r from-[#4F46E5] to-[#9333EA] hover:from-[#4338CA] hover:to-[#7E22CE] text-white rounded-full font-black text-[15px] shadow-[0_0_20px_rgba(139,92,246,0.5)] h-[55px] flex items-center justify-center transition-all ${isLoading ? '' : 'active:scale-95'} z-10 relative uppercase tracking-wider`}>
              {!isLoading && (
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mr-3 backdrop-blur-sm">
                   <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
                </div>
              )}
              {isLoading ? "Loading..." : "Watch Ad Now"}
            </div>
          </button>
        )}

        {countdown === null && (
          <div className="flex items-center justify-center space-x-2 text-gray-500 pb-2">
            <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
              <svg className="w-2 h-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-[10px] font-medium leading-tight">
              Stay on the ad for 15 seconds<br/>to progress towards the reward.
            </p>
          </div>
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
