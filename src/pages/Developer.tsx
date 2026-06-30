import { MessageCircle, Phone, Code2, Sparkles, Star } from "lucide-react";
import PremiumBackButton from "../components/PremiumBackButton";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Developer() {
  const [developerData, setDeveloperData] = useState<any>({
    name: "Md Sayed Islam",
    role: "Lead Developer & Architect",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4",
    description: "Passionate full-stack developer specializing in premium mobile-first web applications. Let's build something amazing together.",
    telegram: "https://t.me/sayedislam201545",
    whatsapp: "https://wa.me/8801700000000"
  });

  useEffect(() => {
    const fetchDeveloper = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "developer_profile"));
        if (snap.exists() && snap.data().name) {
          setDeveloperData(snap.data());
        }
      } catch(e) {}
    };
    fetchDeveloper();
  }, []);

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-gray-50 text-gray-900 pb-10 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center mb-8 relative z-10 pt-6 px-4">
        <PremiumBackButton fallbackPath="/profile" className="scale-90 origin-left mr-4" />
        <h1 className="text-[14px] font-bold tracking-[0.2em] text-gray-800 uppercase">Developer Profile</h1>
      </div>

      <div className="px-4 relative z-10 flex-1 flex flex-col items-center pt-8">
        {/* Profile Card */}
        <div className="w-full max-w-sm bg-white rounded-[32px] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden flex flex-col items-center text-center">
          
          {/* Decorative Background inside card */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-t-[32px]" />
          
          {/* Photo */}
          <div className="relative mt-8 mb-6">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 relative z-10">
              <img 
                src={developerData.image} 
                alt="Developer" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center shadow-lg z-20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Name & Title */}
          <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{developerData.name}</h2>
          <p className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-4">{developerData.role}</p>

          <div className="flex items-center space-x-1 mb-6 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4 font-medium">
            {developerData.description}
          </p>

          {/* Actions */}
          <div className="w-full space-y-3">
            {developerData.telegram && (
              <a 
                href={developerData.telegram} 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                Contact on Telegram
              </a>
            )}
            
            {developerData.whatsapp && (
              <a 
                href={developerData.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-green-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                Chat on WhatsApp
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
