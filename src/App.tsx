import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import exifr from "exifr";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  exportFinishedSizesToXLSX,
  exportMediaToXLSX,
  parseImportedXLSX,
} from "./lib/portability";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { INITIAL_MEDIA_CATALOG as PARSED_MEDIA } from "./data/media";
import { INITIAL_FINISHED_SIZES_DATA as PARSED_SIZES } from "./data/sizes";

export function useFirestoreSync<T>(
  collectionName: string,
  docId: string,
  fallback: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(fallback);
  const [isLoaded, setIsLoaded] = useState(false);
  const serverValueStr = React.useRef<string>(JSON.stringify(fallback));

  useEffect(() => {
    let active = true;
    const docRef = doc(db, collectionName, docId);

    const unsubscribeSnapshot = onSnapshot(
      docRef,
      (docSnap) => {
        if (!active) return;
        if (docSnap.exists()) {
          const incomingData = docSnap.data().data;
          console.log(
            `[useFirestoreSync] ${collectionName}/${docId} Snapshot received. Data length:`,
            Array.isArray(incomingData) ? incomingData.length : "object",
          );
          serverValueStr.current = JSON.stringify(incomingData);
          setValue((prev) =>
            JSON.stringify(prev) === serverValueStr.current
              ? prev
              : incomingData,
          );
        } else {
          console.log(
            `[useFirestoreSync] ${collectionName}/${docId} Document does not exist. Using fallback.`,
          );
          // Document does not exist in backend, hold fallback
          serverValueStr.current = JSON.stringify(fallback);
          setValue((prev) =>
            JSON.stringify(prev) === serverValueStr.current ? prev : fallback,
          );
        }
        setIsLoaded(true);
      },
      (err) => {
        console.error(
          `[useFirestoreSync] ${collectionName}/${docId} Sync error:`,
          err,
        );
        if (active) setIsLoaded(true);
      },
    );

    return () => {
      active = false;
      unsubscribeSnapshot();
    };
  }, [collectionName, docId]);

  useEffect(() => {
    if (!isLoaded) return;

    // Only save if the requested value differs from the known server state
    const currentValStr = JSON.stringify(value);
    if (currentValStr === serverValueStr.current) {
      return;
    }

    console.log(
      `[useFirestoreSync] ${collectionName}/${docId} Value changed, attempting save.`,
    );
    const save = async () => {
      try {
        await setDoc(
          doc(db, collectionName, docId),
          { data: value },
          { merge: true },
        );
        console.log(
          `[useFirestoreSync] ${collectionName}/${docId} Save successful.`,
        );
        // Mark what we just successfully sent so we don't send it again
        serverValueStr.current = currentValStr;
      } catch (err) {
        console.error(
          `[useFirestoreSync] ${collectionName}/${docId} Save error:`,
          err,
        );
      }
    };
    save();
  }, [value, isLoaded, collectionName, docId]);

  return [value, setValue];
}

// Removing GlobalDataMenu as requested
type Module = {
  id: string;
  name: string;
  headerName?: string;
  icon: string | React.ReactNode;
};

const topModules: Module[] = [
  {
    id: "program",
    name: "Program",
    headerName: "Program Item Dashboard",
    icon: "dashboard",
  },
  { id: "projects", name: "Projects", icon: "assignment" },
  { id: "files", name: "Files", icon: "file_present" },
  { id: "orders", name: "PrintBridge", icon: <span className="sc-1xdthq8-2 ilDIBW inline-flex items-center justify-center w-[24px] h-[24px]"><svg viewBox="0 0 40 40" focusable="false" aria-hidden="true" height="24px" width="24px" color="currentColor" className="sc-14dq9fm-0 czVqFY"><g fillRule="evenodd"><path d="M4.76 40h-.19c-.94-.05-1.8-.46-2.42-1.16s-.94-1.6-.89-2.53c0-.04.01-.08.01-.11L4.6 13c.31-1.75 1.79-3 3.53-3h23.72c1.71 0 3.23 1.28 3.52 2.97l3.34 23.23c.01.03.01.07.01.1q.015.21 0 .42c-.06.93-.47 1.79-1.18 2.41-.64.56-1.46.87-2.32.87-.07 0-.14 0-.21-.01L4.92 40zm-1.01-3.52c0 .25.09.5.26.68.18.2.43.32.7.33H35.2c.27 0 .51-.08.7-.25.2-.18.32-.43.34-.69v-.07L32.9 13.35c-.08-.48-.54-.86-1.06-.86H8.15c-.53 0-1 .39-1.09.9zM26.1 7.59c-.6 0-1.11-.43-1.23-1.01a5.03 5.03 0 0 0-4.92-4.08 5.04 5.04 0 0 0-4.9 4.05c-.11.59-.63 1.01-1.22 1.01q-.12 0-.24-.03a1.25 1.25 0 0 1-.99-1.47c.69-3.5 3.78-6.06 7.35-6.07 3.6.01 6.7 2.58 7.38 6.11.13.68-.32 1.33-.99 1.46-.08.03-.16.03-.24.03" fill="currentColor"></path></g></svg></span> },
  { id: "products", name: "Products & Specs", icon: <span className="sc-1xdthq8-2 ilDIBW inline-flex items-center justify-center w-[24px] h-[24px]"><svg viewBox="0 0 40 40" focusable="false" aria-hidden="true" height="24px" width="24px" color="currentColor" className="sc-14dq9fm-0 jWZSbf"><g fillRule="evenodd"><path d="M2.588.06c-.546.12-.987.365-1.408.787a2.8 2.8 0 0 0-.638.926c-.22.544-.207-.245-.208 13.277 0 12.254.001 12.514.076 12.712.105.275.25.456.497.618.364.24.868.265 1.256.065.211-.11.47-.389.578-.625l.092-.2.01-12.445.011-12.445.105-.105.105-.105h19.539l.104.105.104.104.011 4.406.011 4.405.092.2c.11.238.368.516.583.627.513.265 1.213.107 1.565-.354.279-.365.264-.059.251-5.136l-.01-4.577-.094-.28A3.03 3.03 0 0 0 23.313.114l-.28-.094-10.1-.007C4.62.008 2.79.016 2.588.06m3.605 4.994c-.331.13-.585.356-.746.666l-.094.18-.01 7.78c-.011 8.623-.031 7.964.251 8.333.352.461 1.052.619 1.565.354.215-.111.473-.39.582-.627l.092-.2.012-7.6c.007-5.101-.003-7.688-.03-7.87a1.23 1.23 0 0 0-1.252-1.067 1.4 1.4 0 0 0-.37.05m7.38-.03c-.896.164-1.56.498-2.139 1.077a3.8 3.8 0 0 0-1.004 1.78c-.111.436-.104 1.378.014 1.807.381 1.384 1.498 2.448 2.87 2.733.38.08 1.092.09 1.46.02 1.491-.277 2.723-1.509 3-3 .07-.368.06-1.08-.02-1.46-.285-1.373-1.361-2.502-2.733-2.867-.298-.08-1.197-.135-1.448-.09m.135 2.54c-.327.095-.72.496-.813.83-.06.216-.05.566.022.78.076.223.369.56.58.669a1.243 1.243 0 0 0 1.678-1.678c-.107-.212-.445-.504-.669-.58a1.7 1.7 0 0 0-.798-.02m3.88 7.496c-.546.12-.987.365-1.408.787-.433.432-.671.867-.79 1.439-.048.228-.057.648-.048 2.267l.011 1.987.1.195c.13.253.467.56.706.641.214.073.564.083.782.023.414-.115.793-.54.869-.973.027-.157.043-.904.043-1.973V17.73l.106-.105.105-.106h19.539l.105.106.105.105v12.025l-.096.112-.097.112-4.433.02c-4.911.023-4.541.001-4.894.281-.44.348-.586 1.042-.326 1.546.111.214.39.473.626.581l.2.092 4.28.012c2.788.008 4.417-.002 4.672-.03.725-.077 1.245-.327 1.748-.84.452-.46.716-.955.8-1.504.03-.19.04-2.252.032-6.558l-.012-6.28-.093-.28a3.03 3.03 0 0 0-1.907-1.906l-.28-.094-10.1-.007c-8.313-.005-10.143.003-10.345.047m9.705 4.965c-1.237.238-2.156.871-2.724 1.875-.125.221-.136.267-.135.58 0 .262.02.383.085.525.122.265.347.496.608.624.192.094.276.111.546.11s.355-.02.54-.113c.276-.14.334-.192.523-.47.282-.414.582-.598 1.017-.626 1.027-.065 1.669 1.06 1.097 1.923-.068.103-.179.226-.246.274-.21.15-.558.271-.78.273a1.3 1.3 0 0 0-1.118.712c-.154.315-.16.772-.012 1.064.286.565.776.792 1.53.707.49-.055.773-.133 1.18-.323a3.74 3.74 0 0 0 2.098-2.64c.095-.455.082-1.306-.025-1.694-.303-1.098-1.075-2.03-2.047-2.47-.514-.233-.91-.322-1.497-.337a6 6 0 0 0-.64.006m-19.72 5.04a3.2 3.2 0 0 0-.677.242c-.312.15-.434.239-.702.508-.264.265-.36.396-.511.705-.357.726-.328.218-.34 5.86-.013 5.672-.026 5.388.297 6.058.15.312.239.433.508.702.265.264.396.36.705.511.733.361-.087.33 8.5.33 7.121 0 7.617-.005 7.86-.07a2.74 2.74 0 0 0 1.771-1.43c.356-.723.33-.236.33-6 0-5.734.022-5.287-.308-5.96a2.63 2.63 0 0 0-1.193-1.171c-.736-.363.114-.329-8.4-.336-6.462-.005-7.582.002-7.84.052m.379 2.554a.32.32 0 0 0-.099.254v.156l3.72 2.126c2.046 1.169 3.738 2.125 3.76 2.125s1.714-.956 3.76-2.125l3.72-2.126v-.156a.32.32 0 0 0-.098-.254l-.098-.099H8.05zm-.099 6.486v3.18l.099.097.098.098h14.567l.098-.098.098-.098v-6.359l-3.47 1.985c-1.908 1.09-3.549 2.007-3.646 2.037s-.26.053-.364.053a1.5 1.5 0 0 1-.363-.053c-.097-.03-1.738-.946-3.647-2.037l-3.47-1.984z" fill="currentColor"></path></g></svg></span> },
  { id: "pricing", name: "Pricing", icon: "request_quote" },
  { id: "reporting", name: "Reporting", icon: "analytics" },
  { id: "components", name: "Components", icon: "dataset" },
];

const bottomModules: Module[] = [
  { id: "settings", name: "Settings", icon: "settings" },
  { id: "user", name: "User", icon: "person" },
];

const formatDisplayDate = (dateString: string) => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className = "w-full sm:w-80",
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
        search
      </span>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

type ImportedFileDetails = {
  id: string;
  file: File;
  pageCount: number;
  colorMode: string;
  resolutionDpi: number;
};

function FileImportCard({
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

function ProjectsModule() {
  return (
    <>
      <div className="col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Projects Overview
        </h2>
        <p className="text-gray-600">This card spans all 12 columns.</p>
      </div>

      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Active Projects
        </h2>
        <p className="text-gray-600">This card spans 6 columns.</p>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Completed Projects
        </h2>
        <p className="text-gray-600">This card spans 6 columns.</p>
      </div>
    </>
  );
}

function ProgramModule({
  onNavigateToFiles,
  files,
  setFiles,
}: {
  onNavigateToFiles: (account: string) => void;
  files: FileAsset[];
  setFiles: React.Dispatch<React.SetStateAction<FileAsset[]>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<PrintCustomer | null>(null);
  const [newNote, setNewNote] = useState("");
  const [customers, setCustomers] = useFirestoreSync(
    "appData",
    "customers",
    MOCK_CUSTOMERS,
  );

  React.useEffect(() => {
    if (customers && customers.length > 0) {
      const acme = customers.find((c) => c.companyName === "Acme Corp");
      if (
        acme &&
        (!acme.assignedSpecs ||
          !acme.assignedSpecs.includes("spec-rack-card-4x12"))
      ) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === acme.id
              ? {
                  ...c,
                  assignedSpecs: [
                    ...(c.assignedSpecs || []),
                    "spec-rack-card-4x12",
                  ],
                }
              : c,
          ),
        );
      }
    }
  }, [customers, setCustomers]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [viewFilesForCustomer, setViewFilesForCustomer] =
    useState<PrintCustomer | null>(null);
  const [selectedCustomerFile, setSelectedCustomerFile] =
    useState<FileAsset | null>(null);
  const [returnToCustomerFiles, setReturnToCustomerFiles] =
    useState<PrintCustomer | null>(null);

  const [initialDrawerTab, setInitialDrawerTab] = useState<
    "details" | "notes" | "specs"
  >("details");

  const handleOpenDetailFromCustomer = (file: FileAsset) => {
    if (viewFilesForCustomer) {
      setReturnToCustomerFiles(viewFilesForCustomer);
      setViewFilesForCustomer(null);
      setTimeout(() => {
        setSelectedCustomerFile(file);
      }, 300);
    } else {
      setSelectedCustomerFile(file);
    }
  };

  const handleCloseDetail = (file: FileAsset | null) => {
    if (file === null) {
      setSelectedCustomerFile(null);
      if (returnToCustomerFiles) {
        setTimeout(() => {
          setViewFilesForCustomer(returnToCustomerFiles);
          setReturnToCustomerFiles(null);
        }, 600);
      }
    } else {
      setSelectedCustomerFile(file);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedCustomers = filteredCustomers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedCustomer) return;

    const note: CustomerNote = {
      id: Math.random().toString(36).substr(2, 9),
      author: "Alex Miller",
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      text: newNote,
    };

    const updatedCustomers = customers.map((c) => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          notes: [note, ...c.notes],
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      notes: [note, ...selectedCustomer.notes],
    });
    setNewNote("");
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedCustomer) return;
    const updatedNotes = selectedCustomer.notes.filter((n) => n.id !== noteId);
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
  };

  const handleTogglePin = (noteId: string) => {
    if (!selectedCustomer) return;
    const updatedNotes = selectedCustomer.notes.map((n) =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n,
    );
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
  };

  const handleUpdateNote = (noteId: string) => {
    if (!selectedCustomer || !editingNoteText.trim()) return;
    const updatedNotes = selectedCustomer.notes.map((n) =>
      n.id === noteId ? { ...n, text: editingNoteText } : n,
    );
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  return (
    <>
      {/* Full width row (12 columns) */}
      <div className="col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Program Overview
        </h2>
        <p className="text-gray-600">
          This card spans all 12 columns. Use this for major summaries, data
          tables, or wide charts.
        </p>
      </div>

      {/* Half width row (6 columns each) */}
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Recent Activity
        </h2>
        <p className="text-gray-600">
          This card spans 6 columns (half width on large screens).
        </p>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Quick Actions
        </h2>
        <p className="text-gray-600">
          This card spans 6 columns (half width on large screens).
        </p>
      </div>

      {/* 8/4 split row */}
      <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Main Content Area
        </h2>
        <p className="text-gray-600">
          This card spans 8 columns. Good for primary content alongside a
          sidebar.
        </p>
      </div>
      <FileImportCard
        className="col-span-12 lg:col-span-4"
        onImport={(newFiles) => setFiles((prev) => [...newFiles, ...prev])}
      />

      {/* New Customers Table Card (12 columns) */}
      <div className="col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Program Print Customers
          </h2>
          <SearchBar
            placeholder="Search by company or account..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Account Number
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Company Name
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  Files
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Address
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  3PP
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  P2S
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.accountNumber}
                    </td>
                    <td className="px-6 py-2.5 text-sm">
                      <button
                        onClick={() => {
                          setInitialDrawerTab("details");
                          setSelectedCustomer(customer);
                        }}
                        className="text-[var(--color-link-blue)] hover:underline font-medium text-left"
                      >
                        {customer.companyName}
                      </button>
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center text-gray-900">
                      {files.filter((f) =>
                        f.customerAccounts.includes(customer.accountNumber),
                      ).length > 0 ? (
                        <button
                          onClick={() => setViewFilesForCustomer(customer)}
                          className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-[#f0f7ff] text-[var(--color-link-blue)] rounded-full text-xs font-semibold hover:bg-[#e0efff] transition-colors"
                        >
                          {
                            files.filter((f) =>
                              f.customerAccounts.includes(
                                customer.accountNumber,
                              ),
                            ).length
                          }
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.city}, {customer.state}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.threePP}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center text-gray-900">
                      {customer.printToStore ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center">
                      <button
                        onClick={() => {
                          setInitialDrawerTab("notes");
                          setSelectedCustomer(customer);
                        }}
                        className="text-gray-900 hover:text-gray-600 transition-colors p-1"
                        title="View Notes"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          notes
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-sm text-gray-500">
              Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                safeCurrentPage * itemsPerPage,
                filteredCustomers.length,
              )}{" "}
              of {filteredCustomers.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                Previous
              </button>
              <div className="px-3 py-1 text-sm font-medium text-gray-700">
                {safeCurrentPage} / {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onNavigateToFiles={(acct) => {
          setSelectedCustomer(null);
          onNavigateToFiles(acct);
        }}
        handleTogglePin={handleTogglePin}
        handleAddNote={handleAddNote}
        handleDeleteNote={handleDeleteNote}
        handleUpdateNote={handleUpdateNote}
        handleUpdateCustomer={(c) => {
          setCustomers((prev) => prev.map((p) => (p.id === c.id ? c : p)));
          setSelectedCustomer(c);
        }}
        newNote={newNote}
        setNewNote={setNewNote}
        editingNoteId={editingNoteId}
        setEditingNoteId={setEditingNoteId}
        editingNoteText={editingNoteText}
        setEditingNoteText={setEditingNoteText}
        initialTab={initialDrawerTab}
      />

      <CustomerFilesDrawer
        customer={viewFilesForCustomer}
        onClose={() => setViewFilesForCustomer(null)}
        files={files}
        onOpenDetail={handleOpenDetailFromCustomer}
        onNavigateToFiles={(acct) => {
          setViewFilesForCustomer(null);
          onNavigateToFiles(acct);
        }}
      />
    </>
  );
}

function CustomerDetailsDrawer({
  customer,
  onClose,
  onNavigateToFiles,
  handleTogglePin,
  handleAddNote,
  handleDeleteNote,
  handleUpdateNote,
  handleUpdateCustomer,
  newNote,
  setNewNote,
  editingNoteId,
  setEditingNoteId,
  editingNoteText,
  setEditingNoteText,
  initialTab,
}: {
  customer: PrintCustomer | null;
  onClose: () => void;
  onNavigateToFiles: (account: string) => void;
  handleTogglePin: (noteId: string) => void;
  handleAddNote: () => void;
  handleDeleteNote: (noteId: string) => void;
  handleUpdateNote: (noteId: string) => void;
  handleUpdateCustomer: (customer: PrintCustomer) => void;
  newNote: string;
  setNewNote: (val: string) => void;
  editingNoteId: string | null;
  setEditingNoteId: (val: string | null) => void;
  editingNoteText: string;
  setEditingNoteText: (val: string) => void;
  initialTab: "details" | "notes" | "specs";
}) {
  const [activeTab, setActiveTab] = React.useState<
    "details" | "notes" | "specs"
  >("details");

  const [printSpecs] = useFirestoreSync<any[]>("appData", "print_specs", []);

  React.useEffect(() => {
    if (customer) setActiveTab(initialTab);
  }, [customer?.id, initialTab]);

  if (!customer) return null;

  return (
    <StandardDrawer
      isOpen={!!customer}
      onClose={onClose}
      title={<span className="font-semibold">{customer.companyName}</span>}
      customWidth="w-full lg:w-[600px]"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            onClick={() => onNavigateToFiles(customer.accountNumber)}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
          >
            View Files
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-white">
        <div className="flex px-6 pt-4 pb-0 border-b border-gray-200 gap-8 shrink-0">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Customer Details
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "specs" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Specs
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${activeTab === "specs" ? "bg-primary-alpha text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              {customer.assignedSpecs?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Notes
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${activeTab === "notes" ? "bg-primary-alpha text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              {customer.notes.length}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "details" && (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight m-0">
                    {customer.accountNumber}
                  </h3>
                  <span className="text-xl font-bold text-gray-900 leading-tight m-0 opacity-40">
                    -
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight m-0">
                    {customer.companyName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-6 text-sm max-w-lg">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Location
                    </span>
                    <span className="text-gray-900 font-medium">
                      {customer.city}, {customer.state}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      3rd Party Portal
                    </span>
                    <span className="text-gray-900 font-medium">
                      {customer.threePP || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Print to Store
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${customer.printToStore ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
                    >
                      {customer.printToStore ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pinned Notes Section mapped into Details Tab */}
              {customer.notes.some((n) => n.isPinned) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[16px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      push_pin
                    </span>
                    Pinned Notes
                  </h4>
                  <div className="flex flex-col gap-3">
                    {customer.notes
                      .filter((n) => n.isPinned)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm group relative"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {note.author}
                            </span>
                            <span className="text-[11px] text-gray-500 uppercase font-medium tracking-wider">
                              {note.date}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              title="Unpin Note"
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                push_pin
                              </span>
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Assigned Specs
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {customer.assignedSpecs?.length || 0} selected
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center"></th>
                      <th className="px-4 py-3">Spec Name</th>
                      <th className="px-4 py-3 hidden sm:table-cell">
                        Product Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {printSpecs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500 text-sm"
                        >
                          No specs available in library.
                        </td>
                      </tr>
                    ) : (
                      printSpecs.map((spec) => {
                        const isAssigned =
                          customer.assignedSpecs?.includes(spec.id) || false;
                        return (
                          <tr
                            key={spec.id}
                            className={`hover:bg-gray-50 transition-colors cursor-pointer group ${isAssigned ? "bg-[#f0f7ff]" : ""}`}
                            onClick={() => {
                              const currentAssigned =
                                customer.assignedSpecs || [];
                              const newAssigned = isAssigned
                                ? currentAssigned.filter((id) => id !== spec.id)
                                : [...currentAssigned, spec.id];
                              handleUpdateCustomer({
                                ...customer,
                                assignedSpecs: newAssigned,
                              });
                            }}
                          >
                            <td className="px-4 py-3 text-center">
                              <div
                                className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors mx-auto ${isAssigned ? "bg-primary border-primary" : "border-[#969696] bg-white group-hover:border-primary/50"}`}
                              >
                                {isAssigned && (
                                  <span
                                    className="material-symbols-outlined text-[14px] text-white font-bold"
                                    style={{
                                      fontVariationSettings: "'wght' 700",
                                    }}
                                  >
                                    check
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">
                                {spec.name}
                              </div>
                              {spec.description && (
                                <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] lg:max-w-[300px]">
                                  {spec.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                {spec.productType}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="flex flex-col h-full gap-6">
              {/* Add New Note */}
              <div className="space-y-3 shrink-0">
                <label className="block text-sm font-semibold text-gray-700">
                  Add New Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter customer or account notes..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 shrink-0" />

              <div className="space-y-4 flex-1">
                {customer.notes
                  .filter((n) => !n.isPinned)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {note.author}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                            {note.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            title="Pin Note"
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              push_pin
                            </span>
                          </button>
                          {note.author === "Alex Miller" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.text);
                                }}
                                title="Edit Note"
                                className="text-gray-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                title="Delete Note"
                                className="text-gray-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  delete
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary-alpha focus:border-primary outline-none resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateNote(note.id)}
                              className="text-xs text-[var(--color-link-blue)] font-semibold hover:underline"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      )}
                    </div>
                  ))}

                {customer.notes.filter((n) => !n.isPinned).length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No active notes.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StandardDrawer>
  );
}

type FileAsset = {
  id: number;
  name: string;
  dimensions: string;
  type: string;
  updatedAt: string;
  description: string;
  fileId: string;
  version: string;
  lastUpdatedBy: string;
  customerAccounts: string[];
  addedBy: string;
  ownedBy: string;
  isShared: boolean;
  sku: string;
  fileSize: string;
  pageCount: number;
  colorMode: "RGB" | "CMYK";
  resolutionDpi: number;
  preflightCheck: boolean;
};

type CustomerNote = {
  id: string;
  author: string;
  date: string;
  text: string;
  isPinned?: boolean;
};

type PrintCustomer = {
  id: string;
  accountNumber: string;
  companyName: string;
  city: string;
  state: string;
  threePP: "Coupa" | "Oracle" | "Workday" | "No";
  printToStore: boolean;
  notes: CustomerNote[];
  assignedSpecs?: string[];
};

const MOCK_CUSTOMERS: PrintCustomer[] = [
  {
    id: "1",
    accountNumber: "100200301",
    companyName: "Acme Corp",
    city: "Chicago",
    state: "IL",
    threePP: "Coupa",
    printToStore: true,
    assignedSpecs: ["spec-rack-card-4x12"],
    notes: [
      {
        id: "n1",
        author: "Alex Miller",
        date: "04/15/2026",
        text: "Spoke with Bob about the new branding requirements.",
      },
      {
        id: "n2",
        author: "Alex Miller",
        date: "04/10/2026",
        text: "Initial setup complete.",
      },
    ],
  },
  {
    id: "2",
    accountNumber: "900800701",
    companyName: "Globex",
    city: "San Francisco",
    state: "CA",
    threePP: "No",
    printToStore: false,
    notes: [],
  },
  {
    id: "3",
    accountNumber: "123456789",
    companyName: "Soylent Corp",
    city: "New York",
    state: "NY",
    threePP: "Oracle",
    printToStore: true,
    notes: [
      {
        id: "n3",
        author: "Bob Jones",
        date: "03/20/2026",
        text: "High volume customer.",
      },
    ],
  },
  {
    id: "4",
    accountNumber: "888777666",
    companyName: "Initech",
    city: "Austin",
    state: "TX",
    threePP: "Workday",
    printToStore: false,
    notes: [],
  },
  {
    id: "5",
    accountNumber: "111222333",
    companyName: "Umbrella Corp",
    city: "Raccoon City",
    state: "MO",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "6",
    accountNumber: "444555666",
    companyName: "Stark Ind.",
    city: "Malibu",
    state: "CA",
    threePP: "Workday",
    printToStore: true,
    notes: [],
  },
  {
    id: "7",
    accountNumber: "777888999",
    companyName: "Wayne Ent.",
    city: "Gotham",
    state: "NJ",
    threePP: "Coupa",
    printToStore: false,
    notes: [],
  },
  {
    id: "8",
    accountNumber: "222333444",
    companyName: "Cyberdyne",
    city: "Los Angeles",
    state: "CA",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "9",
    accountNumber: "555444333",
    companyName: "Massive Dynamic",
    city: "Boston",
    state: "MA",
    threePP: "Oracle",
    printToStore: false,
    notes: [],
  },
  {
    id: "10",
    accountNumber: "111222444",
    companyName: "Hooli",
    city: "Palo Alto",
    state: "CA",
    threePP: "No",
    printToStore: true,
    notes: [],
  },
  {
    id: "11",
    accountNumber: "333444555",
    companyName: "Pied Piper",
    city: "San Jose",
    state: "CA",
    threePP: "Coupa",
    printToStore: false,
    notes: [],
  },
  {
    id: "12",
    accountNumber: "666777888",
    companyName: "Aviato",
    city: "San Francisco",
    state: "CA",
    threePP: "Workday",
    printToStore: true,
    notes: [],
  },
];

const MOCK_FILES: FileAsset[] = Array.from({ length: 50 }).map((_, i) => {
  const types = [
    "PNG",
    "JPG",
    "SVG",
    "PDF",
    "MP4",
    "GIF",
    "WEBM",
    "DOCX",
    "XLSX",
  ];
  const sizes = [
    '9.92" x 13.89"',
    "1920 x 1080 px",
    '8.5" x 11"',
    "500 x 500 px",
    "1080 x 1920 px",
  ];
  const users = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"];
  const realAccountNumbers = [
    "100200301",
    "900800701",
    "123456789",
    "888777666",
    "111222333",
    "444555666",
    "777888999",
    "222333444",
    "555444333",
  ];
  return {
    id: i,
    name: `File_${i}.${types[i % types.length].toLowerCase()}`,
    dimensions: sizes[i % sizes.length],
    type: types[i % types.length],
    updatedAt: `04/${((i % 28) + 1).toString().padStart(2, "0")}/2026`,
    description: `This is a sample description for file ${i}. It provides context about the file's purpose and contents.`,
    fileId: `123e4567-e89b-12d3-a456-4266141740${i.toString().padStart(2, "0")}`,
    version: `v${(i % 5) + 1}.0`,
    lastUpdatedBy: users[i % users.length],
    customerAccounts: [
      realAccountNumbers[i % 9],
      realAccountNumbers[(i + 3) % 9],
    ],
    addedBy: users[(i + 1) % users.length],
    ownedBy: users[(i + 2) % users.length],
    isShared: i % 2 === 0,
    sku: `SKU-${1000 + i}`,
    fileSize: ["1.2 MB", "4.5 MB", "12 MB", "500 KB"][i % 4],
    pageCount: ["PNG", "JPG", "SVG", "GIF"].includes(types[i % types.length])
      ? 1
      : (i % 10) + 1,
    colorMode: i % 3 === 0 ? "CMYK" : "RGB",
    resolutionDpi: [72, 150, 300][i % 3],
    preflightCheck: true,
  };
});

const fileTypeCounts = MOCK_FILES.reduce(
  (acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>,
);

const SORTED_FILE_TYPES = Object.entries(fileTypeCounts)
  .sort((a, b) => b[1] - a[1])
  .map(([type]) => type);

function TruncateWithTooltip({
  text,
  as: Component = "div",
  className = "",
}: {
  text: string;
  as?: any;
  className?: string;
}) {
  const textRef = useRef<HTMLElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth ||
            textRef.current.scrollHeight > textRef.current.clientHeight,
        );
      }
    };

    checkTruncation();
    const observer = new ResizeObserver(checkTruncation);
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    return () => observer.disconnect();
  }, [text]);

  return (
    <Component
      ref={textRef}
      className={`${className.includes("line-clamp") ? "" : "truncate"} ${className}`}
      title={isTruncated ? text : undefined}
    >
      {text}
    </Component>
  );
}

function getCompanyName(accountId: string) {
  const names = [
    "Acme Corp",
    "Globex",
    "Soylent Corp",
    "Initech",
    "Umbrella Corp",
    "Stark Ind.",
    "Wayne Ent.",
    "Cyberdyne",
    "Massive Dynamic",
  ];
  let sum = 0;
  for (let i = 0; i < accountId.length; i++) {
    sum += accountId.charCodeAt(i);
  }
  return names[sum % names.length];
}

function AutocompleteInput({
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

function FilesModule({
  initialSearchTerm = "",
  files,
  setFiles,
}: {
  initialSearchTerm?: string;
  files: FileAsset[];
  setFiles: React.Dispatch<React.SetStateAction<FileAsset[]>>;
}) {
  const [selectedFile, setSelectedFile] = useState<FileAsset | null>(null);
  const [draftFile, setDraftFile] = useState<FileAsset | null>(null);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = useState<
    "information" | "users" | "print"
  >("information");
  const [accountToRemove, setAccountToRemove] = useState<string | null>(null);
  const [newAccountsInput, setNewAccountsInput] = useState("");
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const previousFileRef = useRef<FileAsset | null>(null);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  useEffect(() => {
    setDraftFile(selectedFile);
    setHasChanges(false);

    // Only reset tab to 'information' if we are opening the drawer from a closed state
    if (previousFileRef.current === null && selectedFile !== null) {
      setActiveDrawerTab("information");
    }

    setIsAddingAccount(false);
    previousFileRef.current = selectedFile;
  }, [selectedFile]);

  const [searchName, setSearchName] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchDimensions, setSearchDimensions] = useState("");
  const [searchCustomer, setSearchCustomer] = useState(initialSearchTerm);
  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchUpdatedBy, setSearchUpdatedBy] = useState("");

  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<string[]>([
    "type",
    "updatedAt",
  ]);
  const [sortBy, setSortBy] = useState("updatedAt-desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const pillsContainerRef = useRef<HTMLDivElement>(null);
  const [isPillsOverflowing, setIsPillsOverflowing] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isFileTypesExpanded, setIsFileTypesExpanded] = useState(false);
  const printSettingsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (pillsContainerRef.current) {
        setIsPillsOverflowing(
          pillsContainerRef.current.scrollHeight >
            pillsContainerRef.current.clientHeight,
        );
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [
    searchName,
    selectedTypes,
    dateFrom,
    dateTo,
    searchDimensions,
    searchCustomer,
    searchCompanyName,
    searchUpdatedBy,
  ]);

  const filteredFiles = files.filter((file) => {
    if (
      searchName &&
      !file.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false;

    if (searchCustomer) {
      const accountMatch = searchCustomer.split(" - ")[0].trim();
      if (!file.customerAccounts.some((acc) => acc.includes(accountMatch)))
        return false;
    }

    if (
      searchUpdatedBy &&
      !file.lastUpdatedBy.toLowerCase().includes(searchUpdatedBy.toLowerCase())
    )
      return false;

    if (searchCompanyName) {
      const lowerSearch = searchCompanyName.toLowerCase();
      const hasMatchingCompany = file.customerAccounts.some((acc) => {
        const customer = MOCK_CUSTOMERS.find((c) => c.accountNumber === acc);
        return (
          customer && customer.companyName.toLowerCase().includes(lowerSearch)
        );
      });
      if (!hasMatchingCompany) return false;
    }

    if (selectedTypes.length > 0 && !selectedTypes.includes(file.type))
      return false;
    if (
      searchDimensions &&
      !file.dimensions.toLowerCase().includes(searchDimensions.toLowerCase())
    )
      return false;
    if (dateFrom || dateTo) {
      const fileDate = new Date(file.updatedAt);
      if (dateFrom) {
        const fromDate = new Date(dateFrom + "T00:00:00");
        if (fileDate < fromDate) return false;
      }
      if (dateTo) {
        const toDate = new Date(dateTo + "T23:59:59");
        if (fileDate > toDate) return false;
      }
    }
    return true;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === "updatedAt-desc") {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === "updatedAt-asc") {
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    } else if (sortBy === "name-asc") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "name-desc") {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  const toggleSelection = (
    id: number,
    index: number,
    event: React.MouseEvent,
  ) => {
    if (event.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      const rangeIds = sortedFiles.slice(start, end + 1).map((a) => a.id);

      const isCurrentlySelected = selectedFileIds.includes(id);

      if (isCurrentlySelected) {
        // Deselect the range
        setSelectedFileIds((prev) => prev.filter((x) => !rangeIds.includes(x)));
      } else {
        // Select the range
        setSelectedFileIds((prev) => {
          const newSet = new Set([...prev, ...rangeIds]);
          return Array.from(newSet);
        });
      }
    } else {
      setSelectedFileIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    }
    setLastClickedIndex(index);
  };

  return (
    <>
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-6 relative">
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
            <button
              onClick={() => setIsFilterSettingsOpen(!isFilterSettingsOpen)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
              title="Filter Settings"
            >
              <span className="material-symbols-outlined text-[20px]">
                tune
              </span>
            </button>

            {isFilterSettingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsFilterSettingsOpen(false)}
                />
                <div className="absolute top-10 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Available Filters
                  </h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="rounded border-gray-400 text-primary w-4 h-4"
                      />
                      <span className="text-sm">Customer account</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="rounded border-gray-400 text-primary w-4 h-4"
                      />
                      <span className="text-sm">Company name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        className="rounded border-gray-400 text-primary w-4 h-4"
                      />
                      <span className="text-sm">File Name</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes("type")}
                        onChange={(e) => {
                          if (e.target.checked)
                            setVisibleFilters((prev) => [...prev, "type"]);
                          else
                            setVisibleFilters((prev) =>
                              prev.filter((f) => f !== "type"),
                            );
                        }}
                        className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">File Type</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes("updatedAt")}
                        onChange={(e) => {
                          if (e.target.checked)
                            setVisibleFilters((prev) => [...prev, "updatedAt"]);
                          else
                            setVisibleFilters((prev) =>
                              prev.filter((f) => f !== "updatedAt"),
                            );
                        }}
                        className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Last Updated</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes("updatedBy")}
                        onChange={(e) => {
                          if (e.target.checked)
                            setVisibleFilters((prev) => [...prev, "updatedBy"]);
                          else
                            setVisibleFilters((prev) =>
                              prev.filter((f) => f !== "updatedBy"),
                            );
                        }}
                        className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Last updated by</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleFilters.includes("dimensions")}
                        onChange={(e) => {
                          if (e.target.checked)
                            setVisibleFilters((prev) => [
                              ...prev,
                              "dimensions",
                            ]);
                          else
                            setVisibleFilters((prev) =>
                              prev.filter((f) => f !== "dimensions"),
                            );
                        }}
                        className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="text-sm">Dimensions</span>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Customer Account */}
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Customer Account
            </label>
            <AutocompleteInput
              value={searchCustomer}
              onChange={setSearchCustomer}
              options={MOCK_CUSTOMERS.map((c) =>
                c.companyName
                  ? `${c.accountNumber} - ${c.companyName}`
                  : c.accountNumber,
              )}
            />
          </div>

          {/* Company Name */}
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Company Name
            </label>
            <AutocompleteInput
              value={searchCompanyName}
              onChange={setSearchCompanyName}
              options={MOCK_CUSTOMERS.map((c) => c.companyName)}
            />
          </div>

          {/* File Name */}
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              File Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>

          {/* File Type */}
          {visibleFilters.includes("type") && (
            <div className="relative pt-2 mb-6">
              <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
                File Type
              </label>
              <div className="w-full border border-gray-400 rounded-[3px] p-3 outline-none focus-within:border-primary bg-transparent text-sm flex flex-col">
                <div className="grid grid-cols-3 gap-2">
                  {(isFileTypesExpanded
                    ? SORTED_FILE_TYPES
                    : SORTED_FILE_TYPES.slice(0, 6)
                  ).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes((prev) => [...prev, type]);
                          } else {
                            setSelectedTypes((prev) =>
                              prev.filter((t) => t !== type),
                            );
                          }
                        }}
                        className="rounded border-gray-400 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      />
                      <span className="truncate" title={type}>
                        {type}
                      </span>
                    </label>
                  ))}
                </div>
                {SORTED_FILE_TYPES.length > 6 && (
                  <button
                    onClick={() => setIsFileTypesExpanded(!isFileTypesExpanded)}
                    className="text-[var(--color-link-blue)] hover:underline text-sm font-medium self-start mt-3"
                  >
                    {isFileTypesExpanded ? "See less" : "See more"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Last Updated */}
          {visibleFilters.includes("updatedAt") && (
            <div className="relative pt-2 mb-6">
              <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
                Last Updated
              </label>
              <div className="w-full border border-gray-400 rounded-[3px] p-3 outline-none focus-within:border-primary bg-transparent text-sm flex flex-col gap-3">
                <DatePicker
                  selected={dateFrom ? new Date(dateFrom + "T00:00:00") : null}
                  onChange={(dates: [Date | null, Date | null]) => {
                    const [start, end] = dates;

                    // Format dates as YYYY-MM-DD to match existing logic
                    const formatDate = (date: Date | null) => {
                      if (!date) return "";
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(
                        2,
                        "0",
                      );
                      const day = String(date.getDate()).padStart(2, "0");
                      return `${year}-${month}-${day}`;
                    };

                    setDateFrom(formatDate(start));
                    setDateTo(formatDate(end));
                  }}
                  startDate={dateFrom ? new Date(dateFrom + "T00:00:00") : null}
                  endDate={dateTo ? new Date(dateTo + "T00:00:00") : null}
                  selectsRange
                  isClearable
                  placeholderText="Select date range"
                  className="w-full border border-gray-300 rounded p-1.5 outline-none focus:border-primary bg-white text-sm"
                  wrapperClassName="w-full"
                />
              </div>
            </div>
          )}

          {/* Last Updated By */}
          {visibleFilters.includes("updatedBy") && (
            <div className="relative pt-2 mb-6">
              <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
                Last Updated By
              </label>
              <input
                type="text"
                value={searchUpdatedBy}
                onChange={(e) => setSearchUpdatedBy(e.target.value)}
                placeholder="Search user name"
                className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
              />
            </div>
          )}

          {/* Dimensions */}
          {visibleFilters.includes("dimensions") && (
            <div className="relative pt-2 mb-6">
              <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
                Dimensions
              </label>
              <input
                type="text"
                value={searchDimensions}
                onChange={(e) => setSearchDimensions(e.target.value)}
                className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
                placeholder="e.g. 1920 x 1080"
              />
            </div>
          )}
        </div>
        <div className="shrink-0">
          <FileImportCard
            onImport={(newFiles) => setFiles((prev) => [...newFiles, ...prev])}
          />
        </div>
      </div>
      <div className="col-span-12 lg:col-span-8 lg:h-full lg:min-h-0 flex flex-col">
        {/* Filter Pills and Sort Dropdown */}
        <div className="min-h-[32px] mb-4 flex justify-between items-start gap-4 shrink-0">
          <div className="flex flex-1 gap-2 overflow-hidden items-start">
            <div
              ref={pillsContainerRef}
              className="flex flex-wrap gap-2 flex-1 max-h-[32px] overflow-hidden"
            >
              {searchCustomer && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium">{searchCustomer}</span>
                  <button
                    onClick={() => setSearchCustomer("")}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              {searchCompanyName && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Company:</span>
                  <span className="font-medium">{searchCompanyName}</span>
                  <button
                    onClick={() => setSearchCompanyName("")}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              {searchName && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{searchName}</span>
                  <button
                    onClick={() => setSearchName("")}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              {selectedTypes.map((type) => (
                <div
                  key={type}
                  className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm"
                >
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{type}</span>
                  <button
                    onClick={() =>
                      setSelectedTypes((prev) => prev.filter((t) => t !== type))
                    }
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              ))}
              {(dateFrom || dateTo) && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {dateFrom
                      ? new Date(dateFrom + "T00:00:00").toLocaleDateString()
                      : "Any"}{" "}
                    -{" "}
                    {dateTo
                      ? new Date(dateTo + "T00:00:00").toLocaleDateString()
                      : "Any"}
                  </span>
                  <button
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                    }}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              {searchUpdatedBy && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Updated By:</span>
                  <span className="font-medium">{searchUpdatedBy}</span>
                  <button
                    onClick={() => setSearchUpdatedBy("")}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
              {searchDimensions && (
                <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                  <span className="text-gray-600">Dimensions:</span>
                  <span className="font-medium">{searchDimensions}</span>
                  <button
                    onClick={() => setSearchDimensions("")}
                    className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      close
                    </span>
                  </button>
                </div>
              )}
            </div>
            {isPillsOverflowing && (
              <button
                onClick={() => setIsFilterDrawerOpen(true)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-600 flex-shrink-0 shadow-sm"
                title="View all filters"
              >
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
              </button>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                const visibleFileIds = sortedFiles.map((a) => a.id);
                const hasVisibleSelection = visibleFileIds.some((id) =>
                  selectedFileIds.includes(id),
                );
                if (hasVisibleSelection) {
                  setSelectedFileIds((prev) =>
                    prev.filter((id) => !visibleFileIds.includes(id)),
                  );
                } else {
                  setSelectedFileIds((prev) =>
                    Array.from(new Set([...prev, ...visibleFileIds])),
                  );
                }
              }}
              className="text-sm font-medium text-[var(--color-link-blue)] hover:opacity-80 bg-white border border-gray-200 rounded px-3 py-1.5 shadow-sm transition-colors"
            >
              {sortedFiles
                .map((a) => a.id)
                .some((id) => selectedFileIds.includes(id))
                ? "Deselect all"
                : "Select all"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded p-1.5 text-sm outline-none focus:border-primary bg-white text-gray-800"
              >
                <option value="updatedAt-desc">Newest First</option>
                <option value="updatedAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="w-8 h-8 rounded-full border border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-colors shadow-sm ml-2"
                title={
                  viewMode === "grid"
                    ? "Switch to list view"
                    : "Switch to grid view"
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {viewMode === "grid" ? "list" : "grid_view"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 md:pb-8 pr-2 -mr-2">
          {viewMode === "list" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
              {sortedFiles.map((file, index) => {
                const isSelected = selectedFileIds.includes(file.id);

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`group relative bg-white p-3 rounded-xl transition-shadow cursor-pointer border flex items-center gap-3 ${
                      isSelected ? "border-[#2a78c6]" : "border-gray-200"
                    } hover:shadow-md`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg shrink-0"></div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelection(file.id, index, e);
                        }}
                        className={`absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all z-10 shrink-0 aspect-square focus:outline-none leading-none ${
                          isSelected
                            ? "bg-primary border-primary text-white opacity-100 shadow-sm"
                            : "bg-white border-gray-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-gray-400 shadow-sm"
                        }`}
                        title={isSelected ? "Deselect" : "Select"}
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedFiles.map((file, index) => {
                const isSelected = selectedFileIds.includes(file.id);

                return (
                  <div
                    key={file.id}
                    onClick={() => setSelectedFile(file)}
                    className={`group relative bg-white p-5 rounded-2xl transition-shadow cursor-pointer border flex flex-col ${
                      isSelected ? "border-primary" : "border-gray-200"
                    } hover:shadow-md`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(file.id, index, e);
                      }}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center border z-10 transition-all shrink-0 aspect-square focus:outline-none leading-none ${
                        isSelected
                          ? "bg-primary border-primary text-white opacity-100 shadow-sm"
                          : "bg-white border-gray-300 text-transparent opacity-0 group-hover:opacity-100 hover:border-gray-400 shadow-sm"
                      }`}
                      title={isSelected ? "Deselect" : "Select"}
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">
                        check
                      </span>
                    </button>
                    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-4 flex-shrink-0"></div>
                    <TruncateWithTooltip
                      as="h3"
                      text={file.name}
                      className="font-bold text-gray-900 text-base line-clamp-2 min-h-[3rem] mb-2"
                    />
                    <div className="mt-auto">
                      <TruncateWithTooltip
                        as="p"
                        text={`${file.dimensions} | ${file.type}`}
                        className="text-sm text-gray-500 mb-1"
                      />
                      <TruncateWithTooltip
                        as="p"
                        text={`${!["PNG", "JPG", "SVG", "GIF"].includes(file.type) ? `${file.pageCount} ${file.pageCount === 1 ? "Page" : "Pages"} | ` : ""}${file.resolutionDpi} dpi`}
                        className="text-sm text-gray-500 mb-1"
                      />
                      <TruncateWithTooltip
                        as="p"
                        text={`Updated ${formatDisplayDate(file.updatedAt)}`}
                        className="text-sm text-gray-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SharedFileDetailDrawer
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        selectedFileIds={selectedFileIds}
        files={files}
        setFiles={setFiles}
      />
      {/* Filter Drawer */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="h-[72px] pt-2 shrink-0 flex items-center justify-center relative bg-white border-b border-[#969696] px-4">
                <h2 className="text-lg font-semibold flex items-center h-full m-0 min-w-[120px] justify-center text-gray-900">
                  Active Filters
                </h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="absolute right-4 top-[calc(50%+4px)] -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                {searchCustomer && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Customer Account
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{searchCustomer}</span>
                      <button
                        onClick={() => setSearchCustomer("")}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {searchCompanyName && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Company Name
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{searchCompanyName}</span>
                      <button
                        onClick={() => setSearchCompanyName("")}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {searchName && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      File Name
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{searchName}</span>
                      <button
                        onClick={() => setSearchName("")}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {selectedTypes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      File Type
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedTypes.map((type) => (
                        <div
                          key={type}
                          className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm"
                        >
                          <span className="font-medium">{type}</span>
                          <button
                            onClick={() =>
                              setSelectedTypes((prev) =>
                                prev.filter((t) => t !== type),
                              )
                            }
                            className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(dateFrom || dateTo) && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Last Updated
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">
                        {dateFrom
                          ? new Date(
                              dateFrom + "T00:00:00",
                            ).toLocaleDateString()
                          : "Any"}{" "}
                        -{" "}
                        {dateTo
                          ? new Date(dateTo + "T00:00:00").toLocaleDateString()
                          : "Any"}
                      </span>
                      <button
                        onClick={() => {
                          setDateFrom("");
                          setDateTo("");
                        }}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {searchUpdatedBy && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Last Updated By
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{searchUpdatedBy}</span>
                      <button
                        onClick={() => setSearchUpdatedBy("")}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {searchDimensions && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      Dimensions
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full pl-3 pr-1 py-1 text-sm">
                      <span className="font-medium">{searchDimensions}</span>
                      <button
                        onClick={() => setSearchDimensions("")}
                        className="ml-1 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          close
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {!searchName &&
                  !searchCustomer &&
                  !searchCompanyName &&
                  !searchUpdatedBy &&
                  selectedTypes.length === 0 &&
                  !dateFrom &&
                  !dateTo &&
                  !searchDimensions && (
                    <p className="text-gray-500 text-sm">No active filters.</p>
                  )}
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  bottom: "0px",
                  borderRadius: "0px",
                  boxShadow: "rgba(156, 156, 156, 0.7) 0px 0px 6px",
                  height: "auto",
                  padding: "12px 24px",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 9,
                  background: "rgb(255, 255, 255)",
                }}
                className="items-center"
              >
                <button
                  onClick={() => {
                    setSearchName("");
                    setSearchCustomer("");
                    setSearchCompanyName("");
                    setSearchUpdatedBy("");
                    setSelectedTypes([]);
                    setDateFrom("");
                    setDateTo("");
                    setSearchDimensions("");
                  }}
                  className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

const FAKE_USERS = ["Jen A", "Jess S", "Stacy S"];

function FakeLoginOverlay({ onLogin }: { onLogin: (user: string) => void }) {
  const [selectedUser, setSelectedUser] = useState("");
  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center border border-gray-200">
        <div className="w-16 h-16 bg-primary-alpha text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-3xl">login</span>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Simulated Login
        </h1>
        <p className="text-gray-600 mb-6 text-sm">
          Select a user to continue previewing the app.
        </p>

        <div className="relative">
          <select
            className="w-full border border-gray-300 rounded-lg py-3 pl-4 pr-10 mb-6 outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none bg-gray-50 text-gray-800 font-medium text-left cursor-pointer"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="" disabled>
              Select User...
            </option>
            {FAKE_USERS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">
            arrow_drop_down
          </span>
        </div>

        <button
          onClick={() => onLogin(selectedUser)}
          disabled={!selectedUser}
          className="w-full bg-primary text-white rounded-[20px] p-3 text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}

function UserModule({
  currentUser,
  onSwitchUser,
}: {
  currentUser: string | null;
  onSwitchUser: (user: string) => void;
}) {
  return (
    <div className="col-span-12 lg:col-span-6 lg:col-start-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-gray-500">person</span>
        User Profile (Simulated)
      </h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Active User
        </label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 font-medium flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary-alpha text-primary flex items-center justify-center font-bold text-lg">
            {currentUser?.charAt(0) || "?"}
          </div>
          <span className="text-lg">{currentUser || "None"}</span>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <h3 className="text-lg font-medium text-gray-800 mb-4">Switch User</h3>
      <div className="flex flex-col gap-3">
        {FAKE_USERS.map((user) => (
          <button
            key={user}
            onClick={() => onSwitchUser(user)}
            disabled={user === currentUser}
            className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
              user === currentUser
                ? "border-primary bg-primary-alpha cursor-default shadow-sm ring-1 ring-primary"
                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  user === currentUser
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {user.charAt(0)}
              </div>
              <span
                className={`font-medium text-lg ${user === currentUser ? "text-primary" : "text-gray-800"}`}
              >
                {user}
              </span>
            </div>
            {user === currentUser && (
              <span className="text-xs font-bold text-white uppercase tracking-wider bg-primary px-3 py-1.5 rounded-full">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState<Module>(topModules[0]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [filesSearchFilter, setFilesSearchFilter] = useState("");
  const [ordersState, setOrdersState] = useState<"orders" | "empty">("orders");

  const [simulatedUser, setSimulatedUser] = useState<string | null>(() => {
    return localStorage.getItem("simulatedUser");
  });

  const handleSimulatedLogin = (user: string) => {
    localStorage.setItem("simulatedUser", user);
    setSimulatedUser(user);
  };

  const [globalFiles, setGlobalFiles] = useFirestoreSync(
    "appData",
    "files",
    MOCK_FILES,
  );
  const [globalSelectedFile, setGlobalSelectedFile] =
    useState<FileAsset | null>(null);

  const [productionTypes, setProductionTypes] = useFirestoreSync(
    "appData",
    "production_types",
    INITIAL_PRODUCTION_TYPES,
  );

  const navigateToFilesWithFilter = (filter: string) => {
    setFilesSearchFilter(filter);
    setActiveModule(topModules.find((m) => m.id === "files") || activeModule);
  };

  if (!simulatedUser) {
    return <FakeLoginOverlay onLogin={handleSimulatedLogin} />;
  }

  return (
    <ProductionTypesContext.Provider
      value={[productionTypes, setProductionTypes]}
    >
      <div className="flex h-screen w-full bg-gray-100 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-primary text-white flex flex-col transition-all duration-300 ease-in-out z-20 shadow-lg ${
            isSidebarExpanded ? "w-64" : "w-16"
          }`}
        >
          {/* Top Icon */}
          <div className="h-[72px] pt-2 flex items-center border-b border-black/10 shrink-0 bg-black/5">
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className={`flex items-center w-full h-full hover:bg-black/10 transition-colors focus:outline-none ${
                isSidebarExpanded ? "px-4" : "justify-center"
              }`}
            >
              <span className="material-symbols-outlined text-3xl">menu</span>
              {isSidebarExpanded && (
                <span className="ml-3 font-bold text-xl whitespace-nowrap overflow-hidden">
                  PrIM
                </span>
              )}
            </button>
          </div>

          {/* Top Modules */}
          <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1">
            {topModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className={`flex items-center px-4 py-3 w-full transition-colors ${
                  activeModule.id === mod.id
                    ? "bg-black/20 border-l-4 border-white"
                    : "hover:bg-black/10 border-l-4 border-transparent"
                }`}
                title={isSidebarExpanded ? undefined : mod.name}
              >
                {typeof mod.icon === "string" ? (
                  <span className="material-symbols-outlined">{mod.icon}</span>
                ) : (
                  <span className="flex items-center justify-center w-6 h-6">{mod.icon}</span>
                )}
                {isSidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {mod.name}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Modules */}
          <div className="py-4 border-t border-black/10 flex flex-col gap-1 shrink-0 bg-black/5">
            {bottomModules.map((mod) => (
              <button
                key={mod.id}
                onClick={() => setActiveModule(mod)}
                className={`flex items-center px-4 py-3 w-full transition-colors ${
                  activeModule.id === mod.id
                    ? "bg-black/20 border-l-4 border-white"
                    : "hover:bg-black/10 border-l-4 border-transparent"
                }`}
                title={isSidebarExpanded ? undefined : mod.name}
              >
                {typeof mod.icon === "string" ? (
                  <span className="material-symbols-outlined">{mod.icon}</span>
                ) : (
                  <span className="flex items-center justify-center w-6 h-6">{mod.icon}</span>
                )}
                {isSidebarExpanded && (
                  <span className="ml-4 font-medium whitespace-nowrap">
                    {mod.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-[72px] pt-2 bg-white shadow-md flex items-center justify-between px-6 shrink-0 z-10">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeModule.headerName || activeModule.name}
            </h1>
            {activeModule.id === "orders" && (
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors">
                  Mapping
                </button>
                <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                  <button
                    onClick={() => setOrdersState("orders")}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      ordersState === "orders"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setOrdersState("empty")}
                    className={`px-4 py-1.5 text-sm font-medium rounded ${
                      ordersState === "empty"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Empty
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Module Content */}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              ["files", "components", "products", "orders"].includes(
                activeModule.id,
              )
                ? "p-6 md:p-8 pb-0 md:pb-0 overflow-auto lg:overflow-hidden"
                : "p-6 md:p-8 overflow-auto"
            }`}
          >
            {/* 12-Column Grid Container applied consistently to all pages */}
            <div
              className={`grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full flex-1 ${
                ["files", "components", "products", "orders"].includes(
                  activeModule.id,
                )
                  ? "lg:grid-rows-1 lg:min-h-0"
                  : "content-start"
              }`}
            >
              {activeModule.id === "program" ? (
                <ProgramModule
                  onNavigateToFiles={navigateToFilesWithFilter}
                  files={globalFiles}
                  setFiles={setGlobalFiles}
                />
              ) : activeModule.id === "projects" ? (
                <ProjectsModule />
              ) : activeModule.id === "files" ? (
                <FilesModule
                  initialSearchTerm={filesSearchFilter}
                  files={globalFiles}
                  setFiles={setGlobalFiles}
                />
              ) : activeModule.id === "components" ? (
                <ComponentsModule />
              ) : activeModule.id === "products" ? (
                <ProductsModule />
              ) : activeModule.id === "orders" ? (
                <OrdersModule ordersState={ordersState} />
              ) : activeModule.id === "settings" ? (
                <SettingsModule />
              ) : activeModule.id === "user" ? (
                <UserModule
                  currentUser={simulatedUser}
                  onSwitchUser={handleSimulatedLogin}
                />
              ) : (
                <div className="col-span-12 flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 bg-gray-50">
                  <div className="text-center">
                    {typeof activeModule.icon === "string" ? (
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">
                        {activeModule.icon}
                      </span>
                    ) : (
                      <span className="inline-flex text-4xl mb-2 opacity-50 items-center justify-center">
                        {activeModule.icon}
                      </span>
                    )}
                    <p>
                      {activeModule.name} module content will be placed here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProductionTypesContext.Provider>
  );
}

export interface ProductionTypeConfig {
  id: string;
  name: string;
  defaultBleedInches: number;
}

export const INITIAL_PRODUCTION_TYPES: ProductionTypeConfig[] = [
  { id: "cutSheet", name: "Cut Sheet", defaultBleedInches: 0.25 },
  { id: "wideFormatRoll", name: "Wide Format Roll", defaultBleedInches: 0.125 },
  {
    id: "wideFormatRigid",
    name: "Wide Format Rigid",
    defaultBleedInches: 0.125,
  },
];

export const ProductionTypesContext = React.createContext<
  [
    ProductionTypeConfig[],
    React.Dispatch<React.SetStateAction<ProductionTypeConfig[]>>,
  ]
>([INITIAL_PRODUCTION_TYPES, () => {}]);

export interface MediaCatalogEntry {
  id: string;
  displayName: string;
  internalName: string;
  key?: string;
  lbs: string;
  gsm: string;
  pt: string;
  caliper: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  productionType: string;
  compatibleFinishedSizes: { finishedSizeId: string; colors: string[] }[];
}

export const INITIAL_MEDIA_CATALOG: MediaCatalogEntry[] = [
  {
    displayName: "20lb Economy",
    internalName: "WebCo 20lb 92 bright",
    key: "20LB",
    lbs: "20",
    gsm: "75",
    pt: "",
    caliper: "0.004",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "24lb Standard",
    internalName: "WebCo 24lb 92 bright",
    key: "24LB",
    lbs: "24",
    gsm: "90",
    pt: "",
    caliper: "0.0045",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "28lb Premium",
    internalName: "WebCo 28lb 92 bright",
    key: "28LB",
    lbs: "28",
    gsm: "105",
    pt: "",
    caliper: "0.0052",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "e886541a-c157-6e76-b76b-2746e6c5275a",
        colors: ["#ffffff"],
      },
      {
        finishedSizeId: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "20lb Pastels",
    internalName: "WebCo Pastel 20lb",
    key: "20P",
    lbs: "20",
    gsm: "75",
    pt: "",
    caliper: "0.004",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#fdfd96", "#ffb3ba", "#bae1ff"],
      },
      {
        finishedSizeId: getDeterministicId('4" x 12"'),
        colors: ["#fdfd96", "#ffb3ba", "#bae1ff"],
      },
    ],
  },
  {
    displayName: "80lb Silk Cover",
    internalName: "80lb Silk Cover",
    lbs: "80",
    gsm: "216",
    pt: "",
    caliper: "0.007",
    productionType: "cutSheet" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "d775430f-b046-5d65-a65a-1635d5b4164f",
        colors: ["#ffffff"],
      },
      { finishedSizeId: getDeterministicId('4" x 12"'), colors: ["#ffffff"] },
    ],
  },
  {
    displayName: "Heavyweight Matte",
    internalName: "WF Heavyweight Matte",
    lbs: "",
    gsm: "",
    pt: "",
    caliper: "",
    productionType: "wideFormatRoll" as const,
    compatibleFinishedSizes: [
      {
        finishedSizeId: "cb88a7c6-e5d4-4e3d-2c1b-a0a09f8e7d6c",
        colors: ["#ffffff"],
      },
    ],
  },
  ...PARSED_MEDIA,
].map((m) => ({ id: m.id || crypto.randomUUID(), ...m }));

const COMPONENT_OPTIONS = [
  { id: "impressions", title: "Colors & Impressions", icon: "invert_colors" },
  { id: "media", title: "Media", icon: "description" },
  { id: "finished-sizes", title: "Finished Sizes", icon: "responsive_layout" },
  { id: "finishing-options", title: "Finishing Options", icon: "devices_fold" },
  {
    id: "additional-options",
    title: "Additional Options",
    icon: "local_shipping",
  },
];

const EXPLICIT_SIZE_IDS: Record<string, string> = {
  Letter: "d775430f-b046-5d65-a65a-1635d5b4164f",
  Legal: "e886541a-c157-6e76-b76b-2746e6c5275a",
  Ledger: "b8c7a6b5-d4e3-3c2b-1a9f-8e7d6c5b4a3b",
  '12" x 18"': "d245622a-4f05-63bf-c98f-050e82d0bbe9",
  '18" x 24"': "cb88a7c6-e5d4-4e3d-2c1b-a0a09f8e7d6c",
};

const map = new Map();
const ALL_SIZES = [
  {
    name: "Letter",
    key: "LTR",
    widthIn: 8.5,
    heightIn: 11,
    productionTypes: ["cutSheet"],
    description: "Standard letter paper size.",
  },
  {
    name: "Legal",
    key: "LEG",
    widthIn: 8.5,
    heightIn: 14,
    productionTypes: ["cutSheet"],
    description: "Standard legal paper size.",
  },
  {
    name: "Ledger",
    key: "LED",
    widthIn: 11,
    heightIn: 17,
    productionTypes: ["cutSheet"],
    description: "Standard tabloid / ledger paper size.",
  },
  {
    name: '12" x 18"',
    widthIn: 12,
    heightIn: 18,
    productionTypes: ["cutSheet", "wideFormatRoll"],
    description: "",
  },
  {
    name: '18" x 24"',
    widthIn: 18,
    heightIn: 24,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: '24" x 36"',
    widthIn: 24,
    heightIn: 36,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: '36" x 48"',
    widthIn: 36,
    heightIn: 48,
    productionTypes: ["wideFormatRoll"],
    description: "",
  },
  {
    name: "ARCH A",
    widthIn: 9,
    heightIn: 12,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH B",
    widthIn: 12,
    heightIn: 18,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH C",
    widthIn: 18,
    heightIn: 24,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH D",
    widthIn: 24,
    heightIn: 36,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH E1",
    widthIn: 30,
    heightIn: 42,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: "ARCH E",
    widthIn: 36,
    heightIn: 48,
    productionTypes: ["wideFormatRoll"],
    description: "Engineering / blueprint size.",
  },
  {
    name: '4" x 6"',
    widthIn: 4,
    heightIn: 6,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '5" x 7"',
    widthIn: 5,
    heightIn: 7,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.5" x 8.5"',
    widthIn: 3.5,
    heightIn: 8.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8.5" x 5.5"',
    widthIn: 8.5,
    heightIn: 5.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.25" x 5.5"',
    widthIn: 4.25,
    heightIn: 5.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.66" x 8.5"',
    widthIn: 3.66,
    heightIn: 8.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8" x 8"',
    widthIn: 8,
    heightIn: 8,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3.5" x 3.5"',
    widthIn: 3.5,
    heightIn: 3.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4" x 9"',
    widthIn: 4,
    heightIn: 9,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4" x 12"',
    widthIn: 4,
    heightIn: 12,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '8.5" x 5.13"',
    widthIn: 8.5,
    heightIn: 5.13,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '2" x 4"',
    widthIn: 2,
    heightIn: 4,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '3" x 5.2"',
    widthIn: 3,
    heightIn: 5.2,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '2.5" x 3"',
    widthIn: 2.5,
    heightIn: 3,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '13" x 7.5"',
    widthIn: 13,
    heightIn: 7.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.25" x 3.75"',
    widthIn: 4.25,
    heightIn: 3.75,
    productionTypes: ["cutSheet"],
    description: "",
  },
  {
    name: '4.5" x 9.5"',
    widthIn: 4.5,
    heightIn: 9.5,
    productionTypes: ["cutSheet"],
    description: "",
  },
  ...PARSED_SIZES,
];

ALL_SIZES.forEach((s) => {
  const k = `${s.widthIn}x${s.heightIn}`;
  if (!map.has(k)) {
    map.set(k, s);
  }
});

function getDeterministicId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex}-0000-0000-0000-000000000000`;
}

const INITIAL_FINISHED_SIZES = Array.from(map.values()).map((s) => ({
  id: EXPLICIT_SIZE_IDS[s.name] || getDeterministicId(s.name),
  ...s,
  widthPt: s.widthIn * 72,
  heightPt: s.heightIn * 72,
}));

export interface FinishingOption {
  id: string;
  name: string;
  key: string;
  description: string;
  lastUpdatedBy?: string;
  updatedAt?: string;
  productionTypes: string[];
}

const INITIAL_FINISHING_OPTIONS: FinishingOption[] = [
  {
    id: crypto.randomUUID(),
    name: "Cutting",
    key: "CUT",
    description: "Custom cutting option",
    productionTypes: ["cutSheet"],
  },
  {
    id: crypto.randomUUID(),
    name: "Cut in Half Horizontal",
    key: "CUT2HZ",
    description: "Cut in half horizontal",
    productionTypes: ["cutSheet"],
  },
];

const INITIAL_COLORS = [
  {
    name: "Black",
    key: "BW",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Full Color (CMYK)",
    key: "CLR",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
].map((i) => ({ id: crypto.randomUUID(), ...i }));

const INITIAL_IMPRESSIONS = [
  {
    name: "Single Sided",
    key: "SS",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Double Sided",
    key: "DS",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
  {
    name: "Double Sided (flip)",
    key: "DSF",
    productionTypes: ["cutSheet", "wideFormatRoll", "wideFormatRigid"],
  },
].map((i) => ({ id: crypto.randomUUID(), ...i }));

const INITIAL_PRINT_SPECS = [
  {
    id: "spec-rack-card-4x12",
    name: "Rack Card 4x12",
    description: '4"x12" rack card, 4cp/4cp 100# white uncoated cover, bleed',
    productType: "Rack Card",
    productionType: "cutSheet",
    finishedSizeId: getDeterministicId('4" x 12"'),
    finishedSizeName: '4" x 12"',
    isCustomSize: false,
    customWidthIn: 0,
    customHeightIn: 0,
    type: "JDF token",
    value: "b2d87e50-9d32-4467-9321-c11df5b79796",
    mediaName: "",
    pageCount: 1,
  },
];

const PRODUCT_OPTIONS = [
  { id: "all-products", title: "All Products", icon: "all_inclusive" },
  { id: "static", title: "Static", icon: "description" },
  { id: "variable", title: "Variable", icon: "badge" },
  { id: "navink", title: "navINK (Taylor)", icon: "outgoing_mail" },
  { id: "fc-inventoried", title: "FC Inventoried", icon: "forklift" },
  { id: "print-specs", title: "Print Specs", icon: "star" },
  { id: "mapping", title: "Mapping", icon: <svg viewBox="0 0 40 40" focusable="false" aria-hidden="true" height="24px" width="24px" color="currentColor" className="sc-14dq9fm-0 jWZSbf"><g fillRule="evenodd"><path d="M5 12.5A1.25 1.25 0 0 1 5 15H3.75c-.69 0-1.25.56-1.25 1.25v20c0 .69.56 1.25 1.25 1.25h20c.69 0 1.25-.56 1.25-1.25v-10a1.25 1.25 0 0 1 2.5 0v10A3.754 3.754 0 0 1 23.75 40h-20A3.754 3.754 0 0 1 0 36.25v-20a3.754 3.754 0 0 1 3.75-3.75zM26.25 0c.283 0 .56.097.782.273l12.5 10a1.251 1.251 0 0 1 0 1.953l-12.5 10a1.27 1.27 0 0 1-.641.266l-.141.008c-.187 0-.375-.043-.543-.123A1.26 1.26 0 0 1 25 21.25V17.5h-6.25c-.69 0-1.25.56-1.25 1.25v5a1.25 1.25 0 0 1-1.808 1.118C15.458 24.752 10 21.96 10 16.25v-5A6.257 6.257 0 0 1 16.25 5H25V1.25A1.256 1.256 0 0 1 26.25 0m1.25 3.85v2.4c0 .69-.56 1.25-1.25 1.25h-10a3.754 3.754 0 0 0-3.75 3.75v5c0 2.298 1.307 4.002 2.5 5.08v-2.58A3.754 3.754 0 0 1 18.75 15h7.5c.69 0 1.25.56 1.25 1.25v2.398l9.248-7.398z" fill="currentColor"></path></g></svg> },
];

function ProductsModule() {
  const [activeTab, setActiveTab] = useState(PRODUCT_OPTIONS[0]);
  const [printSpecs, setPrintSpecs] = useFirestoreSync(
    "appData",
    "print_specs",
    INITIAL_PRINT_SPECS,
  );
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [finishedSizes] = useFirestoreSync(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [mediaCatalog] = useFirestoreSync(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [colors] = useFirestoreSync("appData", "colors", INITIAL_COLORS);
  const [impressions] = useFirestoreSync(
    "appData",
    "impressions",
    INITIAL_IMPRESSIONS,
  );
  const [finishingOptions] = useFirestoreSync(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [selectedPrintSpec, setSelectedPrintSpec] = useState<any>(null);
  const [printSpecsSearchTerm, setPrintSpecsSearchTerm] = useState("");

  const [mappings, setMappings] = useFirestoreSync<any[]>(
    "appData",
    "mappings",
    [
      {
        id: crypto.randomUUID(),
        externalItemId: "MW_HCAMKT_RC_2S_4x12_100DCOC_BLEED",
        sku: "1234556",
        description: "BRC - Rack Card - 4 x 12",
        specType: "JDF Token",
        specValue: "dfjkgh234-2354jskdkjh",
        source: "HCA"
      }
    ],
  );
  const [mappingsSearchTerm, setMappingsSearchTerm] = useState("");
  const [selectedMapping, setSelectedMapping] = useState<any>(null);

  const [sources] = useFirestoreSync<any[]>(
    "appData",
    "sources",
    []
  );

  const [savedProducts, setSavedProducts] = useFirestoreSync<any[]>(
    "appData",
    "products",
    [],
  );
  const [selectedSavedProduct, setSelectedSavedProduct] = useState<any>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const productFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportProductDef = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!data.id || !data.name)
          throw new Error("Invalid product definition");
        setSavedProducts((prev) => {
          const next = [...prev];
          const idx = next.findIndex((p) => p.id === data.id);
          if (idx >= 0) next[idx] = data;
          else next.push(data);
          return next;
        });
        alert("Product definition imported successfully.");
      } catch {
        alert("Error parsing product JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportProductJSON = (prod: any) => {
    const blob = new Blob([JSON.stringify(prod, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `product_${prod.name.replace(/\s+/g, "_")}_${prod.id.slice(0, 6)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <input
        type="file"
        accept=".json"
        className="hidden"
        ref={productFileInputRef}
        onChange={handleImportProductDef}
      />
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Library</h2>
          <div className="flex flex-col gap-3">
            {PRODUCT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  activeTab.id === option.id
                    ? "border-primary bg-[#f0f7ff] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {typeof option.icon === "string" ? (
                  <span className="material-symbols-outlined text-[24px] text-[#cc0000]">
                    {option.icon}
                  </span>
                ) : (
                  <span className="flex items-center text-[#cc0000] justify-center w-[24px] h-[24px]">
                    {option.icon}
                  </span>
                )}
                <span className="font-semibold text-gray-800 text-sm">
                  {option.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-9 lg:h-full lg:min-h-0 flex flex-col gap-6 overflow-y-auto scrollbar-none pb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full lg:min-h-0 shrink-0 lg:shrink">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab.title}
            </h2>
            {activeTab.id === "print-specs" && (
              <div className="flex items-center gap-3">
                <SearchBar
                  placeholder="Search specs..."
                  value={printSpecsSearchTerm}
                  onChange={setPrintSpecsSearchTerm}
                  className="w-64"
                />
                <TableActionMenu
                  actions={[
                    { label: "Import", icon: "upload" },
                    { label: "Export", icon: "download" },
                    {
                      label: "Add new spec",
                      icon: "add",
                      variant: "primary",
                      onClick: () => {
                        setSelectedPrintSpec({
                          id: crypto.randomUUID(),
                          name: "",
                          description: "",
                          productType: "Document",
                          productionType: "cutSheet",
                          type: "Template key",
                          value: "",
                        });
                      },
                    },
                  ]}
                />
              </div>
            )}
            {activeTab.id === "mapping" && (
              <div className="flex items-center gap-3">
                <SearchBar
                  placeholder="Search mappings..."
                  value={mappingsSearchTerm}
                  onChange={setMappingsSearchTerm}
                  className="w-64"
                />
                <TableActionMenu
                  actions={[
                    { label: "Import", icon: "upload" },
                    { label: "Export", icon: "download" },
                    {
                      label: "Add Mapping",
                      icon: "add",
                      variant: "primary",
                      onClick: () => {
                        setSelectedMapping({
                          id: crypto.randomUUID(),
                          externalItemId: "",
                          internalItemId: "",
                          qtyModifyType: "none",
                          qtyModifier: "0",
                          description: "",
                          specType: "None assigned",
                          specValue: "",
                          sourceId: ""
                        });
                      },
                    },
                  ]}
                />
              </div>
            )}
            {activeTab.id === "all-products" && (
              <div className="flex items-center gap-3">
                <SearchBar
                  placeholder="Search products..."
                  value={productSearchTerm}
                  onChange={setProductSearchTerm}
                  className="w-64"
                />
                <TableActionMenu
                  actions={[
                    {
                      label: "Import Product JSON",
                      icon: "upload",
                      onClick: () => productFileInputRef.current?.click(),
                    },
                    {
                      label: "Create Product",
                      icon: "add",
                      variant: "primary",
                      onClick: () => {
                        setSelectedSavedProduct({
                          id: crypto.randomUUID(),
                          name: "New Product",
                          components: [],
                        });
                      },
                    },
                  ]}
                />
              </div>
            )}
          </div>

          <div className="overflow-y-auto overflow-x-hidden min-h-0 flex-1">
            {activeTab.id === "all-products" && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                        Components
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {savedProducts
                      .filter((prod) =>
                        prod.name
                          .toLowerCase()
                          .includes(productSearchTerm.toLowerCase()),
                      )
                      .map((prod, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            {prod.name}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {prod.components?.length || 0} component(s)
                          </td>
                          <td className="px-5 py-4 text-sm text-right whitespace-nowrap">
                            <button
                              onClick={() => exportProductJSON(prod)}
                              className="text-gray-500 hover:text-primary transition-colors inline-block p-1"
                              title="Export Product JSON"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                download
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    {savedProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-gray-500"
                        >
                          No products configured yet. Create one or import a
                          product JSON.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab.id === "print-specs" && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Size
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Media
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Type
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {printSpecs
                      .filter(
                        (spec) =>
                          (spec.name || "")
                            .toLowerCase()
                            .includes(printSpecsSearchTerm.toLowerCase()) ||
                          (spec.value || "")
                            .toLowerCase()
                            .includes(printSpecsSearchTerm.toLowerCase()),
                      )
                      .map((spec, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedPrintSpec(spec)}
                              className="text-[#cc0000] hover:underline font-semibold"
                            >
                              {spec.name}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {spec.isCustomSize
                              ? `Custom (${spec.customWidthIn}"x${spec.customHeightIn}")`
                              : spec.finishedSizeName || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {spec.mediaName || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {spec.description || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {spec.type}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {spec.value ? (
                              <button
                                onClick={() =>
                                  navigator.clipboard.writeText(spec.value)
                                }
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex items-center justify-center"
                                title="Copy value to clipboard"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  content_copy
                                </span>
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab.id === "mapping" && (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        External Item ID
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        SKU
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Spec Type
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Spec Value
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-5 py-3 w-20"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mappings
                      .filter(
                        (mapping) =>
                          (mapping.externalItemId || "")
                            .toLowerCase()
                            .includes(mappingsSearchTerm.toLowerCase()) ||
                          (mapping.internalItemId || mapping.sku || "")
                            .toLowerCase()
                            .includes(mappingsSearchTerm.toLowerCase()) ||
                          (mapping.description || "")
                            .toLowerCase()
                            .includes(mappingsSearchTerm.toLowerCase()) ||
                          (sources.find(s => s.id === mapping.sourceId)?.name || mapping.sourceId || mapping.source || "")
                            .toLowerCase()
                            .includes(mappingsSearchTerm.toLowerCase()),
                      )
                      .map((mapping, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 break-words max-w-[200px]">
                            {mapping.externalItemId}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {mapping.internalItemId || mapping.sku}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 border-gray-200">
                            {mapping.description}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {mapping.specType}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 max-w-xs break-words">
                            {mapping.specValue}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {sources.find(s => s.id === mapping.sourceId)?.name || mapping.sourceId || mapping.source}
                          </td>
                          <td className="px-5 py-4 text-sm text-right whitespace-nowrap">
                            <button
                              onClick={() => setSelectedMapping(mapping)}
                              className="text-[#0056b3] hover:text-[#003d82] p-1.5 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    "Are you sure you want to delete this mapping?"
                                  )
                                ) {
                                  setMappings(
                                    mappings.filter((m) => m.id !== mapping.id)
                                  );
                                }
                              }}
                              className="text-[#cc0000] hover:text-[#990000] p-1.5 transition-colors ml-1"
                              title="Delete"
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
            )}
          </div>
        </div>
      </div>
      <MappingDetailDrawer
        selectedMapping={selectedMapping}
        onClose={() => setSelectedMapping(null)}
        sources={sources}
        onSave={(updated) => {
          setMappings((prev) => {
            const exists = prev.find((m) => m.id === updated.id);
            if (exists) {
              return prev.map((m) => (m.id === updated.id ? updated : m));
            }
            return [...prev, updated];
          });
          setSelectedMapping(null);
        }}
      />
      <PrintSpecDetailDrawer
        selectedSpec={selectedPrintSpec}
        onClose={() => setSelectedPrintSpec(null)}
        onSave={(updated) => {
          setPrintSpecs((prev) => {
            const exists = prev.find((s) => s.id === updated.id);
            if (exists) {
              return prev.map((s) => (s.id === updated.id ? updated : s));
            }
            return [...prev, updated];
          });
          setSelectedPrintSpec(null);
        }}
        isNew={
          selectedPrintSpec
            ? !printSpecs.find((s) => s.id === selectedPrintSpec.id)
            : false
        }
        finishedSizes={finishedSizes}
        mediaCatalog={mediaCatalog}
        colors={colors}
        impressions={impressions}
        finishingOptions={finishingOptions}
      />
    </>
  );
}

function PrintSpecDetailDrawer({
  selectedSpec,
  onClose,
  onSave,
  isNew,
  finishedSizes,
  mediaCatalog,
  colors,
  impressions,
  finishingOptions,
}: {
  selectedSpec: any;
  onClose: () => void;
  onSave: (spec: any) => void;
  isNew?: boolean;
  finishedSizes?: any[];
  mediaCatalog?: any[];
  colors?: any[];
  impressions?: any[];
  finishingOptions?: any[];
}) {
  const [formData, setFormData] = useState<any>(selectedSpec);
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [activeDrawerTab, setActiveDrawerTab] = useState<
    "overview" | "configure" | "validate"
  >("overview");

  // Custom Combobox states
  const [isSizesOpen, setIsSizesOpen] = useState(false);
  const [dropdownDirection, setDropdownDirection] = useState<"down" | "up">(
    "down",
  );
  const [sizeSearchTerm, setSizeSearchTerm] = useState("");
  const sizesDropdownRef = useRef<HTMLDivElement>(null);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaDropdownDirection, setMediaDropdownDirection] = useState<
    "down" | "up"
  >("down");
  const [mediaSearchTerm, setMediaSearchTerm] = useState("");
  const mediaDropdownRef = useRef<HTMLDivElement>(null);

  const [validationResult, setValidationResult] = useState<any>(null);
  const [isInterrogating, setIsInterrogating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTestFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsInterrogating(true);
    setValidationResult(null);

    try {
      const result: any = {
        fileName: file.name,
        fileType: file.type,
      };

      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        result.pageCount = pdfDoc.getPageCount();

        if (pages.length > 0) {
          const { width, height } = pages[0].getSize();
          // Convert from points to inches (72 points per inch)
          result.widthIn = width / 72;
          result.heightIn = height / 72;
        }
      } else if (file.type.startsWith("image/")) {
        // Native width/height
        const url = URL.createObjectURL(file);
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        let dpiX = 72; // default
        let dpiY = 72;
        try {
          const exifData = await exifr.parse(file);
          if (exifData) {
            if (exifData.XResolution) dpiX = exifData.XResolution;
            if (exifData.YResolution) dpiY = exifData.YResolution;
          }
        } catch (e) {
          console.log("No EXIF data found, defaulting to 72 DPI");
        }

        result.widthIn = img.naturalWidth / dpiX;
        result.heightIn = img.naturalHeight / dpiY;
        result.pageCount = 1;
        result.dpiX = dpiX;
        result.dpiY = dpiY;
        URL.revokeObjectURL(url);
      } else {
        result.error =
          "Unsupported file format. Please upload PDF or Image (JPEG/PNG/TIFF).";
      }

      // Cross-reference with print spec
      const warnings: string[] = [];
      const specPageCount = formData?.pageCount || 1;

      if (result.pageCount && result.pageCount !== specPageCount) {
        warnings.push(
          `Warning: The attached file contains ${result.pageCount} pages, but the spec expects ${specPageCount}.`,
        );
      }

      if (result.widthIn && result.heightIn) {
        let targetW = 0;
        let targetH = 0;
        if (
          formData?.isCustomSize &&
          formData.customWidthIn &&
          formData.customHeightIn
        ) {
          targetW = parseFloat(formData.customWidthIn);
          targetH = parseFloat(formData.customHeightIn);
        } else if (formData?.finishedSizeId && finishedSizes) {
          const fsMatched = finishedSizes.find(
            (s: any) => s.id === formData.finishedSizeId,
          );
          if (fsMatched && fsMatched.widthIn && fsMatched.heightIn) {
            targetW = fsMatched.widthIn;
            targetH = fsMatched.heightIn;
          }
        }

        if (targetW > 0 && targetH > 0) {
          // Check bleed (usually 0.125" each side, so 0.25" total)
          const hwMatched =
            Math.abs(result.widthIn - targetW) < 0.05 &&
            Math.abs(result.heightIn - targetH) < 0.05;
          const hwMatchedBleed =
            Math.abs(result.widthIn - (targetW + 0.25)) < 0.05 &&
            Math.abs(result.heightIn - (targetH + 0.25)) < 0.05;

          const whMatched =
            Math.abs(result.heightIn - targetW) < 0.05 &&
            Math.abs(result.widthIn - targetH) < 0.05;
          const whMatchedBleed =
            Math.abs(result.heightIn - (targetW + 0.25)) < 0.05 &&
            Math.abs(result.widthIn - (targetH + 0.25)) < 0.05;

          if (!hwMatched && !hwMatchedBleed && !whMatched && !whMatchedBleed) {
            warnings.push(
              `Warning: File dimensions are ${result.widthIn.toFixed(3)}" x ${result.heightIn.toFixed(3)}", which does not match expected size of ${targetW}" x ${targetH}" (nor standard 0.125" margins for bleed).`,
            );
          }
        }
      }

      result.warnings = warnings;
      result.isValid = warnings.length === 0 && !result.error;

      setValidationResult(result);
    } catch (err: any) {
      setValidationResult({
        error: "Failed to process the file: " + err.message,
      });
    } finally {
      setIsInterrogating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenSizesDropdown = () => {
    if (sizesDropdownRef.current) {
      const rect = sizesDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If less than 240px below, but more space above, open upwards
      if (spaceBelow < 240 && rect.top > spaceBelow) {
        setDropdownDirection("up");
      } else {
        setDropdownDirection("down");
      }
    }
    setIsSizesOpen(true);
  };

  const handleOpenMediaDropdown = () => {
    if (mediaDropdownRef.current) {
      const rect = mediaDropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 240 && rect.top > spaceBelow) {
        setMediaDropdownDirection("up");
      } else {
        setMediaDropdownDirection("down");
      }
    }
    setIsMediaOpen(true);
  };

  useEffect(() => {
    if (selectedSpec) {
      setFormData(selectedSpec);
      setSizeSearchTerm(selectedSpec.finishedSizeName || "");
      setMediaSearchTerm(selectedSpec.mediaName || "");
    }
    setActiveDrawerTab("overview");
  }, [selectedSpec]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sizesDropdownRef.current &&
        !sizesDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSizesOpen(false);
        // Reset query string to matched value if they clicked away
        if (formData?.finishedSizeName) {
          setSizeSearchTerm(formData.finishedSizeName);
        }
      }
      if (
        mediaDropdownRef.current &&
        !mediaDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMediaOpen(false);
        if (formData?.mediaName) {
          setMediaSearchTerm(formData.mediaName);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [formData?.finishedSizeName, formData?.mediaName]);

  const isOptionCompatible = (opt: any) => {
    if (opt.productionTypes && formData?.productionType) {
      if (!opt.productionTypes.includes(formData.productionType)) return false;
    }
    if (opt.productionType && formData?.productionType) {
      if (opt.productionType !== formData.productionType) return false;
    }
    if (opt.compatibleFinishedSizes && formData?.finishedSizeId) {
      if (
        !opt.compatibleFinishedSizes.some(
          (fs: any) => fs.finishedSizeId === formData.finishedSizeId,
        )
      )
        return false;
    }
    return true;
  };

  const renderPill = (opt: any, isSelected: boolean, onClick: () => void) => {
    const isCompat = isOptionCompatible(opt);
    if (!isCompat) {
      return (
        <button
          key={opt.id}
          type="button"
          disabled
          className="border border-gray-200 bg-gray-50 text-gray-400 line-through text-sm font-medium px-4 py-2 rounded-md cursor-not-allowed relative overflow-hidden"
        >
          {/* Diagonal indicator similar to image */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg width="100%" height="100%" preserveAspectRatio="none">
              <line
                x1="0"
                y1="100%"
                x2="100%"
                y2="0"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>
          </div>
          {opt.name}
        </button>
      );
    }
    return (
      <button
        key={opt.id}
        type="button"
        onClick={onClick}
        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
          isSelected
            ? "border-2 border-primary bg-primary/5 text-primary"
            : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 p-[9px]" // match spacing for 2px border
        }`}
        style={!isSelected ? { padding: "7px 15px" } : undefined}
      >
        {opt.name}
      </button>
    );
  };

  const safeSizeSearchTerm = sizeSearchTerm || "";
  const safeMediaSearchTerm = mediaSearchTerm || "";

  const normalizedSearch = safeSizeSearchTerm
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const normalizedMediaSearch = safeMediaSearchTerm
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const filteredMedia = (mediaCatalog || []).filter((m) => {
    // 1. Compatibility constraint
    if (!isOptionCompatible(m)) return false;
    // 2. Text search constraint
    const name = m.displayName || "";
    if (name.toLowerCase().includes(safeMediaSearchTerm.toLowerCase()))
      return true;
    if (normalizedMediaSearch.length > 0) {
      const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedName.includes(normalizedMediaSearch);
    }
    return false;
  });

  const filteredSizes = [
    { id: "custom", name: "Custom size", productionTypes: [] }, // Custom allowed anywhere
    ...(finishedSizes?.filter((fs) => {
      if (!formData?.productionType) return true;
      return fs.productionTypes?.includes(formData.productionType);
    }) || []),
  ].filter((s) => {
    const name = s.name || "";
    // Preserve standard inclusion match for names like "Custom"
    if (name.toLowerCase().includes(safeSizeSearchTerm.toLowerCase())) {
      return true;
    }
    // Perform normalized match for removing quotes/spaces ('18x24' matches '18" x 24"')
    if (normalizedSearch.length > 0) {
      const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedName.includes(normalizedSearch);
    }
    return false;
  });

  const hasChanges =
    selectedSpec && JSON.stringify(formData) !== JSON.stringify(selectedSpec);

  const disableSave =
    !formData?.name?.trim() ||
    !formData?.productType ||
    !formData?.productionType ||
    !formData?.type ||
    !formData?.value?.trim() ||
    (formData?.isCustomSize
      ? !formData?.customWidthIn || !formData?.customHeightIn
      : !formData?.finishedSizeId);

  return (
    <StandardDrawer
      isOpen={!!selectedSpec}
      onClose={onClose}
      onSave={() => onSave(formData)}
      title={isNew ? "New Print Spec" : "Edit Print Spec"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Spec" : "Save Updates"}
      customWidth="w-[95vw] lg:w-[1100px]"
    >
      {formData && (
        <div className="flex-1 flex overflow-hidden flex-col lg:flex-row w-full h-full border-t border-gray-200">
          {/* Left Column: Fixed Preview */}
          <div className="w-full lg:w-1/2 bg-[#e6e6e6] border-r border-[#d4d4d4] flex flex-col items-center justify-center p-8 relative shrink-0 min-h-[50vh] lg:min-h-0">
            <div className="w-full max-w-[400px] aspect-[4/5] bg-white shadow-xl flex flex-col items-center justify-center relative">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                description
              </span>
              <p className="text-sm font-medium text-gray-400">Page 1</p>
              <p className="text-xs text-gray-300 uppercase mt-2">PREVIEW</p>
            </div>
          </div>

          {/* Right Column: Scrollable Data Layout */}
          <div className="w-full lg:w-1/2 flex flex-col bg-white">
            {/* Tabs */}
            <div className="flex px-8 pt-6 pb-0 border-b border-gray-200 gap-8 shrink-0">
              <button
                onClick={() => setActiveDrawerTab("overview")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "overview" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveDrawerTab("configure")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "configure" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Configure
              </button>
              <button
                onClick={() => setActiveDrawerTab("validate")}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "validate" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
              >
                Validate File
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-8 relative">
              <div className="max-w-xl mx-auto space-y-10">
                {activeDrawerTab === "overview" && (
                  <section>
                    <div className="flex flex-col gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-[#cc0000]">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none"
                          value={formData.name || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none resize-none"
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Type{" "}
                            <span className="text-[#cc0000]">*</span>
                          </label>
                          <select
                            value={formData.productType || "Document"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                productType: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            {[
                              "Document",
                              "Form",
                              "Business Card",
                              "Envelope",
                              "Postcard",
                              "Rack Card",
                              "Other",
                            ].map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Production Type{" "}
                            <span className="text-[#cc0000]">*</span>
                          </label>
                          <select
                            value={formData.productionType || "cutSheet"}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                productionType: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                          >
                            {productionTypes.map((typeDef) => (
                              <option key={typeDef.id} value={typeDef.id}>
                                {typeDef.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-4 items-start">
                        <div
                          className="relative flex-[2]"
                          ref={sizesDropdownRef}
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Finished Size{" "}
                            <span className="text-[#cc0000]">*</span>
                          </label>
                          <div className="relative">
                            {formData.finishedSizeName ? (
                              <div className="w-full border border-gray-300 rounded-md p-1.5 flex items-center justify-between bg-white h-[38px]">
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-sm border border-blue-200">
                                  {formData.finishedSizeName}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormData({
                                        ...formData,
                                        finishedSizeName: "",
                                        isCustomSize: false,
                                        finishedSizeId: null,
                                      });
                                      setSizeSearchTerm("");
                                      setTimeout(
                                        () => handleOpenSizesDropdown(),
                                        0,
                                      );
                                    }}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-sm p-0.5 flex items-center justify-center transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px] leading-none">
                                      close
                                    </span>
                                  </button>
                                </span>
                                <button
                                  type="button"
                                  className="px-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      finishedSizeName: "",
                                      isCustomSize: false,
                                      finishedSizeId: null,
                                    });
                                    setSizeSearchTerm("");
                                    setTimeout(
                                      () => handleOpenSizesDropdown(),
                                      0,
                                    );
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    arrow_drop_down
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  placeholder="Select or type to search..."
                                  value={sizeSearchTerm}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none pr-8 h-[38px]"
                                  onChange={(e) => {
                                    setSizeSearchTerm(e.target.value);
                                    if (!isSizesOpen) handleOpenSizesDropdown();
                                  }}
                                  onFocus={handleOpenSizesDropdown}
                                />
                                <button
                                  type="button"
                                  className="absolute right-0 top-0 bottom-0 px-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    if (isSizesOpen) setIsSizesOpen(false);
                                    else handleOpenSizesDropdown();
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    arrow_drop_down
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                          {isSizesOpen && !formData.finishedSizeName && (
                            <div
                              className={`absolute z-10 w-full ${dropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"} bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto`}
                            >
                              {filteredSizes.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                  No sizes found
                                </div>
                              ) : (
                                filteredSizes.map((s) => (
                                  <button
                                    key={s.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                      setSizeSearchTerm(s.name);
                                      setIsSizesOpen(false);
                                      if (s.name === "Custom size") {
                                        setFormData({
                                          ...formData,
                                          finishedSizeName: s.name,
                                          isCustomSize: true,
                                          finishedSizeId: null,
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          finishedSizeName: s.name,
                                          isCustomSize: false,
                                          finishedSizeId:
                                            s.id !== "custom" ? s.id : null,
                                        });
                                      }
                                    }}
                                  >
                                    {s.name}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Page Count
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={formData.pageCount || 1}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                pageCount: parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none h-[38px]"
                          />
                        </div>
                      </div>

                      {formData.isCustomSize && (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Width (in){" "}
                              <span className="text-[#cc0000]">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.125"
                              value={formData.customWidthIn || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customWidthIn: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Height (in){" "}
                              <span className="text-[#cc0000]">*</span>
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.125"
                              value={formData.customHeightIn || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  customHeightIn: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {activeDrawerTab === "configure" && (
                  <section>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                            Name
                          </span>
                          <span className="font-medium text-gray-900">
                            {formData.name || "-"}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-gray-300 mx-2"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                            Product Type
                          </span>
                          <span className="font-medium text-gray-900">
                            {formData.productType || "-"}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-gray-300 mx-2"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
                            Finished Size
                          </span>
                          <span className="font-medium text-gray-900">
                            {formData.isCustomSize
                              ? `Custom (${formData.customWidthIn}" x ${formData.customHeightIn}")`
                              : formData.finishedSizeName || "-"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type <span className="text-[#cc0000]">*</span>
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="specType"
                              value="Template key"
                              checked={formData.type === "Template key"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  type: e.target.value,
                                })
                              }
                              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="text-sm text-gray-700">
                              Template key
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="specType"
                              value="JDF token"
                              checked={formData.type === "JDF token"}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  type: e.target.value,
                                })
                              }
                              className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="text-sm text-gray-700">
                              JDF token
                            </span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Value <span className="text-[#cc0000]">*</span>
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none font-mono"
                          value={formData.value || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, value: e.target.value })
                          }
                        />
                      </div>

                      <hr className="border-gray-200" />

                      {/* Options */}
                      <div className="flex flex-col gap-6">
                        {/* Media */}
                        <div className="relative z-20" ref={mediaDropdownRef}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Media
                          </label>
                          <div className="relative">
                            {formData.mediaName ? (
                              <div className="w-full border border-gray-300 rounded-md p-1.5 flex items-center justify-between bg-white h-[38px]">
                                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded text-sm border border-blue-200">
                                  {formData.mediaName}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setFormData({
                                        ...formData,
                                        mediaName: "",
                                        mediaId: null,
                                      });
                                      setMediaSearchTerm("");
                                      setTimeout(
                                        () => handleOpenMediaDropdown(),
                                        0,
                                      );
                                    }}
                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-sm p-0.5 flex items-center justify-center transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px] leading-none">
                                      close
                                    </span>
                                  </button>
                                </span>
                                <button
                                  type="button"
                                  className="px-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      mediaName: "",
                                      mediaId: null,
                                    });
                                    setMediaSearchTerm("");
                                    setTimeout(
                                      () => handleOpenMediaDropdown(),
                                      0,
                                    );
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    arrow_drop_down
                                  </span>
                                </button>
                              </div>
                            ) : (
                              <>
                                <input
                                  type="text"
                                  placeholder="Select or type to search media..."
                                  value={mediaSearchTerm}
                                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none pr-8 h-[38px]"
                                  onChange={(e) => {
                                    setMediaSearchTerm(e.target.value);
                                    if (!isMediaOpen) handleOpenMediaDropdown();
                                  }}
                                  onFocus={handleOpenMediaDropdown}
                                />
                                <button
                                  type="button"
                                  className="absolute right-0 top-0 bottom-0 px-2 flex items-center justify-center text-gray-500 hover:text-gray-700"
                                  onClick={() => {
                                    if (isMediaOpen) setIsMediaOpen(false);
                                    else handleOpenMediaDropdown();
                                  }}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    arrow_drop_down
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                          {isMediaOpen && !formData.mediaName && (
                            <div
                              className={`absolute z-10 w-full ${mediaDropdownDirection === "up" ? "bottom-full mb-1" : "top-full mt-1"} bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto overscroll-contain`}
                            >
                              {filteredMedia.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 text-center">
                                  No compatible media found
                                </div>
                              ) : (
                                filteredMedia.map((m) => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                                    onClick={() => {
                                      setMediaSearchTerm(m.displayName);
                                      setIsMediaOpen(false);
                                      setFormData({
                                        ...formData,
                                        mediaName: m.displayName,
                                        mediaId: m.id,
                                      });
                                    }}
                                  >
                                    {m.displayName}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(colors || []).map((c) =>
                              renderPill(c, formData.colorId === c.id, () => {
                                setFormData((prev) => ({
                                  ...prev,
                                  colorId: prev.colorId === c.id ? null : c.id,
                                }));
                              }),
                            )}
                          </div>
                        </div>

                        {/* Impression */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Impression
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(impressions || []).map((i) =>
                              renderPill(
                                i,
                                formData.impressionId === i.id,
                                () => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    impressionId:
                                      prev.impressionId === i.id ? null : i.id,
                                  }));
                                },
                              ),
                            )}
                          </div>
                        </div>

                        {/* Finishing Options */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Finishing Options
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {(finishingOptions || []).map((f) =>
                              renderPill(
                                f,
                                formData.finishingOptionIds?.includes(f.id),
                                () => {
                                  setFormData((prev) => {
                                    const current =
                                      prev.finishingOptionIds || [];
                                    if (current.includes(f.id)) {
                                      return {
                                        ...prev,
                                        finishingOptionIds: current.filter(
                                          (id: string) => id !== f.id,
                                        ),
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        finishingOptionIds: [...current, f.id],
                                      };
                                    }
                                  });
                                },
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {activeDrawerTab === "validate" && (
                  <section>
                    <div className="flex flex-col gap-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3">
                        <span className="material-symbols-outlined text-blue-500 mt-0.5">
                          info
                        </span>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            File Validation
                          </h4>
                          <p className="text-sm text-blue-800">
                            Upload a sample file to interrogate its properties
                            against this Print Spec. The file is never stored or
                            uploaded; it is processed entirely in your web
                            browser.
                          </p>
                        </div>
                      </div>

                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-4xl text-gray-400 mb-3">
                          upload_file
                        </span>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Select a file to interrogate
                        </p>
                        <p className="text-xs text-gray-500 mb-4">
                          PDF, JPEG, PNG, or TIFF
                        </p>

                        <label className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4 py-2 rounded-md transition-colors text-sm cursor-pointer inline-flex items-center gap-2">
                          {isInterrogating ? (
                            <>
                              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                              Interrogating...
                            </>
                          ) : (
                            <>Select File</>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            accept=".pdf,image/*"
                            onChange={handleTestFile}
                            disabled={isInterrogating}
                          />
                        </label>
                      </div>

                      {validationResult && (
                        <div
                          className={`rounded-lg border ${validationResult.isValid ? "border-green-200 bg-green-50" : validationResult.error ? "border-red-200 bg-red-50" : "border-yellow-200 bg-yellow-50"} p-5`}
                        >
                          <h4
                            className={`text-sm font-bold flex items-center gap-2 mb-3 ${validationResult.isValid ? "text-green-800" : validationResult.error ? "text-red-800" : "text-yellow-800"}`}
                          >
                            <span className="material-symbols-outlined">
                              {validationResult.isValid
                                ? "check_circle"
                                : validationResult.error
                                  ? "error"
                                  : "warning"}
                            </span>
                            {validationResult.isValid
                              ? "File matches Print Spec"
                              : validationResult.error
                                ? "Interrogation Failed"
                                : "Validation Warnings found"}
                          </h4>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold">
                                  File Name
                                </span>
                                <span className="text-sm font-medium text-gray-900 break-all">
                                  {validationResult.fileName}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold">
                                  Page Count
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {validationResult.pageCount || "-"}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold">
                                  Dimensions
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {validationResult.widthIn &&
                                  validationResult.heightIn
                                    ? `${validationResult.widthIn.toFixed(3)}" x ${validationResult.heightIn.toFixed(3)}"`
                                    : "-"}
                                </span>
                              </div>
                              {(validationResult.dpiX ||
                                validationResult.dpiY) && (
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500 uppercase font-semibold">
                                    Resolution (PPI)
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {validationResult.dpiX} x{" "}
                                    {validationResult.dpiY}
                                  </span>
                                </div>
                              )}
                            </div>

                            {validationResult.error && (
                              <p className="text-sm text-red-700 bg-red-100 p-3 rounded-md border border-red-200 mt-2">
                                {validationResult.error}
                              </p>
                            )}

                            {validationResult.warnings &&
                              validationResult.warnings.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                  {validationResult.warnings.map(
                                    (w: string, i: number) => (
                                      <p
                                        key={i}
                                        className="text-sm text-yellow-800 bg-yellow-100/50 p-2.5 rounded-md border border-yellow-200"
                                      >
                                        {w}
                                      </p>
                                    ),
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}

const MOCK_ORDERS = [
  {
    id: "760124891",
    externalId: "HCA-155035",
    items: 3,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-18",
    status: "Processing",
    contact: {
      name: "Mary Smith",
      phone: "5557106075",
      email: "mary.smith@email.null",
    },
  },
  {
    id: "760982341",
    externalId: "HCA-155036",
    items: 1,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-19",
    status: "Shipped",
    contact: {
      name: "John Doe",
      phone: "5551234567",
      email: "john.doe@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155037",
    items: 5,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "Pending",
    contact: {
      name: "Jane Smith",
      phone: "5559876543",
      email: "jane.smith@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155038",
    items: 2,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "Failed",
    contact: {
      name: "Bob Wilson",
      phone: "5552223333",
      email: "bob.wilson@email.null",
    },
  },
  {
    id: "",
    externalId: "HCA-155039",
    items: 12,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: "2026-04-20",
    status: "On Hold",
    contact: {
      name: "Alice Brown",
      phone: "5554445555",
      email: "alice.brown@email.null",
    },
  },
];

const ADDITIONAL_ORDERS = Array.from({ length: 29 }).map((_, i) => {
  const status = ["Processing", "Shipped", "Pending", "Delivered", "Failed", "On Hold"][Math.floor(Math.random() * 6)];
  return {
    id: ["Failed", "Pending", "On Hold"].includes(status) ? "" : `760${100000 + i}`,
    externalId: `HCA-1550${40 + i}`,
    items: Math.floor(Math.random() * 10) + 1,
    customer: "HCA",
    customerId: "12345678",
    dateReceived: `2026-04-${String(20 - (i % 5)).padStart(2, "0")}`,
    status,
    contact: {
      name: "Generated User " + i,
      phone: "555000" + String(i).padStart(4, "0"),
      email: `genuser${i}@email.null`
    }
  };
});

MOCK_ORDERS.push(...ADDITIONAL_ORDERS);

function TrackingDrawer({ isOpen, onClose, orderId }: { isOpen: boolean, onClose: () => void, orderId: string | null }) {
  const [showMoreAll, setShowMoreAll] = useState(false);
  const [showMoreFirst, setShowMoreFirst] = useState(false);

  return (
    <StandardDrawer isOpen={isOpen} onClose={onClose} title="Track print order">
      {orderId ? (
        <div className="flex flex-col h-full bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Order # {orderId}</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
            
            {/* Box 1 */}
            <div className="border border-[var(--color-link-blue)] rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 27, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 1ZX414050322144101</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> United Parcel Service</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> MICHAEL</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 1 of 1</div>
              </div>

              {!showMoreFirst ? (
                <button className="text-[var(--color-link-blue)] text-sm mb-4 hover:underline" onClick={() => setShowMoreFirst(true)}>Show more</button>
              ) : (
                <div className="pl-4 border-l border-gray-300 ml-1.5 mb-4 space-y-6 py-1 mt-6">
                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-green-600 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Last scan: Apr 27, 2:30 PM</span><br/>
                      <span className="italic text-gray-700">Delivered</span>
                    </div>
                  </div>
                  <button className="text-[var(--color-link-blue)] text-sm hover:underline mt-2 -ml-4" onClick={() => setShowMoreFirst(false)}>Show less</button>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between items-center cursor-pointer mb-1">
                  <span className="text-sm text-gray-900">1 item in this shipment group</span>
                  <span className="material-symbols-outlined text-[20px] text-gray-900">expand_less</span>
                </div>
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <div className="font-bold text-sm text-gray-900">Job 4463140 - </div>
                    <div className="text-xs text-gray-500 mt-0.5">Item #: 717081</div>
                  </div>
                  <div className="text-xs text-gray-500 self-end">Qty: 1</div>
                </div>
              </div>
            </div>

            {/* Box 2 */}
            <div className="border border-[var(--color-link-blue)] rounded-xl bg-white p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 24, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 00000006921704669949</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> On Trac</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> DAVID H</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 1 of 3</div>
              </div>

               <div className="pl-4 border-l border-gray-300 ml-1.5 mb-4 space-y-6 py-1 mt-6">
                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[3px] border-green-600 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Last scan: Apr 24, 4:55 PM</span><br/>
                      <span className="italic text-gray-900">Delivered</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 24, 11:54 AM</span><br/>
                      <span className="italic text-gray-900">Loaded on Truck : Out for Delivery</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 24, 5:47 AM</span><br/>
                      <span className="italic text-gray-900">Order Received</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full border-[2.5px] border-gray-300 bg-white shadow-[0_0_0_2px_white]"></div>
                    <div className="text-sm leading-snug">
                      <span className="text-gray-900">Apr 23, 12:00 AM</span><br/>
                      <span className="italic text-gray-900">Manifest Received</span>
                    </div>
                  </div>
                  
                  <button className="text-[var(--color-link-blue)] text-sm -ml-4 hover:underline block pt-2">Show less</button>
                </div>
            </div>
            
             {/* Box 3 */}
            <div className="border border-gray-200 rounded-xl bg-white p-5 shadow-sm mb-4">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-white text-green-700 text-sm font-semibold rounded border border-green-600">Delivered</span>
                <span className="text-sm text-gray-900">Apr 24, 2026</span>
              </div>
              
              <div className="flex justify-between items-start mb-2 text-sm">
                <div className="space-y-0.5">
                  <div><span className="font-bold text-gray-900 tracking-tight">Tracking #:</span> 00000006921704781092</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Carrier :</span> On Trac</div>
                  <div><span className="font-bold text-gray-900 tracking-tight">Signed by :</span> DAVID H</div>
                </div>
                <div className="font-bold text-gray-900 tracking-tight">Box 2 of 3</div>
              </div>

               <button className="text-[var(--color-link-blue)] text-sm mb-2 hover:underline">Show more</button>
            </div>

          </div>
        </div>
      ) : null}
    </StandardDrawer>
  );
}

function OrdersModule({ ordersState }: { ordersState?: "orders" | "empty" }) {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [sortBy, setSortBy] = useState<{
    column: string;
    direction: "asc" | "desc";
  }>({ column: "dateReceived", direction: "desc" });
  const [searchExternalId, setSearchExternalId] = useState("");
  const [searchOrderNumber, setSearchOrderNumber] = useState("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchContact, setSearchContact] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const filteredOrders = orders.filter((o) => {
    if (needsAttention && o.status !== "Failed" && o.status !== "On Hold")
      return false;
    if (
      searchExternalId &&
      !o.externalId.toLowerCase().includes(searchExternalId.toLowerCase())
    )
      return false;
    if (
      searchOrderNumber &&
      !o.id.toLowerCase().includes(searchOrderNumber.toLowerCase())
    )
      return false;
    if (
      searchCustomer &&
      !o.customer.toLowerCase().includes(searchCustomer.toLowerCase()) &&
      !o.customerId.toLowerCase().includes(searchCustomer.toLowerCase())
    )
      return false;
    if (
      searchContact &&
      !(
        o.contact?.name.toLowerCase().includes(searchContact.toLowerCase()) ||
        o.contact?.phone.toLowerCase().includes(searchContact.toLowerCase()) ||
        o.contact?.email.toLowerCase().includes(searchContact.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dir = sortBy.direction === "asc" ? 1 : -1;
    if (sortBy.column === "dateReceived") {
      return (
        (new Date(a.dateReceived).getTime() -
          new Date(b.dateReceived).getTime()) *
        dir
      );
    }
    if (sortBy.column === "externalId") {
      return a.externalId.localeCompare(b.externalId) * dir;
    }
    if (sortBy.column === "id") {
      return a.id.localeCompare(b.id) * dir;
    }
    if (sortBy.column === "contact") {
      const aContact = a.contact?.name || "";
      const bContact = b.contact?.name || "";
      return aContact.localeCompare(bContact) * dir;
    }
    if (sortBy.column === "customer") {
      return a.customer.localeCompare(b.customer) * dir;
    }
    if (sortBy.column === "customerId") {
      return a.customerId.localeCompare(b.customerId) * dir;
    }
    if (sortBy.column === "status") {
      return a.status.localeCompare(b.status) * dir;
    }
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy.column === column) {
      setSortBy({
        column,
        direction: sortBy.direction === "asc" ? "desc" : "asc",
      });
    } else {
      setSortBy({ column, direction: "desc" }); // default to desc for new columns
    }
  };

  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = sortedOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const renderSortIcon = (column: string) => {
    if (sortBy.column !== column) {
      return (
        <span className="material-symbols-outlined text-[14px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          unfold_more
        </span>
      );
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        {sortBy.direction === "asc"
          ? "keyboard_arrow_up"
          : "keyboard_arrow_down"}
      </span>
    );
  };

  return (
    <>
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-6 relative">
            <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
          </div>

          <div className="mb-6 flex items-center gap-3">
            <button
              onClick={() => setNeedsAttention(!needsAttention)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                needsAttention
                  ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${needsAttention ? "bg-red-500" : "bg-gray-400"}`}
              />
              Needs Attention
            </button>
          </div>

          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              External ID
            </label>
            <input
              type="text"
              value={searchExternalId}
              onChange={(e) => setSearchExternalId(e.target.value)}
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Order Number
            </label>
            <input
              type="text"
              value={searchOrderNumber}
              onChange={(e) => setSearchOrderNumber(e.target.value)}
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Customer
            </label>
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Name or ID"
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
          <div className="relative pt-2 mb-6">
            <label className="absolute top-0 left-2 bg-white px-1 text-xs text-gray-600 z-10">
              Contact
            </label>
            <input
              type="text"
              value={searchContact}
              onChange={(e) => setSearchContact(e.target.value)}
              placeholder="Name, Phone, or Email"
              className="w-full border border-gray-400 rounded-[3px] p-2.5 outline-none focus:border-primary bg-transparent text-sm"
            />
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 lg:h-full lg:min-h-0 flex flex-col overflow-y-auto scrollbar-none pb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col shrink-0">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
            <h2 className="text-lg font-semibold text-gray-800">Orders</h2>
          </div>
          {ordersState === "empty" ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <span className="sc-1xdthq8-2 ilDIBW mb-4 text-[#CDCDCD]">
                <svg viewBox="0 0 40 40" focusable="false" aria-hidden="true" height="40px" width="40px" color="currentColor" className="sc-14dq9fm-0 czVqFY">
                  <g fillRule="evenodd">
                    <path d="M39.3 13.5c-.7-1-1.8-1.6-3.1-1.6h-2.1l-6.3-10c-.4-.6-1.2-.8-1.8-.4s-.8 1.2-.4 1.8l5.4 8.6H9.2l5.4-8.6c.4-.6.2-1.4-.4-1.8s-1.4-.2-1.8.4L6 11.9H3.9c-1.2 0-2.3.6-3.1 1.6-.7 1-1 2.2-.7 3.3L4 35.5c.4 1.8 1.9 3 3.8 3.1h24.6c1.8 0 3.4-1.3 3.7-3.1l3.8-18.6c.3-1.2.1-2.4-.6-3.4m-2 2.7q0 .15 0 0l-3.8 18.7c-.1.6-.6 1-1.2 1H7.8c-.6 0-1.1-.4-1.2-1L2.8 16.3v-.1c-.1-.4 0-.8.2-1.1s.6-.5 1-.5h32.1c.4 0 .8.2 1 .5.3.3.4.7.2 1.1m-22.6 8.1c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m10.7 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2m-1.5 5.8h-7.7c-.7 0-1.3-.6-1.3-1.3s.6-1.3 1.3-1.3h7.7c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3" fill="inherit"></path>
                  </g>
                </svg>
              </span>
              <p className="text-gray-900 font-medium">No orders to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("externalId")}
                  >
                    <div className="flex items-center gap-1">
                      External ID
                      {renderSortIcon("externalId")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    <div className="flex items-center gap-1">
                      Order Number
                      {renderSortIcon("id")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("contact")}
                  >
                    <div className="flex items-center gap-1">
                      Contact
                      {renderSortIcon("contact")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("customer")}
                  >
                    <div className="flex items-center gap-1">
                      Customer
                      {renderSortIcon("customer")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("dateReceived")}
                  >
                    <div className="flex items-center gap-1">
                      Date received
                      {renderSortIcon("dateReceived")}
                    </div>
                  </th>
                  <th
                    className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider cursor-pointer hover:bg-gray-50 group transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {renderSortIcon("status")}
                    </div>
                  </th>
                  <th className="px-5 py-3 text-xs font-bold text-gray-900 uppercase tracking-wider w-24">Tracking</th>
                  <th className="px-5 py-3 w-12 border-l border-gray-200"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td
                      className="px-5 py-4 text-sm text-[var(--color-link-blue)] cursor-pointer hover:underline font-medium"
                      onClick={() => setSelectedOrderId(order.externalId)}
                    >
                      {order.externalId}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900 font-medium">
                      {order.id}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.contact?.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {order.customer}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {(() => {
                        const [y, m, d] = order.dateReceived.split("-");
                        return `${m}/${d}/${y.slice(-2)}`;
                      })()}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className={`inline-flex px-2 py-[2px] rounded text-xs font-medium border bg-white ${
                          order.status === "Shipped"
                            ? "border-green-600 text-green-700"
                            : order.status === "Processing"
                              ? "border-blue-600 text-blue-700"
                              : order.status === "Failed"
                                ? "border-red-600 text-red-700"
                                : order.status === "On Hold"
                                  ? "border-orange-600 text-orange-700"
                                  : order.status === "Delivered"
                                    ? "border-teal-600 text-teal-700"
                                    : "border-yellow-600 text-yellow-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900">
                      {(order.status === "Shipped" || order.status === "Delivered") && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setTrackingOrderId(order.id); }}
                          className="text-[var(--color-link-blue)] hover:underline font-medium"
                        >
                          Track
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-center border-l border-gray-100 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === order.externalId ? null : order.externalId); }}
                        className="text-gray-400 hover:text-gray-900"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {openMenuId === order.externalId && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                          <div className="absolute right-8 top-10 w-36 bg-white rounded-md shadow-lg border border-gray-200 z-20 py-1">
                            <button
                              onClick={() => { setOpenMenuId(null); setSelectedOrderId(order.externalId); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View details
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Pagination Controls */}
        {ordersState !== "empty" && (
          <div className="pt-6 pb-6 flex flex-col items-center gap-3">
            <div className="text-gray-900 text-sm text-center">
              Viewing <span className="font-bold">{sortedOrders.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, sortedOrders.length)}</span> of <span className="font-bold">{sortedOrders.length}</span> items
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-[26px] h-[26px] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center bg-white text-gray-400 hover:text-gray-900 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Previous Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <div className="flex items-center gap-2.5 mx-1">
                <span className="text-gray-900 text-sm">Page</span>
                <div className="relative">
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="appearance-none border border-gray-400 rounded text-gray-900 text-sm px-2 py-0.5 pr-7 focus:outline-none focus:ring-1 focus:ring-gray-400 bg-white"
                  >
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <option key={idx} value={idx + 1}>
                        {idx + 1}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-700 pointer-events-none text-[16px]">expand_more</span>
                </div>
                <span className="text-gray-900 text-sm">of {totalPages}</span>
              </div>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-[26px] h-[26px] rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center justify-center bg-white text-gray-700 hover:text-gray-900 hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Next Page"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <OrderDetailDrawer
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId}
        orderStatus={
          orders.find(
            (o) => o.id === selectedOrderId || o.externalId === selectedOrderId,
          )?.status || null
        }
      />
      <TrackingDrawer
        isOpen={!!trackingOrderId}
        onClose={() => setTrackingOrderId(null)}
        orderId={trackingOrderId}
      />
    </>
  );
}

function ComponentsModule() {
  const [activeTab, setActiveTab] = useState(COMPONENT_OPTIONS[0]);
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [finishedSizes, setFinishedSizes] = useFirestoreSync(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [finishingOptions, setFinishingOptions] = useFirestoreSync(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [selectedFinishingOption, setSelectedFinishingOption] =
    useState<FinishingOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [mediaCatalog, setMediaCatalog] = useFirestoreSync(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [selectedMedia, setSelectedMedia] = useState<MediaCatalogEntry | null>(
    null,
  );
  const [colors, setColors] = useFirestoreSync(
    "appData",
    "colors",
    INITIAL_COLORS,
  );
  const [impressions, setImpressions] = useFirestoreSync(
    "appData",
    "impressions",
    INITIAL_IMPRESSIONS,
  );
  const [selectedImpression, setSelectedImpression] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [mediaColors, setMediaColors] = useState([
    { id: crypto.randomUUID(), hex: "#bae1ff", name: "Blue", key: "BLU" },
    { id: crypto.randomUUID(), hex: "#fdfd96", name: "Canary", key: "CAN" },
  ]);
  const [isColorKeysDrawerOpen, setIsColorKeysDrawerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reviewImportData, setReviewImportData] = useState<any[] | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseImportedXLSX(file);
      setReviewImportData(data);
    } catch (err) {
      alert("Failed to parse XLSX file");
    }
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!reviewImportData) return;
    if (activeTab.id === "finished-sizes") {
      const parsed = reviewImportData.map((row) => ({
        id: row.ID || crypto.randomUUID(),
        name: row.Name,
        key: row.Key,
        widthIn: Number(row["Width (Inches)"]) || 0,
        heightIn: Number(row["Height (Inches)"]) || 0,
        widthPt: (Number(row["Width (Inches)"]) || 0) * 72,
        heightPt: (Number(row["Height (Inches)"]) || 0) * 72,
        description: row.Description || "",
        productionTypes: [
          String(row["Cut Sheet"]).toUpperCase() === "TRUE" ? "cutSheet" : null,
          String(row["WF Roll"]).toUpperCase() === "TRUE"
            ? "wideFormatRoll"
            : null,
          String(row["WF Rigid"]).toUpperCase() === "TRUE"
            ? "wideFormatRigid"
            : null,
        ].filter(Boolean),
      }));
      setFinishedSizes((prev) => {
        const next = [...prev];
        parsed.forEach((p) => {
          const idx = next.findIndex((x) => x.id === p.id);
          if (idx >= 0) next[idx] = { ...next[idx], ...p };
          else next.push(p);
        });
        return next;
      });
    } else if (activeTab.id === "media") {
      const parsed = reviewImportData.map((row) => ({
        id: row.ID || crypto.randomUUID(),
        displayName: row["Display Name"] || "",
        internalName: row["Internal Name"] || "",
        key: row.Key || "",
        lbs: row.LBS || "",
        gsm: row.GSM || "",
        pt: row.PT || "",
        caliper: row.Caliper || "",
        productionType: (row["Production Type"] === "Cut Sheet"
          ? "cutSheet"
          : row["Production Type"] === "WF Roll"
            ? "wideFormatRoll"
            : "wideFormatRigid") as
          | "cutSheet"
          | "wideFormatRoll"
          | "wideFormatRigid",
        compatibleFinishedSizes: [],
      }));
      setMediaCatalog((prev) => {
        const next = [...prev];
        parsed.forEach((p) => {
          const idx = next.findIndex((x) => x.id === p.id);
          if (idx >= 0) next[idx] = { ...next[idx], ...p };
          else next.push(p);
        });
        return next;
      });
    }
    setReviewImportData(null);
  };

  return (
    <>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      {reviewImportData && (
        <StandardModal
          isOpen={true}
          onClose={() => setReviewImportData(null)}
          title={`Review Import: ${activeTab.title}`}
          primaryAction={{ label: "Confirm Import", onClick: confirmImport }}
          secondaryAction={{
            label: "Cancel",
            onClick: () => setReviewImportData(null),
          }}
          fullScreen={false}
        >
          <div className="p-6">
            <p className="mb-4 text-gray-700">
              You are about to import <strong>{reviewImportData.length}</strong>{" "}
              records into {activeTab.title}. This will merge and overwrite
              existing rows with matching IDs.
            </p>
            <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-100 sticky top-0 border-b border-gray-200 z-10">
                  <tr>
                    {Object.keys(reviewImportData[0] || {}).map((k) => (
                      <th
                        key={k}
                        className="p-3 font-semibold text-gray-800 border-r last:border-0 border-gray-200"
                      >
                        {k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {reviewImportData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      {Object.values(row).map((v: any, j) => (
                        <td
                          key={j}
                          className="p-3 border-r last:border-0 border-gray-100 truncate max-w-[200px] text-gray-600"
                        >
                          {String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {reviewImportData.length > 50 && (
                    <tr>
                      <td
                        colSpan={Object.keys(reviewImportData[0] || {}).length}
                        className="p-4 text-center text-gray-500 font-medium bg-gray-50 italic"
                      >
                        ...and {reviewImportData.length - 50} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </StandardModal>
      )}
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0 lg:h-full lg:overflow-y-auto lg:pr-2 lg:-mr-2 scrollbar-none pb-8">
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Library</h2>
          <div className="flex flex-col gap-3">
            {COMPONENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setActiveTab(option)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  activeTab.id === option.id
                    ? "border-primary bg-[#f0f7ff] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {typeof option.icon === "string" ? (
                  <span className="material-symbols-outlined text-[24px] text-[#cc0000]">
                    {option.icon}
                  </span>
                ) : (
                  <span className="flex items-center text-[#cc0000] justify-center w-[24px] h-[24px]">
                    {option.icon}
                  </span>
                )}
                <span className="font-semibold text-gray-800 text-sm">
                  {option.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-12 lg:col-span-9 lg:h-full lg:min-h-0 flex flex-col gap-6 overflow-y-auto scrollbar-none pb-8">
        {activeTab.id === "impressions" ? (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Colors</h2>
                <div className="flex items-center gap-3">
                  <TableActionMenu
                    actions={[
                      { label: "Import", icon: "upload" },
                      { label: "Export", icon: "download" },
                      {
                        label: "Add color",
                        icon: "add",
                        variant: "primary",
                        onClick: () => {
                          setSelectedColor({
                            id: crypto.randomUUID(),
                            name: "",
                            productionTypes: [],
                          });
                        },
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Key
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Production Types
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {colors.map((color, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedColor(color)}
                            className="text-[#cc0000] hover:underline font-semibold"
                          >
                            {color.name}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {color.key || "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {color.productionTypes.map((pt: string) => (
                              <span
                                key={pt}
                                className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200"
                              >
                                {productionTypes.find((t) => t.id === pt)
                                  ?.name || pt}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 shrink-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Impressions</h2>
                <div className="flex items-center gap-3">
                  <TableActionMenu
                    actions={[
                      { label: "Import", icon: "upload" },
                      { label: "Export", icon: "download" },
                      {
                        label: "Add impression",
                        icon: "add",
                        variant: "primary",
                        onClick: () => {
                          setSelectedImpression({
                            id: crypto.randomUUID(),
                            name: "",
                            productionTypes: [],
                          });
                        },
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Name
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Key
                      </th>
                      <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                        Production Types
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {impressions.map((impression, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedImpression(impression)}
                            className="text-[#cc0000] hover:underline font-semibold"
                          >
                            {impression.name}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {impression.key || "-"}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          <div className="flex flex-wrap gap-1">
                            {impression.productionTypes.map((pt: string) => (
                              <span
                                key={pt}
                                className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200"
                              >
                                {productionTypes.find((t) => t.id === pt)
                                  ?.name || pt}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col h-full lg:min-h-0 shrink-0 lg:shrink">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {activeTab.title}
              </h2>
              {(activeTab.id === "finished-sizes" ||
                activeTab.id === "media" ||
                activeTab.id === "finishing-options") && (
                <div className="flex items-center gap-3">
                  {activeTab.id === "media" && (
                    <button
                      onClick={() => setIsColorKeysDrawerOpen(true)}
                      className="px-4 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        palette
                      </span>
                      Colors
                    </button>
                  )}
                  <TableActionMenu
                    actions={[
                      {
                        label: "Import",
                        icon: "upload",
                        onClick: handleImportClick,
                      },
                      {
                        label: "Export",
                        icon: "download",
                        onClick: () => {
                          if (activeTab.id === "media") {
                            exportMediaToXLSX(mediaCatalog);
                          } else if (activeTab.id === "finished-sizes") {
                            exportFinishedSizesToXLSX(finishedSizes);
                          }
                        },
                      },
                      {
                        label: `Add ${activeTab.id === "media" ? "media" : activeTab.id === "finished-sizes" ? "size" : "option"}`,
                        icon: "add",
                        variant: "primary",
                        onClick: () => {
                          if (activeTab.id === "media") {
                            const compatibleList = finishedSizes.filter((fs) =>
                              fs.productionTypes?.includes("cutSheet"),
                            );
                            const defaultSizeId =
                              compatibleList.length > 0
                                ? compatibleList[0].id
                                : "";
                            setSelectedMedia({
                              id: crypto.randomUUID(),
                              displayName: "",
                              internalName: "",
                              lbs: "",
                              gsm: "",
                              pt: "",
                              caliper: "",
                              productionType: "cutSheet",
                              compatibleFinishedSizes: defaultSizeId
                                ? [
                                    {
                                      finishedSizeId: defaultSizeId,
                                      colors: ["#ffffff"],
                                    },
                                  ]
                                : [],
                            });
                          } else if (activeTab.id === "finished-sizes") {
                            setSelectedSize({
                              id: crypto.randomUUID(),
                              name: "",
                              widthIn: "",
                              heightIn: "",
                              widthPt: 0,
                              heightPt: 0,
                              description: "",
                              productionTypes: [],
                            });
                          } else if (activeTab.id === "finishing-options") {
                            setSelectedFinishingOption({
                              id: crypto.randomUUID(),
                              name: "",
                              key: "",
                              description: "",
                              productionTypes: [],
                            });
                          }
                        },
                      },
                    ]}
                  />
                </div>
              )}
            </div>

            <div className="overflow-y-auto overflow-x-hidden min-h-0 flex-1">
              {activeTab.id === "finished-sizes" && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Key
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Dimensions
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                          Description
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Production Types
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {finishedSizes.map((size, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedSize(size)}
                              className="text-[#cc0000] hover:underline font-semibold"
                            >
                              {size.name}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {size.key || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {size.widthIn}" × {size.heightIn}"
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {size.description}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {size.productionTypes.map((pt) => (
                                <span
                                  key={pt}
                                  className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200"
                                >
                                  {productionTypes.find((t) => t.id === pt)
                                    ?.name || pt}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab.id === "media" && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Key
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Stock
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Type
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                          Sizes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mediaCatalog.map((media, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedMedia(media)}
                              className="text-[#cc0000] hover:underline font-semibold"
                            >
                              {media.displayName}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {media.key || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {media.internalName}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {productionTypes.find(
                              (t) => t.id === media.productionType,
                            )?.name || media.productionType}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {media.compatibleFinishedSizes.map((cs) => {
                                const size = finishedSizes.find(
                                  (fs) => fs.id === cs.finishedSizeId,
                                );
                                if (!size) return null;
                                return (
                                  <span
                                    key={cs.finishedSizeId}
                                    className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200"
                                  >
                                    {size.name}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab.id === "finishing-options" && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-gray-200">
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Name
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Key
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                          Description
                        </th>
                        <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          Production Types
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {finishingOptions.map((option, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedFinishingOption(option)}
                              className="text-[#cc0000] hover:underline font-semibold"
                            >
                              {option.name}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                            {option.key || "-"}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {option.description}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">
                            <div className="flex flex-wrap gap-1">
                              {option.productionTypes.map((pt) => (
                                <span
                                  key={pt}
                                  className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200"
                                >
                                  {productionTypes.find((t) => t.id === pt)
                                    ?.name || pt}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ColorDetailDrawer
        selectedColor={selectedColor}
        onClose={() => setSelectedColor(null)}
        onSave={(updated) => {
          setColors((prev) => {
            const exists = prev.find((c) => c.id === updated.id);
            if (exists) {
              return prev.map((c) => (c.id === updated.id ? updated : c));
            }
            return [...prev, updated];
          });
          setSelectedColor(null);
        }}
        isNew={
          selectedColor ? !colors.find((c) => c.id === selectedColor.id) : false
        }
        colors={colors}
      />
      <ImpressionDetailDrawer
        selectedImpression={selectedImpression}
        onClose={() => setSelectedImpression(null)}
        onSave={(updated) => {
          setImpressions((prev) => {
            const exists = prev.find((i) => i.id === updated.id);
            if (exists) {
              return prev.map((i) => (i.id === updated.id ? updated : i));
            }
            return [...prev, updated];
          });
          setSelectedImpression(null);
        }}
        isNew={
          selectedImpression
            ? !impressions.find((i) => i.id === selectedImpression.id)
            : false
        }
        impressions={impressions}
      />
      <FinishingOptionDetailDrawer
        selectedOption={selectedFinishingOption}
        onClose={() => setSelectedFinishingOption(null)}
        onSave={(updated) => {
          setFinishingOptions((prev) => {
            const exists = prev.find((o) => o.id === updated.id);
            if (exists)
              return prev.map((o) => (o.id === updated.id ? updated : o));
            return [...prev, updated];
          });
          setSelectedFinishingOption(null);
        }}
        isNew={
          selectedFinishingOption
            ? !finishingOptions.find((o) => o.id === selectedFinishingOption.id)
            : false
        }
      />
      <FinishedSizeDetailDrawer
        selectedSize={selectedSize}
        onClose={() => setSelectedSize(null)}
        onSave={(updated) => {
          setFinishedSizes((prev) => {
            const exists = prev.find((s) => s.id === updated.id);
            if (exists) {
              return prev.map((s) => (s.id === updated.id ? updated : s));
            }
            return [...prev, updated];
          });
          setSelectedSize(null);
        }}
        isNew={
          selectedSize
            ? !finishedSizes.find((s) => s.id === selectedSize.id)
            : false
        }
      />
      <MediaDetailDrawer
        selectedMedia={selectedMedia}
        onClose={() => setSelectedMedia(null)}
        onSave={(updated) => {
          setMediaCatalog((prev) => {
            const exists = prev.find((m) => m.id === updated.id);
            if (exists) {
              return prev.map((m) => (m.id === updated.id ? updated : m));
            }
            return [...prev, updated];
          });
          setSelectedMedia(null);
        }}
        finishedSizes={finishedSizes}
        isNew={
          selectedMedia
            ? !mediaCatalog.find((m) => m.id === selectedMedia.id)
            : false
        }
        mediaCatalog={mediaCatalog}
      />
      <MediaColorKeysDrawer
        isOpen={isColorKeysDrawerOpen}
        onClose={() => setIsColorKeysDrawerOpen(false)}
        mediaColors={mediaColors}
        onSave={(updated) => {
          setMediaColors(updated);
          setIsColorKeysDrawerOpen(false);
        }}
      />
    </>
  );
}

export function StandardModal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  danger = false,
  maxWidth = "max-w-sm",
  fullScreen = false,
  icon,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  danger?: boolean;
  maxWidth?: string;
  fullScreen?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center ${fullScreen ? "" : "p-4"}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fullScreen ? undefined : onClose}
            className={`absolute inset-0 ${fullScreen ? "bg-white" : "bg-black/30 backdrop-blur-sm"}`}
          />
          <motion.div
            initial={
              fullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }
            }
            animate={
              fullScreen ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              fullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }
            }
            className={`relative w-full ${fullScreen ? "h-full rounded-none" : `${maxWidth} rounded-xl shadow-xl`} bg-white overflow-hidden flex flex-col`}
          >
            <div
              className={`shrink-0 flex ${fullScreen ? "h-[72px] items-center justify-center px-4 border-b border-[#969696]" : "items-start px-5 pt-5 pb-2 gap-4"} bg-white relative`}
            >
              {icon && !fullScreen && (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${danger ? "bg-red-100 text-[#cc0000]" : "bg-gray-100 text-gray-600"}`}
                >
                  {icon}
                </div>
              )}
              <div
                className={
                  fullScreen
                    ? "flex items-center justify-center h-full"
                    : "flex-1 pt-1"
                }
              >
                {fullScreen ? (
                  <h2 className="text-lg font-semibold flex items-center h-full m-0 min-w-[120px] justify-center text-gray-900">
                    {title}
                  </h2>
                ) : (
                  <h3 className="text-lg font-bold text-gray-900 mx-0 mb-1">
                    {title}
                  </h3>
                )}
              </div>
              {fullScreen && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-2xl">
                    close
                  </span>
                </button>
              )}
            </div>

            <div
              className={`flex-1 ${fullScreen ? "bg-gray-50 flex flex-col min-h-0" : "overflow-auto px-5 pb-6 pt-1"}`}
            >
              {!fullScreen && typeof children === "string" ? (
                <div
                  className={`text-sm text-gray-600 leading-relaxed ${icon ? "ml-14" : ""}`}
                >
                  {children}
                </div>
              ) : !fullScreen && icon ? (
                <div className="ml-14">{children}</div>
              ) : (
                children
              )}
            </div>

            {(primaryAction || secondaryAction) && (
              <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 shrink-0 border-t border-gray-200">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-[20px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {secondaryAction.label}
                  </button>
                )}
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-[20px] transition-colors shadow-sm disabled:opacity-50 ${danger ? "bg-[#cc0000] hover:bg-[#a30000]" : "bg-primary hover:bg-primary-dark"}`}
                  >
                    {primaryAction.label}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function TableActionMenu({
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

function OrderDetailDrawer({
  isOpen,
  onClose,
  orderId,
  orderStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  orderStatus?: string | null;
}) {
  const canEditShipping = orderStatus === "Failed" || orderStatus === "On Hold";
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [searchShipToId, setSearchShipToId] = useState("");
  const [searchAddress1, setSearchAddress1] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");

  const [shippingResults, setShippingResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const mockShipToResults = [
    { id: "SHIP-002", address1: "15 Broad St", city: "Nashville", state: "TN" },
    {
      id: "SHIP-003",
      address1: "20 Central Ave",
      city: "Nashville",
      state: "TN",
    },
    { id: "SHIP-004", address1: "123 Elm St", city: "Denver", state: "CO" },
    { id: "SHIP-005", address1: "444 Poplar Rd", city: "Denver", state: "CO" },
    { id: "SHIP-006", address1: "555 Cedar Ln", city: "Denver", state: "CO" },
    { id: "SHIP-007", address1: "666 Pine St", city: "Chicago", state: "IL" },
  ];

  const handleSearchShipping = () => {
    let results = mockShipToResults;
    if (searchShipToId)
      results = results.filter((r) =>
        r.id.toLowerCase().includes(searchShipToId.toLowerCase()),
      );
    if (searchAddress1)
      results = results.filter((r) =>
        r.address1.toLowerCase().includes(searchAddress1.toLowerCase()),
      );
    if (searchCity)
      results = results.filter((r) =>
        r.city.toLowerCase().includes(searchCity.toLowerCase()),
      );
    if (searchState)
      results = results.filter((r) =>
        r.state.toLowerCase().includes(searchState.toLowerCase()),
      );
    setShippingResults(results);
    setHasSearched(true);
  };

  const handleSelectShipTo = (val: any) => {
    setIsEditingShipping(false);
    setHasSearched(false);
    // Visual update logic or callback could go here
  };

  const cancelEdit = () => {
    setIsEditingShipping(false);
    setHasSearched(false);
    setSearchShipToId("");
    setSearchAddress1("");
    setSearchCity("");
    setSearchState("");
  };

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [searchContactType, setSearchContactType] = useState("lastName");
  const [searchContactValue, setSearchContactValue] = useState("");
  const [contactResults, setContactResults] = useState<any[]>([]);
  const [hasSearchedContact, setHasSearchedContact] = useState(false);

  const mockContactResults = [
    {
      userId: "mary123",
      firstName: "Mary",
      lastName: "Smith",
      email: "mary.smith@email.null",
      phone: "5557106075",
    },
    {
      userId: "jsmith",
      firstName: "John",
      lastName: "Smith",
      email: "john@email.null",
      phone: "5551234567",
    },
    {
      userId: "asmith",
      firstName: "Alice",
      lastName: "Smith",
      email: "alice@email.null",
      phone: "5559876543",
    },
    {
      userId: "bjohnson",
      firstName: "Bob",
      lastName: "Johnson",
      email: "bjohnson@email.null",
      phone: "5554567890",
    },
    {
      userId: "csmith",
      firstName: "Charlie",
      lastName: "Smith",
      email: "csmith@email.null",
      phone: "5553334444",
    },
  ];

  const handleSearchContact = () => {
    let results = mockContactResults;
    if (searchContactValue) {
      const val = searchContactValue.toLowerCase();
      if (searchContactType === "lastName") {
        results = results.filter((r) => r.lastName.toLowerCase().includes(val));
      } else if (searchContactType === "userId") {
        results = results.filter((r) => r.userId.toLowerCase().includes(val));
      } else if (searchContactType === "email") {
        results = results.filter((r) => r.email.toLowerCase().includes(val));
      }
    }
    setContactResults(results);
    setHasSearchedContact(true);
  };

  const handleSelectContact = (val: any) => {
    setIsEditingContact(false);
    setHasSearchedContact(false);
  };

  const cancelEditContact = () => {
    setIsEditingContact(false);
    setHasSearchedContact(false);
    setSearchContactValue("");
  };

  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [budgetCenter, setBudgetCenter] = useState("3456");
  const [purchaseOrder, setPurchaseOrder] = useState("3456");
  const [draftBudgetCenter, setDraftBudgetCenter] = useState("");
  const [draftPurchaseOrder, setDraftPurchaseOrder] = useState("");

  const handleEditBilling = () => {
    setDraftBudgetCenter(budgetCenter);
    setDraftPurchaseOrder(purchaseOrder);
    setIsEditingBilling(true);
  };

  const handleSaveBilling = () => {
    setBudgetCenter(draftBudgetCenter);
    setPurchaseOrder(draftPurchaseOrder);
    setIsEditingBilling(false);
  };

  const cancelEditBilling = () => {
    setIsEditingBilling(false);
  };

  const MOCK_DATA = {
    mappedOrderId: "760124891",
    externalOrderId: "HCA-155035",
    orderName: "Staples test 4",
    customer: "HCA",
    customerId: "12345678",
    contact: {
      userId: "mary123",
      firstName: "Mary",
      lastName: "Smith",
      phone: "5557106075",
      email: "mary.smith@email.null",
    },
    shipping: {
      shippingId: "SHIP-001",
      name: "work",
      divisionName: "Corporate",
      streetAddressOne: "10 Main Street",
      city: "Nashville",
      state: "TN",
      postalCode: "37206",
    },
    billing: {
      billingId: "BILL-001",
      hcaCOID: "11111",
      userId: "CYO2222",
      departmentNumber: "",
      budgetCenter: budgetCenter,
      purchaseOrder: purchaseOrder,
    },
    items: [
      {
        itemId: "550e8400-e29b-41d4-a716-446655440000",
        itemName: "XYZ Healthcare Business Card",
        itemType: "Template Instance",
        quantity: 500,
        jobTicketTemplateName: "MW_XYZMKT_BC_2S_3-5x2_130CSSC_BLEED",
        productConfigSKU: "203070",
        fileUrl: "https://example.com/file.pdf",
      },
    ],
  };

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details`}
      customWidth="w-[95vw] lg:w-[940px]"
      footer={
        canEditShipping ? (
          <div className="w-full flex justify-start">
            <button
              onClick={() => {
                // Resubmit logic
                onClose();
              }}
              className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
            >
              Resubmit
            </button>
          </div>
        ) : undefined
      }
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-8 border-b border-gray-200 pb-2">
          <h2 className="text-lg font-semibold text-gray-900 col-span-1">
            Received
          </h2>
          <h2 className="text-lg font-semibold text-gray-900 col-span-2">
            Mapped
          </h2>
        </div>

        {/* Row: Order Info */}
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col gap-4 col-span-1">
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Order Name
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.orderName}
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">
                External Order ID
              </span>
              <span className="block text-sm text-gray-900">
                {orderId || MOCK_DATA.externalOrderId}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-4 col-span-2">
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Customer
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.customer} ({MOCK_DATA.customerId})
              </span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-500">
                Order ID
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.mappedOrderId}
              </span>
            </div>
          </div>
        </div>

        {/* Row: Contact */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Contact
              </h3>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.firstName} {MOCK_DATA.contact.lastName}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.phone}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.contact.email}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7">
                <span className="block text-sm font-medium text-gray-500">
                  UserID
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-900">
                  {MOCK_DATA.contact.userId}
                  {canEditShipping && (
                    <button
                      onClick={() => setIsEditingContact(true)}
                      className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingContact ? 'invisible pointer-events-none' : ''}`}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {isEditingContact && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Search User
              </h4>
              <div className="flex items-end gap-4 mb-4">
                <div className="w-1/3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search By
                  </label>
                  <select
                    value={searchContactType}
                    onChange={(e) => setSearchContactType(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  >
                    <option value="lastName">Last Name</option>
                    <option value="userId">User ID</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="w-2/3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Search Value
                  </label>
                  <input
                    type="text"
                    value={searchContactValue}
                    onChange={(e) => setSearchContactValue(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSearchContact}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Search
                </button>
                <button
                  onClick={cancelEditContact}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>

              {hasSearchedContact && (
                <div className="overflow-x-auto border border-gray-200 rounded max-h-[220px]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          User ID
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          First Name
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Last Name
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {contactResults.length > 0 ? (
                        contactResults.map((r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/50 transition cursor-pointer"
                            onClick={() => handleSelectContact(r)}
                          >
                            <td className="py-2 px-3 text-[var(--color-link-blue)] hover:underline font-medium">
                              {r.userId}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.firstName}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.lastName}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.email}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-gray-500"
                          >
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row: Shipping */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Shipping
              </h3>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.name} - {MOCK_DATA.shipping.divisionName}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.streetAddressOne}
              </span>
              <span className="block text-sm text-gray-900">
                {MOCK_DATA.shipping.city}, {MOCK_DATA.shipping.state}{" "}
                {MOCK_DATA.shipping.postalCode}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7">
                <span className="block text-sm font-medium text-gray-500">
                  Ship To ID
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-900">
                  {MOCK_DATA.shipping.shippingId}
                  {canEditShipping && (
                    <button
                      onClick={() => setIsEditingShipping(true)}
                      className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingShipping ? 'invisible pointer-events-none' : ''}`}
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        edit
                      </span>
                    </button>
                  )}
                </span>
              </div>
            </div>
          </div>

          {isEditingShipping && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Search Ship To ID
              </h4>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Ship-To ID
                  </label>
                  <input
                    type="text"
                    value={searchShipToId}
                    onChange={(e) => setSearchShipToId(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={searchAddress1}
                    onChange={(e) => setSearchAddress1(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={searchState}
                    onChange={(e) => setSearchState(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleSearchShipping}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Search
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>

              {hasSearched && (
                <div className="overflow-x-auto border border-gray-200 rounded max-h-[220px]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="sticky top-0 bg-gray-100 z-10">
                      <tr>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Ship-To ID
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          Address Line 1
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          City
                        </th>
                        <th className="py-2 px-3 font-semibold text-gray-700 border-b">
                          State
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {shippingResults.length > 0 ? (
                        shippingResults.map((r, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50/50 transition cursor-pointer"
                            onClick={() => handleSelectShipTo(r)}
                          >
                            <td className="py-2 px-3 text-[var(--color-link-blue)] hover:underline font-medium">
                              {r.id}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.address1}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.city}
                            </td>
                            <td className="py-2 px-3 text-gray-800">
                              {r.state}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-gray-500"
                          >
                            No results found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row: Billing */}
        <div className="flex flex-col gap-4 border-t border-gray-100 pt-3 mt-3">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-1">
              <h3 className="text-md font-semibold text-gray-900 mb-2">
                Billing
              </h3>
              <span className="block text-sm text-gray-900">
                HCA COID: {MOCK_DATA.billing.hcaCOID}
              </span>
              <span className="block text-sm text-gray-900">
                User ID: {MOCK_DATA.billing.userId}
              </span>
            </div>
            <div className="col-span-2">
              <div className="mt-7 grid grid-cols-3 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Bill To ID
                  </span>
                  <span className="block text-sm text-gray-900">
                    {MOCK_DATA.billing.billingId}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Budget Center
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-900">
                    {MOCK_DATA.billing.budgetCenter}
                    {canEditShipping && (
                      <button
                        onClick={handleEditBilling}
                        className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingBilling ? 'invisible pointer-events-none' : ''}`}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          edit
                        </span>
                      </button>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-500">
                    Purchase Order
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-900">
                    {MOCK_DATA.billing.purchaseOrder}
                    {canEditShipping && (
                      <button
                        onClick={handleEditBilling}
                        className={`text-gray-400 hover:text-gray-700 transition-colors p-1 flex items-center justify-center ${isEditingBilling ? 'invisible pointer-events-none' : ''}`}
                        title="Edit"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          edit
                        </span>
                      </button>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {isEditingBilling && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Edit Billing Info
              </h4>
              <div className="flex gap-4 mb-4">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Budget Center
                  </label>
                  <input
                    type="text"
                    value={draftBudgetCenter}
                    onChange={(e) => setDraftBudgetCenter(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Purchase Order
                  </label>
                  <input
                    type="text"
                    value={draftPurchaseOrder}
                    onChange={(e) => setDraftPurchaseOrder(e.target.value)}
                    className="w-full border border-gray-300 bg-white rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveBilling}
                  className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary/90 transition-all shadow-sm"
                >
                  Save
                </button>
                <button
                  onClick={cancelEditBilling}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="border-t border-gray-100 pt-4 mt-4 mb-2">
          <h3 className="text-md font-semibold text-gray-900 mb-3">Items</h3>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    ExternalID
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    QTY
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    File
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    Item ID / SKU
                  </th>
                  <th className="py-2.5 px-4 text-sm font-semibold text-gray-700">
                    Specs
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {MOCK_DATA.items.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-sm text-gray-900">
                      {item.jobTicketTemplateName}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-medium text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-4 text-sm">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-link-blue)] hover:underline font-medium"
                      >
                        View
                      </a>
                    </td>
                    <td className="py-2.5 px-4 text-sm text-gray-600">
                      {item.productConfigSKU}
                    </td>
                    <td className="py-2.5 px-4 text-sm text-gray-900 font-mono">
                      {item.itemId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}

function StandardDrawer({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  hasChanges,
  saveDisabled,
  saveLabel = "Save Changes",
  customWidth = "w-[95vw] lg:w-[600px]",
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  hasChanges?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
  customWidth?: string;
  footer?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[75539]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [1, 0.01, 0.01, 1] }}
            className={`fixed right-0 top-0 h-full ${customWidth} bg-white text-black z-[75540] flex flex-col rounded-l-[3px] shadow-[0_0_6px_rgba(156,156,156,0.7)]`}
          >
            <div className="h-[72px] pt-2 shrink-0 flex items-center justify-center relative bg-white border-b border-[#969696] px-4">
              <h2 className="text-lg font-semibold flex items-center h-full m-0 justify-center">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="absolute right-4 top-[calc(50%+4px)] -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto w-full">
              {children}
            </div>

            {footer ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  bottom: "0px",
                  borderRadius: "0px",
                  boxShadow: "rgba(156, 156, 156, 0.7) 0px 0px 6px",
                  height: "auto",
                  padding: "12px 24px",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 9,
                  background: "rgb(255, 255, 255)",
                }}
                className="items-center shrink-0"
              >
                {footer}
              </div>
            ) : onSave ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  bottom: "0px",
                  borderRadius: "0px",
                  boxShadow: "rgba(156, 156, 156, 0.7) 0px 0px 6px",
                  height: "auto",
                  padding: "12px 24px",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 9,
                  background: "rgb(255, 255, 255)",
                }}
                className="items-center shrink-0"
              >
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={hasChanges === false || saveDisabled === true}
                  className="px-6 py-2 ml-3 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
                >
                  {saveLabel}
                </button>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MediaColorKeysDrawer({
  isOpen,
  onClose,
  onSave,
  mediaColors,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (colors: any[]) => void;
  mediaColors: any[];
}) {
  const [formData, setFormData] = useState<any[]>(mediaColors);

  useEffect(() => {
    if (isOpen) setFormData(mediaColors);
  }, [isOpen, mediaColors]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(mediaColors);
  const isValid = formData.every((c) => c.name.trim() !== "");

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => onSave(formData)}
      title="Colors"
      hasChanges={hasChanges}
      saveLabel="Save Updates"
      saveDisabled={!isValid}
    >
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Media Colors
            </h3>
            <div className="flex items-center gap-2">
              <TableActionMenu
                actions={[
                  { label: "Import", icon: "upload" },
                  { label: "Export", icon: "download" },
                  {
                    label: "Add",
                    icon: "add",
                    variant: "primary",
                    onClick: () =>
                      setFormData([
                        ...formData,
                        {
                          id: crypto.randomUUID(),
                          hex: "#000000",
                          name: "",
                          key: "",
                        },
                      ]),
                  },
                ]}
              />
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-6">
            Configure default suffix keys for media colors globally across all
            products. <br />
            <br />
            This key will be appended to the end of a media type's base key. For
            instance, if 20lb Pastel is keyed "20P" and Canary is keyed "CAN",
            selecting Canary will output "20PCAN".
          </p>

          <div className="flex flex-col gap-3">
            {/* Hardcoded default White color */}
            <div className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 bg-gray-50 opacity-70">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded border border-gray-200 shadow-sm bg-white"></div>
              </div>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                value="White"
                disabled
              />
              <input
                type="text"
                className="w-24 px-3 py-2 border border-gray-300 rounded text-sm text-center bg-gray-100 text-gray-500 cursor-not-allowed"
                value="-"
                disabled
              />
              <div className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-[18px]">
                  lock
                </span>
              </div>
            </div>

            {formData.map((color, index) => (
              <div
                key={color.id}
                className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 bg-white"
              >
                <div className="flex items-center gap-2 shrink-0 group relative cursor-pointer">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const newData = [...formData];
                      newData[index].hex = e.target.value;
                      setFormData(newData);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Color Name *"
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white ${
                      !color.name.trim() ? "border-red-400" : "border-gray-300"
                    }`}
                    value={color.name}
                    onChange={(e) => {
                      const newData = [...formData];
                      newData[index].name = e.target.value;
                      setFormData(newData);
                    }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Key"
                  className="w-24 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-center uppercase bg-white"
                  value={color.key}
                  onChange={(e) => {
                    const newData = [...formData];
                    newData[index].key = e.target.value;
                    setFormData(newData);
                  }}
                />

                <button
                  onClick={() => {
                    const newData = [...formData];
                    newData.splice(index, 1);
                    setFormData(newData);
                  }}
                  className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 rounded bg-white hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}

function MediaDetailDrawer({
  selectedMedia,
  onClose,
  onSave,
  finishedSizes,
  isNew = false,
  mediaCatalog,
}: {
  selectedMedia: MediaCatalogEntry | null;
  onClose: () => void;
  onSave: (media: MediaCatalogEntry) => void;
  finishedSizes: any[];
  isNew?: boolean;
  mediaCatalog: MediaCatalogEntry[];
}) {
  const [formData, setFormData] = useState<MediaCatalogEntry | null>(
    selectedMedia,
  );
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [pendingProductionType, setPendingProductionType] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (selectedMedia) setFormData(selectedMedia);
    setPendingProductionType(null);
  }, [selectedMedia]);

  const hasChanges =
    selectedMedia &&
    formData &&
    JSON.stringify(formData) !== JSON.stringify(selectedMedia);

  const duplicateSizeIds =
    formData?.compatibleFinishedSizes
      .filter(
        (s, index, self) =>
          self.findIndex((t) => t.finishedSizeId === s.finishedSizeId) !==
          index,
      )
      .map((s) => s.finishedSizeId) || [];

  const hasDuplicates = duplicateSizeIds.length > 0;

  const isNameUnique = formData
    ? !mediaCatalog.find(
        (m) =>
          m.id !== formData.id &&
          m.displayName.trim().toLowerCase() ===
            formData.displayName.trim().toLowerCase(),
      )
    : true;
  const isNameValid = formData
    ? formData.displayName.trim() !== "" && isNameUnique
    : false;
  const hasCompatibleSizes = formData
    ? formData.compatibleFinishedSizes.length > 0
    : false;

  const disableSave = hasDuplicates || !isNameValid || !hasCompatibleSizes;

  const handleProductionTypeChange = (newType: string) => {
    if (!formData) return;
    if (formData.compatibleFinishedSizes.length > 0) {
      setPendingProductionType(newType);
    } else {
      setFormData({ ...formData, productionType: newType });
    }
  };

  const confirmProductionTypeChange = () => {
    if (!formData || !pendingProductionType) return;

    // Automatically pre-populate with a single valid size if possible
    const compatibleList = finishedSizes.filter((fs) =>
      fs.productionTypes?.includes(pendingProductionType),
    );
    const newSizes =
      compatibleList.length > 0
        ? [{ finishedSizeId: compatibleList[0].id, colors: ["#ffffff"] }]
        : [];

    setFormData({
      ...formData,
      productionType: pendingProductionType,
      compatibleFinishedSizes: newSizes,
    });
    setPendingProductionType(null);
  };

  const cancelProductionTypeChange = () => {
    setPendingProductionType(null);
  };

  const handleAddCompatibleSize = () => {
    if (!formData) return;
    const compatibleList = finishedSizes.filter((fs) =>
      fs.productionTypes?.includes(formData.productionType),
    );
    if (compatibleList.length === 0) return;
    const defaultSizeId = compatibleList[0].id;
    setFormData({
      ...formData,
      compatibleFinishedSizes: [
        ...formData.compatibleFinishedSizes,
        { finishedSizeId: defaultSizeId, colors: ["#ffffff"] },
      ],
    });
  };

  const handleUpdateCompatibleSize = (index: number, newSizeId: string) => {
    if (!formData) return;
    const newSizes = [...formData.compatibleFinishedSizes];
    newSizes[index].finishedSizeId = newSizeId;
    setFormData({ ...formData, compatibleFinishedSizes: newSizes });
  };

  const handleRemoveCompatibleSize = (index: number) => {
    if (!formData || formData.compatibleFinishedSizes.length <= 1) return;
    const newSizes = [...formData.compatibleFinishedSizes];
    newSizes.splice(index, 1);
    setFormData({ ...formData, compatibleFinishedSizes: newSizes });
  };

  const handleAddColor = (sizeIndex: number) => {
    if (!formData) return;
    const newSizes = [...formData.compatibleFinishedSizes];
    newSizes[sizeIndex].colors.push("#ffffff");
    setFormData({ ...formData, compatibleFinishedSizes: newSizes });
  };

  const handleUpdateColor = (
    sizeIndex: number,
    colorIndex: number,
    color: string,
  ) => {
    if (!formData) return;
    const newSizes = [...formData.compatibleFinishedSizes];
    newSizes[sizeIndex].colors[colorIndex] = color;
    setFormData({ ...formData, compatibleFinishedSizes: newSizes });
  };

  const handleRemoveColor = (sizeIndex: number, colorIndex: number) => {
    if (!formData) return;
    const newSizes = [...formData.compatibleFinishedSizes];
    newSizes[sizeIndex].colors.splice(colorIndex, 1);
    setFormData({ ...formData, compatibleFinishedSizes: newSizes });
  };

  return (
    <StandardDrawer
      isOpen={!!selectedMedia}
      onClose={onClose}
      onSave={() =>
        formData &&
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "Add Media" : "Edit media"}
      hasChanges={!!hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Media" : "Save Changes"}
    >
      {formData && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-[3px] bg-[#f5f5f5] text-[#111111] text-sm focus:outline-none"
            />
            {formData.id && formData.updatedAt && (
              <p className="mt-1.5 text-[11px] italic text-gray-500">
                Last updated by {formData.lastUpdatedBy || "System"},{" "}
                {new Date(formData.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-[#cc0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.displayName || ""}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              className={`w-full px-3 py-2 border ${!isNameValid && formData.displayName.trim() !== "" ? "border-red-500 ring-1 ring-red-500" : "border-[#969696] focus:border-primary focus:ring-primary"} rounded-[3px] text-[#111111] text-sm focus:outline-none focus:ring-1`}
            />
            {formData.displayName.trim() !== "" && !isNameUnique && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                A media entry with this name already exists.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key{" "}
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.key || ""}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock (Internal Name)
            </label>
            <input
              type="text"
              value={formData.internalName || ""}
              onChange={(e) =>
                setFormData({ ...formData, internalName: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LBS
              </label>
              <input
                type="text"
                value={formData.lbs || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lbs: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GSM
              </label>
              <input
                type="text"
                value={formData.gsm || ""}
                onChange={(e) =>
                  setFormData({ ...formData, gsm: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PT
              </label>
              <input
                type="text"
                value={formData.pt || ""}
                onChange={(e) =>
                  setFormData({ ...formData, pt: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caliper
              </label>
              <input
                type="text"
                value={formData.caliper || ""}
                onChange={(e) =>
                  setFormData({ ...formData, caliper: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Production Type <span className="text-[#cc0000]">*</span>
            </label>
            <select
              value={formData.productionType || ""}
              onChange={(e) =>
                handleProductionTypeChange(e.target.value as any)
              }
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
            >
              {productionTypes.map((typeDef) => (
                <option key={typeDef.id} value={typeDef.id}>
                  {typeDef.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Compatible Finished Sizes{" "}
                <span className="text-[#cc0000]">*</span>
              </label>
            </div>

            {hasDuplicates && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>
                <span>
                  Each compatible size can only be added once. Please remove
                  duplicates before saving.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {formData.compatibleFinishedSizes.map((compSize, i) => {
                const isDuplicate = duplicateSizeIds.includes(
                  compSize.finishedSizeId,
                );
                return (
                  <div
                    key={i}
                    className={`p-3 border ${isDuplicate ? "border-red-300 bg-red-50/30" : "border-gray-200 bg-gray-50"} rounded-[3px] flex flex-col gap-3`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <select
                        value={compSize.finishedSizeId}
                        onChange={(e) =>
                          handleUpdateCompatibleSize(i, e.target.value)
                        }
                        className={`flex-1 px-3 py-2 border ${isDuplicate ? "border-red-400 focus:border-red-500 focus:ring-red-500" : "border-[#969696] focus:border-primary focus:ring-primary"} rounded-[3px] text-[#111111] text-sm focus:outline-none focus:ring-1 bg-white`}
                      >
                        {finishedSizes
                          .filter((fs) =>
                            fs.productionTypes?.includes(
                              formData.productionType,
                            ),
                          )
                          .map((fs) => (
                            <option key={fs.id} value={fs.id}>
                              {fs.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleRemoveCompatibleSize(i)}
                        disabled={formData.compatibleFinishedSizes.length <= 1}
                        className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    </div>

                    <div className="flex gap-2 items-center flex-wrap">
                      <span className="text-xs text-gray-500">Colors:</span>
                      {compSize.colors.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-0 border border-gray-300 rounded pl-1 bg-white group focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden"
                        >
                          <input
                            type="color"
                            value={c.match(/^#[0-9a-fA-F]{6}$/) ? c : "#ffffff"}
                            onChange={(e) =>
                              handleUpdateColor(i, idx, e.target.value)
                            }
                            className="w-5 h-5 p-0 border-0 bg-transparent cursor-pointer rounded-sm flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={c}
                            onChange={(e) =>
                              handleUpdateColor(i, idx, e.target.value)
                            }
                            className="w-[64px] text-xs font-mono uppercase px-1.5 py-1 border-0 bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
                            maxLength={7}
                            placeholder="#FFFFFF"
                          />
                          <button
                            onClick={() => handleRemoveColor(i, idx)}
                            className="w-6 h-full min-h-[24px] flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 rounded-none bg-gray-50 hover:bg-red-50 border-l border-gray-200 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all"
                            title="Remove color"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              close
                            </span>
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddColor(i)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          add
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
              <button
                onClick={handleAddCompatibleSize}
                className="mt-2 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 font-medium hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Add Compatible Size
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Type Change Confirmation Modal */}
      <StandardModal
        isOpen={!!pendingProductionType}
        onClose={cancelProductionTypeChange}
        title="Change Production Type?"
        danger={true}
        icon={<span className="material-symbols-outlined">warning</span>}
        primaryAction={{
          label: "Change Type",
          onClick: confirmProductionTypeChange,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: cancelProductionTypeChange,
        }}
      >
        Changing the production type will clear all current compatible sizes.
        This action cannot be undone.
      </StandardModal>
    </StandardDrawer>
  );
}

function ColorDetailDrawer({
  selectedColor,
  onClose,
  onSave,
  isNew = false,
  colors,
}: {
  selectedColor: any;
  onClose: () => void;
  onSave: (color: any) => void;
  isNew?: boolean;
  colors: any[];
}) {
  const [formData, setFormData] = useState<any>(selectedColor);
  const [productionTypes] = React.useContext(ProductionTypesContext);

  useEffect(() => {
    if (selectedColor) setFormData(selectedColor);
  }, [selectedColor]);

  const handleCheckboxChange = (type: string, checked: boolean) => {
    const currentTypes = formData.productionTypes || [];
    if (checked) {
      setFormData({ ...formData, productionTypes: [...currentTypes, type] });
    } else {
      setFormData({
        ...formData,
        productionTypes: currentTypes.filter((t: string) => t !== type),
      });
    }
  };

  const hasChanges =
    selectedColor && JSON.stringify(formData) !== JSON.stringify(selectedColor);

  const isNameUnique = formData
    ? !colors?.find(
        (i) =>
          i.id !== formData.id &&
          i.name.trim().toLowerCase() === formData.name.trim().toLowerCase(),
      )
    : true;
  const isNameValid = formData
    ? formData.name.trim() !== "" && isNameUnique
    : false;
  const hasProductionTypes = formData
    ? formData.productionTypes?.length > 0
    : false;

  const disableSave = !isNameValid || !hasProductionTypes;

  return (
    <StandardDrawer
      isOpen={!!selectedColor}
      onClose={onClose}
      onSave={() =>
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "Add Color" : "Edit Color"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Color" : "Save Changes"}
    >
      {formData && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-[3px] bg-[#f5f5f5] text-[#111111] text-sm focus:outline-none"
            />
            {formData.id && formData.updatedAt && (
              <p className="mt-1.5 text-[11px] italic text-gray-500">
                Last updated by {formData.lastUpdatedBy || "System"},{" "}
                {new Date(formData.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-[#cc0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all ${
                !isNameUnique && (formData.name || "").trim() !== ""
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {!isNameUnique && formData.name.trim() !== "" && (
              <p className="text-[#cc0000] text-xs mt-1">
                A color with this name already exists.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key{" "}
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.key || ""}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Types <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {productionTypes.map((typeDef) => (
                <label key={typeDef.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.productionTypes?.includes(typeDef.id)}
                    onChange={(e) =>
                      handleCheckboxChange(typeDef.id as any, e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">{typeDef.name}</span>
                </label>
              ))}
            </div>
            {!hasProductionTypes && (
              <p className="text-[#cc0000] text-xs mt-1">
                Select at least one production type.
              </p>
            )}
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}

function ImpressionDetailDrawer({
  selectedImpression,
  onClose,
  onSave,
  isNew = false,
  impressions,
}: {
  selectedImpression: any;
  onClose: () => void;
  onSave: (impression: any) => void;
  isNew?: boolean;
  impressions: any[];
}) {
  const [formData, setFormData] = useState<any>(selectedImpression);
  const [productionTypes] = React.useContext(ProductionTypesContext);

  useEffect(() => {
    if (selectedImpression) setFormData(selectedImpression);
  }, [selectedImpression]);

  const handleCheckboxChange = (type: string, checked: boolean) => {
    const currentTypes = formData.productionTypes || [];
    if (checked) {
      setFormData({ ...formData, productionTypes: [...currentTypes, type] });
    } else {
      setFormData({
        ...formData,
        productionTypes: currentTypes.filter((t: string) => t !== type),
      });
    }
  };

  const hasChanges =
    selectedImpression &&
    JSON.stringify(formData) !== JSON.stringify(selectedImpression);

  const isNameUnique = formData
    ? !impressions?.find(
        (i) =>
          i.id !== formData.id &&
          i.name.trim().toLowerCase() === formData.name.trim().toLowerCase(),
      )
    : true;
  const isNameValid = formData
    ? formData.name.trim() !== "" && isNameUnique
    : false;
  const hasProductionTypes = formData
    ? formData.productionTypes?.length > 0
    : false;

  const disableSave = !isNameValid || !hasProductionTypes;

  return (
    <StandardDrawer
      isOpen={!!selectedImpression}
      onClose={onClose}
      onSave={() =>
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "Add Impression" : "Edit impression"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Impression" : "Save Changes"}
    >
      {formData && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-[3px] bg-[#f5f5f5] text-[#111111] text-sm focus:outline-none"
            />
            {formData.id && formData.updatedAt && (
              <p className="mt-1.5 text-[11px] italic text-gray-500">
                Last updated by {formData.lastUpdatedBy || "System"},{" "}
                {new Date(formData.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-[#cc0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-3 py-2 border ${!isNameValid && formData.name.trim() !== "" ? "border-red-500 ring-1 ring-red-500" : "border-[#969696] focus:border-primary focus:ring-primary"} rounded-[3px] text-[#111111] text-sm focus:outline-none focus:ring-1`}
            />
            {formData.name.trim() !== "" && !isNameUnique && (
              <p className="mt-1.5 text-xs font-semibold text-red-600">
                An impression with this name already exists.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key{" "}
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.key || ""}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Production Types <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {["cutSheet", "wideFormatRoll", "wideFormatRigid"].map((type) => {
                const isChecked = formData.productionTypes?.includes(type);
                const displayLabel =
                  type === "cutSheet"
                    ? "Cut Sheet"
                    : type === "wideFormatRoll"
                      ? "Wide Format Roll"
                      : "Wide Format Rigid";
                return (
                  <label
                    key={type}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors ${isChecked ? "bg-primary border-primary" : "border-[#969696] group-hover:border-primary/50"}`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[14px] text-white font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={(e) =>
                        handleCheckboxChange(type, e.target.checked)
                      }
                    />
                    <span className="text-sm text-[#111111]">
                      {displayLabel}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}

function FinishedSizeDetailDrawer({
  selectedSize,
  onClose,
  onSave,
  isNew = false,
}: {
  selectedSize: any;
  onClose: () => void;
  onSave: (size: any) => void;
  isNew?: boolean;
}) {
  const [formData, setFormData] = useState<any>(selectedSize);
  const [productionTypes] = React.useContext(ProductionTypesContext);

  useEffect(() => {
    if (selectedSize) setFormData(selectedSize);
  }, [selectedSize]);

  const handleDimensionChange = (
    field: "widthIn" | "heightIn",
    value: string,
  ) => {
    const num = value === "" ? 0 : parseFloat(value);
    setFormData({
      ...formData,
      [field]: isNaN(num) ? value : num,
      [field === "widthIn" ? "widthPt" : "heightPt"]: isNaN(num) ? 0 : num * 72,
    });
  };

  const handleCheckboxChange = (type: string, checked: boolean) => {
    const currentTypes = formData.productionTypes || [];
    if (checked) {
      setFormData({ ...formData, productionTypes: [...currentTypes, type] });
    } else {
      setFormData({
        ...formData,
        productionTypes: currentTypes.filter((t: string) => t !== type),
      });
    }
  };

  const hasChanges =
    selectedSize && JSON.stringify(formData) !== JSON.stringify(selectedSize);

  const isNameValid = formData ? formData.name.trim() !== "" : false;
  const hasValidDimensions = formData
    ? !isNaN(parseFloat(String(formData.widthIn))) &&
      !isNaN(parseFloat(String(formData.heightIn))) &&
      parseFloat(String(formData.widthIn)) > 0 &&
      parseFloat(String(formData.heightIn)) > 0
    : false;
  const hasProductionTypes = formData
    ? formData.productionTypes?.length > 0
    : false;

  const disableSave =
    !isNameValid || !hasValidDimensions || !hasProductionTypes;

  return (
    <StandardDrawer
      isOpen={!!selectedSize}
      onClose={onClose}
      onSave={() =>
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "Add Size" : "Edit component"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Size" : "Save Changes"}
    >
      {formData && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-[3px] bg-[#f5f5f5] text-[#111111] text-sm focus:outline-none"
            />
            {formData.id && formData.updatedAt && (
              <p className="mt-1.5 text-[11px] italic text-gray-500">
                Last updated by {formData.lastUpdatedBy || "System"},{" "}
                {new Date(formData.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-[#cc0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key{" "}
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.key || ""}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dimensions (Inches) <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1 flex flex-col">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.widthIn || ""}
                    onChange={(e) =>
                      handleDimensionChange("widthIn", e.target.value)
                    }
                    className="w-full pl-3 pr-8 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    W"
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1 pl-1 text-left">
                  {typeof formData.widthPt === "number" ? formData.widthPt : 0}{" "}
                  pt
                </span>
              </div>
              <span className="text-gray-400 pb-5">×</span>
              <div className="flex-1 flex flex-col">
                <div className="relative">
                  <input
                    type="text"
                    value={formData.heightIn || ""}
                    onChange={(e) =>
                      handleDimensionChange("heightIn", e.target.value)
                    }
                    className="w-full pl-3 pr-8 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    H"
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1 pl-1 text-left">
                  {typeof formData.heightPt === "number"
                    ? formData.heightPt
                    : 0}{" "}
                  pt
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Production Types <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {productionTypes.map((typeDef) => {
                const isChecked = formData.productionTypes?.includes(
                  typeDef.id,
                );
                return (
                  <label
                    key={typeDef.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors ${isChecked ? "bg-primary border-primary" : "border-[#969696] group-hover:border-primary/50"}`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[14px] text-white font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={(e) =>
                        handleCheckboxChange(
                          typeDef.id as any,
                          e.target.checked,
                        )
                      }
                    />
                    <span className="text-sm text-[#111111]">
                      {typeDef.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}

function CustomerFilesDrawer({
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

export function FinishingOptionDetailDrawer({
  selectedOption,
  onClose,
  onSave,
  isNew,
}: {
  selectedOption: FinishingOption | null;
  onClose: () => void;
  onSave: (option: FinishingOption) => void;
  isNew?: boolean;
}) {
  const [formData, setFormData] = useState<FinishingOption | null>(
    selectedOption,
  );
  const [productionTypes] = React.useContext(ProductionTypesContext);

  useEffect(() => {
    if (selectedOption) setFormData(selectedOption);
  }, [selectedOption]);

  const hasChanges =
    selectedOption &&
    JSON.stringify(formData) !== JSON.stringify(selectedOption);

  const disableSave = !formData?.name?.trim();

  const handleCheckboxChange = (type: string, checked: boolean) => {
    if (!formData) return;
    const currentSpecs = formData.productionTypes || [];
    const newSpecs = checked
      ? [...currentSpecs, type]
      : currentSpecs.filter((t) => t !== type);
    setFormData({ ...formData, productionTypes: newSpecs as any });
  };

  return (
    <StandardDrawer
      isOpen={!!selectedOption}
      onClose={onClose}
      onSave={() =>
        formData &&
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "New Finishing Option" : "Edit Finishing Option"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Option" : "Save Updates"}
    >
      {formData && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ID
            </label>
            <input
              type="text"
              value={formData.id || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-[3px] bg-[#f5f5f5] text-[#111111] text-sm focus:outline-none"
            />
            {formData.id && formData.updatedAt && (
              <p className="mt-1.5 text-[11px] italic text-gray-500">
                Last updated by {formData.lastUpdatedBy || "System"},{" "}
                {new Date(formData.updatedAt).toLocaleString()}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-[#cc0000]">*</span>
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Key{" "}
              <span className="text-gray-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.key || ""}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-[#969696] rounded-[3px] text-[#111111] text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Production Types <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex flex-col gap-3">
              {productionTypes.map((typeDef) => {
                const isChecked = formData.productionTypes?.includes(
                  typeDef.id,
                );
                return (
                  <label
                    key={typeDef.id}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors ${isChecked ? "bg-primary border-primary" : "border-[#969696] group-hover:border-primary/50"}`}
                    >
                      {isChecked && (
                        <span className="material-symbols-outlined text-[14px] text-white font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={(e) =>
                        handleCheckboxChange(
                          typeDef.id as any,
                          e.target.checked,
                        )
                      }
                    />
                    <span className="text-sm text-[#111111]">
                      {typeDef.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}

export function SharedFileDetailDrawer({
  selectedFile,
  setSelectedFile,
  files,
  setFiles,
  selectedFileIds,
}: any) {
  const [draftFile, setDraftFile] = React.useState<any>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = React.useState<
    "information" | "users" | "print"
  >("information");
  const [accountToRemove, setAccountToRemove] = React.useState<string | null>(
    null,
  );
  const [newAccountsInput, setNewAccountsInput] = React.useState("");
  const [isAddingAccount, setIsAddingAccount] = React.useState(false);
  const printSettingsRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    setDraftFile(selectedFile);
    setHasChanges(false);
    setActiveDrawerTab("information");
    setIsAddingAccount(false);
    setNewAccountsInput("");
    setAccountToRemove(null);
  }, [selectedFile]);

  // A standalone simple lookup
  const getCompanyName = (acc: string) => {
    if (acc === "123456789") return "Acme Corp";
    if (acc === "987654321") return "Globex";
    if (acc === "555666777") return "Stark Ind.";
    if (acc === "111222333") return "Initech";
    if (acc === "444555666") return "Umbrella Corp";
    if (acc === "777888999") return "Wayne Ent.";
    if (acc === "222333444") return "Cyberdyne";
    if (acc === "555444333") return "Massive Dynamic";
    return "-";
  };

  const titleNode = (
    <div className="flex items-center gap-4 w-full pr-12 justify-center">
      {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = selectedFileIds.indexOf(selectedFile.id);
              const prevId =
                selectedFileIds[
                  (currentIndex - 1 + selectedFileIds.length) %
                    selectedFileIds.length
                ];
              const prevFile = files.find((f: any) => f.id === prevId);
              if (prevFile) setSelectedFile(prevFile);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -ml-10 text-primary hover:text-primary-dark"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
        )}

      <span className="h-full min-w-[120px] flex items-center justify-center font-semibold text-lg text-black">
        {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id)
          ? `File ${selectedFileIds.indexOf(selectedFile.id) + 1} of ${selectedFileIds.length}`
          : "File Details"}
      </span>

      {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = selectedFileIds.indexOf(selectedFile.id);
              const nextId =
                selectedFileIds[(currentIndex + 1) % selectedFileIds.length];
              const nextFile = files.find((f: any) => f.id === nextId);
              if (nextFile) setSelectedFile(nextFile);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -mr-10 text-primary hover:text-primary-dark"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </button>
        )}
    </div>
  );

  return (
    <>
      <StandardDrawer
        isOpen={!!(selectedFile && draftFile)}
        onClose={() => setSelectedFile(null)}
        title={titleNode}
        customWidth="w-[95vw] lg:w-[1100px]"
        hasChanges={hasChanges}
        saveDisabled={!draftFile?.name.trim()}
        onSave={() => {
          if (!hasChanges) return;
          setFiles(
            files.map((a: any) => (a.id === draftFile.id ? draftFile : a)),
          );
          setHasChanges(false);
          setSelectedFile(null);
        }}
      >
        {selectedFile && draftFile && (
          <div className="flex-1 flex overflow-hidden flex-col lg:flex-row w-full h-full">
            {/* Left Column: Fixed File Preview */}
            <div className="w-full lg:w-1/2 bg-[#e6e6e6] border-r border-[#d4d4d4] flex flex-col items-center justify-center p-8 relative shrink-0 min-h-[50vh] lg:min-h-0">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-white shadow-xl flex flex-col items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                  image
                </span>
                <p className="text-sm font-medium text-gray-400">
                  {draftFile.dimensions}
                </p>
                <p className="text-xs text-gray-300 uppercase mt-2">
                  {draftFile.type}
                </p>
              </div>

              {/* Pagination Controls */}
              {draftFile.pageCount > 1 && (
                <div className="absolute bottom-10 flex items-center justify-center gap-6">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined font-light text-4xl text-black select-none">
                      chevron_left
                    </span>
                  </button>
                  <div className="px-5 py-2 bg-[#2d2d2d] text-white font-medium text-sm rounded-full tracking-widest leading-none flex items-center h-10 select-none">
                    1 / {draftFile.pageCount}
                  </div>
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined font-normal text-2xl text-black select-none">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Scrollable Data Layout */}
            <div className="w-1/2 flex flex-col bg-white border-l border-gray-200">
              {/* Tabs */}
              <div className="flex px-8 pt-6 pb-0 border-b border-gray-200 gap-8 shrink-0">
                <button
                  onClick={() => setActiveDrawerTab("information")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "information" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveDrawerTab("users")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "users" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Users & Accounts
                </button>
                <button
                  onClick={() => setActiveDrawerTab("print")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "print" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Print Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-xl mx-auto space-y-10">
                  {/* Information Section */}
                  {activeDrawerTab === "information" && (
                    <section>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-[#cc0000]">*</span>
                          </label>
                          <input
                            type="text"
                            value={draftFile.name}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                name: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={draftFile.description}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                description: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            File ID
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={draftFile.fileId}
                            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md p-1.5 outline-none font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Version
                          </label>
                          <div className="flex items-center gap-3 h-[34px]">
                            <span className="text-sm text-gray-900">
                              {draftFile.version.replace(/^v/, "")}
                            </span>
                            <label className="text-sm text-[var(--color-link-blue)] hover:underline cursor-pointer font-medium">
                              Replace file
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                  ) {
                                    setHasChanges(true);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Updated
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {formatDisplayDate(draftFile.updatedAt)} by{" "}
                            {draftFile.lastUpdatedBy}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            File Size
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.fileSize}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Page Size
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.dimensions}
                          </div>
                        </div>
                        {!["PNG", "JPG", "SVG", "GIF"].includes(
                          draftFile.type,
                        ) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Page Count
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {draftFile.pageCount}{" "}
                              {draftFile.pageCount === 1 ? "Page" : "Pages"}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color Mode
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.colorMode}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resolution
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.resolutionDpi} dpi
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preflight Check
                          </label>
                          <div className="text-sm text-green-600 mt-1 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[18px]">
                              check_circle
                            </span>
                            Passed
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Users & Accounts Section */}
                  {activeDrawerTab === "users" && (
                    <section>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Accounts
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {draftFile.customerAccounts.map((account) => {
                              const customer = MOCK_CUSTOMERS.find(
                                (c) => c.accountNumber === account,
                              );
                              const companyName = customer
                                ? customer.companyName
                                : getCompanyName(account);
                              return (
                                <span
                                  key={account}
                                  className="inline-flex items-center max-w-full px-3 h-[30px] rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm gap-1.5 box-border"
                                >
                                  <span className="font-mono shrink-0">
                                    {account}
                                  </span>
                                  <span className="text-gray-400 shrink-0">
                                    |
                                  </span>
                                  <span className="truncate font-normal min-w-0">
                                    {companyName}
                                  </span>
                                  <button
                                    onClick={() => setAccountToRemove(account)}
                                    className="ml-1 -mr-1.5 shrink-0 flex items-center justify-center w-5 h-5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      close
                                    </span>
                                  </button>
                                </span>
                              );
                            })}
                            {!isAddingAccount ? (
                              <button
                                onClick={() => setIsAddingAccount(true)}
                                className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-gray-100 text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors box-border"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  add
                                </span>
                              </button>
                            ) : (
                              <div className="flex gap-2 w-full lg:w-auto items-center mt-2 lg:mt-0">
                                <input
                                  type="text"
                                  value={newAccountsInput}
                                  onChange={(e) =>
                                    setNewAccountsInput(e.target.value)
                                  }
                                  placeholder="Add accounts (comma separated)"
                                  className="flex-1 min-w-[200px] border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setIsAddingAccount(false);
                                    setNewAccountsInput("");
                                  }}
                                  className="px-[19px] py-1.5 text-sm font-semibold text-black bg-white border border-[#969696] hover:bg-gray-50 rounded-[20px] transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const newAccs = newAccountsInput
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    if (newAccs.length > 0) {
                                      setDraftFile({
                                        ...draftFile,
                                        customerAccounts: Array.from(
                                          new Set([
                                            ...draftFile.customerAccounts,
                                            ...newAccs,
                                          ]),
                                        ),
                                      });
                                      setHasChanges(true);
                                      setNewAccountsInput("");
                                      setIsAddingAccount(false);
                                    }
                                  }}
                                  disabled={!newAccountsInput.trim()}
                                  className="px-[28px] py-1.5 text-sm font-semibold text-white bg-[#cc0000] hover:bg-[#a30000] rounded-[22px] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border border-transparent"
                                >
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Added By
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.addedBy}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owned By
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.ownedBy}
                          </div>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Personal / Shared
                          </label>
                          <button
                            onClick={() => {
                              setDraftFile({
                                ...draftFile,
                                isShared: !draftFile.isShared,
                              });
                              setHasChanges(true);
                            }}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${draftFile.isShared ? "bg-primary" : "bg-gray-200"}`}
                            role="switch"
                            aria-checked={draftFile.isShared}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${draftFile.isShared ? "translate-x-4" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Print Settings Section */}
                  {activeDrawerTab === "print" && (
                    <section ref={printSettingsRef}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned SKU / Item #
                          </label>
                          <input
                            type="text"
                            value={draftFile.sku}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                sku: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            placeholder="Enter alphanumeric SKU"
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none uppercase"
                          />
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </StandardDrawer>

      {/* Account Removal Modal */}
      <StandardModal
        isOpen={!!(accountToRemove && draftFile)}
        onClose={() => setAccountToRemove(null)}
        title="Remove Account"
        danger={true}
        icon={<span className="material-symbols-outlined">delete</span>}
        primaryAction={{
          label: "Remove Account",
          onClick: () => {
            if (draftFile) {
              setDraftFile({
                ...draftFile,
                customerAccounts: draftFile.customerAccounts.filter(
                  (a) => a !== accountToRemove,
                ),
              });
              setHasChanges(true);
              setAccountToRemove(null);
            }
          },
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setAccountToRemove(null),
        }}
      >
        Are you sure you want to remove account{" "}
        <span className="font-mono text-gray-900 font-medium">
          {accountToRemove}
        </span>{" "}
        from this file? This action will not be saved until you apply changes to
        the drawer.
      </StandardModal>
    </>
  );
}

export function SettingsModule() {
  const [productionTypes, setProductionTypes] = React.useContext(
    ProductionTypesContext,
  );
  const [mediaCatalog] = useFirestoreSync(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [printSpecs] = useFirestoreSync(
    "appData",
    "print_specs",
    INITIAL_PRINT_SPECS,
  );
  const [finishedSizes] = useFirestoreSync(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [finishingOptions] = useFirestoreSync(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [colors] = useFirestoreSync("appData", "colors", INITIAL_COLORS);
  const [impressions] = useFirestoreSync(
    "appData",
    "impressions",
    INITIAL_IMPRESSIONS,
  );
  const [sources, setSources] = useFirestoreSync<any[]>(
    "appData",
    "sources",
    [
      {
        id: crypto.randomUUID(),
        name: "HCA/Censhare",
        description: "HCA Marketing System",
        contactName: "John Doe",
        contactEmail: "john@example.com"
      }
    ],
  );

  const [editingType, setEditingType] = useState<ProductionTypeConfig | null>(
    null,
  );
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [editingSource, setEditingSource] = useState<any | null>(null);
  const [isDeletingSourceId, setIsDeletingSourceId] = useState<string | null>(null);

  const handleSaveType = (type: ProductionTypeConfig) => {
    if (!type.id) {
      type.id = crypto.randomUUID();
      setProductionTypes([...productionTypes, type]);
    } else {
      setProductionTypes(
        productionTypes.map((t) => (t.id === type.id ? type : t)),
      );
    }
    setEditingType(null);
  };

  const checkInUse = (id: string) => {
    const mediaUse = mediaCatalog.some((m: any) => m.productionType === id);
    const specUse = printSpecs.some((s: any) => s.productionType === id);
    const sizeUse = finishedSizes.some((s: any) =>
      s.productionTypes?.includes(id),
    );
    const finishingUse = finishingOptions.some((o: any) =>
      o.productionTypes?.includes(id),
    );
    const colorUse = colors.some((c: any) => c.productionTypes?.includes(id));
    const impressionUse = impressions.some((i: any) =>
      i.productionTypes?.includes(id),
    );

    return (
      mediaUse ||
      specUse ||
      sizeUse ||
      finishingUse ||
      colorUse ||
      impressionUse
    );
  };

  const handleDelete = (id: string) => {
    if (checkInUse(id)) {
      alert(
        "Cannot delete this Production Type because it is currently in use by one or more components (Media, Print Spec, Size, Color, etc.).",
      );
      setIsDeletingId(null);
      return;
    }
    setProductionTypes(productionTypes.filter((t) => t.id !== id));
    setIsDeletingId(null);
  };

  return (
    <div className="col-span-12 space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Settings
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage external resources, variables, and platform configurations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Production Types
            </h3>
            <button
              onClick={() =>
                setEditingType({ id: "", name: "", defaultBleedInches: 0.125 })
              }
              className="text-primary hover:text-primary-hover flex items-center text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] mr-1">
                add
              </span>
              Add New
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {productionTypes.map((type) => {
              const inUse = checkInUse(type.id);
              return (
                <div
                  key={type.id}
                  className="p-6 hover:bg-gray-50 transition-colors group flex items-start justify-between"
                >
                  <div>
                    <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      {type.name}
                      {inUse && (
                        <span
                          className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-gray-100 text-gray-500"
                          title="In Use"
                        >
                          Active
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 font-mono">
                      <span className="material-symbols-outlined text-[14px]">
                        crop
                      </span>
                      Default Bleed: {type.defaultBleedInches}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingType(type)}
                      className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    {!inUse && (
                      <button
                        onClick={() => setIsDeletingId(type.id)}
                        className="text-red-300 hover:text-[#cc0000] transition-colors p-1"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Sources
            </h3>
            <button
              onClick={() =>
                setEditingSource({ id: "", name: "", description: "", contactName: "", contactEmail: "" })
              }
              className="text-primary hover:text-primary-hover flex items-center text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] mr-1">
                add
              </span>
              Add New
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {sources.map((source) => {
              return (
                <div
                  key={source.id}
                  className="p-6 hover:bg-gray-50 transition-colors group flex items-start justify-between"
                >
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">
                      {source.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {source.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingSource(source)}
                      className="text-gray-400 hover:text-gray-700 transition-colors p-1"
                      title="Edit"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => setIsDeletingSourceId(source.id)}
                      className="text-red-300 hover:text-[#cc0000] transition-colors p-1"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StandardModal
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        title={editingType?.id ? "Edit Production Type" : "New Production Type"}
        icon={<span className="material-symbols-outlined">settings</span>}
        primaryAction={{
          label: "Save",
          onClick: () => {
            if (editingType) handleSaveType(editingType);
          },
          disabled:
            !editingType?.name?.trim() || editingType.defaultBleedInches < 0,
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setEditingType(null),
        }}
      >
        {editingType && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-[#cc0000]">*</span>
              </label>
              <input
                type="text"
                value={editingType.name}
                onChange={(e) =>
                  setEditingType({ ...editingType, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none"
                placeholder="e.g. Cut Sheet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Bleed (Inches) <span className="text-[#cc0000]">*</span>
              </label>
              <input
                type="number"
                step="0.125"
                min="0"
                value={editingType.defaultBleedInches}
                onChange={(e) =>
                  setEditingType({
                    ...editingType,
                    defaultBleedInches: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:border-primary outline-none"
              />
            </div>
          </div>
        )}
      </StandardModal>

      <StandardModal
        isOpen={!!isDeletingId}
        onClose={() => setIsDeletingId(null)}
        title="Confirm Deletion"
        danger={true}
        icon={<span className="material-symbols-outlined">delete_forever</span>}
        primaryAction={{
          label: "Delete it",
          onClick: () => {
            if (isDeletingId) handleDelete(isDeletingId);
          },
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeletingId(null),
        }}
      >
        <p className="text-gray-700 text-sm">
          Are you sure you want to delete this Production Type? This cannot be
          undone.
        </p>
      </StandardModal>

      <StandardDrawer
        isOpen={!!editingSource}
        onClose={() => setEditingSource(null)}
        title={editingSource?.id ? "Edit Source: " + editingSource.name : "New Source"}
        onSave={() => {
          if (editingSource) {
            const type = editingSource;
            if (!type.id) {
              type.id = crypto.randomUUID();
              setSources([...sources, type]);
            } else {
              setSources(
                sources.map((t) => (t.id === type.id ? type : t)),
              );
            }
            setEditingSource(null);
          }
        }}
        saveDisabled={!editingSource?.name?.trim()}
      >
        {editingSource && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Display Name <span className="text-[#cc0000]">*</span>
                </label>
                <input
                  type="text"
                  value={editingSource.name}
                  onChange={(e) =>
                    setEditingSource({ ...editingSource, name: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  placeholder="e.g. Customer A DAM"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingSource.description}
                  onChange={(e) =>
                    setEditingSource({
                      ...editingSource,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm h-32 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Primary Contact Name
                  </label>
                  <input
                    type="text"
                    value={editingSource.contactName}
                    onChange={(e) =>
                      setEditingSource({ ...editingSource, contactName: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    type="text"
                    value={editingSource.contactEmail}
                    onChange={(e) =>
                      setEditingSource({ ...editingSource, contactEmail: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </StandardDrawer>

      <StandardModal
        isOpen={!!isDeletingSourceId}
        onClose={() => setIsDeletingSourceId(null)}
        title="Confirm Deletion"
        danger={true}
        icon={<span className="material-symbols-outlined">delete_forever</span>}
        primaryAction={{
          label: "Delete it",
          onClick: () => {
            if (isDeletingSourceId) {
              setSources(sources.filter((t) => t.id !== isDeletingSourceId));
              setIsDeletingSourceId(null);
            }
          },
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setIsDeletingSourceId(null),
        }}
      >
        <p className="text-gray-700 text-sm">
          Are you sure you want to delete this Source? This cannot be undone.
        </p>
      </StandardModal>
    </div>
  );
}

export function MappingDetailDrawer({
  selectedMapping,
  onClose,
  onSave,
  sources,
}: {
  selectedMapping: any;
  onClose: () => void;
  onSave: (mapping: any) => void;
  sources: any[];
}) {
  const [editingMapping, setEditingMapping] = useState<any>(selectedMapping || null);

  useEffect(() => {
    setEditingMapping(selectedMapping);
  }, [selectedMapping]);

  return (
    <StandardDrawer
      isOpen={!!selectedMapping}
      onClose={onClose}
      title={selectedMapping?.externalItemId ? "Edit Mapping: " + selectedMapping.externalItemId : "New Mapping"}
      onSave={() => onSave(editingMapping)}
      saveDisabled={!editingMapping?.externalItemId?.trim()}
    >
      {selectedMapping && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                External Item ID <span className="text-[#cc0000]">*</span>
              </label>
            <input
              type="text"
              value={editingMapping?.externalItemId || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, externalItemId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Internal Item ID (SKU)
            </label>
            <input
              type="text"
              value={editingMapping?.internalItemId || editingMapping?.sku || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, internalItemId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                QTY Modify Type
              </label>
              <select
                value={editingMapping?.qtyModifyType || "none"}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, qtyModifyType: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              >
                <option value="none">none</option>
                <option value="multiply">multiply</option>
                <option value="divide">divide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                QTY Modifier
              </label>
              <input
                type="text"
                value={editingMapping?.qtyModifier || ""}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, qtyModifier: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editingMapping?.description || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Source
            </label>
            <select
              value={editingMapping?.sourceId || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, sourceId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            >
              <option value="">None</option>
              {sources.map((src) => (
                <option key={src.id} value={src.id}>{src.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Spec Type
              </label>
              <select
                value={editingMapping?.specType || "None assigned"}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, specType: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              >
                <option value="None assigned">None assigned</option>
                <option value="templateId">templateId</option>
                <option value="jdfToken">jdfToken</option>
                <option value="JDF Token">JDF Token</option>
                <option value="Template">Template</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Spec Value
              </label>
              <input
                type="text"
                value={editingMapping?.specValue || ""}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, specValue: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
      )}
    </StandardDrawer>
  );
}
