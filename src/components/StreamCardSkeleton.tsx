interface StreamCardSkeletonProps {
  count?: number;
}

const StreamCardSkeleton = ({ count = 6 }: StreamCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-3 animate-pulse">
          <div className="aspect-video rounded-xl bg-secondary mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-secondary shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-secondary rounded-full w-3/4" />
              <div className="h-3 bg-secondary rounded-full w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StreamCardSkeleton;
