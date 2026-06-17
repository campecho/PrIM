import React, { useState, useEffect, useContext } from "react";
import { ProductionTypesContext } from "../../context/ProductionTypesContext";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function ColorDetailDrawer({
  selectedColor,
  onClose,
  onSave,
  isNew = false,
  colors,
}: {
  selectedColor: any;
  onClose: () => void;
  onSave: (color: any) => void;
  isNew?: boolean;
  colors: any[];
}) {
  const [formData, setFormData] = useState<any>(selectedColor);
  const [productionTypes] = React.useContext(ProductionTypesContext);

  useEffect(() => {
    if (selectedColor) setFormData(selectedColor);
  }, [selectedColor]);

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
    selectedColor && JSON.stringify(formData) !== JSON.stringify(selectedColor);

  const isNameUnique = formData
    ? !colors?.find(
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
      isOpen={!!selectedColor}
      onClose={onClose}
      onSave={() =>
        onSave({
          ...formData,
          lastUpdatedBy: localStorage.getItem("simulatedUser") || "System",
          updatedAt: new Date().toISOString(),
        })
      }
      title={isNew ? "Add Color" : "Edit Color"}
      hasChanges={hasChanges}
      saveDisabled={disableSave}
      saveLabel={isNew ? "Add Color" : "Save Changes"}
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
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all ${
                !isNameUnique && (formData.name || "").trim() !== ""
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            />
            {!isNameUnique && formData.name.trim() !== "" && (
              <p className="text-[#cc0000] text-xs mt-1">
                A color with this name already exists.
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Types <span className="text-[#cc0000]">*</span>
            </label>
            <div className="flex flex-col gap-2">
              {productionTypes.map((typeDef) => (
                <label key={typeDef.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.productionTypes?.includes(typeDef.id)}
                    onChange={(e) =>
                      handleCheckboxChange(typeDef.id as any, e.target.checked)
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                  />
                  <span className="text-sm text-gray-700">{typeDef.name}</span>
                </label>
              ))}
            </div>
            {!hasProductionTypes && (
              <p className="text-[#cc0000] text-xs mt-1">
                Select at least one production type.
              </p>
            )}
          </div>
        </div>
      )}
    </StandardDrawer>
  );
}
