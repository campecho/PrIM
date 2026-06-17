import { useState, useEffect } from "react";
import { StandardDrawer } from "../../ui/StandardDrawer";
import { Button } from "../../ui/Button";

export function MappingDetailDrawer({
  selectedMapping,
  onClose,
  onSave,
  onDelete,
  sources,
}: {
  selectedMapping: any;
  onClose: () => void;
  onSave: (mapping: any) => void;
  onDelete?: () => void;
  sources: any[];
}) {
  const [editingMapping, setEditingMapping] = useState<any>(selectedMapping || null);

  useEffect(() => {
    setEditingMapping(selectedMapping);
  }, [selectedMapping]);

  return (
    <StandardDrawer
      isOpen={!!selectedMapping}
      onClose={onClose}
      title={selectedMapping?.externalItemId ? "Edit Mapping: " + selectedMapping.externalItemId : "New Mapping"}
      footer={
        <div className="flex items-center justify-between w-full">
          {onDelete ? (
            <Button
              variant="ghost"
              leadingIcon="delete"
              onClick={onDelete}
              className="!text-primary hover:!bg-red-50"
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => onSave(editingMapping)}
              disabled={!editingMapping?.externalItemId?.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      {selectedMapping && (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                External Item ID <span className="text-[#cc0000]">*</span>
              </label>
            <input
              type="text"
              value={editingMapping?.externalItemId || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, externalItemId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Internal Item ID (SKU)
            </label>
            <input
              type="text"
              value={editingMapping?.internalItemId || editingMapping?.sku || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, internalItemId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                QTY Modify Type
              </label>
              <select
                value={editingMapping?.qtyModifyType || "none"}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, qtyModifyType: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              >
                <option value="none">none</option>
                <option value="multiply">multiply</option>
                <option value="divide">divide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                QTY Modifier
              </label>
              <input
                type="text"
                value={editingMapping?.qtyModifier || ""}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, qtyModifier: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={editingMapping?.description || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Source
            </label>
            <select
              value={editingMapping?.sourceId || ""}
              onChange={(e) =>
                setEditingMapping({ ...editingMapping, sourceId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
            >
              <option value="">None</option>
              {sources.map((src) => (
                <option key={src.id} value={src.id}>{src.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Spec Type
              </label>
              <select
                value={editingMapping?.specType || "None assigned"}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, specType: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm"
              >
                <option value="None assigned">None assigned</option>
                <option value="templateId">templateId</option>
                <option value="jdfToken">jdfToken</option>
                <option value="JDF Token">JDF Token</option>
                <option value="Template">Template</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Spec Value
              </label>
              <input
                type="text"
                value={editingMapping?.specValue || ""}
                onChange={(e) =>
                  setEditingMapping({ ...editingMapping, specValue: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm font-mono"
              />
            </div>
          </div>
        </div>
      </div>
      )}
    </StandardDrawer>
  );
}
