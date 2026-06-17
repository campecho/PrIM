import { useState, useRef, useEffect } from "react";

export function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = value
    ? options.filter((opt) => opt.toLowerCase().includes(value.toLowerCase()))
    : options;

  const uniqueFilteredOptions = Array.from(new Set(filteredOptions)).slice(
    0,
    50,
  );

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  const renderHighlighted = (text: string) => {
    if (!value) return <span className="font-normal">{text}</span>;
    const regex = new RegExp(
      `(${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === value.toLowerCase() ? (
        <strong key={i} className="font-semibold text-gray-900">
          {part}
        </strong>
      ) : (
        <span key={i} className="font-normal text-gray-700">
          {part}
        </span>
      ),
    );
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full border border-gray-400 rounded-sm py-2 pl-3 pr-16 outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white text-[14px] text-gray-900"
          placeholder={placeholder}
        />
        <div className="absolute right-2 flex items-center gap-2 bg-transparent pointer-events-auto">
          {value && (
            <button
              onClick={() => {
                onChange("");
                setIsOpen(true);
              }}
              className="text-gray-500 hover:text-gray-800 flex items-center justify-center focus:outline-none"
            >
              <span className="material-symbols-outlined text-[16px] font-light">
                close
              </span>
            </button>
          )}
          <span className="text-gray-500 flex items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-[20px] font-light">
              search
            </span>
          </span>
        </div>
      </div>

      {isOpen && uniqueFilteredOptions.length > 0 && (
        <div className="absolute left-0 right-0 z-[60] bg-white border border-gray-300 shadow-sm max-h-64 overflow-y-auto mt-[1px]">
          {uniqueFilteredOptions.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(option)}
              className="px-3 py-2.5 text-[14px] cursor-pointer hover:bg-gray-50 text-gray-800 flex items-center"
            >
              <div className="truncate w-full">{renderHighlighted(option)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
