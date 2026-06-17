import React, { useState, useContext } from "react";
import { ProductionTypesContext } from "../context/ProductionTypesContext";
import { INITIAL_COLORS, INITIAL_FINISHED_SIZES, INITIAL_FINISHING_OPTIONS, INITIAL_IMPRESSIONS, INITIAL_MEDIA_CATALOG, INITIAL_PRINT_SPECS } from "../data/catalog";
import { INITIAL_SOURCES } from "../data/mockData";
import { usePersistentState } from "../hooks/usePersistentState";
import { ProductionTypeConfig } from "../types";
import { Button } from "../ui/Button";
import { StandardDrawer } from "../ui/StandardDrawer";
import { StandardModal } from "../ui/StandardModal";

const SETTINGS_SECTIONS = [
  { id: "production-types", title: "Production Types", icon: "tune" },
  { id: "sources", title: "Sources", icon: "hub" },
];

export function SettingsModule() {
  const [productionTypes, setProductionTypes] = React.useContext(
    ProductionTypesContext,
  );
  const [mediaCatalog] = usePersistentState(
    "appData",
    "media",
    INITIAL_MEDIA_CATALOG,
  );
  const [printSpecs] = usePersistentState(
    "appData",
    "print_specs",
    INITIAL_PRINT_SPECS,
  );
  const [finishedSizes] = usePersistentState(
    "appData",
    "finished_sizes",
    INITIAL_FINISHED_SIZES,
  );
  const [finishingOptions] = usePersistentState(
    "appData",
    "finishing_options",
    INITIAL_FINISHING_OPTIONS,
  );
  const [colors] = usePersistentState("appData", "colors", INITIAL_COLORS);
  const [impressions] = usePersistentState(
    "appData",
    "impressions",
    INITIAL_IMPRESSIONS,
  );
  const [sources, setSources] = usePersistentState<any[]>(
    "appData",
    "sources",
    INITIAL_SOURCES,
  );

  const [editingType, setEditingType] = useState<ProductionTypeConfig | null>(
    null,
  );
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [editingSource, setEditingSource] = useState<any | null>(null);
  const [isDeletingSourceId, setIsDeletingSourceId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState(SETTINGS_SECTIONS[0].id);

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
    setEditingType(null);
  };

  return (
    <>
      <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 lg:self-start mb-6 md:mb-8 lg:mb-0">
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Settings</h2>
          <p className="text-sm text-gray-500 mb-6">
            Manage variables and platform configurations.
          </p>
          <div className="flex flex-col gap-3">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                  activeSection === section.id
                    ? "border-primary bg-[#f0f7ff] shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="material-symbols-outlined text-[24px] text-[#cc0000]">
                  {section.icon}
                </span>
                <span className="font-semibold text-gray-800 text-sm">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-9 flex flex-col gap-6">
        {activeSection === "production-types" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Production Types
              </h2>
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
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Default Bleed
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productionTypes.map((type, index) => {
                    const inUse = checkInUse(type.id);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                          <button
                            onClick={() => setEditingType(type)}
                            className="text-[#cc0000] hover:underline font-semibold"
                          >
                            {type.name}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap font-mono">
                          {type.defaultBleedInches}"
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {inUse ? (
                            <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
                              In use
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {productionTypes.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No production types yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeSection === "sources" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Sources</h2>
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
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900">
                      Description
                    </th>
                    <th className="px-5 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sources.map((source, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                        <button
                          onClick={() => setEditingSource(source)}
                          className="text-[#cc0000] hover:underline font-semibold"
                        >
                          {source.name}
                        </button>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 max-w-md">
                        {source.description || (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {source.contactName || source.contactEmail ? (
                          <div className="flex flex-col">
                            {source.contactName && (
                              <span>{source.contactName}</span>
                            )}
                            {source.contactEmail && (
                              <span className="text-xs text-gray-400">
                                {source.contactEmail}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sources.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-8 text-center text-gray-500"
                      >
                        No sources yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <StandardDrawer
        isOpen={!!editingType}
        onClose={() => setEditingType(null)}
        title={editingType?.id ? "Edit Production Type" : "New Production Type"}
        footer={
          <div className="flex items-center justify-between w-full">
            {editingType?.id && !checkInUse(editingType.id) ? (
              <Button
                variant="ghost"
                leadingIcon="delete"
                onClick={() => setIsDeletingId(editingType.id)}
                className="!text-primary hover:!bg-red-50"
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setEditingType(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => editingType && handleSaveType(editingType)}
                disabled={
                  !editingType?.name?.trim() ||
                  (editingType?.defaultBleedInches ?? 0) < 0
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        {editingType && (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name <span className="text-[#cc0000]">*</span>
              </label>
              <input
                type="text"
                value={editingType.name}
                onChange={(e) =>
                  setEditingType({ ...editingType, name: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
                placeholder="e.g. Cut Sheet"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
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
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>
        )}
      </StandardDrawer>

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
        title={editingSource?.id ? "Edit Source" : "New Source"}
        footer={
          <div className="flex items-center justify-between w-full">
            {editingSource?.id ? (
              <Button
                variant="ghost"
                leadingIcon="delete"
                onClick={() => setIsDeletingSourceId(editingSource.id)}
                className="!text-primary hover:!bg-red-50"
              >
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setEditingSource(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!editingSource?.name?.trim()}
                onClick={() => {
                  if (editingSource) {
                    const type = editingSource;
                    if (!type.id) {
                      type.id = crypto.randomUUID();
                      setSources([...sources, type]);
                    } else {
                      setSources(sources.map((t) => (t.id === type.id ? type : t)));
                    }
                    setEditingSource(null);
                  }
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        }
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
              setEditingSource(null);
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
    </>
  );
}
