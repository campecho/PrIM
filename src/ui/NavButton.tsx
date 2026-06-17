import React from "react";
import { cn } from "./cn";
import { Icon } from "./Icon";

export interface NavButtonProps {
  /** Material Symbols name (string) or a custom node such as an SVG. */
  icon: string | React.ReactNode;
  label: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
}

/**
 * Sidebar navigation item. Previously this markup was duplicated verbatim
 * for the top and bottom module lists in App.tsx.
 */
export function NavButton({ icon, label, active, expanded, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      title={expanded ? undefined : label}
      className={cn(
        "flex items-center px-4 py-3 w-full transition-colors border-l-4",
        active ? "bg-black/20 border-white" : "hover:bg-black/10 border-transparent",
      )}
    >
      {typeof icon === "string" ? (
        <Icon name={icon} />
      ) : (
        <span className="flex items-center justify-center w-6 h-6">{icon}</span>
      )}
      {expanded && <span className="ml-4 font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
}
