import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguageStore } from "../store/useLanguageStore";
import PremiumBackButton from "../components/PremiumBackButton";

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali (বাংলা)', flag: '🇧🇩' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'hi', name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'zh', name: 'Chinese (中文)', flag: '🇨🇳' },
  { code: 'ko', name: 'Korean (한국어)', flag: '🇰🇷' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish (Türkçe)', flag: '🇹🇷' },
  { code: 'vi', name: 'Vietnamese (Tiếng Việt)', flag: '🇻🇳' },
  { code: 'th', name: 'Thai (ไทย)', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian (Bahasa Indonesia)', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay (Bahasa Melayu)', flag: '🇲🇾' },
  { code: 'ur', name: 'Urdu (اردو)', flag: '🇵🇰' },
  { code: 'fa', name: 'Persian (فارسی)', flag: '🇮🇷' },
];

export default function Language() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguageStore();

  const handleSelectLanguage = (langCode: string, langName: string) => {
    setLanguage(langName);
    
    // Set cookies for persistence across reloads
    document.cookie = `googtrans=/en/${langCode}; path=/;`;
    if (window.location.hostname !== 'localhost') {
        document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${window.location.hostname};`;
    }

    // Attempt to change language via the embedded script combo box
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-gray-50 relative">
      {/* Header */}
      <header className="flex items-center mb-8 text-[#2C334A] pt-2">
        <PremiumBackButton fallbackPath="/profile" className="scale-90 origin-left mr-4" />
        <h1 className="text-xl font-bold">Language Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-8 hide-scrollbar">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2">
          {languages.map((lang) => {
            const isActive = language === lang.name;
            return (
              <div 
                key={lang.code}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${isActive ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                onClick={() => handleSelectLanguage(lang.code, lang.name)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{lang.name}</span>
                </div>
                
                {/* Toggle Button */}
                <div 
                  className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${isActive ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
