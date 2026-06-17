import { useMemo, useState } from "react";
import { StandardModal } from "../ui/StandardModal";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";

export type ImportColumnType = "text" | "number" | "select" | "boolean";

export interface ImportColumn {
  /** Field key on the review row object. */
  key: string;
  label: string;
  type: ImportColumnType;
  options?: { value: string; label: string }[];
  required?: boolean;
  min?: number;
  /** Extra per-cell validation; return an error message or undefined. */
  validate?: (value: any, row: any) => string | undefined;
  width?: string;
}

export interface ImportReviewModalProps {
  isOpen: boolean;
  title: string;
  columns: ImportColumn[];
  /** Parsed + transformed rows; each must carry a stable `id`. */
  initialRows: any[];
  /** IDs already present, used to count new vs. updated records. */
  existingIds: string[];
  onCancel: () => void;
  onConfirm: (rows: any[], mode: "merge" | "overwrite") => void;
}

function validateRow(row: any, columns: ImportColumn[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const col of columns) {
    const v = row[col.key];
    if (col.type === "number") {
      if (v === "" || v === null || v === undefined || isNaN(Number(v))) {
        errors[col.key] = "Must be a number.";
        continue;
      }
      if (col.min != null && Number(v) < col.min) {
        errors[col.key] = `Must be ≥ ${col.min}.`;
        continue;
      }
    } else if (col.type === "select") {
      if (col.required && !v) {
        errors[col.key] = "Required.";
        continue;
      }
      if (v && !col.options?.some((o) => o.value === v)) {
        errors[col.key] = "Invalid option.";
        continue;
      }
    } else if (col.type === "text") {
      if (col.required && !String(v ?? "").trim()) {
        errors[col.key] = "Required.";
        continue;
      }
    }
    if (col.validate) {
      const msg = col.validate(v, row);
      if (msg) errors[col.key] = msg;
    }
  }
  return errors;
}

/**
 * Reusable import review step: shows parsed rows in an editable table,
 * validates each cell, blocks confirmation until all errors are resolved,
 * and offers a merge-by-id import or a full overwrite.
 */
export function ImportReviewModal({
  isOpen,
  title,
  columns,
  initialRows,
  existingIds,
  onCancel,
  onConfirm,
}: ImportReviewModalProps) {
  const [rows, setRows] = useState<any[]>(initialRows);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  const errorsByRow = useMemo(
    () => rows.map((r) => validateRow(r, columns)),
    [rows, columns],
  );
  const errorCount = errorsByRow.reduce(
    (sum, e) => sum + Object.keys(e).length,
    0,
  );
  const isValid = errorCount === 0;

  const existing = useMemo(() => new Set(existingIds), [existingIds]);
  const newCount = rows.filter((r) => !existing.has(r.id)).length;
  const updateCount = rows.length - newCount;

  const updateCell = (index: number, key: string, value: any) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    );
  };

  const cellClass = (hasError?: boolean) =>
    cn(
      "w-full px-2 py-1 rounded text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary",
      hasError ? "border border-red-500 bg-red-50" : "border border-transparent",
    );

  return (
    <StandardModal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Review and correct the imported data below. Import is enabled once all
          errors are resolved.{" "}
          <span className="font-medium text-gray-800">
            {newCount} new, {updateCount} update{updateCount === 1 ? "" : "s"}
          </span>
          {errorCount > 0 && (
            <span className="font-medium text-red-600">
              {" "}
              · {errorCount} error{errorCount === 1 ? "" : "s"}
            </span>
          )}
          .
        </p>

        <div className="max-h-[55vh] overflow-auto border border-gray-200 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-2 py-2 text-left font-medium text-gray-500 whitespace-nowrap"
                  >
                    {col.label}
                    {col.required && <span className="text-primary"> *</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {rows.map((row, i) => {
                const rowErrors = errorsByRow[i];
                return (
                  <tr key={row.id ?? i}>
                    {columns.map((col) => {
                      const err = rowErrors[col.key];
                      return (
                        <td
                          key={col.key}
                          className={cn("px-2 py-1 align-top", col.width)}
                          title={err}
                        >
                          {col.type === "boolean" ? (
                            <input
                              type="checkbox"
                              checked={!!row[col.key]}
                              onChange={(e) =>
                                updateCell(i, col.key, e.target.checked)
                              }
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                          ) : col.type === "select" ? (
                            <select
                              value={row[col.key] ?? ""}
                              onChange={(e) =>
                                updateCell(i, col.key, e.target.value)
                              }
                              className={cellClass(!!err)}
                            >
                              <option value="" disabled>
                                Select…
                              </option>
                              {col.options?.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={col.type === "number" ? "number" : "text"}
                              step={col.type === "number" ? "any" : undefined}
                              value={row[col.key] ?? ""}
                              onChange={(e) =>
                                updateCell(i, col.key, e.target.value)
                              }
                              className={cellClass(!!err)}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          {confirmingOverwrite ? (
            <div className="flex items-center justify-between w-full gap-4">
              <p className="text-sm font-semibold text-primary">
                This replaces ALL existing records. Continue?
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setConfirmingOverwrite(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={!isValid}
                  onClick={() => onConfirm(rows, "overwrite")}
                >
                  Confirm Overwrite
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-4">
              <button
                type="button"
                onClick={() => setConfirmingOverwrite(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Overwrite all records instead…
              </button>
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!isValid}
                  onClick={() => onConfirm(rows, "merge")}
                >
                  Confirm Import
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StandardModal>
  );
}
