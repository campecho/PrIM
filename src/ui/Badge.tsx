import React from "react";
import { cn } from "./cn";

export type BadgeTone =
  | "gray"
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "teal"
  | "orange"
  | "yellow";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Outlined style (border + colored text on white) vs. soft filled. */
  outline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SOFT: Record<BadgeTone, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  amber: "bg-amber-100 text-amber-800",
  teal: "bg-teal-100 text-teal-800",
  orange: "bg-orange-100 text-orange-800",
  yellow: "bg-yellow-100 text-yellow-800",
};

const OUTLINE: Record<BadgeTone, string> = {
  gray: "border-gray-400 text-gray-700",
  blue: "border-blue-600 text-blue-700",
  green: "border-green-600 text-green-700",
  red: "border-red-600 text-red-700",
  amber: "border-amber-600 text-amber-700",
  teal: "border-teal-600 text-teal-700",
  orange: "border-orange-600 text-orange-700",
  yellow: "border-yellow-600 text-yellow-700",
};

/**
 * Status / label pill. Consolidates the many inline
 * `inline-flex px-2 rounded-full text-xs font-medium ...` chips.
 */
export function Badge({ tone = "gray", outline = false, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide",
        outline ? cn("border bg-white", OUTLINE[tone]) : SOFT[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
