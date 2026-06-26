import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Coins, Pickaxe, CheckCircle2, Play, Timer, Sparkles, Video } from "lucide-react";

export default function Earn() {
  const user = useAuthStore((state) => state.user);
  const [status, setStatus] = useState<'idle' | 'mining' | 'claimable'>('idle');
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('24:00:00');
  const [progress, setProgress] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);

  const MINING_REWARD = 500;
  const MINING_DURATION = 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!user) return;
    const fetchMiningState = async () => {
      const docRef = doc(db, 'users', user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.miningEndTime) {
          const end = new Date(data.miningEndTime);
          if (end.getTime() > Date.now()) {
            setStatus('mining');
            setEndTime(end);
          } else {
            setStatus('claimable');
            setEndTime(end);
            setProgress(100);
            setTimeLeft('00:00:00');
          }
        }
      }
    };
    fetchMiningState();
  }, [user?.uid]);

  useEffect(() => {
    if (status === 'mining' && endTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const end = endTime.getTime();
        const start = end - MINING_DURATION;
        
        if (now >= end) {
          setStatus('claimable');
          clearInterval(interval);
          setProgress(100);
          setTimeLeft('00:00:00');
        } else {
          const remaining = end - now;
          const h = Math.floor(remaining / (1000 * 60 * 60));
          const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
          
          const elapsed = now - start;
          setProgress((elapsed / MINING_DURATION) * 100);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, endTime]);

  const simulateAd = (callback: () => void) => {
    setShowAd(true);
    setAdProgress(0);
    const interval = setInterval(() => {
      setAdProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowAd(false);
          callback();
          return 100;
        }
        return prev + 2; // ~5 seconds ad
      });
    }, 100);
  };

  const handleStartEarning = () => {
    simulateAd(async () => {
      if (!user) return;
      const end = new Date(Date.now() + MINING_DURATION);
      await updateDoc(doc(db, 'users', user.uid), {
        miningStartTime: new Date().toISOString(),
        miningEndTime: end.toISOString(),
      });
      setStatus('mining');
      setEndTime(end);
    });
  };

  const handleClaim = () => {
    simulateAd(async () => {
      if (!user) return;
      
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const currentBalance = snap.data().vaBalance || 0;
        await updateDoc(userRef, {
          vaBalance: currentBalance + MINING_REWARD,
          miningStartTime: null,
          miningEndTime: null,
        });
        useAuthStore.getState().updateUser({ vaBalance: currentBalance + MINING_REWARD });
      }
      
      setStatus('idle');
      setEndTime(null);
      setProgress(0);
      setTimeLeft('24:00:00');
    });
  };

  return (
    <div className="flex flex-col items-center py-6 px-4 text-center min-h-[calc(100vh-100px)] relative overflow-hidden">
      
      {/* 3D Background Elements */}
      <div className="absolute top-10 left-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none" />

      <h1 className="text-2xl font-black text-[#2C334A] tracking-tight mb-2 relative z-10">VA Token Mining</h1>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10 relative z-10">Automated 24H Earning</p>

      {/* 3D Mining UI Centerpiece */}
      <div className="relative z-10 mb-12">
        <div className="w-56 h-56 rounded-full relative flex items-center justify-center">
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
          
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="#e2e8f0" 
              strokeWidth="4" 
            />
            <circle 
              cx="50" cy="50" r="46" 
              fill="none" 
              stroke="url(#gradient)" 
              strokeWidth="6" 
              strokeDasharray="289.02" /* 2 * pi * r */
              strokeDashoffset={289.02 - (progress / 100) * 289.02}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* 3D Coin Inner */}
          <div className={`w-44 h-44 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 shadow-[inset_0_-8px_16px_rgba(0,0,0,0.4),0_16px_32px_rgba(30,58,138,0.4)] flex flex-col items-center justify-center border-4 border-white/20 relative overflow-hidden ${status === 'mining' ? 'animate-[pulse_3s_ease-in-out_infinite]' : ''}`}>
             <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent transform -translate-x-full animate-[shimmer_2s_infinite]" />
             
             {status === 'idle' && (
                <>
                  <Pickaxe className="w-14 h-14 text-white drop-shadow-md mb-2" />
                  <span className="text-white/80 text-xs font-bold tracking-widest uppercase">Ready</span>
                </>
             )}
             
             {status === 'mining' && (
                <>
                  <div className="animate-spin mb-2">
                    <Sparkles className="w-12 h-12 text-yellow-300 drop-shadow-md" />
                  </div>
                  <span className="text-white font-black text-xl tracking-wider drop-shadow-md">{timeLeft}</span>
                  <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase mt-1">Mining Active</span>
                </>
             )}

             {status === 'claimable' && (
                <>
                  <Coins className="w-16 h-16 text-yellow-400 drop-shadow-lg mb-1 animate-bounce" />
                  <span className="text-white font-black text-2xl drop-shadow-md">+{MINING_REWARD}</span>
                </>
             )}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center mb-6">
          <p className="text-gray-500 text-sm font-medium mb-1">Current Reward Rate</p>
          <h3 className="text-3xl font-black text-[#2C334A] tracking-tight">{MINING_REWARD} <span className="text-lg text-gray-400 font-bold">VA / 24H</span></h3>
        </div>

        {status === 'idle' && (
          <button 
            onClick={handleStartEarning}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-black text-lg tracking-wide shadow-[0_6px_0_rgb(30,58,138),0_15px_20px_rgba(59,130,246,0.4)] active:shadow-[0_0px_0_rgb(30,58,138)] active:translate-y-[6px] transition-all flex items-center justify-center space-x-2"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START EARNING</span>
          </button>
        )}

        {status === 'mining' && (
          <button 
            disabled
            className="w-full py-4 rounded-2xl bg-gray-200 text-gray-400 font-black text-lg tracking-wide shadow-[0_6px_0_rgb(209,213,219)] flex items-center justify-center space-x-2"
          >
            <Timer className="w-6 h-6" />
            <span>MINING IN PROGRESS</span>
          </button>
        )}

        {status === 'claimable' && (
          <button 
            onClick={handleClaim}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 text-white font-black text-lg tracking-wide shadow-[0_6px_0_rgb(194,65,12),0_15px_20px_rgba(245,158,11,0.4)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-[6px] transition-all flex items-center justify-center space-x-2 animate-pulse"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>CLAIM {MINING_REWARD} VA</span>
          </button>
        )}
      </div>

      {/* Ad Modal Simulation */}
      {showAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="bg-gray-900 w-full max-w-sm rounded-3xl p-8 border border-white/10 flex flex-col items-center text-center">
            <Video className="w-16 h-16 text-blue-500 mb-6 animate-pulse" />
            <h3 className="text-white font-black text-xl mb-2 tracking-wide">Watching Sponsor Ad</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Please wait while the ad completes to receive your reward.</p>
            
            <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-100 ease-linear"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            <p className="text-blue-400 text-xs font-bold">{Math.floor(adProgress)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
