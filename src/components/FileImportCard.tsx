import React, { useState, useRef } from "react";
import { MOCK_CUSTOMERS } from "../data/mockData";
import { FileAsset, ImportedFileDetails, PrintCustomer } from "../types";
import { SearchBar } from "../ui/SearchBar";
import { StandardModal } from "../ui/StandardModal";

export function FileImportCard({
  className = "",
  onImport,
}: {
  className?: string;
  onImport?: (files: FileAsset[]) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [importedFiles, setImportedFiles] = useState<ImportedFileDetails[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [selectedImportCustomer, setSelectedImportCustomer] =
    useState<PrintCustomer | null>(null);
  const internalFileInputRef = useRef<HTMLInputElement>(null);

  const filteredCustomers = customerSearchTerm
    ? MOCK_CUSTOMERS.filter(
        (c) =>
          c.accountNumber
            .toLowerCase()
            .includes(customerSearchTerm.toLowerCase()) ||
          c.companyName
            .toLowerCase()
            .includes(customerSearchTerm.toLowerCase()),
      ).slice(0, 5) // Limit to 5 results
    : [];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const addFiles = (files: File[]) => {
    const newFiles = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      pageCount: file.type.includes("pdf")
        ? Math.floor(Math.random() * 10) + 1
        : 1,
      colorMode: "CMYK",
      resolutionDpi: 300,
    }));
    setImportedFiles((prev) => [...prev, ...newFiles]);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
      setIsModalOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
      setIsModalOpen(true);
    }
    e.target.value = "";
  };

  return (
    <>
      <div
        className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px] flex flex-col ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">File Import</h2>
          <button
            onClick={() => {
              setImportedFiles([]);
              setIsModalOpen(true);
            }}
            className="text-sm font-medium text-[var(--color-link-blue)] hover:underline"
          >
            Upload to Spec
          </button>
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
            isDragging
              ? "border-primary bg-primary-alpha"
              : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
          }`}
        >
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-3">
            cloud_upload
          </span>
          <p className="text-sm text-gray-600 text-center mb-4">
            Drag and drop files here, or click to upload
          </p>
          <label className="bg-white border text-center border-[#969696] text-black font-medium text-sm px-4 py-2 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
            Upload Files
            <input
              type="file"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
          </label>
        </div>
      </div>

      <StandardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setImportedFiles([]);
          setSelectedImportCustomer(null);
          setCustomerSearchTerm("");
        }}
        title="File Import"
        fullScreen={true}
        primaryAction={{
          label: "Import files",
          onClick: () => {
            if (!selectedImportCustomer || importedFiles.length === 0) return;

            const newFileAssets: FileAsset[] = importedFiles.map((item) => {
              return {
                id: Math.floor(Math.random() * 10000) + 100, // Make ID reasonably unique for mock
                name: item.file.name,
                dimensions: "Unknown",
                type:
                  item.file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
                updatedAt: new Date().toISOString(),
                description: "",
                fileId: `FILE-${Math.random().toString(36).substr(2, 9)}`,
                version: "1.0",
                lastUpdatedBy: "Implementations",
                customerAccounts: [selectedImportCustomer.accountNumber],
                addedBy: "Implementations",
                ownedBy: "Implementations",
                isShared: true,
                sku: "",
                fileSize: formatBytes(item.file.size),
                pageCount: item.pageCount,
                colorMode: item.colorMode as any,
                resolutionDpi: item.resolutionDpi,
                preflightCheck: true,
              };
            });

            if (onImport) onImport(newFileAssets);

            setIsModalOpen(false);
            setImportedFiles([]);
            setSelectedImportCustomer(null);
            setCustomerSearchTerm("");
          },
          disabled: !selectedImportCustomer || importedFiles.length === 0,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => {
            setIsModalOpen(false);
            setImportedFiles([]);
            setSelectedImportCustomer(null);
            setCustomerSearchTerm("");
          },
        }}
      >
        <div className="p-6 md:p-8 flex flex-col h-full min-h-0">
          <div className="grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full flex-1 lg:grid-rows-1 lg:min-h-0">
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:self-start lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0 min-h-[150px]">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Assign to Customer
                </h3>

                {selectedImportCustomer ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {selectedImportCustomer.companyName}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {selectedImportCustomer.accountNumber}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedImportCustomer(null)}
                        className="text-sm font-medium text-[var(--color-link-blue)] hover:underline"
                      >
                        Change
                      </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 border-t border-gray-100 pt-4">
                      <p>
                        <strong className="text-gray-900 font-medium">
                          Address:
                        </strong>{" "}
                        {selectedImportCustomer.city},{" "}
                        {selectedImportCustomer.state}
                      </p>
                      <p>
                        <strong className="text-gray-900 font-medium">
                          3PP:
                        </strong>{" "}
                        {selectedImportCustomer.threePP}
                      </p>
                      <p>
                        <strong className="text-gray-900 font-medium">
                          P2S:
                        </strong>{" "}
                        {selectedImportCustomer.printToStore ? "Yes" : "No"}
                      </p>
                      {selectedImportCustomer.notes &&
                        selectedImportCustomer.notes.length > 0 && (
                          <p>
                            <strong className="text-gray-900 font-medium">
                              Notes:
                            </strong>{" "}
                            {selectedImportCustomer.notes.length} note(s)
                          </p>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <SearchBar
                      placeholder="Search account or company..."
                      value={customerSearchTerm}
                      onChange={setCustomerSearchTerm}
                      className="w-full"
                    />
                    {customerSearchTerm && filteredCustomers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                        {filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedImportCustomer(c);
                              setCustomerSearchTerm("");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                          >
                            <div className="font-medium text-sm text-gray-900">
                              {c.companyName}
                            </div>
                            <div className="text-sm text-gray-900">
                              {c.accountNumber}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {customerSearchTerm && filteredCustomers.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 text-center text-sm text-gray-500">
                        No matching customers found.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0 min-h-[150px]">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Specs
                </h3>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-8 lg:h-full lg:min-h-0 flex flex-col">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full lg:min-h-0 overflow-y-auto pb-8">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h3 className="text-lg font-semibold text-gray-800">Files</h3>
                  {importedFiles.length > 0 && (
                    <button
                      onClick={() => internalFileInputRef.current?.click()}
                      className="text-sm font-medium text-[var(--color-link-blue)] hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                      Add more files
                    </button>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    ref={internalFileInputRef}
                    onChange={handleFileSelect}
                  />
                </div>

                {importedFiles.length > 0 ? (
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-200">
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            File Name
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            Type
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            Size
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            Pages
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            Color Mode
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                            Resolution
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-gray-900 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {importedFiles.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
                          >
                            <td
                              className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate"
                              title={item.file.name}
                            >
                              {item.file.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 uppercase">
                              {item.file.name.split(".").pop() || "Unknown"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {formatBytes(item.file.size)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.pageCount}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.colorMode}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.resolutionDpi} dpi
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <button
                                onClick={() =>
                                  setImportedFiles((prev) =>
                                    prev.filter((f) => f.id !== item.id),
                                  )
                                }
                                className="text-gray-400 hover:text-red-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
                                title="Remove file"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  delete
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed rounded-lg transition-colors bg-gray-50/50 ${
                      isDragging
                        ? "border-primary bg-primary-alpha"
                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">
                      cloud_upload
                    </span>
                    <p className="text-gray-500 text-sm mb-4">
                      Drag and drop files here, or click to upload
                    </p>
                    <label className="bg-white border text-center border-[#969696] text-black font-medium text-sm px-4 py-2 rounded-[20px] cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                      Upload Files
                      <input
                        type="file"
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </StandardModal>
    </>
  );
}
