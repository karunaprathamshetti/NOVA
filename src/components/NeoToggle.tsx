import { useState } from "react";
import { cn } from "@/lib/utils";

interface NeoToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
}

const NeoToggle = ({ checked = false, onChange, label }: NeoToggleProps) => {
  const [isOn, setIsOn] = useState(checked);

  const toggle = () => {
    const next = !isOn;
    setIsOn(next);
    onChange?.(next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-3 group"
      role="switch"
      aria-checked={isOn}
    >
      <div
        className={cn(
          "relative w-14 h-7 rounded-full transition-all duration-300",
          isOn
            ? "bg-primary shadow-[var(--neon-glow)]"
            : "bg-muted shadow-[var(--neu-inset)]"
        )}
        style={{
          boxShadow: isOn
            ? "0 0 20px rgba(59, 130, 246, 0.4)"
            : "inset 3px 3px 6px rgba(0, 20, 60, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)"
        }}
      >
        <div
          className={cn(
            "absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 shadow-md",
            isOn
              ? "left-[calc(100%-1.625rem)] bg-primary-foreground"
              : "left-0.5 bg-card-foreground/30"
          )}
        />
      </div>
      {label && (
        <span className={cn(
          "text-sm font-medium transition-colors",
          isOn ? "text-primary" : "text-muted-foreground"
        )}>
          {label}
        </span>
      )}
    </button>
  );
};

export default NeoToggle;
