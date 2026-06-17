import React, { useState } from "react";
import { formatDisplayDate } from "../../lib/format";
import { FileAsset, PrintCustomer } from "../../types";
import { StandardDrawer } from "../../ui/StandardDrawer";
import { TruncateWithTooltip } from "../../ui/TruncateWithTooltip";

export function CustomerFilesDrawer({
  customer,
  onClose,
  files,
  onOpenDetail,
  onNavigateToFiles,
}: {
  customer: PrintCustomer | null;
  onClose: () => void;
  files: FileAsset[];
  onOpenDetail: (file: FileAsset) => void;
  onNavigateToFiles: (account: string) => void;
}) {
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const customerFiles = customer
    ? files.filter((f) => f.customerAccounts.includes(customer.accountNumber))
    : [];

  const toggleSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFileIds.includes(id)) {
      setSelectedFileIds(selectedFileIds.filter((f) => f !== id));
    } else {
      setSelectedFileIds([...selectedFileIds, id]);
    }
  };

  const titleNode = customer ? (
    <span>Files for {customer.companyName}</span>
  ) : null;

  return (
    <StandardDrawer
      isOpen={!!customer}
      onClose={onClose}
      title={titleNode}
      customWidth="w-full max-w-2xl"
      footer={
        customer ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
              onNavigateToFiles(customer.accountNumber);
            }}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
          >
            View in Files
          </button>
        ) : null
      }
    >
      <div className="p-6 flex-1 bg-gray-50 h-full">
        <div className="flex flex-col gap-2">
          {customerFiles.map((file, index) => {
            const isSelected = selectedFileIds.includes(file.id);
            return (
              <div
                key={file.id}
                onClick={() => {
                  onClose();
                  onOpenDetail(file);
                }}
                className={`group relative bg-white p-3 rounded-xl transition-shadow cursor-pointer border flex items-center gap-3 ${isSelected ? "border-[#2a78c6]" : "border-gray-200"} hover:shadow-md`}
              >
                <div className="relative shrink-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0"></div>
                  <button
                    onClick={(e) => toggleSelection(file.id, e)}
                    className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all z-10 shrink-0 aspect-square focus:outline-none leading-none ${isSelected ? "bg-primary border-primary text-white opacity-100 shadow-sm" : "bg-white border-gray-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-gray-400 shadow-sm"}`}
                  >
                    <span className="material-symbols-outlined text-[14px] font-bold">
                      check
                    </span>
                  </button>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <TruncateWithTooltip
                    as="h3"
                    text={file.name}
                    className="font-bold text-gray-900 text-sm mb-0.5 truncate"
                  />
                  <TruncateWithTooltip
                    as="p"
                    text={`${file.dimensions} | ${file.type}`}
                    className="text-xs text-gray-500 mb-0.5 truncate"
                  />
                  <TruncateWithTooltip
                    as="p"
                    text={`${!["PNG", "JPG", "SVG", "GIF"].includes(file.type) ? `${file.pageCount} ${file.pageCount === 1 ? "Page" : "Pages"} | ` : ""}${file.resolutionDpi} dpi`}
                    className="text-xs text-gray-500 mb-0.5 truncate"
                  />
                  <TruncateWithTooltip
                    as="p"
                    text={`Updated ${formatDisplayDate(file.updatedAt)}`}
                    className="text-[11px] text-gray-400 truncate"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StandardDrawer>
  );
}
