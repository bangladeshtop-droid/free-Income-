import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import PremiumBackButton from "../components/PremiumBackButton";
import EmptyState from "../components/EmptyState";
import { History } from "lucide-react";

export default function Activity() {
  const user = useAuthStore((state) => state.user);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const txRef = collection(db, "transactions");
    const q = query(txRef, where("userId", "==", user.uid.toString()));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const acts: any[] = [];
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          acts.push({
            id: doc.id,
            type: data.type || "transaction",
            amount: data.amount || 0,
            status: data.status || "completed",
            date: new Date(
              data.timestamp || data.createdAt || Date.now(),
            ).getTime(),
            note: data.note || "No description",
          });
        });
        // Sort descending by date
        acts.sort((a, b) => b.date - a.date);
        setActivities(acts);
      } else {
        setActivities([]);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="flex items-center mb-6 pt-2">
        <PremiumBackButton
          fallbackPath="/profile"
          className="scale-90 origin-left mr-4"
        />
        <h2 className="text-xl font-bold text-gray-800">Activity Tracker</h2>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800 capitalize">{act.type}</p>
                <p className="text-xs text-gray-500">
                  {new Date(act.date).toLocaleString()}
                </p>
                {act.note && (
                  <p className="text-xs text-gray-400 mt-1">{act.note}</p>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${act.type === "deposit" || act.type === "bonus" ? "text-green-500" : "text-red-500"}`}
                >
                  {act.type === "deposit" || act.type === "bonus" ? "+" : "-"}
                  {act.amount} VA
                </p>
                <p className="text-[10px] text-gray-400 uppercase">
                  {act.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="No Activity Yet"
          description="Your transaction history, rewards, and daily check-ins will appear here."
        />
      )}
    </div>
  );
}
