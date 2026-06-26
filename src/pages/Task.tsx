import {
  ListTodo,
  CheckCircle,
  Activity,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const CATEGORIES = [
  { id: "joined", label: "Joined Tasks" },
  { id: "visit", label: "Visit Tasks" },
  { id: "registration", label: "App registration" },
  { id: "vip", label: "VIP User Task" },
];

export default function Task() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("joined");
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingSubmissions, setPendingSubmissions] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    const tasksRef = collection(db, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const tasksList = snapshot.docs
            .map((doc) => ({
              id: doc.id,
              fbId: doc.id,
              ...doc.data(),
            }))
            .filter((t: any) => t.active !== false);

          setTasks(tasksList);
        } else {
          setTasks([]);
        }
      },
      (error) => {
        console.warn("Task fetch error:", error);
        setTasks([]);
      },
    );
    return () => unsubscribe();
  }, []);

  // Fetch user's completions and submissions
  useEffect(() => {
    if (!user?.uid) return;

    const fetchUserProgress = async () => {
      try {
        const completionsQ = query(
          collection(db, "task_completions"),
          where("userId", "==", user.uid),
        );
        const submissionsQ = query(
          collection(db, "task_submissions"),
          where("userId", "==", user.uid),
        );

        const [compSnap, subSnap] = await Promise.all([
          getDocs(completionsQ),
          getDocs(submissionsQ),
        ]);

        const completed = new Set<string>();
        const pending = new Set<string>();

        compSnap.forEach((doc) => {
          completed.add(doc.data().taskId);
        });

        subSnap.forEach((doc) => {
          const data = doc.data();
          if (data.status === "approved") {
            completed.add(data.taskId);
          } else if (data.status === "pending") {
            pending.add(data.taskId);
          }
        });

        setCompletedTaskIds(completed);
        setPendingSubmissions(pending);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchUserProgress();
  }, [user?.uid]); 

  const filteredTasks = tasks.filter((t) => {
    const taskCategory = t.category || "joined"; // default fallback
    return taskCategory === activeCategory;
  });

  const totalTasksCount = tasks.length;
  const completedCount = completedTaskIds.size;
  const progressPercent =
    totalTasksCount > 0
      ? Math.round((completedCount / totalTasksCount) * 100)
      : 0;
  const pendingCount = totalTasksCount - completedCount;

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-8 bg-gray-50 text-gray-900 overflow-x-hidden">
      <h2 className="text-xl font-bold mb-4 px-2 flex items-center text-gray-800">
        <ListTodo className="mr-2 text-blue-600" /> Available Tasks
      </h2>

      {/* Progress Bar Component */}
      <div className="px-2 mb-6">
        <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 blur-[40px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-end mb-3 relative z-10">
            <div>
              <p className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase mb-1">
                Your Progress
              </p>
              <h3 className="text-2xl font-black text-[#2C334A] leading-none">
                {progressPercent}%
              </h3>
            </div>
            <div className="flex space-x-4">
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Completed
                </p>
                <p className="text-sm font-black text-green-500 flex items-center justify-end">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {completedCount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Pending
                </p>
                <p className="text-sm font-black text-orange-500 flex items-center justify-end">
                  <Clock className="w-3.5 h-3.5 mr-1" /> {pendingCount}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Track */}
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden relative z-10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar space-x-3 mb-6 px-2 pb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-5 py-3 rounded-2xl text-xs font-bold transition-all transform active:translate-y-1 ${
              activeCategory === cat.id
                ? "bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-[0_4px_0_rgb(30,58,138)] border-b border-blue-700"
                : "bg-white text-gray-600 border-2 border-gray-100 shadow-[0_4px_0_rgb(229,231,235)] hover:bg-gray-50"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center border-4 border-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] transform rotate-3">
            <span className="text-5xl drop-shadow-md">📋</span>
          </div>
          <p className="text-gray-500 text-sm font-medium max-w-[250px]">
            No tasks available in this category right now. Try again later.
          </p>
        </div>
      ) : (
        <div className="space-y-5 px-2">
          {filteredTasks.map((task) => {
            const isCompleted = completedTaskIds.has(task.fbId || task.id);
            const isPending = pendingSubmissions.has(task.fbId || task.id);

            return (
              <div
                key={task.fbId || task.id}
                className={`bg-white border-2 border-gray-100 rounded-3xl p-5 flex justify-between items-center shadow-[0_6px_0_rgb(229,231,235)] relative overflow-hidden transition-all ${isCompleted ? "opacity-70" : ""}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />

                {activeCategory === "vip" &&
                  (user?.currentLevel === 0 || !user?.currentLevel) && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-3xl">
                      <span className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-2 rounded-2xl text-xs font-bold shadow-[0_4px_0_rgb(88,28,135)] border-b border-purple-800">
                        VIP Only Task
                      </span>
                    </div>
                  )}
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white shrink-0">
                    <span className="drop-shadow-sm">
                      {task.icon === "message" ? "💬" : "📋"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-bold text-[15px] text-[#2C334A] leading-tight truncate">
                      {task.title || "Untitled Task"}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1 max-w-[170px] line-clamp-2 leading-snug">
                      {task.description}
                    </p>
                    <div className="inline-flex items-center mt-2 bg-amber-100 px-2 py-1 rounded-lg border border-amber-200">
                      <span className="text-amber-600 font-extrabold text-[11px] flex items-center">
                        +{task.reward || 50}{" "}
                        <span className="ml-1 opacity-80">Coins</span>
                      </span>
                    </div>
                  </div>
                </div>

                {isCompleted ? (
                  <div className="flex flex-col items-center justify-center z-10 relative">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-500 border border-green-200">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-green-600 mt-1">
                      DONE
                    </span>
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center justify-center z-10 relative">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 border border-orange-200">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-orange-600 mt-1">
                      PENDING
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (
                        activeCategory === "vip" &&
                        (user?.currentLevel === 0 || !user?.currentLevel)
                      ) {
                        alert("This task is only for VIP users.");
                        return;
                      }
                      navigate(`/task/${task.fbId || task.id}`);
                    }}
                    className="bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold text-xs px-6 py-3 rounded-2xl shadow-[0_4px_0_rgb(30,58,138)] border-b border-blue-800 active:translate-y-[4px] active:shadow-[0_0px_0_rgb(30,58,138)] transition-all z-10 relative shrink-0"
                  >
                    GO
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
