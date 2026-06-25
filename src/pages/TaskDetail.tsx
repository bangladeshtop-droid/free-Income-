import { AnimatePresence, motion } from "motion/react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Video,
  Link as LinkIcon,
  ExternalLink,
  Image as ImageIcon,
  Send,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { collection, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { playSound } from "../lib/sounds";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Visit Task States
  const [isVisiting, setIsVisiting] = useState(false);
  const [visitTimer, setVisitTimer] = useState(30);

  // App Reg States
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [note, setNote] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [photos, setPhotos] = useState<string[]>([]); // mock photo urls for now

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        const taskSnap = await getDoc(doc(db, "tasks", id));
        if (taskSnap.exists()) {
          setTask({ id: taskSnap.id, ...taskSnap.data() });
        }
      } catch (err) {
        console.error("Failed to fetch task:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  // Visit timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVisiting && visitTimer > 0) {
      interval = setInterval(() => {
        setVisitTimer((prev) => prev - 1);
      }, 1000);
    } else if (isVisiting && visitTimer === 0) {
      handleVisitComplete();
    }
    return () => clearInterval(interval);
  }, [isVisiting, visitTimer]);

  const [visitModalState, setVisitModalState] = useState<{
    show: boolean;
    type: "success" | "early_exit";
    reward?: number;
    timeSpent?: number;
    remaining?: number;
  }>({ show: false, type: "success" });

  const handleVisitComplete = async () => {
    setIsVisiting(false);
    const { user: currentUser, updateBalances } = useAuthStore.getState();
    const reward = task?.reward || 50;
    if (currentUser) {
      updateBalances(currentUser.usdtBalance, currentUser.vaBalance + reward);

      await addDoc(collection(db, "task_completions"), {
        userId: currentUser.uid,
        taskId: task?.id || "unknown",
        timestamp: new Date().toISOString(),
        reward: reward,
      });

      await addDoc(collection(db, "transactions"), {
        userId: currentUser.uid,
        type: "Visit Task",
        amount: reward,
        currency: "VA",
        timestamp: new Date().toISOString(),
        status: "completed"
      });
    }
    playSound("reward");
    setVisitModalState({ show: true, type: "success", reward });
  };

  const closeVisitEarly = () => {
    setIsVisiting(false);
    const timeSpent = 35 - visitTimer; // We use 35 as the default timer below
    setVisitModalState({ show: true, type: "early_exit", timeSpent, remaining: visitTimer });
  };

  const handleStartVisit = () => {
    // Open the target link in background or we simulate the visit by showing an overlay with timer
    window.open(task?.targetUrl || "https://google.com", "_blank");
    setVisitTimer(35); // Random between 30 and 40
    setIsVisiting(true);
  };

  const handleAppSubmit = async () => {
    if (!note || !profileLink) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "task_submissions"), {
        userId: user?.uid || "unknown",
        username: user?.username || user?.firstName || 'User',
        taskId: task?.id || "unknown",
        taskTitle: task?.title || "Unknown Task",
        reward: task?.reward || 0,
        note,
        profileLink,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      // Still open telegram if admin wants
      const text = `Task Submission:\nNote: ${note}\nProfile: ${profileLink}\nUser: ${user?.username}`;
      const encoded = encodeURIComponent(text);
      window.open(`https://t.me/your_admin_bot?start=${encoded}`, "_blank");
      
      alert("Submission sent successfully! It is now pending admin approval.");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to submit task.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
        Loading...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">
        Task not found
      </div>
    );
  }

  const category = task.category || "joined";

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-gray-50 text-gray-900 relative">
      {/* Header */}
      <header className="flex items-center space-x-4 mb-6 pt-4 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-gray-700 shadow-[0_4px_0_rgb(229,231,235)] active:shadow-[0_0px_0_rgb(229,231,235)] active:translate-y-[4px] transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-black text-[#2C334A] tracking-tight">Task Details</h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 space-y-6">
        <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[40px] rounded-full pointer-events-none group-hover:bg-blue-100 transition-colors" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black text-[#2C334A] mb-2 leading-tight">{task.title}</h2>
            
            <div className="inline-flex items-center space-x-2 bg-blue-50 border-2 border-blue-100 px-4 py-2 rounded-xl mb-6 shadow-inner">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">🪙</div>
              <span className="text-blue-700 font-black text-lg tracking-tight">+{task.reward} <span className="text-sm font-bold text-blue-500">Coins</span></span>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100/50 rounded-2xl p-5 mb-6 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h3 className="font-extrabold text-[11px] text-indigo-800 uppercase tracking-widest mb-2 opacity-80">
                Instructions
              </h3>
              <p className="text-[13px] text-indigo-900 font-medium whitespace-pre-wrap leading-relaxed">
                {task.description ||
                  "Follow the instructions to complete this task and earn your reward. Make sure to complete all steps accurately to receive coins."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() =>
                  window.open(task.youtubeUrl || "https://youtube.com", "_blank")
                }
                className="w-full flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-red-100 shadow-[0_6px_0_rgb(254,226,226)] active:shadow-[0_0px_0_rgb(254,226,226)] active:translate-y-[6px] transform transition-all duration-150 group/btn"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-2 shadow-inner group-hover/btn:scale-110 transition-transform">
                  <Video className="w-6 h-6 text-red-500 drop-shadow-sm" />
                </div>
                <span className="font-bold text-[11px] text-red-600 text-center leading-tight uppercase tracking-wider">Tutorial</span>
              </button>

              <button
                onClick={() =>
                  window.open(task.telegraphUrl || "https://telegra.ph", "_blank")
                }
                className="w-full flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-[0_6px_0_rgb(224,231,255)] active:shadow-[0_0px_0_rgb(224,231,255)] active:translate-y-[6px] transform transition-all duration-150 group/btn"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-2 shadow-inner group-hover/btn:scale-110 transition-transform">
                  <LinkIcon className="w-6 h-6 text-indigo-500 drop-shadow-sm" />
                </div>
                <span className="font-bold text-[11px] text-indigo-600 text-center leading-tight uppercase tracking-wider">Read Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Section based on Category */}
        <div className="animate-in fade-in slide-in-from-bottom-4">
          {category === "joined" && (
            <button
              onClick={() =>
                window.open(task.targetUrl || "https://t.me", "_blank")
              }
              className="w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-[0_6px_0_rgb(30,58,138)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[6px] active:shadow-[0_0px_0_rgb(30,58,138)]"
            >
              <span>JOIN NOW</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}

          {category === "visit" && (
            isVisiting ? (
              <button
                onClick={closeVisitEarly}
                className="w-full bg-gradient-to-b from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-[0_6px_0_rgb(153,27,27)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[6px] active:shadow-[0_0px_0_rgb(153,27,27)]"
              >
                <span>CANCEL (WAIT {visitTimer}S)</span>
              </button>
            ) : (
              <button
                onClick={handleStartVisit}
                className="w-full bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-[0_6px_0_rgb(30,58,138)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[6px] active:shadow-[0_0px_0_rgb(30,58,138)]"
              >
                <span>START VISITING</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            )
          )}

          {(category === "registration" || category === "vip") &&
            !showSubmitForm && (
              <button
                onClick={() => setShowSubmitForm(true)}
                className="w-full bg-gradient-to-b from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-4 rounded-2xl font-black text-sm tracking-wide shadow-[0_6px_0_rgb(21,128,61)] flex items-center justify-center space-x-2 transition-transform active:translate-y-[6px] active:shadow-[0_0px_0_rgb(21,128,61)]"
              >
                <span>SUBMIT PROOF</span>
                <Send className="w-4 h-4" />
              </button>
            )}
        </div>

        {/* App Registration Form */}
        {showSubmitForm && (
          <div className="bg-white rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 mt-6 animate-in fade-in slide-in-from-bottom-8 relative overflow-hidden">
            <h3 className="font-black text-xl text-[#2C334A] tracking-tight mb-6">Submit Your Proof</h3>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Upload Screenshots (Max 3)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-1 aspect-square bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <ImageIcon className="w-6 h-6" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Note / Task details
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Write your note here..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Profile Link
              </label>
              <input
                type="url"
                value={profileLink}
                onChange={(e) => setProfileLink(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <button
              onClick={handleAppSubmit}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-md hover:bg-green-700 active:scale-95 transition-all"
            >
              Submit to Admin
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {visitModalState.show && (
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
                className={`absolute top-0 inset-x-0 h-32 ${visitModalState.type === "success" ? "bg-gradient-to-b from-green-50 to-white" : "bg-gradient-to-b from-red-50 to-white"} pointer-events-none`}
              />

              <div
                className={`w-24 h-24 ${visitModalState.type === "success" ? "bg-gradient-to-br from-green-300 to-green-500 shadow-green-500/30" : "bg-gradient-to-br from-red-300 to-red-500 shadow-red-500/30"} rounded-3xl mb-6 shadow-lg flex items-center justify-center relative z-10 rotate-3 border-4 border-white`}
              >
                <span className="text-5xl filter drop-shadow-md">
                  {visitModalState.type === "success" ? "🎉" : "⚠️"}
                </span>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10 text-center">
                {visitModalState.type === "success" ? "Congratulations!" : "Early Exit"}
              </h2>

              <div className="text-sm text-gray-500 text-center mb-8 relative z-10 font-medium">
                {visitModalState.type === "success" ? (
                  <>
                    <p className="mb-2">Visit task completed!</p>
                    <p className="text-green-600 font-bold text-lg">
                      You received {visitModalState.reward} Coins!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-2 text-red-600 font-bold">আপনি নির্ধারিত সময় সম্পূর্ণ করেননি।</p>
                    <p>আপনি ছিলেন: <span className="font-bold text-gray-800">{visitModalState.timeSpent}</span> সেকেন্ড</p>
                    <p>বাকি ছিল: <span className="font-bold text-gray-800">{visitModalState.remaining}</span> সেকেন্ড</p>
                    <p className="mt-2 text-xs">তাই কোনো Coin প্রদান করা হয়নি।</p>
                  </>
                )}
              </div>

              <button
                onClick={() => setVisitModalState({ ...visitModalState, show: false })}
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
