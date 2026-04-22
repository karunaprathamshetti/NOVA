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
      <div className="glass-card p-3 transition-all duration-300 hover:-translate-y-1.5">
        {/* Thumbnail */}
        <div className="relative aspect-video rounded-xl overflow-hidden mb-3" style={{ background: 'rgba(237,217,214,0.4)' }}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(237,217,214,0.6), rgba(193,123,116,0.2))' }}
            >
              <span className="text-muted-foreground text-xs">Preview</span>
            </div>
          )}
          {isLive && (
            <div className="absolute top-2 left-2 live-badge">
              <span className="live-dot" />
              LIVE
            </div>
          )}
          {/* Viewer count pill */}
          <div
            className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm"
            style={{
              background: 'rgba(193,123,116,0.15)',
              color: '#C17B74',
              border: '1px solid rgba(193,123,116,0.25)',
            }}
          >
            <Eye className="w-3 h-3" />
            {viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full shrink-0 overflow-hidden" style={{ border: '1px solid #EDD9D6' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(193,123,116,0.15)', color: '#C17B74' }}
              >
                {username[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-card-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-muted-foreground">{username}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(193,123,116,0.1)', color: '#C17B74' }}
              >
                {category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StreamCard;
