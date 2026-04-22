import { useState, useEffect, useRef } from "react";
import { 
  X, Heart, MessageCircle, Share2, MoreHorizontal, 
  Trash2, Flag, Send, UserPlus, UserCheck, Play 
} from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NeonSpinner from "./NeonSpinner";
import { useAuthStore } from "@/store/use-auth-store";

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

interface Comment {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  content: string;
  created_at: string;
}

interface PostDetailModalProps {
  post: Post;
  onClose: () => void;
  onDelete: (postId: string) => void;
}

const PostDetailModal = ({ post: initialPost, onClose, onDelete }: PostDetailModalProps) => {
  const [post, setPost] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [sendingComment, setSendingComment] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user } = useAuthStore();
  const isOwner = user && user.id === post.user_id;
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingComments(true);
      
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      if (commentsData) setComments(commentsData);

      // Check like status
      if (user) {
        const { data: likeData } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();
        setLiked(!!likeData);

        // Check follow status
        if (!isOwner) {
          const { data: followData } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', post.user_id)
            .single();
          setFollowing(!!followData);
        }
      }
      setLoadingComments(false);
    };

    fetchData();

    // Real-time subscriptions
    const commentsChannel = supabase.channel(`comments-${post.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${post.id}` }, (payload) => {
        setComments(prev => [...prev, payload.new as Comment]);
        setPost(prev => ({ ...prev, comments_count: prev.comments_count + 1 }));
      }).subscribe();

    const likesChannel = supabase.channel(`likes-${post.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes', filter: `post_id=eq.${post.id}` }, async () => {
        const { count } = await supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
        setPost(prev => ({ ...prev, likes_count: count || 0 }));
      }).subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [post.id, user]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleLike = async () => {
    if (!user) return toast.error("Please login to like posts");
    
    const wasLiked = liked;
    setLiked(!wasLiked);
    setPost(prev => ({ ...prev, likes_count: prev.likes_count + (wasLiked ? -1 : 1) }));

    if (wasLiked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
      
      // Notification
      if (!isOwner) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          sender_id: user.id,
          sender_username: user.user_metadata?.username || user.email?.split('@')[0],
          sender_avatar: user.user_metadata?.avatar_url || "",
          type: 'like',
          message: `${user.user_metadata?.username || user.email?.split('@')[0]} liked your post`
        });
      }
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSendingComment(true);
    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        user_id: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url || "",
        content: newComment
      });

      if (error) throw error;

      // Notification
      if (!isOwner) {
        await supabase.from('notifications').insert({
          user_id: post.user_id,
          sender_id: user.id,
          sender_username: user.user_metadata?.username || user.email?.split('@')[0],
          sender_avatar: user.user_metadata?.avatar_url || "",
          type: 'comment',
          message: `${user.user_metadata?.username || user.email?.split('@')[0]} commented: "${newComment.slice(0, 30)}..."`
        });
      }

      setNewComment("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    try {
      // 1. Delete media if exists
      if (post.media_url) {
        const bucket = post.type === 'photo' ? 'post-images' : 'post-videos';
        const filePath = post.media_url.split('/').slice(-2).join('/');
        await supabase.storage.from(bucket).remove([filePath]);
      }
      // 2. Delete post
      await supabase.from('posts').delete().eq('id', post.id);
      
      onDelete(post.id);
      onClose();
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return then.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10">
        <X className="w-8 h-8" />
      </button>

      <div 
        className="modal-card w-full max-w-[1000px] h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Media */}
        <div className="flex-[1.5] bg-black flex items-center justify-center relative group">
          {post.type === 'photo' ? (
            <img src={post.media_url} className="w-full h-full object-contain" />
          ) : post.type === 'video' ? (
            <video src={post.media_url} controls autoPlay loop className="w-full h-full" />
          ) : (
            <div className="p-12 text-center max-w-md">
              <p className="text-2xl font-bold text-white leading-relaxed italic">"{post.caption}"</p>
            </div>
          )}
          {liked && <Heart className="absolute w-24 h-24 text-[#C17B74] opacity-0 animate-[ping_0.5s_ease-out_forwards] pointer-events-none" />}
        </div>

        {/* Right Side: Interactions */}
        <div className="flex-1 flex flex-col bg-background h-full border-l border-[#EDD9D6] dark:border-[#3D2A28]">
          {/* Header */}
          <div className="p-4 border-b border-[#EDD9D6] dark:border-[#3D2A28] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border-2 border-[#C17B74]/30 overflow-hidden">
                <img src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-bold text-card-foreground">{post.username}</p>
                <p className="text-[0.65rem] text-muted-foreground">{getRelativeTime(post.created_at)}</p>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-muted/10 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 glass-card p-1 z-50 shadow-2xl">
                  {isOwner ? (
                    <button onClick={() => { setShowMenu(false); setShowDeleteConfirm(true); }} className="w-full text-left px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Post
                    </button>
                  ) : (
                    <button onClick={() => { setShowMenu(false); toast.info("Reported"); }} className="w-full text-left px-3 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/10 rounded-lg flex items-center gap-2">
                      <Flag className="w-3.5 h-3.5" /> Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Caption & Comments */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {post.type !== 'text' && post.caption && (
              <div className="flex gap-3 pb-4 border-b border-[#EDD9D6]/30 dark:border-[#3D2A28]/30">
                <div className="w-8 h-8 rounded-full border border-[#C17B74]/20 overflow-hidden shrink-0">
                  <img src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm"><span className="font-bold mr-2">{post.username}</span>{post.caption}</p>
                </div>
              </div>
            )}

            {loadingComments ? <div className="flex justify-center py-12"><NeonSpinner /></div> : (
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground italic">No comments yet. Be the first!</div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                      <div className="w-8 h-8 rounded-full border border-[#EDD9D6] dark:border-[#3D2A28] overflow-hidden shrink-0">
                        <img src={c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.username}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-[#EDD9D6]/20 dark:bg-[#3D2A28]/20 px-3 py-2 rounded-2xl rounded-tl-none">
                          <p className="text-xs font-bold text-[#C17B74] mb-0.5">{c.username}</p>
                          <p className="text-sm text-card-foreground leading-relaxed">{c.content}</p>
                        </div>
                        <p className="text-[0.6rem] text-muted-foreground mt-1 ml-1">{getRelativeTime(c.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={commentsEndRef} />
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-4 border-t border-[#EDD9D6] dark:border-[#3D2A28] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLike}
                  className={`transition-all duration-300 ${liked ? 'text-[#C17B74] scale-110' : 'text-muted-foreground hover:text-[#C17B74]'}`}
                >
                  <Heart className={`w-7 h-7 ${liked ? 'fill-current' : ''}`} />
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MessageCircle className="w-7 h-7" />
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + `/profile/${post.username}`);
                    toast.success("Link copied!");
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-7 h-7" />
                </button>
              </div>
              <p className="text-sm font-bold text-card-foreground">{post.likes_count.toLocaleString()} likes</p>
            </div>

            {user ? (
              <form onSubmit={handleComment} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#EDD9D6] dark:border-[#3D2A28] shrink-0">
                  <img src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} className="w-full h-full object-cover" />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="neu-input w-full h-10 px-4 pr-10 text-xs bg-muted/5"
                  />
                  <button 
                    disabled={!newComment.trim() || sendingComment}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C17B74] disabled:opacity-30 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                <Link to="/login" className="text-[#C17B74] font-bold hover:underline">Login</Link> to like and comment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="modal-card p-6 max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Delete Post?</h3>
              <p className="text-sm text-muted-foreground">This cannot be undone. Are you sure?</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailModal;
