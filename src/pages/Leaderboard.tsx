import { Trophy, Gift, ArrowRight, User } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Leaderboard() {
  const [listUsers, setListUsers] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
     // Fetch top 20 users by referralCount (fallback to vaBalance if not using refs yet)
     const usersRef = collection(db, 'users');
     const q = query(usersRef, orderBy('referralCount', 'desc'), limit(20));
     
     const unsubscribe = onSnapshot(q, (snapshot) => {
         if (!snapshot.empty) {
             const usersArray: any[] = [];
             snapshot.docs.forEach((doc) => {
                 const data = doc.data();
                 usersArray.push({
                     id: doc.id,
                     ...data,
                     refs: data.referralCount || 0
                 });
             });
             
             const formattedUsers = usersArray.map((u, index) => ({
                 rank: index + 1,
                 name: u.username || 'User',
                 refs: u.refs,
                 initial: (u.username || 'U').substring(0, 2).toUpperCase(),
                 verified: u.role === 'admin' || u.role === 'super_admin'
             }));

             setListUsers(formattedUsers);

             const top3 = formattedUsers.slice(0, 3);
             const podium = [];
             if (top3[1]) podium.push({ ...top3[1], rank: 2 });
             if (top3[0]) podium.push({ ...top3[0], rank: 1 });
             if (top3[2]) podium.push({ ...top3[2], rank: 3 });
             
             setTopUsers(podium);
         } else {
             setListUsers([]);
             setTopUsers([]);
         }
     }, (error) => {
         console.warn("Leaderboard fetch error:", error);
     });
     return () => unsubscribe();
  }, []);

  const getRankBadgeColors = (rank: number) => {
    switch(rank) {
      case 1: return { bg: 'bg-gradient-to-br from-yellow-300 to-yellow-500', text: 'text-white', pillBg: 'bg-yellow-100', pillText: 'text-yellow-600', shadow: 'shadow-yellow-500/40' };
      case 2: return { bg: 'bg-gradient-to-br from-gray-200 to-gray-400', text: 'text-gray-700', pillBg: 'bg-blue-100', pillText: 'text-blue-600', shadow: 'shadow-blue-500/40' };
      case 3: return { bg: 'bg-gradient-to-br from-orange-300 to-orange-500', text: 'text-white', pillBg: 'bg-orange-100', pillText: 'text-orange-600', shadow: 'shadow-orange-500/40' };
      default: return { bg: 'bg-transparent', text: 'text-gray-500', pillBg: 'bg-blue-50', pillText: 'text-blue-500', shadow: '' };
    }
  };

  return (
      <div className="flex flex-col min-h-screen -mx-4 -my-6 bg-gradient-to-b from-[#eaf0fc] to-[#e4effc] relative">
      
      {/* Background Diamonds */}
      <div className="absolute top-40 left-4 w-4 h-4 bg-blue-300/40 rotate-45 rounded-[2px]"></div>
      <div className="absolute top-64 right-6 w-5 h-5 bg-orange-300/40 rotate-45 rounded-[2px]"></div>

      {/* Header */}
      <div className="pt-10 pb-4 text-center relative z-10 px-4">
        <button className="absolute top-10 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.05)] text-[10px] font-bold text-[#2C334A] flex items-center space-x-1 hover:scale-105 transition-transform">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>My Rank</span>
        </button>
        <div className="flex items-center justify-center space-x-2 mb-1">
            <h1 className="text-3xl font-black text-[#1a233a] tracking-tight">Leaderboard</h1>
            <span className="text-3xl">🏆</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
            <span className="text-yellow-500 rotate-180">🌿</span>
            <p className="text-[10px] font-black text-blue-700 tracking-wider uppercase">Top 20 Referrers of the Week</p>
            <span className="text-yellow-500">🌿</span>
        </div>
      </div>

      {/* 3D Podium Layout */}
      <div className="flex justify-center items-end px-4 mb-4 space-x-4 relative z-10 h-[280px]">
        {topUsers.map((user) => {
          const colors = getRankBadgeColors(user.rank);
          const isCenter = user.rank === 1;
          
          return (
          <div key={user.rank} className={`flex flex-col items-center relative w-[100px] z-${isCenter ? '20' : '10'}`}>
             {/* Card over podium */}
             <div className={`absolute bottom-[100%] mb-4 flex flex-col items-center bg-white/80 backdrop-blur-md rounded-2xl p-2 shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-white ${isCenter ? 'w-[120px] pb-3' : 'w-[90px]'}`}>
                {/* Crown for #1 */}
                {isCenter && <Trophy className="absolute -top-8 w-14 h-14 text-yellow-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.1)] fill-yellow-400" />}
                
                {/* Rank Starburst Badge */}
                <div className={`absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center font-black ${colors.bg} ${colors.text} shadow-lg border-2 border-white`}>
                  {user.rank}
                </div>

                {/* Avatar */}
                <div className={`rounded-full mt-2 mb-2 flex items-center justify-center ${isCenter ? 'w-16 h-16 bg-yellow-500 border-4 border-yellow-200 text-white' : user.rank === 2 ? 'w-14 h-14 bg-blue-500 border-4 border-blue-200 text-white' : 'w-14 h-14 bg-orange-500 border-4 border-orange-200 text-white'} shadow-inner font-black text-xl`}>
                    {user.initial}
                </div>
                
                {/* Name & Pill */}
                <p className={`font-bold text-[#2C334A] truncate w-full text-center tracking-tight mb-1 ${isCenter ? 'text-sm' : 'text-xs'}`}>{user.name}</p>
                <div className={`${colors.pillBg} ${colors.pillText} rounded-lg py-1 w-full flex justify-center items-center shadow-inner`}>
                  <p className="text-[9px] font-black tracking-widest uppercase">{user.refs} REFS</p>
                </div>
             </div>

             {/* 3D Pillar (Cylinder) */}
             <div className={`w-[90px] relative rounded-[50%] flex justify-center ${isCenter ? 'h-24 bg-yellow-400 z-20' : user.rank === 2 ? 'h-16 bg-blue-400' : 'h-12 bg-orange-400'}`}>
               <div className={`absolute -top-4 w-full h-8 rounded-[50%] ${isCenter ? 'bg-yellow-300' : user.rank === 2 ? 'bg-blue-300' : 'bg-orange-300'} border-4 border-white/30 shadow-[inset_0_4px_10px_rgba(255,255,255,0.5)] flex items-center justify-center`}>
                  <span className="text-white/50 font-black text-2xl">{user.rank}</span>
               </div>
               {/* 3D side gradient */}
               <div className={`absolute inset-0 rounded-[50%] ${isCenter ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : user.rank === 2 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} opacity-50`}></div>
             </div>
          </div>
        )})}
      </div>

      {/* List */}
      <div className="flex-1 bg-gradient-to-b from-white/90 to-blue-50/50 backdrop-blur-xl rounded-t-[40px] px-4 pt-6 pb-32 border-t border-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20">
        <div className="space-y-3">
          {listUsers.map((user) => {
            const colors = getRankBadgeColors(user.rank);
            const isTop3 = user.rank <= 3;
            return (
            <div key={user.rank} className="flex items-center bg-white p-3.5 rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-50/50 group hover:shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all">
              
              {/* Rank Icon */}
              <div className="w-8 flex justify-center">
                {isTop3 ? (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[11px] ${colors.bg} ${colors.text} border border-white shadow-md`}>
                    {user.rank}
                  </div>
                ) : (
                  <span className="text-gray-400 font-black text-sm">{user.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full ml-3 mr-4 flex items-center justify-center text-sm font-black text-white ${isTop3 ? 'bg-blue-600' : 'bg-gray-300'}`}>
                {user.initial}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                  <span className="font-bold text-[#2C334A] text-sm truncate block">{user.name}</span>
              </div>

              {/* Score Pill */}
              <div className={`${isTop3 ? (user.rank===1?'bg-yellow-100 text-yellow-600':user.rank===2?'bg-blue-100 text-blue-600':'bg-orange-100 text-orange-600') : 'bg-blue-50 text-blue-500'} px-3 py-1.5 rounded-xl`}>
                <span className="font-black text-[10px] tracking-widest uppercase">{user.refs} REFS</span>
              </div>
            </div>
          )})}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="fixed bottom-[72px] left-4 right-4 z-40 bg-gradient-to-r from-blue-50 to-blue-100 rounded-[24px] p-4 flex justify-between items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)] border-2 border-white">
          <div className="flex items-center space-x-3">
             <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transform -rotate-6">
                <Gift className="w-6 h-6 text-white" />
             </div>
             <div>
                <h3 className="font-black text-[#2C334A] text-[13px] leading-tight mb-0.5">Invite More,<br/><span className="text-yellow-500">Earn More!</span></h3>
                <p className="text-[9px] text-gray-500 leading-tight">Invite friends and be<br/>top referrer.</p>
             </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 flex items-center space-x-1.5 shadow-md transition-colors">
             <span className="font-bold text-xs">Invite</span>
             <ArrowRight className="w-3.5 h-3.5" />
          </button>
      </div>
    </div>
  );
}
