interface StreamCardSkeletonProps {
  count?: number;
}

const StreamCardSkeleton = ({ count = 6 }: StreamCardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-3">
          <div
            className="aspect-video rounded-xl mb-3"
            style={{
              background: 'linear-gradient(90deg, #EDD9D6 25%, #F5E8E6 50%, #EDD9D6 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-shimmer 1.5s infinite',
            }}
          />
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full shrink-0"
              style={{
                background: 'linear-gradient(90deg, #EDD9D6 25%, #F5E8E6 50%, #EDD9D6 75%)',
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.5s infinite 0.1s',
              }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-3.5 rounded-full w-3/4"
                style={{
                  background: 'linear-gradient(90deg, #EDD9D6 25%, #F5E8E6 50%, #EDD9D6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-shimmer 1.5s infinite 0.2s',
                }}
              />
              <div
                className="h-3 rounded-full w-1/2"
                style={{
                  background: 'linear-gradient(90deg, #EDD9D6 25%, #F5E8E6 50%, #EDD9D6 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'skeleton-shimmer 1.5s infinite 0.3s',
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default StreamCardSkeleton;
