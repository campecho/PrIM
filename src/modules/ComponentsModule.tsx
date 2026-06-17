import React, { useState, useRef, useContext } from "react";
import { exportFinishedSizesToXLSX, exportMediaToXLSX, parseImportedXLSX } from "../lib/portability";
import { ColorDetailDrawer } from "../components/drawers/ColorDetailDrawer";
import { FinishedSizeDetailDrawer } from "../components/drawers/FinishedSizeDetailDrawer";
import { FinishingOptionDetailDrawer } from "../components/drawers/FinishingOptionDetailDrawer";
import { ImpressionDetailDrawer } from "../components/drawers/ImpressionDetailDrawer";
import { MediaColorKeysDrawer } from "../components/drawers/MediaColorKeysDrawer";
import { MediaDetailDrawer } from "../components/drawers/MediaDetailDrawer";
import { ProductionTypesContext } from "../context/ProductionTypesContext";
import { INITIAL_COLORS, INITIAL_FINISHED_SIZES, INITIAL_FINISHING_OPTIONS, INITIAL_IMPRESSIONS, INITIAL_MEDIA_CATALOG } from "../data/catalog";
import { COMPONENT_OPTIONS } from "../data/options";
import { usePersistentState } from "../hooks/usePersistentState";
import { FinishingOption, MediaCatalogEntry } from "../types";
import { TableActionMenu } from "../ui/TableActionMenu";
import { ImportReviewModal, ImportColumn } from "../components/ImportReviewModal";

const toBool = (v: any): boolean => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return s === "true" || s === "yes" || s === "1";
};

const prodTypeFromLabel = (v: any): string => {
  const s = String(v ?? "").toLowerCase().trim();
  if (s === "cut sheet" || s === "cutsheet") return "cutSheet";
  if (s === "wf roll" || s === "wideformatroll") return "wideFormatRoll";
  if (s === "wf rigid" || s === "wideformatrigid") return "wideFormatRigid";
  return String(v ?? "");
};

const FINISHED_SIZE_COLUMNS: ImportColumn[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "key", label: "Key", type: "text", width: "w-24" },
  { key: "widthIn", label: "Width (in)", type: "number", required: true, min: 0, width: "w-24" },
  { key: "heightIn", label: "Height (in)", type: "number", required: true, min: 0, width: "w-24" },
  { key: "cutSheet", label: "Cut Sheet", type: "boolean", width: "w-20" },
  { key: "wfRoll", label: "WF Roll", type: "boolean", width: "w-20" },
  { key: "wfRigid", label: "WF Rigid", type: "boolean", width: "w-20" },
  { key: "description", label: "Description", type: "text" },
];

const MEDIA_COLUMNS: ImportColumn[] = [
  { key: "displayName", label: "Display Name", type: "text", required: true },
  { key: "internalName", label: "Internal Name", type: "text" },
  { key: "key", label: "Key", type: "text", width: "w-24" },
  { key: "lbs", label: "LBS", type: "text", width: "w-20" },
  { key: "gsm", label: "GSM", type: "text", width: "w-20" },
  { key: "pt", label: "PT", type: "text", width: "w-20" },
  { key: "caliper", label: "Caliper", type: "text", width: "w-24" },
  {
    key: "productionType",
    label: "Production Type",
    type: "select",
    required: true,
    options: [
      { value: "cutSheet", label: "Cut Sheet" },
      { value: "wideFormatRoll", label: "WF Roll" },
      { value: "wideFormatRigid", label: "WF Rigid" },
    ],
  },
];

export function ComponentsModule() {
  const [activeTab, setActiveTab] = useState(COMPONENT_OPTIONS[0]);
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [finishedSizes, setFinishedSizes] = usePersistentState(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [finishingOptions, setFinishingOptions] = usePersistentState(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [selectedFinishingOption, setSelectedFinishingOption] =
    useState<FinishingOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [mediaCatalog, setMediaCatalog] = usePersistentState(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [selectedMedia, setSelectedMedia] = useState<MediaCatalogEntry | null>(
    null,
  );
  const [colors, setColors] = usePersistentState(
    "appData",
    "colors",
    INITIAL_COLORS,
  );
  const [impressions, setImpressions] = usePersistentState(
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
  const [importReview, setImportReview] = useState<
    { kind: "finished-sizes" | "media"; rows: any[] } | null
  >(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const raw = await parseImportedXLSX(file);
      if (raw.length === 0) {
        alert("The selected file is empty.");
        return;
      }
      if (activeTab.id === "finished-sizes") {
        const rows = raw.map((row: any) => ({
          id: row.ID || crypto.randomUUID(),
          name: row.Name ?? "",
          key: row.Key ?? "",
          widthIn: row["Width (Inches)"] ?? "",
          heightIn: row["Height (Inches)"] ?? "",
          cutSheet: toBool(row["Cut Sheet"]),
          wfRoll: toBool(row["WF Roll"]),
          wfRigid: toBool(row["WF Rigid"]),
          description: row.Description ?? "",
        }));
        setImportReview({ kind: "finished-sizes", rows });
      } else if (activeTab.id === "media") {
        const rows = raw.map((row: any) => ({
          id: row.ID || crypto.randomUUID(),
          displayName: row["Display Name"] ?? "",
          internalName: row["Internal Name"] ?? "",
          key: row.Key ?? "",
          lbs: row.LBS ?? "",
          gsm: row.GSM ?? "",
          pt: row.PT ?? "",
          caliper: row.Caliper ?? "",
          productionType: prodTypeFromLabel(row["Production Type"]),
        }));
        setImportReview({ kind: "media", rows });
      } else {
        alert("Import is not available for this tab yet.");
      }
    } catch {
      alert("Failed to parse XLSX file");
    }
    e.target.value = "";
  };

  const handleConfirmFinishedSizes = (
    rows: any[],
    mode: "merge" | "overwrite",
  ) => {
    const mapped = rows.map((r) => ({
      id: r.id,
      name: r.name,
      key: r.key,
      widthIn: Number(r.widthIn) || 0,
      heightIn: Number(r.heightIn) || 0,
      widthPt: (Number(r.widthIn) || 0) * 72,
      heightPt: (Number(r.heightIn) || 0) * 72,
      description: r.description || "",
      productionTypes: [
        r.cutSheet ? "cutSheet" : null,
        r.wfRoll ? "wideFormatRoll" : null,
        r.wfRigid ? "wideFormatRigid" : null,
      ].filter(Boolean) as string[],
    }));
    if (mode === "overwrite") {
      setFinishedSizes(mapped);
    } else {
      setFinishedSizes((prev) => {
        const next = [...prev];
        mapped.forEach((p) => {
          const idx = next.findIndex((x) => x.id === p.id);
          if (idx >= 0) next[idx] = { ...next[idx], ...p };
          else next.push(p);
        });
        return next;
      });
    }
    setImportReview(null);
  };

  const handleConfirmMedia = (rows: any[], mode: "merge" | "overwrite") => {
    const base = (r: any) => ({
      id: r.id,
      displayName: r.displayName,
      internalName: r.internalName,
      key: r.key,
      lbs: r.lbs,
      gsm: r.gsm,
      pt: r.pt,
      caliper: r.caliper,
      productionType: r.productionType,
    });
    if (mode === "overwrite") {
      setMediaCatalog(
        rows.map((r) => ({ ...base(r), compatibleFinishedSizes: [] })) as any,
      );
    } else {
      setMediaCatalog((prev) => {
        const next = [...prev];
        rows.forEach((r) => {
          const idx = next.findIndex((x) => x.id === r.id);
          if (idx >= 0) next[idx] = { ...next[idx], ...base(r) };
          else next.push({ ...base(r), compatibleFinishedSizes: [] } as any);
        });
        return next;
      });
    }
    setImportReview(null);
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
      {importReview?.kind === "finished-sizes" && (
        <ImportReviewModal
          isOpen={true}
          title="Review Finished Sizes Import"
          columns={FINISHED_SIZE_COLUMNS}
          initialRows={importReview.rows}
          existingIds={finishedSizes.map((s: any) => s.id)}
          onCancel={() => setImportReview(null)}
          onConfirm={handleConfirmFinishedSizes}
        />
      )}
      {importReview?.kind === "media" && (
        <ImportReviewModal
          isOpen={true}
          title="Review Media Import"
          columns={MEDIA_COLUMNS}
          initialRows={importReview.rows}
          existingIds={mediaCatalog.map((m: any) => m.id)}
          onCancel={() => setImportReview(null)}
          onConfirm={handleConfirmMedia}
        />
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
