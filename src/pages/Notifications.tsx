import { useState, useEffect } from "react";
import { Bell, FileText, Gift, Wallet, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuthStore } from "../store/useAuthStore";
import PremiumBackButton from "../components/PremiumBackButton";

type TabType = 'admin' | 'app' | 'wallet';

export default function Notifications() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('admin');
  const user = useAuthStore(state => state.user);

  const [adminNotices, setAdminNotices] = useState<any[]>([]);
  const [appNotices, setAppNotices] = useState<any[]>([]);
  const [walletNotices, setWalletNotices] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchNotices = async () => {
      // 1. Fetch Admin Notices
      try {
        const adminQ = query(collection(db, 'notices'), orderBy('createdAt', 'desc'));
        const adminSnap = await getDocs(adminQ);
        setAdminNotices(adminSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch(e) { console.warn("Admin notices", e); }

      // 2. Fetch App/Task History
      try {
        const appQ = query(collection(db, 'task_history'), where('userId', '==', user.uid));
        const appSnap = await getDocs(appQ);
        const docs = appSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAppNotices(docs);
      } catch(e) { console.warn("App notices", e); }

      // 3. Fetch Wallet Transactions
      try {
        const walletQ = query(collection(db, 'transactions'), where('userId', '==', user.uid));
        const walletSnap = await getDocs(walletQ);
        const docs = walletSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        docs.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setWalletNotices(docs);
      } catch(e) { console.warn("Wallet notices", e); }
    };

    fetchNotices();
  }, [user?.uid]);

  const tabs = [
    { id: 'admin', label: 'Admin Notice', icon: FileText },
    { id: 'app', label: 'App Notice', icon: Gift },
    { id: 'wallet', label: 'Wallet Notice', icon: Wallet }
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 -mx-4 -my-6 relative">
      <div className="bg-white px-4 pt-10 pb-4 shadow-sm z-10 sticky top-0">
        <div className="flex items-center mb-4">
            <PremiumBackButton fallbackPath="/" className="scale-90 origin-left mr-4" />
            <h1 className="text-lg font-black text-[#2C334A] tracking-tight">Notifications</h1>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
            {tabs.map(t => (
                <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <t.icon className="w-3.5 h-3.5" />
                    <span className="truncate">{t.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'admin' && (
            adminNotices.length > 0 ? adminNotices.map((n) => (
                <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#2C334A] text-sm">{n.title || 'System Notice'}</h3>
                            <p className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{n.message || n.content}</p>
                </div>
            )) : <div className="text-center text-gray-400 py-10 font-bold text-sm">No admin notices</div>
        )}

        {activeTab === 'app' && (
            appNotices.length > 0 ? appNotices.map((n) => (
                <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Gift className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#2C334A] text-sm">{n.taskType === 'ad' ? 'Watched Ad' : 'Completed Task'}</h3>
                            <p className="text-[10px] text-gray-400">{new Date(n.timestamp).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="bg-green-50 text-green-600 px-3 py-1 rounded-lg font-black text-xs">
                        +{n.reward} VA
                    </div>
                </div>
            )) : <div className="text-center text-gray-400 py-10 font-bold text-sm">No app notices</div>
        )}

        {activeTab === 'wallet' && (
            walletNotices.length > 0 ? walletNotices.map((n) => (
                <div key={n.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.type === 'deposit' ? 'bg-blue-100 text-blue-600' : n.type === 'withdraw' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600'}`}>
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#2C334A] text-sm capitalize">{n.type} Request</h3>
                                <p className="text-[10px] text-gray-400">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${n.status === 'approved' ? 'bg-green-100 text-green-700' : n.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {n.status}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                            <span className="text-gray-400 block mb-0.5 text-[9px] uppercase tracking-wider">Method</span>
                            <span className="font-bold text-[#2C334A]">{n.method}</span>
                        </div>
                        <div>
                            <span className="text-gray-400 block mb-0.5 text-[9px] uppercase tracking-wider">Amount</span>
                            <span className="font-bold text-[#2C334A]">{n.amount} VA</span>
                        </div>
                        {n.txId && (
                            <div className="col-span-2">
                                <span className="text-gray-400 block mb-0.5 text-[9px] uppercase tracking-wider">Tx ID</span>
                                <span className="font-bold text-[#2C334A] text-[10px] break-all">{n.txId}</span>
                            </div>
                        )}
                        {n.sender && (
                            <div className="col-span-2">
                                <span className="text-gray-400 block mb-0.5 text-[9px] uppercase tracking-wider">Sender / Address</span>
                                <span className="font-bold text-[#2C334A] text-[10px] break-all">{n.sender}</span>
                            </div>
                        )}
                    </div>
                </div>
            )) : <div className="text-center text-gray-400 py-10 font-bold text-sm">No wallet notices</div>
        )}
      </div>
    </div>
  );
}
