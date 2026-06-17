import React, { useState, useEffect, useContext } from "react";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function ImpressionDetailDrawer({
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
