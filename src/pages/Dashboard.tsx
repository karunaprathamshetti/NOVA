import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import NeoToggle from "@/components/NeoToggle";
import { 
  Eye, EyeOff, Copy, Check, Monitor, Info, Users, Activity, 
  Radio, ChevronRight, Camera, CameraOff, Mic, MicOff, RefreshCw, Plus 
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NeonSpinner from "@/components/NeonSpinner";
import CreatePostModal from "@/components/CreatePostModal";

interface Profile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  stream_key: string;
  rtmp_url: string;
  is_live: boolean;
  stream_title: string;
  category: string;
  viewer_count: number;
  follower_count: number;
}

interface FollowingUser {
  id: string;
  username: string;
  avatar_url: string;
  is_live: boolean;
  stream_title: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuthStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [followingLoading, setFollowingLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Gaming");
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setFollowingLoading(true);
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) {
          setProfile(profileData);
          setTitle(profileData.stream_title || "");
          setCategory(profileData.category || "Gaming");
          setIsLive(profileData.is_live || false);
        }

        const { data: followData } = await supabase
          .from('follows')
          .select(`following_id, profiles:following_id (id, username, avatar_url, is_live, stream_title)`)
          .eq('follower_id', user.id);
        if (followData) setFollowing(followData.map((d: any) => d.profiles).filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setFollowingLoading(false);
      }
    };

    fetchData();

    const channel = supabase.channel(`dashboard_realtime_${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        setProfile(prev => prev ? { ...prev, ...payload.new } : prev);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const copyToClipboard = (text: string, type: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') setCopiedKey(true); else setCopiedUrl(true);
    toast.success(`${type === 'key' ? 'Stream key' : 'RTMP URL'} copied!`);
    setTimeout(() => { setCopiedKey(false); setCopiedUrl(false); }, 2000);
  };

  const handleSaveProfile = async (field: Partial<Profile>) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update(field).eq('id', user.id);
    if (error) toast.error("Failed to save changes"); else toast.success("Saved ✓");
  };

  const toggleLive = async (checked: boolean) => {
    if (!user || !profile) return;
    setIsLive(checked);
    const { error } = await supabase.from('profiles').update({ is_live: checked, viewer_count: checked ? 0 : 0 }).eq('id', user.id);
    if (error) {
      toast.error("Failed to toggle live status");
      setIsLive(!checked);
    } else if (checked) {
      toast.success("You are now live! 🔴");
    }
  };

  if (authLoading || !profile) return <div className="min-h-screen pt-24"><NeonSpinner /></div>;

  return (
    <div className="gradient-bg min-h-screen pt-16 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-card-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your stream and content</p>
          </div>
          <div className="glass-card px-6 py-3 flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Followers</p>
              <p className="text-xl font-bold text-[#C17B74]">{profile.follower_count}</p>
            </div>
            <div className="w-px h-8 bg-border/10" />
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
              <span className="text-sm font-bold">{isLive ? 'LIVE' : 'OFFLINE'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Stream Control */}
            <div className="modal-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#C17B74]" /> Stream Settings
                </h2>
                <NeoToggle checked={isLive} onChange={toggleLive} label="" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => handleSaveProfile({ stream_title: title })} placeholder="Stream title..." className="neu-input w-full h-12 px-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Category</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); handleSaveProfile({ category: e.target.value }); }} className="neu-input w-full h-12 px-4">
                    {["Just Chatting", "Gaming", "Music", "Art"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Encoder Info */}
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-[#C17B74]" /> Encoder Setup
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">RTMP URL</label>
                    <div className="flex gap-2">
                      <div className="neu-input flex-1 h-12 px-4 flex items-center text-xs font-mono overflow-hidden">{profile.rtmp_url}</div>
                      <button onClick={() => copyToClipboard(profile.rtmp_url, 'url')} className="neu-button w-12 h-12 flex items-center justify-center rounded-full">
                        {copiedUrl ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stream Key</label>
                    <div className="flex gap-2">
                      <div className="neu-input flex-1 h-12 px-4 flex items-center text-xs font-mono overflow-hidden">
                        {showKey ? profile.stream_key : "••••••••••••••••••••••••••••••••"}
                      </div>
                      <button onClick={() => setShowKey(!showKey)} className="neu-button w-12 h-12 flex items-center justify-center rounded-full">
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => copyToClipboard(profile.stream_key, 'key')} className="neu-button w-12 h-12 flex items-center justify-center rounded-full">
                        {copiedKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Post */}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full h-full p-8 border-2 border-dashed border-[#C17B74]/40 rounded-3xl flex flex-col items-center justify-center gap-4 bg-[#C17B74]/5 hover:bg-[#C17B74]/10 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-[#C17B74]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-8 h-8 text-[#C17B74]" />
                </div>
                <div className="text-center">
                  <span className="text-xl font-bold text-[#C17B74] block">Create New Post</span>
                  <p className="text-xs text-muted-foreground mt-1">Share photos or videos with followers</p>
                </div>
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-[#C17B74]" /> Following</h2>
            <div className="glass-card p-2 max-h-[400px] overflow-y-auto">
              {followingLoading ? <div className="flex items-center justify-center py-20"><NeonSpinner /></div> : (
                following.map((u) => (
                  <Link key={u.id} to={`/profile/${u.username}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#C17B74]/5 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-10 h-10 rounded-full border-2 border-[#E8948D]" />
                      <div>
                        <p className="font-bold text-sm">{u.username}</p>
                        <p className="text-[0.65rem] text-muted-foreground">{u.is_live ? 'Live' : 'Offline'}</p>
                      </div>
                    </div>
                    {u.is_live && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                  </Link>
                ))
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C17B74]" /> OBS Stability Guide
              </h2>
              <div className="space-y-3 text-[0.7rem] text-muted-foreground leading-relaxed">
                <p>To stop stream disconnects, use these exact settings in OBS:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li><span className="text-card-foreground font-bold">Output → Mode:</span> Simple</li>
                  <li><span className="text-card-foreground font-bold">Video Bitrate:</span> 2500 - 3500 Kbps</li>
                  <li><span className="text-card-foreground font-bold">Encoder:</span> Software (x264)</li>
                  <li><span className="text-card-foreground font-bold">Keyframe Interval:</span> 2 <span className="text-[#C17B74] font-medium">(Critical for stability)</span></li>
                </ul>
                <div className="h-px bg-border/10 my-2" />
                <p>Then paste your <span className="text-[#C17B74] font-medium">RTMP URL</span> and <span className="text-[#C17B74] font-medium">Stream Key</span> and click <span className="text-card-foreground font-bold">Start Streaming</span>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal 
          user={user} 
          profile={profile} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => setShowCreateModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
