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
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div
            className="flex flex-col lg:flex-row items-center justify-between gap-12"
            style={{ animation: "fade-in-up 0.8s ease-out forwards" }}
          >
            <div className="flex-1 space-y-6">
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

              <p className="text-lg md:text-xl text-[#2D1F1E]/60 dark:text-[#F5E8E6]/70 max-w-xl">
                Stream to the world with zero hassle. Nova-tactile experience, real-time chat, and full control over your broadcast.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Button variant="hero" size="xl" asChild>
                <Link to="/signup">
                  <Play className="w-5 h-5" />
                  Start Streaming
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

        {/* About Us Section */}
        <section className="border-t border-border/10 bg-[#C17B74]/5 pt-24 pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#2D1F1E] dark:text-[#F5E8E6]">
                  About <span className="text-[#C17B74]">Nova</span>
                </h2>
                <div className="w-20 h-1 bg-[#C17B74] mx-auto rounded-full" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-lg leading-relaxed text-[#2D1F1E]/70 dark:text-[#F5E8E6]/80">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#2D1F1E] dark:text-[#F5E8E6]">Our Mission</h3>
                  <p>
                    Nova was built for creators who want more than just a place to stream. We envisioned a truly <strong>standalone ecosystem</strong> where you aren't dependent on external encoders or third-party platforms.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-[#2D1F1E] dark:text-[#F5E8E6]">Standalone Power</h3>
                  <p>
                    With our integrated <strong>Nova Studio</strong>, you can go live directly from your browser in 1080p. No OBS, no stream keys, just you and your audience in real-time.
                  </p>
                </div>
              </div>

              <div className="pt-12 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#C17B74]">Purely Nova. Purely Independent.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
