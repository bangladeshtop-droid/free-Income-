import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import React from "react";

export const playPremiumClick = () => {
  try {
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Premium pop/click sound
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

export default function PremiumBackButton({
  className = "",
  fallbackPath = "/",
}: {
  className?: string;
  fallbackPath?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    playPremiumClick();
    setTimeout(() => {
      if (window.history.state && window.history.state.idx > 0) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    }, 150);
  };

  // Do not show on main dashboard or bottom nav roots if we don't want to
  const isRoot = location.pathname === "/" || location.pathname === "/admin";
  if (isRoot) return null;

  return (
    <div className={`inline-block ${className}`}>
      <button
        onClick={handleBack}
        className="group relative w-12 h-12 flex items-center justify-center outline-none"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a3042] to-[#1a1d24] rounded-2xl shadow-[0_6px_0_rgb(17,20,27),0_15px_20px_rgba(0,0,0,0.4)] group-active:shadow-[0_0px_0_rgb(17,20,27),0_0px_0_rgba(0,0,0,0.4)] group-active:translate-y-[6px] transition-all duration-150 border border-white/10"></div>
        <ChevronLeft
          className="w-7 h-7 text-white relative z-10 group-active:translate-y-[6px] transition-all duration-150 -ml-1 drop-shadow-md"
          strokeWidth={3}
        />
      </button>
    </div>
  );
}
