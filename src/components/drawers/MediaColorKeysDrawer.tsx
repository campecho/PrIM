import { useState, useEffect } from "react";
import { StandardDrawer } from "../../ui/StandardDrawer";
import { TableActionMenu } from "../../ui/TableActionMenu";

export function MediaColorKeysDrawer({
  isOpen,
  onClose,
  onSave,
  mediaColors,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (colors: any[]) => void;
  mediaColors: any[];
}) {
  const [formData, setFormData] = useState<any[]>(mediaColors);

  useEffect(() => {
    if (isOpen) setFormData(mediaColors);
  }, [isOpen, mediaColors]);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(mediaColors);
  const isValid = formData.every((c) => c.name.trim() !== "");

  return (
    <StandardDrawer
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => onSave(formData)}
      title="Colors"
      hasChanges={hasChanges}
      saveLabel="Save Updates"
      saveDisabled={!isValid}
    >
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">
              Media Colors
            </h3>
            <div className="flex items-center gap-2">
              <TableActionMenu
                actions={[
                  { label: "Import", icon: "upload" },
                  { label: "Export", icon: "download" },
                  {
                    label: "Add",
                    icon: "add",
                    variant: "primary",
                    onClick: () =>
                      setFormData([
                        ...formData,
                        {
                          id: crypto.randomUUID(),
                          hex: "#000000",
                          name: "",
                          key: "",
                        },
                      ]),
                  },
                ]}
              />
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-6">
            Configure default suffix keys for media colors globally across all
            products. <br />
            <br />
            This key will be appended to the end of a media type's base key. For
            instance, if 20lb Pastel is keyed "20P" and Canary is keyed "CAN",
            selecting Canary will output "20PCAN".
          </p>

          <div className="flex flex-col gap-3">
            {/* Hardcoded default White color */}
            <div className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 bg-gray-50 opacity-70">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded border border-gray-200 shadow-sm bg-white"></div>
              </div>
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 text-gray-500 cursor-not-allowed font-medium"
                value="White"
                disabled
              />
              <input
                type="text"
                className="w-24 px-3 py-2 border border-gray-300 rounded text-sm text-center bg-gray-100 text-gray-500 cursor-not-allowed"
                value="-"
                disabled
              />
              <div className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-400">
                <span className="material-symbols-outlined text-[18px]">
                  lock
                </span>
              </div>
            </div>

            {formData.map((color, index) => (
              <div
                key={color.id}
                className="flex items-center gap-3 border p-3 rounded-lg border-gray-200 bg-white"
              >
                <div className="flex items-center gap-2 shrink-0 group relative cursor-pointer">
                  <input
                    type="color"
                    value={color.hex}
                    onChange={(e) => {
                      const newData = [...formData];
                      newData[index].hex = e.target.value;
                      setFormData(newData);
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                  <div
                    className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Color Name *"
                    className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-white ${
                      !color.name.trim() ? "border-red-400" : "border-gray-300"
                    }`}
                    value={color.name}
                    onChange={(e) => {
                      const newData = [...formData];
                      newData[index].name = e.target.value;
                      setFormData(newData);
                    }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Key"
                  className="w-24 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-center uppercase bg-white"
                  value={color.key}
                  onChange={(e) => {
                    const newData = [...formData];
                    newData[index].key = e.target.value;
                    setFormData(newData);
                  }}
                />

                <button
                  onClick={() => {
                    const newData = [...formData];
                    newData.splice(index, 1);
                    setFormData(newData);
                  }}
                  className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-red-500 rounded bg-white hover:bg-red-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </StandardDrawer>
  );
}
