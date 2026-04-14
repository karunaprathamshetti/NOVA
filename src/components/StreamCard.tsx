import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

interface StreamCardProps {
  username: string;
  title: string;
  category: string;
  viewerCount: number;
  thumbnailUrl?: string;
  avatarUrl?: string;
  isLive?: boolean;
}

const StreamCard = ({ username, title, category, viewerCount, thumbnailUrl, avatarUrl, isLive = true }: StreamCardProps) => {
  return (
    <Link to={`/stream/${username}`} className="block group">
      <div className="glass-card p-3 transition-all duration-300 hover:-translate-y-1.5" style={{ transition: "all 0.3s ease" }}>
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-3">
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-secondary flex items-center justify-center">
              <span className="text-muted-foreground text-xs">Preview</span>
            </div>
          )}
          {isLive && (
            <div className="absolute top-2 left-2 live-badge">
              <span className="live-dot" />
              LIVE
            </div>
          )}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 glass-card px-2 py-0.5 text-xs text-card-foreground font-medium" style={{ borderRadius: "9999px", padding: "2px 8px" }}>
            <Eye className="w-3 h-3" />
            {viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-muted shrink-0 overflow-hidden border border-border">
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                {username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </p>
            <p className="text-xs text-muted-foreground truncate">{username} · {category}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;
