import { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import {
  Settings,
  Users,
  LayoutDashboard,
  Bell,
  FileText,
  Gift,
  Download,
  Upload,
  Shield,
  Menu,
  X,
  Video,
  ListTodo,
  Plus,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { useEffect } from "react";
import PremiumBackButton from "../components/PremiumBackButton";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0E14] text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#151A23] flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-crypto-primary">
            <Shield className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight">Admin CMS</span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {[
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
            { name: "Task Manager", icon: ListTodo, path: "/admin/tasks" },
            { name: "Task Submissions", icon: FileText, path: "/admin/submissions" },
            { name: "Ad Settings", icon: Video, path: "/admin/ads" },
            { name: "Rewards & Bonus", icon: Gift, path: "/admin/rewards" },
            { name: "Users & VIP", icon: Users, path: "/admin/users" },
            { name: "Requests", icon: Download, path: "/admin/requests" },
            { name: "Payment Methods", icon: Upload, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <header className="h-16 border-b border-white/10 bg-[#151A23] flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-3">
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-semibold text-lg truncate ml-2">Admin Panel</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white relative p-1">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#151A23]"></span>
            </button>
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors text-sm font-medium"
            >
              <span>Exit Admin</span>
            </Link>
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-white/10 cursor-pointer text-white">
              SA
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 bg-[#0B0E14]">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="rewards" element={<AdminRewards />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="requests" element={<AdminRequests />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route
              path="*"
              element={
                <div className="text-gray-400">
                  Section pending implementation...
                </div>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    vipUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTickets: 0,
    activeTasks: 0,
    totalCoins: 0,
    adsWatched: 0,
    pendingSubmissions: 0,
  });

  const [toggles, setToggles] = useState({
    maintenance: false,
    registration: true,
    withdrawals: true,
    dailyCheckin: true
  });

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubUsers = onSnapshot(usersRef, (snap) => {
        if (!snap.empty) {
            let vipCount = 0;
            let coins = 0;
            let ads = 0;
            snap.docs.forEach(doc => {
              const d = doc.data();
              if (d.role === 'vip') vipCount++;
              coins += (d.vaBalance || 0);
              ads += (d.dailyAdsWatched || 0);
            });
            setStats(prev => ({ 
              ...prev, 
              totalUsers: snap.docs.length,
              vipUsers: vipCount,
              totalCoins: coins,
              adsWatched: ads
            }));
        } else {
            setStats(prev => ({ ...prev, totalUsers: 0, vipUsers: 0, totalCoins: 0, adsWatched: 0 }));
        }
    });

    const txRef = collection(db, 'transactions');
    const unsubTx = onSnapshot(txRef, (snap) => {
       if (!snap.empty) {
           let deposits = 0;
           let withdrawals = 0;
           let pendingReqs = 0;
           snap.docs.forEach((docSnap) => {
               const val = docSnap.data();
               if (val.type === 'deposit' && val.status === 'completed') deposits += (val.amount || 0);
               if (val.type === 'withdraw' && val.status === 'completed') withdrawals += (val.amount || 0);
               if ((val.type === 'deposit' || val.type === 'withdraw') && val.status === 'pending') pendingReqs++;
           });
           setStats(prev => ({ ...prev, totalDeposits: deposits, totalWithdrawals: withdrawals, pendingTickets: pendingReqs }));
       } else {
           setStats(prev => ({ ...prev, totalDeposits: 0, totalWithdrawals: 0, pendingTickets: 0 }));
       }
    });

    const tasksRef = collection(db, 'tasks');
    const unsubTasks = onSnapshot(tasksRef, snap => {
      setStats(prev => ({ ...prev, activeTasks: snap.docs.filter(d => d.data().active).length }));
    });

    const subsRef = collection(db, 'task_submissions');
    const unsubSubs = onSnapshot(subsRef, snap => {
      setStats(prev => ({ ...prev, pendingSubmissions: snap.docs.filter(d => d.data().status === 'pending').length }));
    });

    const togglesRef = doc(db, 'settings', 'toggles');
    const unsubToggles = onSnapshot(togglesRef, (snap) => {
        if (snap.exists()) {
            setToggles(prev => ({ ...prev, ...snap.data() }));
        }
    });

    return () => {
        unsubUsers();
        unsubTx();
        unsubToggles();
        unsubTasks();
        unsubSubs();
    };
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
      await updateDoc(doc(db, 'settings', 'toggles'), { [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Users", value: stats.totalUsers.toLocaleString(), color: "text-blue-400" },
          { label: "VIP Users", value: stats.vipUsers.toLocaleString(), color: "text-purple-400" },
          { label: "Total Balance (VA)", value: stats.totalCoins.toLocaleString(), color: "text-yellow-400" },
          { label: "Total Deposits", value: `${stats.totalDeposits.toLocaleString()} VA`, color: "text-green-400" },
          { label: "Total Withdrawals", value: `${stats.totalWithdrawals.toLocaleString()} VA`, color: "text-red-400" },
          { label: "Pending Requests", value: stats.pendingTickets.toString(), color: "text-orange-400" },
          { label: "Active Tasks", value: stats.activeTasks.toString(), color: "text-cyan-400" },
          { label: "Pending Submissions", value: stats.pendingSubmissions.toString(), color: "text-pink-400" },
          { label: "Ads Watched Today", value: stats.adsWatched.toString(), color: "text-emerald-400" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[#151A23] p-6 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-white/10 transition-colors" />
            <p className="text-gray-400 text-sm mb-2 font-medium">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#151A23] p-6 rounded-xl border border-white/5">
          <h3 className="font-semibold mb-4">Feature Toggles</h3>
          <div className="space-y-4">
            {[
              { label: "Maintenance Mode", key: "maintenance" },
              { label: "Registration", key: "registration" },
              { label: "Withdrawals", key: "withdrawals" },
              { label: "Daily Check-in", key: "dailyCheckin" },
            ].map((feature) => {
              const isActive = toggles[feature.key as keyof typeof toggles];
              return (
              <div key={feature.key} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">{feature.label}</span>
                <div 
                  className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-crypto-primary' : 'bg-gray-600'}`}
                  onClick={() => handleToggle(feature.key, !isActive)}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${isActive ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminAds() {
  const [settings, setSettings] = useState({
    adsEnabled: true,
    dailyAdsLimit: 50,
    adWatchDuration: 15,
    rewardPerAd: 50,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "ads_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...(docSnap.data() as any) });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    await updateDoc(doc(db, "settings", "ads_config"), settings);
    alert("Ad settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Ads Management Settings</h2>
      </div>

      <div className="bg-[#151A23] p-6 rounded-xl border border-white/5 space-y-6 max-w-xl">
        <h3 className="font-bold text-white">General Settings</h3>
        
        <div className="flex items-center justify-between bg-[#0B0E14] border border-white/10 rounded-lg p-4">
          <div>
            <span className="text-white block font-medium">Enable Ads System</span>
            <span className="text-gray-500 text-xs">Turn ad viewing on or off globally.</span>
          </div>
          <div 
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.adsEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
            onClick={() => setSettings({...settings, adsEnabled: !settings.adsEnabled})}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${settings.adsEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Daily Ads Limit (per user)</label>
          <input 
            type="number"
            value={settings.dailyAdsLimit}
            onChange={(e) => setSettings({...settings, dailyAdsLimit: parseInt(e.target.value) || 0})}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Ad Watch Duration (seconds)</label>
          <input 
            type="number"
            value={settings.adWatchDuration}
            onChange={(e) => setSettings({...settings, adWatchDuration: parseInt(e.target.value) || 0})}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-1">Reward Per Ad (Coins)</label>
          <input 
            type="number"
            value={settings.rewardPerAd}
            onChange={(e) => setSettings({...settings, rewardPerAd: parseInt(e.target.value) || 0})}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold mt-6 shadow-md hover:bg-blue-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function AdminTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    reward: 100,
    description: "",
    category: "joined",
    youtubeUrl: "",
    telegraphUrl: "",
    targetUrl: "",
    active: true,
  });

  useEffect(() => {
    const tasksRef = collection(db, "tasks");
    const unsubscribe = onSnapshot(
      tasksRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const tasksArray: any[] = [];
          snapshot.docs.forEach((docSnap) => {
            tasksArray.push({ id: docSnap.id, ...docSnap.data() });
          });
          setTasks(tasksArray);
        } else {
          setTasks([]);
        }
      },
      (error) => {
        console.warn("Tasks admin fetch error:", error);
      },
    );
    return () => unsubscribe();
  }, []);

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSaveTask = async () => {
    if (!newTask.title) return alert("Title required");
    
    if (editingId) {
      await updateDoc(doc(db, "tasks", editingId), {
        ...newTask,
      });
      setEditingId(null);
    } else {
      await addDoc(collection(db, "tasks"), {
        ...newTask,
        icon: "clipboard",
      });
    }

    setIsAdding(false);
    setNewTask({
      title: "",
      reward: 100,
      description: "",
      category: "joined",
      youtubeUrl: "",
      telegraphUrl: "",
      targetUrl: "",
      active: true,
    });
  };

  const handleEdit = (task: any) => {
    setNewTask({
      title: task.title,
      reward: task.reward,
      description: task.description,
      category: task.category,
      youtubeUrl: task.youtubeUrl || "",
      telegraphUrl: task.telegraphUrl || "",
      targetUrl: task.targetUrl || "",
      active: task.active,
    });
    setEditingId(task.id);
    setIsAdding(true);
  };

  const handleDuplicate = async (task: any) => {
    const { id, ...taskWithoutId } = task;
    await addDoc(collection(db, "tasks"), {
      ...taskWithoutId,
      title: `${task.title} (Copy)`,
    });
  };

  const handleToggleActive = async (task: any) => {
    await updateDoc(doc(db, "tasks", task.id), { active: !task.active });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "tasks", id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#151A23] -mt-6 -mx-6 px-6 py-4 border-b border-white/10 sticky top-0 z-10">
        <h2 className="text-xl font-bold">Task Management</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setNewTask({
              title: "",
              reward: 100,
              description: "",
              category: "joined",
              youtubeUrl: "",
              telegraphUrl: "",
              targetUrl: "",
              active: true,
            });
            setIsAdding(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center space-x-2 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#151A23] p-6 rounded-xl border border-white/5 space-y-4 mb-6">
          <h3 className="font-bold text-white mb-2">Create New Task</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <input
              type="number"
              placeholder="Reward Coins"
              value={newTask.reward}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  reward: parseInt(e.target.value) || 0,
                })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <select
              value={newTask.category}
              onChange={(e) =>
                setNewTask({ ...newTask, category: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white col-span-2"
            >
              <option value="joined">Joined Tasks (Telegram/Group)</option>
              <option value="visit">Visit Tasks (Website 30-40s timer)</option>
              <option value="registration">App Registration</option>
              <option value="vip">VIP User Task</option>
            </select>
            <textarea
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white col-span-2"
              rows={2}
            />
            <input
              placeholder="YouTube Tutorial URL"
              value={newTask.youtubeUrl}
              onChange={(e) =>
                setNewTask({ ...newTask, youtubeUrl: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <input
              placeholder="Telegraph Details URL"
              value={newTask.telegraphUrl}
              onChange={(e) =>
                setNewTask({ ...newTask, telegraphUrl: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white"
            />
            <input
              placeholder="Target Action URL (e.g. Join Link / Website)"
              value={newTask.targetUrl}
              onChange={(e) =>
                setNewTask({ ...newTask, targetUrl: e.target.value })
              }
              className="bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2 text-white col-span-2"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleSaveTask}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-bold text-white"
            >
              Save Task
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg font-bold text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-[#151A23] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-[#1C2331] text-gray-300 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Task Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Reward</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-b border-white/5 hover:bg-white/5"
              >
                <td className="px-6 py-4 font-medium text-white flex items-center space-x-3">
                  <ListTodo className="w-5 h-5 text-purple-400" />
                  <div>
                    <p>{task.title}</p>
                    <p className="text-xs text-gray-500 max-w-[200px] truncate">
                      {task.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 capitalize">
                  {task.category || "joined"}
                </td>
                <td className="px-6 py-4 text-yellow-400 font-bold">
                  +{task.reward} VA
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${task.active ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                  >
                    {task.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button
                    onClick={() => handleToggleActive(task)}
                    className="text-gray-400 hover:text-white"
                  >
                    {task.active ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(task)}
                    className="text-green-400 hover:text-green-300"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No tasks found. Create a task to offer users rewards.
          </div>
        )}
      </div>
    </div>
  );
}
function AdminSettings() {
  const [editing, setEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [coinValues, setCoinValues] = useState<any>({
    bkash: 1, nagad: 1, rocket: 1, usdt: 0.01, usdc: 0.01, ton: 0.005, trx: 0.1, not: 10, bnb: 0.0001
  });

  const handleEdit = async (key: string) => {
    setEditing(key);
    const docRef = doc(db, "settings", key);
    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        if (key === 'coin_values') {
           setCoinValues({ ...coinValues, ...snap.data() });
        } else if (snap.data().content) {
           setEditContent(snap.data().content);
        } else {
           setEditContent("");
        }
      } else {
        setEditContent("");
      }
    } catch (e) {
      console.warn("Fetch permissions error", e);
      setEditContent("");
    }
  };

  const handleSave = async () => {
    if (editing) {
      try {
        if (editing === 'coin_values') {
          await updateDoc(doc(db, "settings", "coin_values"), coinValues);
        } else {
          await updateDoc(doc(db, "settings", editing), { content: editContent });
        }
        alert("Saved!");
        setEditing(null);
      } catch (e) {
        console.warn("Save error", e);
        try {
          if (editing === 'coin_values') {
            await setDoc(doc(db, "settings", "coin_values"), coinValues);
          } else {
            await setDoc(doc(db, "settings", editing), { content: editContent });
          }
          alert("Saved!");
          setEditing(null);
        } catch(err) {
          alert("Failed to save");
        }
      }
    }
  };

  if (editing) {
    if (editing === 'coin_values') {
      return (
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center space-x-3 mb-6">
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">Edit Coin Values</h2>
          </div>
          <p className="text-sm text-gray-400 mb-6">Set the value of 1 VA coin in different currencies.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(coinValues).map(currency => (
              <div key={currency} className="bg-[#151A23] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <span className="font-bold text-white uppercase">{currency}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">1 VA =</span>
                  <input 
                    type="number" 
                    step="any"
                    value={coinValues[currency]} 
                    onChange={e => setCoinValues({...coinValues, [currency]: parseFloat(e.target.value) || 0})}
                    className="bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-1.5 text-white w-32 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSave} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl text-white font-bold shadow-md transition-colors">
            Save Coin Values
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={() => setEditing(null)}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold">Edit Content</h2>
        </div>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-64 bg-[#151A23] border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500"
          placeholder="Type Markdown or plain text here..."
        />
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg text-white font-medium shadow-md"
        >
          Save Content
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-white tracking-tight">App Content & Settings</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-2xl">
        Manage all customizable content shown in the user's Profile/Menu screen. 
        Update terms, guidelines, about pages, and other localized texts here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            label: "About Us",
            key: "about_us",
            desc: "Configure About Us page content",
            icon: "🏢"
          },
          {
            label: "Developer Profile",
            key: "developer_profile",
            desc: "Set developer details and social links",
            icon: "👨‍💻"
          },
          {
            label: "Help & Support",
            key: "support",
            desc: "Manage FAQs and contact methods",
            icon: "🎧"
          },
          {
            label: "VIP Plan",
            key: "vip_plan",
            desc: "Setup VIP subscription tiers and benefits",
            icon: "👑"
          },
          {
            label: "Refer Now",
            key: "refer_now",
            desc: "Configure referral program text",
            icon: "👥"
          },
          {
            label: "Fund Details",
            key: "fund_details",
            desc: "Information regarding funding and policies",
            icon: "💰"
          },
          {
            label: "Privacy Policy",
            key: "privacy_policy",
            desc: "Legal privacy rules and data usage",
            icon: "🔒"
          },
          {
            label: "Terms of Service",
            key: "terms_service",
            desc: "App usage terms and conditions",
            icon: "📜"
          },
          {
            label: "Coin Values",
            key: "coin_values",
            desc: "Set conversion rates for methods",
            icon: "💱"
          },
        ].map((section) => (
          <div
            key={section.key}
            className="bg-[#151A23] p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors group"
          >
            <div className="flex items-start space-x-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <div>
                <h3 className="font-bold text-white text-base">{section.label}</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{section.desc}</p>
              </div>
            </div>
            <button
              onClick={() => handleEdit(section.key)}
              className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl transition-colors text-sm font-bold border border-blue-600/20 group-hover:border-blue-600/40"
            >
              Edit Content
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const subRef = collection(db, "task_submissions");
    const unsubscribe = onSnapshot(subRef, (snapshot) => {
      if (!snapshot.empty) {
          const subsArray: any[] = [];
          snapshot.docs.forEach((docSnap) => {
             subsArray.push({ id: docSnap.id, ...docSnap.data() });
          });
          // Sort pending first
          subsArray.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return 0;
          });
          setSubmissions(subsArray);
      } else {
          setSubmissions([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string, userId: string, reward: number) => {
    try {
      await updateDoc(doc(db, "task_submissions", id), { status: newStatus });
      if (newStatus === "approved" && userId) {
        const userRef = doc(db, "users", userId.toString());
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            vaBalance: (userData.vaBalance || 0) + reward
          });
        }
        alert(`Submission approved! ${reward} VA rewarded to user.`);
      } else if (newStatus === "rejected") {
        alert("Submission rejected.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Task Submissions Review</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {submissions.map((sub) => (
          <div key={sub.id} className="bg-[#151A23] rounded-2xl border border-white/5 p-5 shadow-lg relative overflow-hidden group hover:border-white/10 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                  {(sub.username || 'U').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{sub.username || 'Unknown User'}</h3>
                  <p className="text-xs text-gray-400">{new Date(sub.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${sub.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : sub.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {sub.status || 'pending'}
              </span>
            </div>

            <div className="bg-[#0B0E14] rounded-xl p-3 mb-4 border border-white/5 flex-1">
              <p className="text-sm font-bold text-gray-200 mb-1">{sub.taskTitle}</p>
              <p className="text-xs text-yellow-400 font-bold mb-3">Reward: {sub.reward} VA</p>
              
              <div className="text-xs text-gray-400 mb-2">
                <span className="text-gray-500">Note:</span> {sub.note || 'No notes provided.'}
              </div>
              {sub.profileLink && (
                <a href={sub.profileLink} target="_blank" rel="noreferrer" className="inline-flex items-center space-x-1 text-blue-400 text-xs font-medium hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded-md">
                  <span>View Profile Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {sub.status === 'pending' && (
              <div className="flex space-x-3 mt-auto">
                <button onClick={() => handleStatusUpdate(sub.id, "approved", sub.userId, sub.reward)} className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold transition-colors border border-green-500/30 text-sm">
                  Approve
                </button>
                <button onClick={() => handleStatusUpdate(sub.id, "rejected", sub.userId, 0)} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-colors border border-red-500/30 text-sm">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <div className="col-span-full p-12 text-center text-gray-500 bg-[#151A23] rounded-2xl border border-white/5">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-lg">No submissions pending.</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'normal' | 'vip'>('normal');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [coinAmount, setCoinAmount] = useState<number | ''>('');
  const [coinAction, setCoinAction] = useState<'add' | 'remove'>('add');

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsub = onSnapshot(usersRef, snap => {
      const u: any[] = [];
      snap.docs.forEach(doc => {
        u.push({ id: doc.id, ...doc.data() });
      });
      setUsers(u);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(u => activeTab === 'vip' ? u.role === 'vip' : u.role !== 'vip');

  const handleUpdateCoins = async () => {
    if (!selectedUser || typeof coinAmount !== 'number' || coinAmount <= 0) return;
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const currentCoins = selectedUser.vaBalance || 0;
      const newCoins = coinAction === 'add' ? currentCoins + coinAmount : Math.max(0, currentCoins - coinAmount);
      await updateDoc(userRef, { vaBalance: newCoins });
      
      // Update local state temporarily so UI reflects before snap
      setSelectedUser({ ...selectedUser, vaBalance: newCoins });
      setCoinAmount('');
      alert(`Successfully updated coins! New balance: ${newCoins}`);
    } catch (e) {
      console.error(e);
      alert("Error updating coins");
    }
  };

  const handleToggleBan = async () => {
    if (!selectedUser) return;
    try {
      const userRef = doc(db, 'users', selectedUser.id);
      const isBanned = selectedUser.status === 'banned';
      await updateDoc(userRef, { status: isBanned ? 'active' : 'banned' });
      setSelectedUser({ ...selectedUser, status: isBanned ? 'active' : 'banned' });
      alert(`User ${isBanned ? 'Unbanned' : 'Banned'} successfully!`);
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    }
  };

  if (selectedUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
          <h2 className="text-xl font-bold tracking-tight">User Details</h2>
        </div>

        <div className="bg-[#151A23] rounded-2xl border border-white/5 p-6 shadow-lg">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl border-2 border-blue-500/30">
              {(selectedUser.username || 'U').substring(0,2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{selectedUser.username || 'Unknown'}</h3>
              <p className="text-gray-400 text-sm">ID: {selectedUser.uid}</p>
              <div className="flex space-x-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedUser.role === 'vip' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {selectedUser.role === 'vip' ? 'VIP' : 'Normal'}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedUser.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                  {selectedUser.status === 'banned' ? 'Banned' : 'Active'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0B0E14] rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-xs mb-1">Coin Balance</p>
              <p className="text-xl font-black text-yellow-400">{selectedUser.vaBalance || 0} <span className="text-sm">VA</span></p>
            </div>
            <div className="bg-[#0B0E14] rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-xs mb-1">Total Earned</p>
              <p className="text-xl font-black text-green-400">{selectedUser.totalEarned || 0} <span className="text-sm">VA</span></p>
            </div>
            <div className="bg-[#0B0E14] rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-xs mb-1">Total Referrals</p>
              <p className="text-xl font-black text-blue-400">{selectedUser.referralCount || 0}</p>
            </div>
            <div className="bg-[#0B0E14] rounded-xl p-4 border border-white/5">
              <p className="text-gray-500 text-xs mb-1">Ads Watched</p>
              <p className="text-xl font-black text-purple-400">{selectedUser.dailyAdsWatched || 0}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <span className="text-yellow-400">🪙</span>
                <span>Manage Coins</span>
              </h4>
              <div className="flex items-center space-x-3">
                <select 
                  value={coinAction} 
                  onChange={e => setCoinAction(e.target.value as any)}
                  className="bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none w-32"
                >
                  <option value="add">Add (+)</option>
                  <option value="remove">Remove (-)</option>
                </select>
                <input 
                  type="number"
                  placeholder="Amount"
                  value={coinAmount}
                  onChange={e => setCoinAmount(parseInt(e.target.value) || '')}
                  className="flex-1 bg-[#0B0E14] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                />
                <button onClick={handleUpdateCoins} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors">
                  Update
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <h4 className="font-bold text-white mb-3 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-red-400" />
                <span>Account Actions</span>
              </h4>
              <button 
                onClick={handleToggleBan}
                className={`px-6 py-3 rounded-xl font-bold transition-colors w-full ${selectedUser.status === 'banned' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
              >
                {selectedUser.status === 'banned' ? 'Unban User' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#151A23] -mt-6 -mx-6 px-6 py-4 border-b border-white/10 sticky top-0 z-10">
        <h2 className="text-xl font-bold tracking-tight">Users & VIP</h2>
      </div>

      <div className="flex space-x-2 bg-[#151A23] p-1.5 rounded-xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveTab('normal')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'normal' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          Normal Users
        </button>
        <button
          onClick={() => setActiveTab('vip')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'vip' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          VIP Users
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map(u => (
          <div key={u.id} className="bg-[#151A23] rounded-2xl border border-white/5 p-4 flex flex-col items-center text-center hover:border-white/10 transition-colors">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl mb-3 border-2 border-blue-500/30">
              {(u.username || 'U').substring(0,2).toUpperCase()}
            </div>
            <h3 className="font-bold text-white text-base truncate w-full">{u.username || 'Unknown'}</h3>
            <p className="text-yellow-400 text-sm font-bold mt-1">{u.vaBalance || 0} VA</p>
            <button 
              onClick={() => setSelectedUser(u)}
              className="mt-4 w-full py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors"
            >
              View Details
            </button>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            No {activeTab} users found.
          </div>
        )}
      </div>
    </div>
  );
}

function AdminRewards() {
  const [settings, setSettings] = useState({
    dailyBonusReward: 100,
    vipBonusMultiplier: 1.5,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, "settings", "rewards_config");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...(docSnap.data() as any) });
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    await updateDoc(doc(db, "settings", "rewards_config"), settings);
    alert("Reward settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Rewards & Daily Bonus Settings</h2>
      </div>

      <div className="bg-[#151A23] p-6 rounded-xl border border-white/5 space-y-6 max-w-xl">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Daily Bonus Claim Reward (Coins)</label>
          <input 
            type="number"
            value={settings.dailyBonusReward}
            onChange={(e) => setSettings({...settings, dailyBonusReward: parseInt(e.target.value) || 0})}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">VIP Reward Multiplier</label>
          <input 
            type="number"
            step="0.1"
            value={settings.vipBonusMultiplier}
            onChange={(e) => setSettings({...settings, vipBonusMultiplier: parseFloat(e.target.value) || 1.0})}
            className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold mt-6 shadow-md hover:bg-purple-700 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<'deposit' | 'withdraw'>('deposit');
  const [activeStatus, setActiveStatus] = useState<'pending' | 'completed' | 'rejected'>('pending');

  useEffect(() => {
    const reqsRef = collection(db, "transactions");
    const unsubscribe = onSnapshot(reqsRef, (snapshot) => {
      if (!snapshot.empty) {
        const arr: any[] = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.type === 'deposit' || data.type === 'withdraw') {
            arr.push({ id: docSnap.id, ...data });
          }
        });
        arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRequests(arr);
      } else {
        setRequests([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredReqs = requests.filter(r => r.type === activeType && (r.status || 'pending') === activeStatus);

  const handleStatusUpdate = async (req: any, newStatus: string) => {
    try {
      await updateDoc(doc(db, "transactions", req.id), { status: newStatus });
      
      if (req.type === 'deposit' && newStatus === 'completed' && req.userId) {
        const userRef = doc(db, 'users', req.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            vaBalance: (userData.vaBalance || 0) + (req.amount || 0)
          });
        }
      }
      
      if (req.type === 'withdraw' && newStatus === 'rejected' && req.userId) {
        const userRef = doc(db, 'users', req.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          await updateDoc(userRef, {
            vaBalance: (userData.vaBalance || 0) + (req.amount || 0)
          });
        }
      }

      alert(`Request marked as ${newStatus}`);
    } catch (e) {
      console.error(e);
      alert("Error updating status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#151A23] -mt-6 -mx-6 px-6 py-4 border-b border-white/10 sticky top-0 z-10">
        <h2 className="text-xl font-bold tracking-tight">Requests Management</h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex space-x-2 bg-[#151A23] p-1.5 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveType('deposit')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeType === 'deposit' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Deposits
          </button>
          <button
            onClick={() => setActiveType('withdraw')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeType === 'withdraw' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
          >
            Withdrawals
          </button>
        </div>

        <div className="flex space-x-2 bg-[#151A23] p-1.5 rounded-xl border border-white/5 w-fit">
          <button
            onClick={() => setActiveStatus('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveStatus('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStatus === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveStatus('rejected')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400 hover:text-white border border-transparent'}`}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReqs.map((req) => (
          <div key={req.id} className="bg-[#151A23] rounded-2xl border border-white/5 p-5 shadow-lg relative overflow-hidden hover:border-white/10 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${req.type === 'deposit' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                  {req.type}
                </span>
                <p className="text-xs text-gray-400 mt-2">{new Date(req.timestamp).toLocaleString()}</p>
              </div>
              <span className="font-black text-xl text-white">{req.amount} <span className="text-sm font-bold text-gray-400">{req.currency || 'VA'}</span></span>
            </div>

            <div className="bg-[#0B0E14] rounded-xl p-4 mb-4 border border-white/5 space-y-2 flex-1">
              <div className="flex justify-between">
                <span className="text-gray-500 text-xs">Method</span>
                <span className="text-white text-xs font-bold capitalize">{req.method || 'Unknown'}</span>
              </div>
              {req.txId && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">TxID / Order ID</span>
                  <span className="text-white text-xs font-mono">{req.txId}</span>
                </div>
              )}
              {req.sender && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">From</span>
                  <span className="text-white text-xs">{req.sender}</span>
                </div>
              )}
              {req.receiver && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">To</span>
                  <span className="text-white text-xs">{req.receiver}</span>
                </div>
              )}
              {req.memo && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Memo</span>
                  <span className="text-white text-xs">{req.memo}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="text-gray-500 text-xs">User ID</span>
                <span className="text-blue-400 text-xs truncate max-w-[120px]">{req.userId}</span>
              </div>
            </div>

            {activeStatus === 'pending' && (
              <div className="flex space-x-3 mt-auto">
                <button onClick={() => handleStatusUpdate(req, "completed")} className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl font-bold transition-colors border border-green-500/30 text-sm">
                  Approve
                </button>
                <button onClick={() => handleStatusUpdate(req, "rejected")} className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-bold transition-colors border border-red-500/30 text-sm">
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredReqs.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-[#151A23] rounded-2xl border border-white/5">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium text-lg">No {activeStatus} {activeType}s found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPayments() {
  const [methods, setMethods] = useState<any>({ deposit: [], withdraw: [] });
  const [activeType, setActiveType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isEditing, setIsEditing] = useState<any>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      const docRef = doc(db, 'settings', 'payment_methods');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setMethods(snap.data());
      } else {
        const defaultMethods = {
          deposit: [
            { id: 'bkash', name: 'bKash', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-bkash-3627962-3030230.png', address: '01XXXXXXXXX', isCrypto: false },
            { id: 'nagad', name: 'Nagad', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-nagad-3627958-3030226.png', address: '01XXXXXXXXX', isCrypto: false },
            { id: 'rocket', name: 'Rocket', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-rocket-3627959-3030227.png', address: '01XXXXXXXXX', isCrypto: false },
            { id: 'usdt', name: 'USDT', photo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', address: 'TXXXXXXXXXXXXXXXXXX', isCrypto: true },
            { id: 'ton', name: 'TON', photo: 'https://cryptologos.cc/logos/toncoin-ton-logo.png', address: 'EQXXXXXXXXXXXXXXXX', isCrypto: true },
            { id: 'usdc', name: 'USDC', photo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', address: 'TXXXXXXXXXXXXXXXXXX', isCrypto: true },
          ],
          withdraw: [
            { id: 'bkash', name: 'bKash', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-bkash-3627962-3030230.png', isCrypto: false },
            { id: 'nagad', name: 'Nagad', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-nagad-3627958-3030226.png', isCrypto: false },
            { id: 'rocket', name: 'Rocket', photo: 'https://cdn.iconscout.com/icon/free/png-256/free-rocket-3627959-3030227.png', isCrypto: false },
            { id: 'trx', name: 'TRX', photo: 'https://cryptologos.cc/logos/tron-trx-logo.png', isCrypto: true },
            { id: 'ton', name: 'TON', photo: 'https://cryptologos.cc/logos/toncoin-ton-logo.png', isCrypto: true },
            { id: 'usdt', name: 'USDT', photo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', isCrypto: true },
            { id: 'not', name: 'NOT COIN', photo: 'https://cryptologos.cc/logos/notcoin-not-logo.png', isCrypto: true },
            { id: 'bnb', name: 'BNB', photo: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', isCrypto: true },
          ]
        };
        await setDoc(docRef, defaultMethods);
        setMethods(defaultMethods);
      }
    };
    fetchMethods();
  }, []);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'settings', 'payment_methods'), methods);
      alert('Saved successfully!');
      setIsEditing(null);
    } catch (e) {
      alert('Error saving.');
    }
  };

  const updateMethod = (index: number, key: string, value: string) => {
    const updated = { ...methods };
    updated[activeType][index][key] = value;
    setMethods(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Payment Methods</h2>
      </div>

      <div className="flex space-x-2 bg-[#151A23] p-1.5 rounded-xl border border-white/5 w-fit">
        <button
          onClick={() => setActiveType('deposit')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeType === 'deposit' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          Deposit Methods
        </button>
        <button
          onClick={() => setActiveType('withdraw')}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeType === 'withdraw' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          Withdraw Methods
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(methods[activeType] || []).map((method: any, idx: number) => (
          <div key={idx} className="bg-[#151A23] p-5 rounded-2xl border border-white/5 flex flex-col items-center text-center">
            {isEditing === idx ? (
              <div className="space-y-3 w-full">
                <div>
                  <label className="text-xs text-gray-500 text-left block mb-1">Name</label>
                  <input value={method.name} onChange={e => updateMethod(idx, 'name', e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 text-left block mb-1">Photo URL</label>
                  <input value={method.photo} onChange={e => updateMethod(idx, 'photo', e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                {activeType === 'deposit' && (
                  <div>
                    <label className="text-xs text-gray-500 text-left block mb-1">Admin Account/Address</label>
                    <input value={method.address} onChange={e => updateMethod(idx, 'address', e.target.value)} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                )}
                <div className="flex space-x-2 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-2 text-sm font-bold">Save</button>
                  <button onClick={() => setIsEditing(null)} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white rounded-lg py-2 text-sm font-bold">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <img src={method.photo} alt={method.name} className="w-16 h-16 rounded-xl object-cover mb-3 bg-white p-1" />
                <h3 className="font-bold text-white mb-1">{method.name}</h3>
                {activeType === 'deposit' && (
                  <p className="text-xs text-gray-400 font-mono bg-[#0B0E14] px-2 py-1 rounded truncate w-full">{method.address || 'No address set'}</p>
                )}
                <button onClick={() => setIsEditing(idx)} className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 rounded-xl text-sm font-bold transition-colors">
                  Edit Method
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
