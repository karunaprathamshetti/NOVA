import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import NeoToggle from "@/components/NeoToggle";
import { 
  Eye, EyeOff, Copy, Check, Monitor, Info, Users, Activity, 
  Radio, ChevronRight, Camera, CameraOff, Mic, MicOff, RefreshCw, Plus, Play 
} from "lucide-react";
import { useAuthStore } from "@/store/use-auth-store";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NeonSpinner from "@/components/NeonSpinner";
import CreatePostModal from "@/components/CreatePostModal";
import { useStreamStore } from "@/store/use-stream-store";

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
  
  // Global Stream State
  const { 
    stream, isLive, cameraOn, micOn, title, category,
    setTitle, setCategory, setIsLive, startStudio, stopStudio, toggleLive, toggleMic 
  } = useStreamStore();

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync video element with global stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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

        {/* Nova Studio - Integrated Broadcaster */}
        <div className="lg:col-span-12">
          <div className="glass-card overflow-hidden border-2 border-[#C17B74]/20">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* Preview Side */}
              <div className="lg:col-span-2 relative aspect-video lg:aspect-auto bg-[#1A1618] flex items-center justify-center group">
                {cameraOn ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 rounded-full bg-[#C17B74]/10 flex items-center justify-center mx-auto border border-[#C17B74]/20">
                      <CameraOff className="w-8 h-8 text-[#C17B74]/40" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Studio Offline</p>
                      <p className="text-[0.65rem] text-muted-foreground/50">Enter the studio to prepare your stream</p>
                    </div>
                  </div>
                )}
                
                {cameraOn && (
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 pointer-events-auto">
                      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                      <span className="text-[0.6rem] font-bold text-white uppercase tracking-widest">{isLive ? 'Broadcasting' : 'Preview Mode'}</span>
                    </div>
                    <div className="flex items-center gap-2 pointer-events-auto">
                      <button onClick={toggleMic} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white' : 'bg-red-500 text-white'}`}>
                        {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </button>
                      <button onClick={stopStudio} className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all">
                        <CameraOff className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls Side */}
              <div className="p-8 space-y-8 bg-[#C17B74]/5 border-l border-[#C17B74]/10">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">Nova Studio</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">Broadcast your camera and voice directly to your followers without any extra software.</p>
                </div>

                <div className="space-y-4">
                  <Button 
                    variant={isLive ? "destructive" : "hero"} 
                    className="w-full h-14 text-lg animate-in zoom-in duration-300" 
                    onClick={() => user && toggleLive(user.id)}
                  >
                    {isLive ? (
                      <><Radio className="w-5 h-5 animate-pulse" /> End Broadcast</>
                    ) : (
                      <><Play className="w-5 h-5" /> Start Broadcast</>
                    )}
                  </Button>

                  {!cameraOn && !isLive && (
                    <Button variant="outline" className="w-full h-10 text-xs border-[#C17B74]/20 text-[#C17B74] hover:bg-[#C17B74]/5" onClick={startStudio}>
                      <Camera className="w-4 h-4" /> Open Camera Preview
                    </Button>
                  )}
                  
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-[#C17B74]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Privacy</span>
                      </div>
                      <span className="text-[0.65rem] font-bold text-[#C17B74]">Public</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3">
                        <Activity className="w-4 h-4 text-[#C17B74]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quality</span>
                      </div>
                      <span className="text-[0.65rem] font-bold text-[#C17B74]">1080p HD</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {/* Stream Control */}
            <div className="modal-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#C17B74]" /> Stream Details
                </h2>
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-[#C17B74]/10 border border-[#C17B74]/20">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <span className="text-[0.6rem] font-bold uppercase tracking-widest">{isLive ? 'Live Now' : 'Draft Mode'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Broadcast Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => handleSaveProfile({ stream_title: title })} placeholder="What are we doing today?" className="neu-input w-full h-12 px-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Channel Category</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); handleSaveProfile({ category: e.target.value }); }} className="neu-input w-full h-12 px-4">
                    {["Just Chatting", "Gaming", "Music", "Art", "Lifestyle"].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Create Post */}
            <button 
              onClick={() => setShowCreateModal(true)}
              className="w-full p-10 border-2 border-dashed border-[#C17B74]/40 rounded-3xl flex flex-col items-center justify-center gap-4 bg-[#C17B74]/5 hover:bg-[#C17B74]/10 transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[#C17B74]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-[#C17B74]" />
              </div>
              <div className="text-center">
                <span className="text-xl font-bold text-[#C17B74] block">Create New Post</span>
                <p className="text-xs text-muted-foreground mt-1">Share photos or videos with your followers</p>
              </div>
            </button>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-[#C17B74]" /> Following</h2>
            <div className="glass-card p-2 max-h-[500px] overflow-y-auto no-scrollbar">
              {followingLoading ? <div className="flex items-center justify-center py-20"><NeonSpinner /></div> : (
                following.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-xs font-bold uppercase tracking-widest">No follows yet</p>
                  </div>
                ) : (
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
                )
              )}
            </div>

            <div className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Info className="w-4 h-4 text-[#C17B74]" /> Tips
              </h2>
              <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                Make sure your lighting is good before you hit <span className="text-[#C17B74] font-bold">Start Broadcast</span>. 
                You can interact with your viewers in real-time through the chat on your stream page!
              </p>
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
