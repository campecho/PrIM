import { cn } from "./cn";

export interface IconProps {
  /** Material Symbols Outlined ligature name, e.g. "search", "close". */
  name: string;
  /** Optional Tailwind size class such as "text-[20px]" or "text-3xl". */
  size?: string;
  className?: string;
  /** Render the filled variant of the symbol. */
  filled?: boolean;
}

/**
 * Thin wrapper around the Material Symbols Outlined font.
 * Centralises the `material-symbols-outlined` span so icon usage is
 * consistent across the app instead of being hand-written each time.
 */
export function Icon({ name, size, className, filled }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined leading-none select-none", size, className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
