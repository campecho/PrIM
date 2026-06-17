import React from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "link";
export type ButtonSize = "sm" | "md";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Pill-shaped (rounded-full) vs. the default rounded-md corners. */
  pill?: boolean;
  /** Optional Material Symbols icon name rendered before the label. */
  leadingIcon?: string;
  /** Optional Material Symbols icon name rendered after the label. */
  trailingIcon?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark shadow-sm disabled:bg-gray-400",
  danger:
    "bg-primary text-white hover:bg-primary-dark shadow-sm disabled:bg-gray-400",
  secondary:
    "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
  link: "bg-transparent text-link-blue hover:underline px-0 py-0 shadow-none",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2 text-sm",
};

/**
 * Canonical button for the app. Replaces the dozens of hand-written
 * `<button className="px-6 py-2 bg-primary ...">` instances so that all
 * actions share the same brand styling, focus ring and disabled behaviour.
 */
export function Button({
  variant = "primary",
  size = "md",
  pill = true,
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isLink = variant === "link";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-alpha",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        !isLink && SIZES[size],
        !isLink && (pill ? "rounded-full" : "rounded-md"),
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {leadingIcon && <Icon name={leadingIcon} size="text-[18px]" />}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size="text-[18px]" />}
    </button>
  );
}
