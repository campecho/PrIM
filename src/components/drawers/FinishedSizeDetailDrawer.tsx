import React, { useState, useEffect, useContext } from "react";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function FinishedSizeDetailDrawer({
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
