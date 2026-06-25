import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "motion/react";
import { playSound } from "../lib/sounds";

export default function Spin() {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const prizes = [
    { text: "10 VA", isCrypto: false },
    { text: "10", isCrypto: true },
    { text: "500 VA", isCrypto: false },
    { text: "0.1", isCrypto: true },
    { text: "100", isCrypto: true },
    { text: "5000 VA", isCrypto: false },
    { text: "0.01", isCrypto: true },
    { text: "1000 VA", isCrypto: false },
    { text: "1 VA", isCrypto: false },
    { text: "1", isCrypto: true },
  ];

  const sliceAngle = 360 / prizes.length;
  const conicString = prizes
    .map((_, i) => `${i % 2 === 0 ? '#FFFFFF' : '#F3E8FF'} ${i * sliceAngle}deg ${(i + 1) * sliceAngle}deg`)
    .join(", ");

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    playSound('spin');
    
    // Play tick sound every few MS during spin
    let spinSoundInterval = setInterval(() => {
        playSound('click');
    }, 150);

    const newRotation = rotation + 360 * 5 + Math.floor(Math.random() * 360);
    setRotation(newRotation);
    
    setTimeout(() => {
      clearInterval(spinSoundInterval);
      setIsSpinning(false);
      playSound('success');
    }, 5000);
  };

  return (
    <div className="flex flex-col min-h-screen -mx-4 -my-6 px-4 py-6 bg-gradient-to-b from-[#AABBED] via-[#E2BBE9] to-[#EAF0FF] relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-white/40 blur-2xl rounded-full" />
      <div className="absolute top-40 right-10 w-32 h-32 bg-purple-400/20 blur-3xl rounded-full" />
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-300/20 blur-3xl rounded-full" />

      {/* Header */}
      <header className="flex items-center justify-between mb-6 text-gray-900 relative z-10 drop-shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/10 transition-colors">
          <ChevronLeft className="w-8 h-8" strokeWidth={2.5} />
        </button>
        <h1 className="text-xl font-bold tracking-wide">Lucky Draw</h1>
        <div className="w-8" />
      </header>

      {/* Try count button */}
      <div className="flex justify-center mb-10 relative z-10 pt-4">
        <div className="primary-gradient rounded-full px-6 py-2.5 text-white font-bold tracking-wide shadow-[0_8px_20px_rgba(138,92,245,0.4)] border border-white/30">
            Remaining Attempts: 0
        </div>
      </div>

      {/* Wheel Area */}
      <div className="flex-1 flex flex-col justify-center items-center relative z-10 mt-4">
         <div className="relative w-80 h-80 sm:w-96 sm:h-96">
            
            {/* Outer Rim styling to look 3D and premium */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#8A5CF5] to-[#5A27DF] shadow-[0_20px_50px_rgba(90,39,223,0.5),inset_0_4px_10px_rgba(255,255,255,0.4),inset_0_-8px_20px_rgba(0,0,0,0.3)] border-[14px] border-[#AC88FF] flex items-center justify-center p-2">
                
                <div className="absolute inset-0 rounded-full border-4 border-white/10 shadow-inner pointer-events-none"></div>
                
                {/* Inner Wheel */}
                <motion.div 
                    className="w-full h-full rounded-full relative overflow-hidden shadow-inner"
                    style={{ background: `conic-gradient(${conicString})` }}
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    {/* Slices Overlay/shadows for depth */}
                    <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.1)] rounded-full pointer-events-none"></div>

                    {prizes.map((prize, i) => (
                      <div
                        key={i}
                        className="absolute top-0 left-1/2 w-16 h-1/2 origin-bottom pt-4 sm:pt-6 flex flex-col items-center justify-start pointer-events-none"
                        style={{ transform: `translateX(-50%) rotate(${i * sliceAngle + sliceAngle / 2}deg)` }}
                      >
                        <span className="font-bold text-[13px] sm:text-[15px] text-[#6032BA] flex flex-col items-center leading-tight">
                           {prize.text}
                           {prize.isCrypto && <span className="text-crypto-accent font-black text-lg mt-0.5 leading-none shadow-sm">₮</span>}
                        </span>
                      </div>
                    ))}
                </motion.div>

                {/* Center Button and pointer */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20" onClick={spinWheel}>
                    
                    {/* Pointer Arrow */}
                    <div className="absolute -top-7 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] z-30" style={{ transformOrigin: "bottom center", rotate: "180deg" }}></div>
                    
                    {/* Center GO dot */}
                    <div className="relative w-24 h-24 bg-gradient-to-b from-yellow-300 to-yellow-500 rounded-full border-[6px] border-yellow-200 shadow-[0_10px_25px_rgba(0,0,0,0.4),inset_0_-4px_10px_rgba(180,100,0,0.5),inset_0_4px_8px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform">
                        <span className="font-black text-yellow-900 text-3xl drop-shadow-[0_2px_1px_rgba(255,255,255,0.7)]">GO</span>
                    </div>
                </div>

                {/* Rivets on outer wheel */}
                {[...Array(12)].map((_, i) => (
                    <div 
                        key={i} 
                        className="absolute w-3.5 h-3.5 bg-gradient-to-br from-white to-gray-400 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_2px_2px_rgba(255,255,255,1)]"
                        style={{
                            top: `${50 - 46 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                            left: `${50 + 46 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    ></div>
                ))}
            </div>
         </div>
      </div>

      <div className="mt-14 mb-8 flex justify-center relative z-10 w-full">
        <button 
          onClick={() => navigate('/task')}
          className="bg-white/40 backdrop-blur-md text-crypto-primary font-bold text-sm py-4 px-8 rounded-full border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white/60 hover:shadow-[0_10px_40px_rgba(138,92,245,0.2)] transition-all transform hover:-translate-y-1 w-full max-w-[300px]">
            Get more lottery chances
        </button>
      </div>
    </div>
  );
}
