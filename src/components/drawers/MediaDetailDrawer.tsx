import React, { useState, useEffect, useContext } from "react";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { MediaCatalogEntry } from "../../types";
import { StandardDrawer } from "../../ui/StandardDrawer";
import { StandardModal } from "../../ui/StandardModal";

export function MediaDetailDrawer({
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
