import { useEffect, useState } from "react";
import { UserPlus, Radio, PartyPopper, X } from "lucide-react";

interface NotificationToastProps {
  message: string;
  type: 'follow' | 'live' | 'viewer_milestone';
  senderAvatar?: string;
  senderUsername?: string;
  onClose: () => void;
}

const NotificationToast = ({ message, type, senderAvatar, senderUsername, onClose }: NotificationToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'follow': return <UserPlus className="w-5 h-5 text-[#C17B74]" />;
      case 'live': return <Radio className="w-5 h-5 text-[#E8948D] animate-pulse" />;
      case 'viewer_milestone': return <PartyPopper className="w-5 h-5 text-[#E8948D]" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 w-[300px] p-4 flex gap-4 items-center bg-[#2D2326]/95 border border-[#E8948D]/30 rounded-xl backdrop-blur-xl shadow-2xl z-[9999] transition-all duration-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}`}
      style={{ animation: 'slideInRight 0.3s ease forwards' }}
    >
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#E8948D]/30 bg-[#C17B74]/10 flex items-center justify-center">
        {senderAvatar ? (
          <img src={senderAvatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-[#C17B74]">{senderUsername?.[0]?.toUpperCase() || getIcon()}</span>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F5E8E6] leading-tight font-medium">{message}</p>
        <p className="text-[0.65rem] text-[#C17B74] mt-1">Just now</p>
      </div>

      <button onClick={() => setIsVisible(false)} className="text-[#C17B74]/60 hover:text-[#C17B74] transition-colors">
        <X className="w-4 h-4" />
      </button>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationToast;
