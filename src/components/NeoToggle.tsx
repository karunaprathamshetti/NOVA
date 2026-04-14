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
            : "bg-secondary shadow-[var(--neu-inset)]"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300",
            isOn
              ? "left-[calc(100%-1.625rem)] bg-primary-foreground shadow-md"
              : "left-0.5 bg-muted-foreground/50"
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
