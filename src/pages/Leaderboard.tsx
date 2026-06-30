import { Trophy, Search, Users, Activity, Medal, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Leaderboard() {
  const [listUsers, setListUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'refer' | 'running'>('refer');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
     // Fetch all users and sort locally to ensure users without the fields still appear
     const usersRef = collection(db, 'users');
     
     const unsubscribe = onSnapshot(usersRef, (snapshot) => {
         if (!snapshot.empty) {
             const usersArray: any[] = [];
             snapshot.docs.forEach((doc) => {
                 const data = doc.data();
                 usersArray.push({
                     id: doc.id,
                     ...data,
                     referralCount: data.referralCount || 0,
                     totalEarned: data.totalEarned || 0,
                     vaBalance: data.vaBalance || 0
                 });
             });
             
             const orderByField = activeTab === 'refer' ? 'referralCount' : 'totalEarned';
             
             // Sort descending
             usersArray.sort((a, b) => b[orderByField] - a[orderByField]);
             
             // Take top 50
             const topUsers = usersArray.slice(0, 50);

             const formattedUsers = topUsers.map((u, index) => ({
                 rank: index + 1,
                 name: u.username || 'User',
                 handle: u.telegramId ? `@${u.telegramId}` : `@user_${u.id.substring(0,4)}`,
                 score: u[orderByField],
                 initial: (u.username || 'U').substring(0, 2).toUpperCase(),
             }));

             setListUsers(formattedUsers);
         } else {
             setListUsers([]);
         }
     }, (error) => {
         console.warn("Leaderboard fetch error:", error);
     });
     return () => unsubscribe();
  }, [activeTab]);

  const filteredUsers = listUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-gray-50 text-gray-900 pb-10 relative overflow-hidden">
      {/* Header Card */}
      <div className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm mb-4 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none" />
        
        <div className="flex items-center space-x-2 mb-2 relative z-10">
          <Star className="w-4 h-4 text-purple-600" />
          <h1 className="text-[10px] font-bold tracking-widest text-purple-600 uppercase">STARS ARENA</h1>
        </div>
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1 pr-4">
            <h2 className="text-xl font-black text-gray-900 leading-tight mb-2 tracking-wide">CHAMPIONS LEADERBOARD</h2>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              Verify top-level partners, run metrics, and verify where your profile sits in our community rankings pool.
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
            <Trophy className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl flex items-center px-4 py-3 mb-4 border border-gray-100 shadow-sm">
        <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Search member tag..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm text-gray-800 w-full placeholder-gray-400"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        <button 
          onClick={() => setActiveTab('refer')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-[11px] tracking-widest uppercase transition-all ${activeTab === 'refer' ? 'bg-[#9333EA] text-white shadow-md shadow-purple-500/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
        >
          <Users className="w-4 h-4" />
          <span>TOP REFER</span>
        </button>
        <button 
          onClick={() => setActiveTab('running')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl font-bold text-[11px] tracking-widest uppercase transition-all ${activeTab === 'running' ? 'bg-[#9333EA] text-white shadow-md shadow-purple-500/20' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'}`}
        >
          <Activity className="w-4 h-4" />
          <span>TOP RUNNING</span>
        </button>
      </div>

      {/* List Header */}
      <div className="flex justify-between items-center px-2 mb-3">
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">RANK & USER TAGS</span>
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{activeTab === 'refer' ? 'REFERRAL UNITS' : 'EARNING UNITS'}</span>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const isTop3 = user.rank <= 3;
          return (
            <div key={user.rank} className="bg-white rounded-[20px] p-3 flex items-center border border-gray-100 shadow-sm">
              
              {/* Rank Icon */}
              <div className="w-10 flex justify-center shrink-0">
                {user.rank === 1 ? (
                  <div className="relative">
                    <Medal className="w-6 h-6 text-yellow-500 drop-shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white">1</div>
                  </div>
                ) : user.rank === 2 ? (
                  <div className="relative">
                    <Medal className="w-6 h-6 text-gray-400 drop-shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white">2</div>
                  </div>
                ) : user.rank === 3 ? (
                  <div className="relative">
                    <Medal className="w-6 h-6 text-orange-500 drop-shadow-md" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] font-black text-white border border-white">3</div>
                  </div>
                ) : (
                  <span className="font-bold text-gray-500">#{user.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0 mx-3">
                {user.initial}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{user.name}</h3>
                <p className="text-[11px] text-gray-500 truncate">{user.handle}</p>
              </div>

              {/* Score */}
              <div className="shrink-0 flex items-center">
                <span className="font-bold text-gray-900 font-mono text-sm mr-1">{user.score}</span>
                <span className="text-[10px] text-gray-400 font-bold tracking-wider">{activeTab === 'refer' ? 'refs' : 'VA'}</span>
              </div>
            </div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm font-bold">
            No users found
          </div>
        )}
      </div>
    </div>
  );
}
