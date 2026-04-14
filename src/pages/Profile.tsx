import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Calendar } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const [following, setFollowing] = useState(false);

  return (
    <div className="gradient-bg min-h-screen pt-16">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="glass-card p-8 text-center space-y-5" style={{ animation: "fade-in-up 0.6s ease-out forwards" }}>
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-3xl font-bold text-primary border-2 border-primary/30">
            {username?.[0]?.toUpperCase()}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-foreground">{username}</h1>
            <p className="text-sm text-muted-foreground mt-1">Streaming games, code, and vibes ✨</p>
          </div>

          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">12.4K</p>
              <p className="text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">342</p>
              <p className="text-muted-foreground">Following</p>
            </div>
          </div>

          <Button
            variant={following ? "default" : "primary"}
            size="lg"
            onClick={() => setFollowing(!following)}
            className="min-w-[160px]"
          >
            {following ? (
              <>
                <UserCheck className="w-4 h-4" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Follow
              </>
            )}
          </Button>
        </div>

        {/* Past Streams */}
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-foreground">Past Streams</h2>
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
              <div className="w-32 aspect-video rounded-xl bg-secondary shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">Epic Gaming Session #{i}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {i} days ago · 3h 42m
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
