import React, { useState, useRef, useEffect, useContext } from "react";
import { PDFDocument } from "pdf-lib";
import exifr from "exifr";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function PrintSpecDetailDrawer({
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
