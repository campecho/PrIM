import { useState, useRef, useEffect } from "react";

export function TableActionMenu({
  actions,
}: {
  actions: {
    label: string;
    icon: string;
    onClick?: () => void;
    variant?: "default" | "danger" | "primary";
  }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
      >
        <span className="material-symbols-outlined text-[20px]">more_vert</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1 flex flex-col">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => {
                if (action.onClick) action.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                action.variant === "primary"
                  ? "text-primary font-medium"
                  : action.variant === "danger"
                    ? "text-[#cc0000] font-medium"
                    : "text-gray-700"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] opacity-70">
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
