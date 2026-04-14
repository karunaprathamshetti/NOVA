import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Send, WifiOff } from "lucide-react";

const MOCK_MESSAGES = [
  { id: "1", username: "viewer_99", content: "Amazing stream! 🔥", color: "#3B82F6" },
  { id: "2", username: "pixel_pro", content: "GG that was insane", color: "#10B981" },
  { id: "3", username: "nightowl", content: "First time here, love the vibes", color: "#F59E0B" },
  { id: "4", username: "techfan", content: "What keyboard are you using?", color: "#8B5CF6" },
  { id: "5", username: "chill_cat", content: "Song name?", color: "#EF4444" },
];

const StreamPage = () => {
  const { username } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isLive = true;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), username: "you", content: message, color: "#3B82F6" },
    ]);
    setMessage("");
  };

  return (
    <div className="gradient-bg min-h-screen pt-16">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Video Player */}
          <div className="flex-1 space-y-4">
            <div className={`relative aspect-video rounded-2xl overflow-hidden bg-card ${isLive ? "neon-border animate-glow-pulse" : "border border-border"}`}>
              {isLive ? (
                <div className="w-full h-full bg-gradient-to-br from-card to-secondary flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="neon-spinner mx-auto" />
                    <p className="text-sm text-muted-foreground">Connecting to stream...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <WifiOff className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground font-medium">Stream is currently offline</p>
                </div>
              )}
              {isLive && (
                <div className="absolute top-3 left-3 live-badge">
                  <span className="live-dot" />
                  LIVE
                </div>
              )}
            </div>

            {/* Streamer Info */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary border-2 border-primary/30">
                  {username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground">{username}</h2>
                  <p className="text-sm text-muted-foreground truncate">Ranked Grind to Diamond 💎</p>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold text-foreground">3,420</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="w-full lg:w-80 xl:w-96 glass-card flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-7rem)]">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Live Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className="font-semibold mr-1.5" style={{ color: msg.color }}>
                    {msg.username}
                  </span>
                  <span className="text-foreground/80">{msg.content}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Send a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="neu-input flex-1 h-10 px-4 text-sm"
              />
              <Button variant="primary" size="icon" type="submit" className="shrink-0 w-10 h-10 rounded-xl">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamPage;
