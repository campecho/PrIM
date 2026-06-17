import React, { useState, useEffect, useContext } from "react";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { FinishingOption } from "../../types";
import { StandardDrawer } from "../../ui/StandardDrawer";

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
