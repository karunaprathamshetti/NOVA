import { cn } from "@/lib/utils"
import NeuralBackground from "./ui/flow-field-background"
import { useTheme } from "./theme-provider"

export default function AnimatedBackground({
  className,
}: {
  className?: string
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[-1] h-screen w-screen overflow-hidden",
        className,
      )}
    >
      <NeuralBackground
        color={isDark ? '#E8948D' : '#C17B74'}
        trailOpacity={0.1}
        speed={1.5}
        particleCount={800}
        scale={1.2}
      />

      {/* Rose gradient fade at edges */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background" />

      {/* Dusty rose orb — top left */}
      <div
        className="absolute top-[15%] left-[15%] w-80 h-80 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{
          background: isDark ? 'rgba(232,148,141,0.08)' : 'rgba(193,123,116,0.15)',
          animationDuration: '5s'
        }}
      />
      {/* Blush orb — bottom right */}
      <div
        className="absolute bottom-[15%] right-[15%] w-80 h-80 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{
          background: isDark ? 'rgba(139,80,75,0.12)' : 'rgba(237,217,214,0.2)',
          animationDuration: '7s'
        }}
      />
      {/* Light rose center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] pointer-events-none"
        style={{
          background: isDark ? 'rgba(61,42,40,0.4)' : 'rgba(210,160,155,0.1)',
        }}
      />
    </div>
  )
}
