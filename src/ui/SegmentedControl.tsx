import { cn } from "./cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Pill toggle group (e.g. the Orders "Orders / Empty" switch).
 * Replaces inline `flex bg-gray-100 p-1 rounded-md` toggle markup.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("flex bg-gray-100 p-1 rounded-md border border-gray-200", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-1.5 text-sm font-medium rounded transition-colors",
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
