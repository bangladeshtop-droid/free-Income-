import { Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import { Lock } from "lucide-react";

const HARDCODED_ADS = Array.from({ length: 15 }, (_, i) => ({
  id: `ad-${i + 1}`,
  name: `Ad Campaign ${i + 1}`,
  type: 'limit',
  limit: '0/50',
  progress: '0%',
  active: true
}));

const AD_EMOJIS = ['🎬', '📺', '🚀', '🎁', '💎', '🎯', '🕹️', '🏆', '🔥', '🌟', '🤑', '✨', '⚡', '🎉', '🍿'];

export default function Ads() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [tasks, setTasks] = useState<any[]>(HARDCODED_ADS);

  const isVipUser = user?.isVip && user?.vipExpiry && user?.vipExpiry > Date.now();

  useEffect(() => {
    const adsRef = collection(db, 'ads');
    const q = query(adsRef, where("active", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const adsList = snapshot.docs.map(doc => ({
           id: doc.id,
           ...doc.data(),
           fbId: doc.id
        }));
        
        // Merge real data with hardcoded data
        const mergedTasks = HARDCODED_ADS.map((hardcodedTask, index) => {
          if (adsList[index]) {
             return {
                ...hardcodedTask,
                ...adsList[index],
                fbId: adsList[index].id
             };
          }
          return hardcodedTask;
        });
        setTasks(mergedTasks);
      } else {
        setTasks(HARDCODED_ADS);
      }
    }, (error) => {
      console.warn("Ads fetch error:", error);
      setTasks(HARDCODED_ADS);
    });
    return () => unsubscribe();
  }, []);

  return (
      <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-8 bg-gradient-to-b from-slate-50 to-indigo-50">
      
      <div className="flex items-center justify-between mb-6 px-2">
         <h2 className="text-2xl font-extrabold text-[#2C334A] flex items-center drop-shadow-sm tracking-tight">
           <Video className="w-6 h-6 mr-2 text-blue-600 drop-shadow-md" />
           Watch & Earn
         </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-24 px-1">
        {tasks.map((task, idx) => {
          const emoji = AD_EMOJIS[idx % AD_EMOJIS.length];
          return (
            <div 
              key={task.fbId || task.id} 
              className={`rounded-[28px] p-4 flex flex-col items-center relative overflow-hidden transition-all duration-200 transform border-2 shadow-[0_6px_0_rgb(229,231,235)] ${task.active ? 'bg-white border-blue-100 shadow-[0_6px_0_rgb(191,219,254)] hover:shadow-[0_2px_0_rgb(191,219,254)] hover:translate-y-[4px] cursor-pointer' : 'bg-gray-50 border-gray-100 grayscale-[0.5] opacity-80'}`}
              onClick={() => {
                if (!task.active) return;
                if (idx >= 3 && !isVipUser) {
                   alert("Please buy a VIP plan to access this ad campaign!");
                   navigate("/vip");
                   return;
                }
                navigate(`/ads/${task.fbId || task.id}`);
              }}
            >
              {task.active && (
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-[40px] opacity-20 pointer-events-none" />
              )}
              
              <div className={`w-14 h-14 rounded-2xl mb-3 flex items-center justify-center border-2 z-10 shadow-inner relative ${task.active ? 'bg-gradient-to-tr from-cyan-100 to-blue-50 border-white' : 'bg-gray-100 border-white'}`}>
                <span className={`text-[2rem] filter ${task.active ? 'drop-shadow-md' : 'opacity-70'}`}>
                  {emoji}
                </span>
                {idx >= 3 && !isVipUser && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                     <Lock className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              <h3 className={`font-extrabold text-[12px] mb-3 tracking-wide z-10 text-center truncate w-full ${task.active ? 'text-[#2C334A]' : 'text-gray-400'}`}>{task.name}</h3>
              
              {task.type === "timer" ? (
                <div className="flex flex-col items-center w-full mt-auto z-10">
                  <span className="text-gray-400 text-[9px] font-bold tracking-widest mb-1.5 uppercase">Next In</span>
                  <span className="bg-gradient-to-b from-orange-400 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-xl shadow-[0_3px_0_rgb(194,65,12)] border border-orange-600">
                    {task.time}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col w-full mt-auto z-10">
                  <div className="flex justify-between items-center w-full mb-1.5">
                    <span className="text-gray-400 text-[9px] font-bold tracking-widest uppercase">Limit</span>
                    <span className="text-blue-600 text-[10px] font-black bg-blue-50 px-1.5 py-0.5 rounded shadow-sm border border-blue-100">{task.limit}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full relative" style={{ width: task.progress }}>
                      <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
