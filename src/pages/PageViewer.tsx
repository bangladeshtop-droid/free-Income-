import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import PremiumBackButton from "../components/PremiumBackButton";

export default function PageViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState('Loading...');
  const [title, setTitle] = useState('');

  useEffect(() => {
    let settingsKey = '';
    if (location.pathname === '/about') {
        settingsKey = 'about_us';
        setTitle('About Us');
    } else if (location.pathname === '/developer') {
        settingsKey = 'developer_profile';
        setTitle('Developer Profile');
    } else if (location.pathname === '/vip') {
        settingsKey = 'vip_plan';
        setTitle('VIP Plan');
    } else if (location.pathname === '/support') {
        settingsKey = 'support';
        setTitle('Help & Support');
    } else if (location.pathname === '/settings') {
        settingsKey = 'account_settings';
        setTitle('Account Settings');
    } else if (location.pathname === '/refer') {
        settingsKey = 'refer_now';
        setTitle('Refer Now');
    } else if (location.pathname === '/fund-details') {
        settingsKey = 'fund_details';
        setTitle('Fund Details');
    }

    if (settingsKey) {
        const docRef = doc(db, 'settings', settingsKey);
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            if (snapshot.exists() && snapshot.data().content) {
                setContent(snapshot.data().content);
            } else {
                setContent(`No content is available for ${title} yet.`);
            }
        }, (error) => {
            console.warn("Page setup error:", error);
            setContent(`Could not load content for ${title}.`);
        });
        return () => unsubscribe();
    }
  }, [location.pathname, title]);

  return (
    <div className="flex flex-col min-h-screen px-4 py-6 bg-gray-50 relative">
      <header className="flex items-center mb-6 relative z-10 pt-2">
        <PremiumBackButton fallbackPath="/profile" className="mr-4 scale-90" />
        <h1 className="font-extrabold text-lg text-gray-800">{title}</h1>
      </header>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-2 min-h-[50vh] whitespace-pre-wrap text-gray-700">
         {content}
      </div>
    </div>
  );
}
