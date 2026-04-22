import { Button } from "@/components/ui/button";
import StreamCard from "@/components/StreamCard";
import StreamCardSkeleton from "@/components/StreamCardSkeleton";
import { Link } from "react-router-dom";
import { Play, Radio, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface LiveStream {
  username: string;
  stream_title: string;
  category: string;
  viewer_count: number;
  is_live: boolean;
  avatar_url?: string;
}

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [streams, setStreams] = useState<LiveStream[]>([]);

  useEffect(() => {
    const fetchLiveStreams = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, stream_title, category, viewer_count, is_live, avatar_url')
        .eq('is_live', true)
        .order('viewer_count', { ascending: false });

      if (data && !error) {
        setStreams(data as LiveStream[]);
      }
      setLoading(false);
    };

    fetchLiveStreams();

    const channel = supabase.channel('live-streams')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: 'is_live=eq.true'
      }, (payload) => {
        setStreams(prev => prev.map(s => s.username === payload.new.username ? { ...s, ...payload.new } : s));
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles',
      }, () => {
        // Fallback or handle new streams / stream ends
        fetchLiveStreams();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-16 relative">
      <div className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 py-20 md:py-28 text-center">
          <div
            className="max-w-3xl mx-auto space-y-6"
            style={{ animation: "fade-in-up 0.8s ease-out forwards" }}
          >
            {/* Beta Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-2"
              style={{
                background: 'rgba(193,123,116,0.15)',
                border: '1px solid rgba(193,123,116,0.3)',
                color: '#C17B74',
              }}
            >
              <Radio className="w-3.5 h-3.5" />
              Now in Beta
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#2D1F1E] dark:text-[#F5E8E6]">
              Go Live.{" "}
              <span className="text-[#C17B74] dark:text-[#E8948D] drop-shadow-[0_0_20px_rgba(193,123,116,0.4)]">
                Your Stream.
              </span>
              <br />
              Your Rules.
            </h1>

            <p className="text-lg md:text-xl max-w-xl mx-auto text-[#2D1F1E]/60 dark:text-[#F5E8E6]/70">
              Stream to the world with zero hassle. Neo-tactile experience, real-time chat, and full control over your broadcast.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  <Play className="w-5 h-5" />
                  Start Streaming
                </Link>
              </Button>
              <Button variant="default" size="xl" asChild>
                <Link to="/login">
                  <Users className="w-5 h-5" />
                  Browse Streams
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Live Channels */}
        <section className="container mx-auto px-4 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="live-badge">
              <span className="live-dot" />
              LIVE
            </div>
            <h2 className="text-2xl font-bold text-foreground">Live Channels</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <StreamCardSkeleton count={6} />
            ) : streams.length === 0 ? (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20 glass-card">
                <h3 className="text-xl font-medium text-muted-foreground">
                  No streams live right now. Be the first to go live!
                </h3>
              </div>
            ) : (
              streams.map((stream) => (
                <StreamCard
                  key={stream.username}
                  username={stream.username}
                  title={stream.stream_title}
                  category={stream.category}
                  viewerCount={stream.viewer_count}
                  isLive={stream.is_live}
                  avatarUrl={stream.avatar_url}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
