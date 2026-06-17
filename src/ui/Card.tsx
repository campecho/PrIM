import React from "react";
import { cn } from "./cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove the default inner padding (e.g. when the card wraps a table). */
  flush?: boolean;
}

/** White rounded surface with a subtle border — the standard content panel. */
export function Card({ flush, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200 shadow-sm",
        !flush && "p-5",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
