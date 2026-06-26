import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useState, useEffect } from "react";
import { playSound } from "../lib/sounds";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import PremiumBackButton from "../components/PremiumBackButton";

declare global {
    interface Window {
        show_9955574?: () => void;
    }
}

export default function CheckIn() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
     if (!user) return;
     // Check if user already checked in today
     const fetchHistory = async () => {
         const histRef = query(collection(db, 'daily_bonus_history'), where('userId', '==', user.uid.toString()));
         const snapshot = await getDocs(histRef);
         if (!snapshot.empty) {
             let latestDate = 0;
             let count = 0;
             snapshot.docs.forEach(doc => {
                 count++;
                 const date = doc.data().date || 0;
                 if (date > latestDate) latestDate = date;
             });
             setStreak(count);
             const today = new Date().setHours(0,0,0,0);
             if (latestDate >= today) {
                 setIsCheckedIn(true);
             }
         }
     };
     fetchHistory();
  }, [user?.uid]);

  const handleCheckIn = () => {
      if (isCheckedIn || !user) return;
      setIsLoading(true);

      const scriptId = 'ad-sdk-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;
      
      const triggerAd = () => {
          if (window.show_9955574) {
              window.show_9955574();
          }
          setTimeout(async () => {
              setIsLoading(false);
              setIsCheckedIn(true);
              setStreak(streak + 1);

              // 1. Give reward
              const updateBalances = useAuthStore.getState().updateBalances;
              updateBalances(user.usdtBalance, user.vaBalance + 30);
              
              // 2. Log in history
              await addDoc(collection(db, 'daily_bonus_history'), {
                  userId: user.uid.toString(),
                  date: Date.now(),
                  amount: 30
              });

              // 3. Log transaction
              await addDoc(collection(db, 'transactions'), {
                  userId: user.uid.toString(),
                  type: 'bonus',
                  amount: 30,
                  status: 'completed',
                  createdAt: Date.now(),
                  note: 'Daily Check-in Bonus'
              });

              playSound('reward');
              alert("Checked in successfully! You received 30 Coins.");
          }, 15000);
      };

      if (!script) {
         script = document.createElement('script');
         script.id = scriptId;
         script.src = '//libtl.com/sdk.js';
         script.setAttribute('data-zone', '9955574');
         script.setAttribute('data-sdk', 'show_9955574');
         script.onload = () => {
             script.setAttribute('data-loaded', 'true');
             triggerAd();
         };
         document.body.appendChild(script);
      } else {
         if (script.getAttribute('data-loaded') === 'true') {
             triggerAd();
         } else {
             script.addEventListener('load', triggerAd, { once: true });
         }
      }
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-gradient-to-b from-[#8ab4f8] to-[#EAF0FF] relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 text-gray-900 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/" className="scale-90 origin-left" />
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full primary-gradient flex items-center justify-center font-bold text-white shadow-sm border border-purple-300">
                VA
            </div>
        </div>
        <div className="w-8" />
      </header>

      {/* Balance display */}
      <div className="relative z-10 mb-6 flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full primary-gradient flex items-center justify-center font-bold text-white shadow-lg border-2 border-purple-300">
              VA
          </div>
          <span className="text-3xl font-bold text-gray-800 drop-shadow-sm">{user?.vaBalance}</span>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-sm mb-6 relative z-10">
        <div className="flex justify-between items-baseline mb-4">
            <h2 className="text-xl font-bold text-[#2C334A]">Daily check-in</h2>
            <span className="text-xs text-gray-500 font-medium">Consecutive check-ins {streak} days</span>
        </div>

        <div className="flex justify-between space-x-1 mb-6 overflow-x-auto hide-scrollbar pb-2">
            {[1, 2, 3, 4, 5, 6].map((day) => {
                const claimed = day < streak || (day === streak && isCheckedIn);
                const isToday = day === streak + (isCheckedIn ? 0 : 1);
                
                return (
                <div key={day} className={`flex flex-col items-center p-2 rounded-xl min-w-[50px] ${claimed ? 'bg-crypto-primary text-white shadow-md' : 'bg-transparent text-gray-400'}`}>
                    <span className={`text-[10px] mb-2 ${claimed ? 'text-white/80' : 'text-gray-500'}`}>Day {day}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] mb-1 ${claimed ? 'border border-white/20' : 'bg-crypto-primary border border-purple-200 text-white shadow-sm'}`}>
                        VA
                    </div>
                    <span className="text-[10px] font-bold">{claimed ? "Claimed" : (isToday ? "+30" : "+10")}</span>
                </div>
            )})}
        </div>

        <button 
           onClick={handleCheckIn}
           disabled={isCheckedIn || isLoading}
           className={`w-full py-3 rounded-full font-bold shadow-sm transition-colors ${isCheckedIn ? 'bg-white text-gray-400 border border-gray-200' : 'bg-crypto-primary text-white hover:bg-[#6A3ACC]'}`}>
            {isLoading ? "Loading Ad..." : isCheckedIn ? "Checked in today" : "Check in now"}
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-6 shadow-sm relative z-10">
          <h3 className="font-bold text-[#2C334A] mb-4">Check-in instructions</h3>
          <ol className="text-sm text-gray-500 space-y-3 list-decimal list-inside">
              <li>Log in daily and click (Sign in now) to receive corresponding rewards</li>
              <li>Continuous check-in can increase your earnings</li>
          </ol>
      </div>

    </div>
  );
}
