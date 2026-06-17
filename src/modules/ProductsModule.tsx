import React, { useState, useRef, useContext } from "react";
import { MappingDetailDrawer } from "../components/drawers/MappingDetailDrawer";
import { PrintSpecDetailDrawer } from "../components/drawers/PrintSpecDetailDrawer";
import { ProductionTypesContext } from "../context/ProductionTypesContext";
import { INITIAL_COLORS, INITIAL_FINISHED_SIZES, INITIAL_FINISHING_OPTIONS, INITIAL_IMPRESSIONS, INITIAL_MEDIA_CATALOG, INITIAL_PRINT_SPECS } from "../data/catalog";
import { INITIAL_SOURCES } from "../data/mockData";
import { PRODUCT_OPTIONS } from "../data/options";
import { usePersistentState } from "../hooks/usePersistentState";
import { SearchBar } from "../ui/SearchBar";
import { TableActionMenu } from "../ui/TableActionMenu";

export function ProductsModule() {
  const [activeTab, setActiveTab] = useState(PRODUCT_OPTIONS[0]);
  const [printSpecs, setPrintSpecs] = usePersistentState(
    "appData",
    "print_specs",
    INITIAL_PRINT_SPECS,
  );
  const [productionTypes] = React.useContext(ProductionTypesContext);
  const [finishedSizes] = usePersistentState(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [mediaCatalog] = usePersistentState(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [colors] = usePersistentState("appData", "colors", INITIAL_COLORS);
  const [impressions] = usePersistentState(
    "appData",
    "impressions",
    INITIAL_IMPRESSIONS,
  );
  const [finishingOptions] = usePersistentState(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [selectedPrintSpec, setSelectedPrintSpec] = useState<any>(null);
  const [printSpecsSearchTerm, setPrintSpecsSearchTerm] = useState("");

  const [mappings, setMappings] = usePersistentState<any[]>(
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

  const [sources] = usePersistentState<any[]>(
    "appData",
    "sources",
    INITIAL_SOURCES
  );

  const [savedProducts, setSavedProducts] = usePersistentState<any[]>(
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
                          <td className="px-5 py-4 text-sm align-top">
                            <button
                              onClick={() => setSelectedMapping(mapping)}
                              className="text-[#cc0000] hover:underline font-semibold text-left block max-w-[200px] break-words"
                            >
                              {mapping.externalItemId}
                            </button>
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
        onDelete={
          selectedMapping && mappings.some((m) => m.id === selectedMapping.id)
            ? () => {
                if (confirm("Are you sure you want to delete this mapping?")) {
                  setMappings((prev) =>
                    prev.filter((m) => m.id !== selectedMapping.id),
                  );
                  setSelectedMapping(null);
                }
              }
            : undefined
        }
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
