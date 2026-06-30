import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import PremiumBackButton from "../components/PremiumBackButton";
import {
  Crown,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Clock,
  Tag,
} from "lucide-react";

export default function VIP() {
  const user = useAuthStore((state) => state.user);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansSnap = await getDoc(doc(db, "settings", "vip_plans"));
        if (plansSnap.exists() && plansSnap.data().plans) {
          setPlans(plansSnap.data().plans);
        }

        if (user) {
          const userSnap = await getDoc(doc(db, "users", user.uid));
          if (userSnap.exists()) {
            setUserData(userSnap.data());
          }
        }
      } catch (e) {
        console.error("Error fetching VIP data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleBuyPlan = async (plan: any) => {
    if (!user || !userData) return;

    setMessage(null);
    if (userData.vaBalance < plan.coin) {
      setMessage({
        type: "error",
        text: `Insufficient balance to purchase this plan.`,
      });
      return;
    }

    setBuyingId(plan.id);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(plan.duration));

      await updateDoc(doc(db, "users", user.uid), {
        vaBalance: increment(-plan.coin),
        isVip: true,
        vipExpiry: expiryDate.getTime(),
      });

      setUserData({
        ...userData,
        vaBalance: userData.vaBalance - plan.coin,
        isVip: true,
        vipExpiry: expiryDate.getTime(),
      });

      setMessage({
        type: "success",
        text: `Successfully activated ${plan.name}! Verified badge is now active.`,
      });
    } catch (e) {
      console.error("Purchase failed", e);
      setMessage({
        type: "error",
        text: "An error occurred during purchase. Please try again.",
      });
    } finally {
      setBuyingId(null);
    }
  };

  const isVipActive =
    userData?.isVip && userData?.vipExpiry && userData.vipExpiry > Date.now();

  return (
    <div className="flex flex-col min-h-screen bg-[#05050A] text-white pb-20 relative overflow-hidden font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-purple-600/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>
      <div className="absolute top-[20%] left-[-10%] w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>

      <div className="relative z-10 flex items-center space-x-3 px-4 pt-4">
        <PremiumBackButton fallbackPath="/profile" theme="dark" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          VIP Plans
        </h1>
      </div>

      <div className="px-4 mt-6 relative z-10">
        {userData && (
          <div
            className={`rounded-2xl p-5 mb-8 border backdrop-blur-xl shadow-lg ${isVipActive ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30" : "bg-white/5 border-white/10"}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-white flex items-center space-x-2">
                  <span>Current Status</span>
                  {isVipActive && (
                    <Crown className="w-4 h-4 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" />
                  )}
                </h3>
                {isVipActive ? (
                  <p className="text-amber-400 text-sm font-bold mt-1">
                    VIP Verified until{" "}
                    {new Date(userData.vipExpiry).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm font-bold mt-1">
                    Unverified Account
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400">Your Balance</p>
                <p className="font-black text-lg text-blue-400">
                  {userData.vaBalance} VA
                </p>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start space-x-3 backdrop-blur-md border ${message.type === "success" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
          >
            {message.type === "success" ? (
              <Crown className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : plans.filter((p) => p.status === "active" || p.status === undefined)
            .length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
            <Crown className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-bold">No VIP Plans available.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {plans
              .filter((p) => p.status === "active" || p.status === undefined)
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((plan) => (
                <div key={plan.id} className="relative group">
                  {/* Glowing border effect */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 rounded-[2rem] opacity-30 group-hover:opacity-60 transition duration-500 blur-md ${plan.animationStyle === "glow" ? "animate-pulse" : ""}`}
                  ></div>

                  <div className="bg-[#0B0E17]/90 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/10 relative transform transition-all duration-300 shadow-2xl">
                    {/* Top Banner with Animated Plan Name */}
                    <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                      {plan.photo ? (
                        <img
                          src={plan.photo}
                          alt={plan.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E17] via-[#0B0E17]/40 to-transparent"></div>

                      {/* Animated Plan Title */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <h2
                          className={`text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-300 text-center px-4 tracking-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.8)]
                        ${plan.animationStyle === "float" ? "animate-[bounce_3s_infinite]" : ""}
                        ${plan.animationStyle === "glow" ? "drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]" : ""}
                      `}
                        >
                          {plan.title?.toUpperCase()}
                        </h2>
                      </div>
                    </div>

                    <div className="px-5 pb-6">
                      {/* Duration and Price */}
                      <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 backdrop-blur-sm shadow-inner mt-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 tracking-wider">
                              Duration
                            </p>
                            <p className="text-lg font-black text-purple-300">
                              {plan.duration} Days
                            </p>
                          </div>
                        </div>

                        <div className="w-px h-10 bg-white/10"></div>

                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-400 tracking-wider">
                              Price
                            </p>
                            <p className="text-lg font-black text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                              {plan.currency || "৳"}{" "}
                              {plan.coin?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 mb-6 shadow-inner">
                        <ul className="space-y-4">
                          {plan.features?.map((feature: any, idx: number) => (
                            <li
                              key={feature.id || idx}
                              className="flex items-center text-gray-300 text-sm sm:text-base font-medium"
                            >
                              <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-black mr-4 shrink-0 border border-indigo-500/30">
                                {idx + 1}
                              </span>
                              <span className="leading-tight drop-shadow-sm">
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Buy Button */}
                      <button
                        onClick={() => handleBuyPlan(plan)}
                        disabled={buyingId === plan.id}
                        className={`w-full py-4 rounded-2xl font-black text-lg tracking-wide text-white transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] disabled:opacity-70 disabled:cursor-not-allowed
                        bg-gradient-to-r ${plan.buttonColor || "from-amber-500 to-orange-500"}
                      `}
                      >
                        {buyingId === plan.id ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-6 h-6" />
                            <span>{plan.buttonText || "Buy Plan"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
