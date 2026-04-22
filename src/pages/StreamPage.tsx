import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, MessageCircle, Send, Heart, Eye, 
  Activity, Play, Camera, CameraOff, Mic, MicOff, ChevronRight 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "sonner";
import NeonSpinner from "@/components/NeonSpinner";
import PostDetailModal from "@/components/PostDetailModal";

interface Profile {
  id: string;
  username: string;
  stream_title: string;
  category: string;
  viewer_count: number;
  avatar_url: string;
  is_live: boolean;
}

interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  type: 'photo' | 'video' | 'text';
  caption: string;
  media_url: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface ChatMessage {
  id: string;
  username: string;
  content: string;
  created_at: string;
}

const StreamPage = () => {
  const { username: streamUsername } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Camera PIP state (for streamer only)
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isStreamer = user && profile && user.id === profile.id;

  useEffect(() => {
    const fetchStreamData = async () => {
      if (!streamUsername) return;
      setLoading(true);
      try {
        // Decode the username in case it has spaces or special characters
        const decodedUsername = decodeURIComponent(streamUsername);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', decodedUsername)
          .single();

        if (error || !data) {
          toast.error("Streamer not found");
          setLoading(false);
          return;
        }
        
        setProfile(data);

        const { data: postsData } = await supabase
          .from('posts')
          .select('*')
          .eq('user_id', data.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (postsData) setRecentPosts(postsData as Post[]);
      } catch (err) {
        console.error("Stream fetch error:", err);
        toast.error("Could not load stream details");
      } finally {
        setLoading(false);
      }
    };
    fetchStreamData();
  }, [streamUsername]);

  useEffect(() => {
    if (!profile) return;
    const channel = supabase.channel(`stream_${profile.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${profile.id}` }, (payload) => {
        setProfile(prev => prev ? { ...prev, ...payload.new } : prev);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  // Camera logic for streamer PIP
  async function startCamera() {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(ms);
      setCameraOn(true);
      if (videoRef.current) videoRef.current.srcObject = ms;
    } catch (err) { toast.error("Camera access denied"); }
  }

  function stopCamera() {
    stream?.getTracks().forEach(t => t.stop());
    setStream(null);
    setCameraOn(false);
  }

  const toggleMic = () => {
    stream?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setMicOn(prev => !prev);
  };

  if (loading) return <div className="min-h-screen pt-24"><NeonSpinner /></div>;
  
  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 gradient-bg">
      <div className="w-20 h-20 rounded-full bg-[#C17B74]/10 flex items-center justify-center border border-[#C17B74]/20">
        <Activity className="w-10 h-10 text-[#C17B74]" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-card-foreground">Streamer Not Found</h1>
        <p className="text-sm text-muted-foreground">The link might be broken or the user changed their name.</p>
      </div>
      <Button variant="primary" asChild><Link to="/">Back to Home</Link></Button>
    </div>
  );

  return (
    <div className="gradient-bg min-h-screen pt-16 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Stream Player Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="relative aspect-video rounded-3xl overflow-hidden glass-card bg-black shadow-2xl border-2 border-[#EDD9D6] dark:border-[#3D2A28]">
              {profile.is_live ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <Play className="w-20 h-20 text-[#C17B74]/40 animate-pulse" />
                  <p className="text-[#C17B74] font-bold uppercase tracking-[0.2em] text-sm animate-pulse">Live Stream Active</p>
                  
                  {/* Top Badge */}
                  <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[0.65rem] font-bold text-red-500 uppercase tracking-widest">Live</span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <Activity className="w-12 h-12 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Offline</p>
                </div>
              )}

              {/* Camera PIP for Streamer */}
              {isStreamer && (
                <div className="absolute bottom-6 right-6 w-40 md:w-56 aspect-video rounded-2xl overflow-hidden border-2 border-[#E8948D] shadow-2xl z-10 bg-black group">
                  {cameraOn ? (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CameraOff className="w-8 h-8 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => cameraOn ? stopCamera() : startCamera()} className="w-8 h-8 rounded-full bg-[#C17B74] text-white flex items-center justify-center shadow-lg"><Camera className="w-4 h-4" /></button>
                    <button onClick={toggleMic} className="w-8 h-8 rounded-full bg-[#C17B74] text-white flex items-center justify-center shadow-lg"><Mic className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-2 border-[#C17B74] p-0.5 shrink-0">
                  <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} className="w-full h-full rounded-full object-cover" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-card-foreground">{profile.stream_title || "My Stream"}</h1>
                  <p className="text-[#C17B74] font-bold text-sm">{profile.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#C17B74]" />
                  <span className="font-bold text-sm">{profile.viewer_count} Viewers</span>
                </div>
                <Button variant="primary" className="rounded-full px-8">Follow</Button>
              </div>
            </div>

            {/* Recent Posts Section */}
            {recentPosts.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-card-foreground flex items-center gap-2 uppercase tracking-widest">
                    <MessageCircle className="w-5 h-5 text-[#C17B74]" /> Recent Posts
                  </h3>
                  <Link to={`/profile/${profile.username}`} className="text-xs font-bold text-[#C17B74] hover:underline flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                  {recentPosts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => setSelectedPost(post)}
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-transparent hover:border-[#C17B74] transition-all cursor-pointer bg-[#C17B74]/10"
                    >
                      {post.type === 'text' ? (
                        <div className="w-full h-full p-3 flex items-center justify-center text-[0.6rem] md:text-xs text-center italic font-medium leading-tight">
                          "{post.caption?.slice(0, 50)}..."
                        </div>
                      ) : (
                        <img src={post.media_url} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-1">
            <div className="glass-card flex flex-col h-[600px] border-2 border-[#EDD9D6] dark:border-[#3D2A28]">
              <div className="p-4 border-b border-[#EDD9D6] dark:border-[#3D2A28] flex items-center justify-between bg-[#C17B74]/5">
                <span className="font-bold text-sm uppercase tracking-widest">Live Chat</span>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mock Chat */}
                <div className="space-y-3">
                  {[
                    { u: 'Alex', m: 'This stream is amazing! 🔥' },
                    { u: 'Sarah', m: 'Check out his new post below!' },
                    { u: 'Mike', m: 'How do I follow?' }
                  ].map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-bold text-[#C17B74] mr-2">{msg.u}:</span>
                      <span className="text-card-foreground/80">{msg.m}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 border-t border-[#EDD9D6] dark:border-[#3D2A28]">
                <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Send a message..."
                    className="neu-input flex-1 h-10 px-4 text-xs"
                  />
                  <Button variant="primary" size="sm" className="h-10 w-10 p-0"><Send className="w-4 h-4" /></Button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>

      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={(id) => setRecentPosts(p => p.filter(x => x.id !== id))} />}
    </div>
  );
};

export default StreamPage;
