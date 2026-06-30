import { Headset, MessageCircle, Mail, Globe, ArrowRight, User } from "lucide-react";
import PremiumBackButton from "../components/PremiumBackButton";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Support() {
  const [supportAgents, setSupportAgents] = useState<any[]>([
    {
      id: 1,
      name: "Alex Support",
      role: "Technical Assistant",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede",
      action: "Telegram",
      link: "https://t.me/support_alex",
      color: "blue"
    },
    {
      id: 2,
      name: "Sarah Helpdesk",
      role: "Billing & Accounts",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf",
      action: "Email Support",
      link: "mailto:support@goaltubebd.com",
      color: "red"
    },
    {
      id: 3,
      name: "Global Community",
      role: "Public Group",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Group&backgroundColor=b6e3f4",
      action: "Join Group",
      link: "https://t.me/goaltubebd_group",
      color: "green"
    }
  ]);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", "support"));
        if (snap.exists() && snap.data().agents) {
          setSupportAgents(snap.data().agents);
        }
      } catch(e) {}
    };
    fetchSupport();
  }, []);

  const getIcon = (color: string) => {
    switch (color) {
      case 'red': return Mail;
      case 'green': return Globe;
      default: return MessageCircle;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] bg-gray-50 text-gray-900 pb-10 relative overflow-hidden">
      {/* 3D Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center mb-6 relative z-10 pt-6 px-4">
        <PremiumBackButton fallbackPath="/profile" className="scale-90 origin-left mr-4" />
        <h1 className="text-[14px] font-bold tracking-[0.2em] text-gray-800 uppercase">Help & Support</h1>
      </div>

      <div className="px-4 relative z-10 flex-1 flex flex-col">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 shadow-lg shadow-blue-500/20 mb-8 relative overflow-hidden text-white">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-2xl rounded-full mix-blend-overlay"></div>
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/20">
            <Headset className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">How can we help?</h2>
          <p className="text-blue-100 text-sm font-medium leading-relaxed">
            Our support team is available 24/7 to assist you with any inquiries or issues.
          </p>
        </div>

        {/* Support List */}
        <h3 className="font-extrabold text-lg text-gray-800 mb-4 px-1">Support Agents</h3>
        
        <div className="space-y-4">
          {supportAgents.map((agent) => {
            const AgentIcon = getIcon(agent.color);
            return (
            <div key={agent.id} className="bg-white rounded-3xl p-4 shadow-[0_8px_16px_rgba(0,0,0,0.04)] border border-gray-100 flex items-center transition-transform transform hover:-translate-y-1">
              
              <div className="w-16 h-16 rounded-2xl bg-gray-100 p-1 mr-4 shrink-0 shadow-inner overflow-hidden flex items-center justify-center relative">
                {agent.image ? (
                  <img src={agent.image} alt={agent.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="font-black text-gray-900 text-base truncate">{agent.name || 'Support'}</h4>
                <p className="text-xs font-bold text-gray-500 tracking-wide uppercase mt-0.5 truncate">{agent.role || 'Assistant'}</p>
              </div>

              <a 
                href={agent.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-md transition-colors 
                  ${agent.color === 'blue' ? 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' : ''}
                  ${agent.color === 'red' ? 'bg-red-100 text-red-600 hover:bg-red-600 hover:text-white' : ''}
                  ${agent.color === 'green' ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white' : ''}
                  ${!['blue', 'red', 'green'].includes(agent.color) ? 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' : ''}
                `}
              >
                <AgentIcon className="w-5 h-5" />
              </a>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
