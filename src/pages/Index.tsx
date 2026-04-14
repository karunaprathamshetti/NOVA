import { Button } from "@/components/ui/button";
import StreamCard from "@/components/StreamCard";
import StreamCardSkeleton from "@/components/StreamCardSkeleton";
import { Link } from "react-router-dom";
import { Play, Radio, Users } from "lucide-react";
import { useState, useEffect } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const MOCK_STREAMS = [
  { username: "neon_gamer", title: "Ranked Grind to Diamond 💎", category: "Valorant", viewerCount: 3420, isLive: true },
  { username: "chill_dev", title: "Building a SaaS in public", category: "Software Dev", viewerCount: 891, isLive: true },
  { username: "art_queen", title: "Digital painting session ✨", category: "Art", viewerCount: 2105, isLive: true },
  { username: "speedrunner42", title: "Any% WR attempts", category: "Celeste", viewerCount: 5670, isLive: true },
  { username: "music_mike", title: "Lo-fi beats & chill vibes", category: "Music", viewerCount: 1340, isLive: true },
  { username: "retro_plays", title: "N64 classics marathon", category: "Retro Gaming", viewerCount: 780, isLive: true },
];

const Index = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen pt-16 relative">
      {/* Hero BG */}
      <div className="absolute inset-0 z-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      <div className="relative z-10">
      <section className="container mx-auto px-4 py-20 md:py-28 text-center">
        <div className="max-w-3xl mx-auto space-y-6" style={{ animation: "fade-in-up 0.8s ease-out forwards" }}>
          <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 text-xs font-medium text-primary mb-2">
            <Radio className="w-3.5 h-3.5" />
            Now in Beta
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Go Live.{" "}
            <span className="text-primary drop-shadow-[0_0_25px_rgba(59,130,246,0.5)]">
              Your Stream.
            </span>
            <br />
            Your Rules.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
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
          ) : (
            MOCK_STREAMS.map((stream) => (
              <StreamCard key={stream.username} {...stream} />
            ))
          )}
        </div>
      </section>
      </div>
    </div>
  );
};

export default Index;
