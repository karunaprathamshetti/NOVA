import { useState, useEffect } from "react";
import { GlobeLive } from "./ui/cobe-globe-live";
import { Activity } from "lucide-react";

export const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [liveViewers, setLiveViewers] = useState(2847);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveViewers((v) => Math.max(100, v + Math.floor(Math.random() * 21) - 8));
    }, 400);
    
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 1500); 
    }, 6000); 

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1618] overflow-hidden transition-all duration-1000 ${isExiting ? 'scale-105' : 'scale-100'}`}>
      {/* Heavy Mist System - Engulfs the screen on exit */}
      <div className={`absolute inset-0 z-50 pointer-events-none transition-all duration-1500 ease-in-out ${isExiting ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 backdrop-blur-[40px]" />
        
        {/* Swirling Cloud Layers */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] opacity-40 animate-mist-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#C17B74_0%,transparent_50%)] blur-[100px]" />
        </div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[140%] opacity-30 animate-mist-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#F5E8E6_0%,transparent_50%)] blur-[120px]" />
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-50 animate-mist-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1A1618_0%,transparent_60%)] blur-[80px]" />
        </div>
        
        {/* Full Whiteout Overlay */}
        <div className={`absolute inset-0 bg-[#1A1618]/80 transition-opacity duration-1500 ${isExiting ? 'opacity-100' : 'opacity-0'}`} />
      </div>

      <div className={`relative w-full max-w-lg px-8 flex flex-col items-center justify-center gap-12 transition-all duration-1000 ${isExiting ? 'scale-90 blur-md opacity-0' : 'scale-100 opacity-100'}`}>
        {/* Logo/Brand Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-[#C17B74] flex items-center justify-center shadow-[0_0_40px_rgba(193,123,116,0.4)]">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter text-white">NOVA</h1>
          </div>
          <p className="text-[#C17B74] font-bold uppercase tracking-[0.6em] text-[0.65rem]">Standalone Streaming Ecosystem</p>
        </div>

        {/* The Globe */}
        <div className="relative w-full">
          <GlobeLive className="w-full" />
          
          {/* Live Count */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center w-full">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.4em] text-[#C17B74]/60 mb-1">Network Active</p>
            <p className="text-3xl font-bold text-white tabular-nums tracking-tight">
              {liveViewers.toLocaleString()} <span className="text-[0.6rem] text-[#C17B74] font-bold uppercase tracking-widest ml-1">Live Viewers</span>
            </p>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="mt-20 w-full space-y-4">
          <div className="h-[1px] w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#C17B74] to-transparent w-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
          <p className="text-center text-[0.5rem] text-white/30 uppercase tracking-[0.4em] font-medium">Synchronizing Global Nodes</p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes mist-1 {
          0% { transform: translate(-5%, -5%) rotate(0deg); }
          100% { transform: translate(5%, 5%) rotate(5deg); }
        }
        @keyframes mist-2 {
          0% { transform: translate(5%, 5%) rotate(0deg); }
          100% { transform: translate(-5%, -5%) rotate(-5deg); }
        }
        @keyframes mist-3 {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(2deg); }
        }
        .animate-shimmer { animation: shimmer 2.5s infinite linear; }
        .animate-mist-1 { animation: mist-1 8s infinite alternate ease-in-out; }
        .animate-mist-2 { animation: mist-2 10s infinite alternate ease-in-out; }
        .animate-mist-3 { animation: mist-3 12s infinite alternate ease-in-out; }
      `}</style>
    </div>
  );
};
