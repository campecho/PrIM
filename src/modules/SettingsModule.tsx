import React, { useState, useContext } from "react";
import { ProductionTypesContext } from "../context/ProductionTypesContext";
import { INITIAL_COLORS, INITIAL_FINISHED_SIZES, INITIAL_FINISHING_OPTIONS, INITIAL_IMPRESSIONS, INITIAL_MEDIA_CATALOG, INITIAL_PRINT_SPECS } from "../data/catalog";
import { INITIAL_SOURCES } from "../data/mockData";
import { useFirestoreSync } from "../hooks/useFirestoreSync";
import { ProductionTypeConfig } from "../types";
import { StandardDrawer } from "../ui/StandardDrawer";
import { StandardModal } from "../ui/StandardModal";

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
    INITIAL_SOURCES,
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
