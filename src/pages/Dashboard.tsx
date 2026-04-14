import { useState } from "react";
import { Button } from "@/components/ui/button";
import NeoToggle from "@/components/NeoToggle";
import { Eye, EyeOff, Copy, Check, Monitor, Info } from "lucide-react";

const Dashboard = () => {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gaming");

  const mockStreamKey = "sk_live_abc123def456ghi789";
  const rtmpUrl = "rtmp://live.streamflow.tv/app";

  const copyKey = () => {
    navigator.clipboard.writeText(mockStreamKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="gradient-bg min-h-screen pt-16">
      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Streamer Dashboard</h1>

        {/* Stream Key & RTMP */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Stream Configuration
          </h2>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">RTMP Server URL</label>
            <div className="neu-input flex items-center px-4 h-12 text-sm text-foreground/70">
              {rtmpUrl}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Stream Key</label>
            <div className="flex gap-2">
              <div className="neu-input flex items-center flex-1 px-4 h-12 text-sm text-foreground/70 font-mono">
                {showKey ? mockStreamKey : "••••••••••••••••••••"}
              </div>
              <button onClick={() => setShowKey(!showKey)} className="neu-button w-12 h-12 flex items-center justify-center rounded-xl">
                {showKey ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={copyKey} className="neu-button w-12 h-12 flex items-center justify-center rounded-xl">
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>
          </div>
        </div>

        {/* Go Live Controls */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Go Live</h2>
            <NeoToggle checked={isLive} onChange={setIsLive} label={isLive ? "Live" : "Offline"} />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Stream Title</label>
            <input
              type="text"
              placeholder="What are you streaming today?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="neu-input w-full h-12 px-4 text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm text-muted-foreground">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="neu-input w-full h-12 px-4 text-sm appearance-none cursor-pointer"
            >
              <option value="Gaming">Gaming</option>
              <option value="Music">Music</option>
              <option value="Art">Art</option>
              <option value="Software Dev">Software Dev</option>
              <option value="Just Chatting">Just Chatting</option>
              <option value="Education">Education</option>
            </select>
          </div>

          <Button variant="primary" size="lg" className="w-full">
            Update Stream Info
          </Button>
        </div>

        {/* OBS Instructions */}
        <div className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            OBS Setup Guide
          </h2>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Open OBS Studio and go to <span className="text-foreground font-medium">Settings → Stream</span></li>
            <li>Set Service to <span className="text-foreground font-medium">Custom</span></li>
            <li>Paste the <span className="text-foreground font-medium">RTMP Server URL</span> above into the Server field</li>
            <li>Paste your <span className="text-foreground font-medium">Stream Key</span> into the Stream Key field</li>
            <li>Click <span className="text-foreground font-medium">Start Streaming</span> in OBS, then toggle "Go Live" here</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
