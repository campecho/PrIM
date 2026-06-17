import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FileImportCard } from "../components/FileImportCard";
import { SharedFileDetailDrawer } from "../components/drawers/SharedFileDetailDrawer";
import { MOCK_CUSTOMERS, SORTED_FILE_TYPES } from "../data/mockData";
import { formatDisplayDate } from "../lib/format";
import { FileAsset } from "../types";
import { AutocompleteInput } from "../ui/AutocompleteInput";
import { TruncateWithTooltip } from "../ui/TruncateWithTooltip";

export function FilesModule({
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
