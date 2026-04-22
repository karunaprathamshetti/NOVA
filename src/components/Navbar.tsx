import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tv, Moon, Sun, Bell, User as UserIcon, Check, UserPlus, Radio, PartyPopper, ChevronRight } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useAuthStore } from "@/store/use-auth-store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import NotificationToast from "./NotificationToast";

interface Notification {
  id: string;
  user_id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar: string;
  type: 'follow' | 'live' | 'viewer_milestone';
  message: string;
  is_read: boolean;
  created_at: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, is_live')
        .ilike('username', `%${searchQuery}%`)
        .limit(5);
      
      if (data) {
        setSearchResults(data);
        setShowSearchDropdown(true);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data);
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      
      setUnreadCount(count || 0);
      setLoading(false);
    };

    fetchNotifications();

    const channel = supabase.channel(`notifications-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotif = payload.new as Notification;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        setActiveToasts(prev => [...prev, newNotif]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    if (showDropdown || showSearchDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown, showSearchDropdown]);

  const markAllAsRead = async () => {
    if (!user) return;
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
    }
    setShowDropdown(false);
    if (notif.type === 'follow') navigate(`/profile/${notif.sender_username}`);
    else if (notif.type === 'live') navigate(`/stream/${notif.sender_username}`);
    else if (notif.type === 'viewer_milestone') navigate(`/dashboard`);
  };

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const getRelativeTime = (dateStr: string) => {
    const now = new Date();
    const then = new Date(dateStr);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 rounded-none border-x-0 border-t-0"
      style={{
        background: theme === 'dark' ? 'rgba(26,22,24,0.85)' : 'rgba(250,240,238,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: theme === 'dark' ? '1px solid #3D2A28' : '1px solid #EDD9D6',
        borderRadius: 0,
      }}
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8 flex-1">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-shadow"
              style={{
                background: 'linear-gradient(135deg, #C17B74, #E8948D)',
                boxShadow: '0 0 16px rgba(193,123,116,0.5)',
              }}
            >
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block" style={{ color: theme === 'dark' ? '#F5E8E6' : '#2D1F1E' }}>
              StreamFlow
            </span>
          </Link>

          {/* Search Bar */}
          {user && (
            <div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                  className="w-full h-10 pl-10 pr-4 rounded-full text-sm transition-all border-2"
                  style={{
                    background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: theme === 'dark' ? '#3D2A28' : '#EDD9D6',
                    color: theme === 'dark' ? '#F5E8E6' : '#2D1F1E'
                  }}
                />
                <Tv className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C17B74] opacity-50 group-focus-within:opacity-100 transition-opacity" />
              </div>

              {/* Search Results Dropdown */}
              {showSearchDropdown && (
                <div 
                  className="absolute top-[120%] left-0 w-full glass-card border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    background: theme === 'dark' ? 'rgba(45,35,38,0.98)' : 'rgba(250,240,238,0.98)',
                    borderColor: theme === 'dark' ? '#3D2A28' : '#EDD9D6',
                  }}
                >
                  <div className="max-h-[320px] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#C17B74] border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-8 text-center opacity-50">
                        <p className="text-xs font-bold uppercase tracking-widest">No profiles found</p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((res) => (
                          <button
                            key={res.id}
                            onClick={() => {
                              navigate(`/profile/${res.username}`);
                              setSearchQuery("");
                              setShowSearchDropdown(false);
                            }}
                            className="w-full p-3 flex items-center gap-3 hover:bg-[#C17B74]/5 transition-colors text-left group"
                          >
                            <img 
                              src={res.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.username}`} 
                              className="w-8 h-8 rounded-full border-2 border-border object-cover" 
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate group-hover:text-[#C17B74] transition-colors">{res.username}</p>
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${res.is_live ? 'bg-[#E8948D]' : 'bg-muted-foreground/30'}`} />
                                <span className="text-[0.65rem] text-muted-foreground uppercase font-bold tracking-widest">
                                  {res.is_live ? 'Live Now' : 'Offline'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/20 group-hover:text-[#C17B74] group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {!isAuthPage && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full transition-colors hover:bg-[#C17B74]/10"
              style={{ color: '#C17B74' }}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          )}

          {!isAuthPage && !user && (
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link to="/login">Log In</Link>
              </Button>
              <Button variant="primary" size="sm" asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          )}

          {!isAuthPage && user && (
            <div className="flex items-center gap-2 md:gap-4">
              {/* Notification Bell */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 rounded-full transition-colors hover:bg-[#C17B74]/10" 
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" style={{ color: showDropdown ? '#C17B74' : 'rgba(193,123,116,0.7)' }} />
                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[0.65rem] font-bold flex items-center justify-center border-2 border-background animate-in zoom-in duration-300"
                      style={{ background: '#E8948D', color: '#1A1618', boxShadow: '0 0 8px rgba(232,148,141,0.5)' }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showDropdown && (
                  <div 
                    className="absolute top-[120%] right-0 w-[320px] md:w-[360px] max-h-[480px] flex flex-col glass-card border rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300"
                    style={{
                      background: theme === 'dark' ? 'rgba(45,35,38,0.95)' : 'rgba(250,240,238,0.95)',
                      borderColor: theme === 'dark' ? '#3D2A28' : '#EDD9D6',
                      zIndex: 1000
                    }}
                  >
                    <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: theme === 'dark' ? '#3D2A28' : '#EDD9D6' }}>
                      <span className="font-bold">Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs font-bold text-[#C17B74] hover:underline flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 space-y-3">
                          {[1,2,3].map(i => <div key={i} className="h-14 w-full rounded-xl bg-muted/10 animate-pulse" />)}
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="py-12 px-6 text-center space-y-3 opacity-50">
                          <Bell className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-bold text-sm">No notifications yet</p>
                            <p className="text-[0.7rem]">We'll let you know when something happens</p>
                          </div>
                        </div>
                      ) : (
                        <div className="divide-y" style={{ divideColor: theme === 'dark' ? 'rgba(61,42,40,0.5)' : 'rgba(237,217,214,0.5)' }}>
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-4 flex items-start gap-3 transition-colors cursor-pointer hover:bg-[#C17B74]/5 ${!notif.is_read ? 'bg-[#C17B74]/5' : ''}`}
                            >
                              {!notif.is_read && <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#E8948D] shrink-0" />}
                              <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border-2 ${!notif.is_read ? 'border-[#E8948D]' : 'border-muted-foreground/20'}`}>
                                {notif.sender_avatar ? (
                                  <img src={notif.sender_avatar} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[0.6rem] font-bold bg-[#C17B74]/10 text-[#C17B74]">
                                    {notif.sender_username?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0 space-y-1">
                                <p className={`text-xs leading-relaxed ${!notif.is_read ? 'font-semibold' : ''}`}>{notif.message}</p>
                                <p className="text-[0.65rem] text-muted-foreground">{getRelativeTime(notif.created_at)}</p>
                              </div>
                              <div className="shrink-0 pt-1">
                                {notif.type === 'follow' && <UserPlus className="w-4 h-4 text-[#C17B74]/60" />}
                                {notif.type === 'live' && <Radio className="w-4 h-4 text-[#E8948D] animate-pulse" />}
                                {notif.type === 'viewer_milestone' && <PartyPopper className="w-4 h-4 text-[#E8948D]/60" />}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <Link to="/dashboard">
                  <UserIcon className="w-4 h-4 mr-2" /> Dashboard
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={async () => { await signOut(); window.location.assign('/'); }}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Toasts */}
      <div className="fixed bottom-0 right-0 p-6 flex flex-col gap-3 pointer-events-none z-[9999]">
        {activeToasts.map((notif, index) => (
          <div key={notif.id} className="pointer-events-auto" style={{ marginBottom: `${index * 80}px`, position: 'absolute', bottom: 0, right: 0 }}>
             <NotificationToast 
               message={notif.message}
               type={notif.type}
               senderAvatar={notif.sender_avatar}
               senderUsername={notif.sender_username}
               onClose={() => removeToast(notif.id)}
             />
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
