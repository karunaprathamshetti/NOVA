import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, UserCheck, Calendar, Activity, Play, Eye, 
  X, Heart, ChevronRight, Edit3, Save, Image as ImageIcon, 
  Video, Type, MessageCircle, Plus 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/use-auth-store";
import { toast } from "sonner";
import NeonSpinner from "@/components/NeonSpinner";
import PostDetailModal from "@/components/PostDetailModal";
import CreatePostModal from "@/components/CreatePostModal";

interface ProfileData {
  id: string;
  username: string;
  bio: string;
  follower_count: number;
  following_count: number;
  avatar_url: string;
  is_live: boolean;
  stream_title?: string;
  category?: string;
  viewer_count?: number;
  created_at: string;
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

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'text'>('posts');
  
  // Modal State
  const [modalType, setModalType] = useState<'followers' | 'following' | null>(null);
  const [modalList, setModalList] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  
  const { user } = useAuthStore();
  const isOwnProfile = user && profile && user.id === profile.id;

  const fetchPosts = async () => {
    if (!profile) return;
    const typeFilter = activeTab === 'posts' ? ['photo', 'video'] : [activeTab.slice(0, -1)];
    
    let query = supabase
      .from('posts')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (activeTab === 'posts') query = query.in('type', ['photo', 'video']);
    else if (activeTab === 'videos') query = query.eq('type', 'video');
    else query = query.eq('type', 'text');

    const { data } = await query;
    if (data) setPosts(data as Post[]);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profiles').select('*').eq('username', username).single();

      if (data && !error) {
        setProfile(data as ProfileData);
        setEditUsername(data.username);
        setEditBio(data.bio || "");
        setEditAvatar(data.avatar_url || "");
        
        if (user) {
          const { data: followStatus } = await supabase.from('follows').select('id').eq('follower_id', user.id).eq('following_id', data.id).single();
          setFollowing(!!followStatus);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [username, user]);

  useEffect(() => {
    if (profile) fetchPosts();
  }, [profile, activeTab]);

  const handleFollow = async () => {
    if (!profile) return;
    if (!user) return navigate("/login");
    try {
      if (following) {
        setFollowing(false);
        setProfile(prev => prev ? { ...prev, follower_count: prev.follower_count - 1 } : prev);
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', profile.id);
      } else {
        setFollowing(true);
        setProfile(prev => prev ? { ...prev, follower_count: prev.follower_count + 1 } : prev);
        await supabase.from('follows').insert({ follower_id: user.id, following_id: profile.id });
        await supabase.from('notifications').insert({
          user_id: profile.id, sender_id: user.id, sender_username: user.user_metadata?.username || user.email?.split('@')[0],
          sender_avatar: user.user_metadata?.avatar_url || "", type: 'follow',
          message: `${user.user_metadata?.username || user.email?.split('@')[0]} started following you`
        });
      }
    } catch (err) { console.error(err); }
  };

  const openListModal = async (type: 'followers' | 'following') => {
    if (!profile) return;
    setModalType(type);
    setModalLoading(true);
    const joinCol = type === 'followers' ? 'follower_id' : 'following_id';
    const filterCol = type === 'followers' ? 'following_id' : 'follower_id';
    const { data } = await supabase.from('follows').select(`profiles:${joinCol} (id, username, avatar_url, bio, is_live)`).eq(filterCol, profile.id);
    if (data) setModalList(data.map((d: any) => d.profiles).filter(Boolean));
    setModalLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    // Check if username is taken (if it changed)
    if (editUsername !== profile.username) {
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', editUsername).single();
      if (existing) return toast.error("Username already taken!");
    }

    const { error } = await supabase
      .from('profiles')
      .update({ 
        username: editUsername,
        bio: editBio, 
        avatar_url: editAvatar 
      })
      .eq('id', profile.id);

    if (!error) {
      const oldUsername = profile.username;
      setProfile({ ...profile, username: editUsername, bio: editBio, avatar_url: editAvatar });
      setIsEditing(false);
      toast.success("Profile updated!");
      
      // If username changed, redirect to new URL
      if (editUsername !== oldUsername) {
        navigate(`/profile/${editUsername}`);
      }
    } else {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="min-h-screen pt-24"><NeonSpinner /></div>;
  if (!profile) return <div className="min-h-screen pt-24 text-center"><h1>Profile not found</h1></div>;

  return (
    <div className="gradient-bg min-h-screen pt-16 pb-20">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        
        {/* Profile Header Card */}
        <div className="modal-card p-8 space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className={`w-28 h-28 rounded-full border-4 p-1 ${profile.is_live ? 'border-[#E8948D]' : 'border-[#C17B74]'}`}>
                <img src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} className="w-full h-full rounded-full object-cover" />
              </div>
              {profile.is_live && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 live-badge scale-90">LIVE</div>}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">{profile.username}</h1>
                  <p className="text-xs text-muted-foreground flex items-center justify-center md:justify-start gap-1.5 mt-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>{isEditing ? "Cancel" : "Edit Profile"}</Button>
                  ) : (
                    <Button variant={following ? "secondary" : "primary"} onClick={handleFollow}>{following ? "Following" : "Follow"}</Button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Username</label>
                    <input 
                      type="text" 
                      value={editUsername} 
                      onChange={(e) => setEditUsername(e.target.value)} 
                      className="neu-input w-full h-10 px-4" 
                      placeholder="New username" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avatar URL</label>
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)} 
                      className="neu-input w-full h-10 px-4" 
                      placeholder="https://..." 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bio</label>
                    <textarea 
                      value={editBio} 
                      onChange={(e) => setEditBio(e.target.value)} 
                      className="neu-input w-full min-h-[100px] p-4 resize-none" 
                      placeholder="Tell the world about yourself..." 
                    />
                  </div>
                  <Button variant="primary" onClick={handleSaveProfile} size="sm">Save Changes</Button>
                </div>
              ) : (
                <p className="text-card-foreground text-sm leading-relaxed">{profile.bio || "No bio yet."}</p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-8 pt-2">
                <button onClick={() => openListModal('followers')} className="group">
                  <p className="text-xl font-bold group-hover:text-[#C17B74]">{profile.follower_count}</p>
                  <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">Followers</p>
                </button>
                <button onClick={() => openListModal('following')} className="group">
                  <p className="text-xl font-bold group-hover:text-[#C17B74]">{profile.following_count}</p>
                  <p className="text-[0.65rem] text-muted-foreground uppercase tracking-widest">Following</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#EDD9D6] dark:border-[#3D2A28]">
            <div className="flex gap-8">
              {[
                { id: 'posts', label: 'Posts', icon: ImageIcon },
                { id: 'videos', label: 'Videos', icon: Video },
                { id: 'text', label: 'Text', icon: Type }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                    activeTab === tab.id ? 'text-[#C17B74]' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C17B74] animate-in slide-in-from-left duration-300" />}
                </button>
              ))}
            </div>
            {isOwnProfile && (
              <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(true)} className="mb-2 text-[#C17B74] hover:text-[#C17B74] hover:bg-[#C17B74]/5">
                <Plus className="w-4 h-4 mr-2" /> New Post
              </Button>
            )}
          </div>

          {/* Grid or List */}
          {activeTab === 'text' ? (
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} onClick={() => setSelectedPost(post)} className="glass-card p-6 space-y-4 cursor-pointer hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-3">
                    <img src={post.avatar_url} className="w-8 h-8 rounded-full border border-[#C17B74]/20" />
                    <span className="text-sm font-bold">{post.username}</span>
                  </div>
                  <p className="text-card-foreground leading-relaxed italic">"{post.caption}"</p>
                  <div className="flex items-center gap-6 pt-2 border-t border-border/20">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Heart className="w-4 h-4" /> {post.likes_count}</div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground"><MessageCircle className="w-4 h-4" /> {post.comments_count}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-3">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => setSelectedPost(post)}
                  className="aspect-square rounded-lg overflow-hidden relative group cursor-pointer bg-[#EDD9D6]/10 dark:bg-[#3D2A28]/10"
                >
                  <img src={post.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                    <div className="flex items-center gap-1.5 text-white font-bold"><Heart className="w-5 h-5 fill-current" /> {post.likes_count}</div>
                    <div className="flex items-center gap-1.5 text-white font-bold"><MessageCircle className="w-5 h-5 fill-current" /> {post.comments_count}</div>
                  </div>
                  {post.type === 'video' && <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white"><Play className="w-3 h-3 fill-current" /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={(id) => setPosts(p => p.filter(x => x.id !== id))} />}
      {showCreateModal && <CreatePostModal user={user} profile={profile} onClose={() => setShowCreateModal(false)} onSuccess={fetchPosts} />}
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={() => setModalType(null)}>
          <div className="modal-card w-full max-w-[400px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold capitalize">{modalType}</h2>
              <button onClick={() => setModalType(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2 max-h-[400px] overflow-y-auto">
              {modalList.map(u => (
                <Link key={u.id} to={`/profile/${u.username}`} onClick={() => setModalType(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#C17B74]/5 transition-all">
                  <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} className="w-10 h-10 rounded-full" />
                  <span className="font-bold text-sm">{u.username}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
