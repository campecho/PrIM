import React from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Material Symbols icon name. */
  icon: string;
  /** Accessible label (required, since the button has no text). */
  label: string;
  iconSize?: string;
  /** Visual size of the circular hit area. */
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: "w-7 h-7",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

/**
 * Circular, icon-only button — the recurring
 * `rounded-full hover:bg-gray-100 flex items-center justify-center` pattern.
 */
export function IconButton({
  icon,
  label,
  iconSize,
  size = "md",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        "flex items-center justify-center rounded-full text-gray-600 transition-colors",
        "hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-alpha",
        SIZES[size],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}
