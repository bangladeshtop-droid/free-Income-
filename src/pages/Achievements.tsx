import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import PremiumBackButton from "../components/PremiumBackButton";
import EmptyState from "../components/EmptyState";
import { Trophy, CheckCircle, Gift, ArrowRight } from "lucide-react";
import { playPremiumClick, playSuccessSound } from "../utils/audio";

const CATEGORIES = [
  { id: "Task", label: "Task" },
  { id: "Refer", label: "Refer" },
  { id: "Earn", label: "Earn" },
  { id: "Ads", label: "Ads" },
];

export default function Achievements() {
  const user = useAuthStore((state) => state.user);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("Task");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "achievements"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((a: any) => a.status !== "inactive");
      setAchievements(data);
    });
    return () => unsub();
  }, []);

  const handleClaim = async (achievement: any) => {
    if (!user || claimingId) return;

    playPremiumClick();
    setClaimingId(achievement.id);

    // Simulate ad play wait
    setTimeout(async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        const claimedList = userDoc.data()?.claimedAchievements || [];

        if (!claimedList.includes(achievement.id)) {
          await updateDoc(userRef, {
            vaBalance: (userDoc.data()?.vaBalance || 0) + achievement.coin,
            claimedAchievements: [...claimedList, achievement.id],
          });

          playSuccessSound();
          alert(`Successfully claimed ${achievement.coin} VA!`);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to claim reward");
      }
      setClaimingId(null);
    }, 2000); // Simulate 2s ad delay
  };

  const getUserProgress = (category: string) => {
    if (!user) return 0;
    switch (category) {
      case "Task":
        return user.completedTasks || 0;
      case "Refer":
        return user.referralCount || 0;
      case "Earn":
        return user.vaBalance || 0; // Using current balance, could be totalEarned
      case "Ads":
        return user.watchedAds || 0; // Assuming this field exists or defaults to 0
      default:
        return 0;
    }
  };

  const filteredAchievements = achievements.filter(
    (a) => a.category === activeCategory,
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#080B17] -mx-4 -my-6 px-4 py-8 overflow-x-hidden relative text-white">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>
      <div className="absolute top-[30%] left-[-20%] w-72 h-72 bg-blue-600/10 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <div className="relative z-10 flex items-center mb-6">
        <PremiumBackButton
          fallbackPath="/profile"
          theme="dark"
          className="scale-90 origin-left mr-4"
        />
        <h1 className="text-2xl font-bold text-white">
          Badges & Achievements
        </h1>
      </div>

      <div className="relative z-10 flex overflow-x-auto hide-scrollbar space-x-3 mb-6 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              playPremiumClick();
              setActiveCategory(cat.id);
            }}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
              activeCategory === cat.id
                ? "bg-[#1E1145] text-purple-300 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-[#131627] text-gray-400 border-white/5 hover:bg-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="relative z-10 space-y-6">
        {filteredAchievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No Achievements"
            description={`No achievements added in the ${activeCategory} category yet.`}
          />
        ) : (
          filteredAchievements.map((ach) => {
            const currentProgress = getUserProgress(ach.category);
            const isCompleted = currentProgress >= ach.target;
            const percent = Math.min(
              100,
              Math.round((currentProgress / ach.target) * 100),
            );
            const hasClaimed = user?.claimedAchievements?.includes(ach.id);

            // Calculate stars (5 steps)
            const starCount = 5;
            const filledStars = Math.floor((percent / 100) * starCount);

            return (
              <div
                key={ach.id}
                className="bg-[#12142B] p-5 rounded-3xl shadow-lg border border-purple-500/20 flex flex-col relative overflow-hidden group"
              >
                {/* Inner glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] pointer-events-none" />

                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-24 h-24 shrink-0 relative flex items-center justify-center drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <img
                      src={ach.photo}
                      alt={ach.name}
                      className="w-full h-full object-contain drop-shadow-xl"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-xl mb-2">
                      {ach.name}
                    </h3>
                    <div className="inline-flex items-center bg-[#1A1A32] border border-yellow-500/30 text-yellow-500 font-bold text-sm px-3 py-1.5 rounded-xl">
                      <Gift className="w-4 h-4 mr-2" />+{ach.coin} VA
                    </div>
                    <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                      Complete {ach.category.toLowerCase()}s and earn valuable rewards
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm font-bold text-gray-300 mb-3">
                  <span>Progress</span>
                  <span className="text-purple-300">
                    {currentProgress} / {ach.target}
                  </span>
                </div>

                <div className="h-2 bg-[#1A1A32] rounded-full overflow-hidden mb-6 relative border border-white/5 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? "bg-gradient-to-r from-green-400 to-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]" : "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"}`}
                    style={{ width: `${percent}%` }}
                  />
                  {/* Glowing dot at the end of progress */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white]"
                    style={{ left: `calc(${percent}% - 6px)`, display: percent > 0 ? 'block' : 'none' }}
                  />
                </div>

                <div className="flex justify-between items-center px-2 mb-6">
                  {Array.from({ length: starCount }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 z-10 ${
                        i < filledStars 
                          ? 'bg-[#1E1145] border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.5)] text-yellow-500' 
                          : 'bg-[#1A1A32] border-white/10 text-gray-600'
                      }`}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      {/* Connecting line */}
                      {i < starCount - 1 && (
                        <div className={`h-0.5 w-full mx-1 ${
                          i < filledStars - 1 ? 'bg-purple-500/50' : 'bg-white/5'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-[#1A1A32] rounded-2xl p-4 flex items-center justify-between border border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#12142B] flex items-center justify-center border border-white/10">
                      {isCompleted ? (
                        <Gift className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">
                        {hasClaimed ? "Claimed" : isCompleted ? "Completed" : "Not Completed"}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {isCompleted && !hasClaimed ? "Ready to claim" : "Complete all tasks to unlock this badge"}
                      </div>
                    </div>
                  </div>

                  {hasClaimed ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-[#12142B] text-gray-500 font-bold rounded-xl text-sm border border-white/5"
                    >
                      Claimed
                    </button>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(ach)}
                      disabled={claimingId === ach.id}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-70 disabled:cursor-wait text-sm"
                    >
                      {claimingId === ach.id ? "Wait..." : "Claim"}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
