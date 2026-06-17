import React from "react";
import { cn } from "./cn";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  /** Optional helper or error text shown beneath the field. */
  hint?: string;
  error?: boolean;
}

/** Shared input style used by every text field. */
export const inputClass =
  "w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all " +
  "disabled:bg-gray-50 disabled:text-gray-500";

/**
 * Labeled text input. Wraps the recurring input styling so forms across
 * modules and drawers look identical.
 */
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, hint, error, className, id, ...rest }, ref) {
    const inputId = id || (label ? `tf-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputClass, error && "border-red-500 focus:ring-red-200 focus:border-red-500", className)}
          {...rest}
        />
        {hint && (
          <p className={cn("text-xs", error ? "text-red-600" : "text-gray-500")}>{hint}</p>
        )}
      </div>
    );
  },
);
