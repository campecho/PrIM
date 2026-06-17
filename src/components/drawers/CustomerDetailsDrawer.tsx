import React, { useState, useEffect } from "react";
import { useFirestoreSync } from "../../hooks/useFirestoreSync";
import { PrintCustomer } from "../../types";
import { StandardDrawer } from "../../ui/StandardDrawer";

export function CustomerDetailsDrawer({
  customer,
  onClose,
  onNavigateToFiles,
  handleTogglePin,
  handleAddNote,
  handleDeleteNote,
  handleUpdateNote,
  handleUpdateCustomer,
  newNote,
  setNewNote,
  editingNoteId,
  setEditingNoteId,
  editingNoteText,
  setEditingNoteText,
  initialTab,
}: {
  customer: PrintCustomer | null;
  onClose: () => void;
  onNavigateToFiles: (account: string) => void;
  handleTogglePin: (noteId: string) => void;
  handleAddNote: () => void;
  handleDeleteNote: (noteId: string) => void;
  handleUpdateNote: (noteId: string) => void;
  handleUpdateCustomer: (customer: PrintCustomer) => void;
  newNote: string;
  setNewNote: (val: string) => void;
  editingNoteId: string | null;
  setEditingNoteId: (val: string | null) => void;
  editingNoteText: string;
  setEditingNoteText: (val: string) => void;
  initialTab: "details" | "notes" | "specs";
}) {
  const [activeTab, setActiveTab] = React.useState<
    "details" | "notes" | "specs"
  >("details");

  const [printSpecs] = useFirestoreSync<any[]>("appData", "print_specs", []);

  React.useEffect(() => {
    if (customer) setActiveTab(initialTab);
  }, [customer?.id, initialTab]);

  if (!customer) return null;

  return (
    <StandardDrawer
      isOpen={!!customer}
      onClose={onClose}
      title={<span className="font-semibold">{customer.companyName}</span>}
      customWidth="w-full lg:w-[600px]"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            onClick={() => onNavigateToFiles(customer.accountNumber)}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-[20px] hover:bg-gray-50 transition-all shadow-sm"
          >
            View Files
          </button>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-white">
        <div className="flex px-6 pt-4 pb-0 border-b border-gray-200 gap-8 shrink-0">
          <button
            onClick={() => setActiveTab("details")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Customer Details
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "specs" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Specs
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${activeTab === "specs" ? "bg-primary-alpha text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              {customer.assignedSpecs?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex gap-2 items-center ${activeTab === "notes" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
          >
            Notes
            <span
              className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${activeTab === "notes" ? "bg-primary-alpha text-primary" : "bg-gray-100 text-gray-500"}`}
            >
              {customer.notes.length}
            </span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "details" && (
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight m-0">
                    {customer.accountNumber}
                  </h3>
                  <span className="text-xl font-bold text-gray-900 leading-tight m-0 opacity-40">
                    -
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight m-0">
                    {customer.companyName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-6 text-sm max-w-lg">
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Location
                    </span>
                    <span className="text-gray-900 font-medium">
                      {customer.city}, {customer.state}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      3rd Party Portal
                    </span>
                    <span className="text-gray-900 font-medium">
                      {customer.threePP || "None"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Print to Store
                    </span>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold tracking-wide ${customer.printToStore ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}
                    >
                      {customer.printToStore ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pinned Notes Section mapped into Details Tab */}
              {customer.notes.some((n) => n.isPinned) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 px-1 border-b border-gray-100 pb-2 flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[16px] text-primary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      push_pin
                    </span>
                    Pinned Notes
                  </h4>
                  <div className="flex flex-col gap-3">
                    {customer.notes
                      .filter((n) => n.isPinned)
                      .map((note) => (
                        <div
                          key={note.id}
                          className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm group relative"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {note.author}
                            </span>
                            <span className="text-[11px] text-gray-500 uppercase font-medium tracking-wider">
                              {note.date}
                            </span>
                          </div>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleTogglePin(note.id)}
                              title="Unpin Note"
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              <span
                                className="material-symbols-outlined text-[16px]"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                push_pin
                              </span>
                            </button>
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {note.text}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Assigned Specs
                </h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  {customer.assignedSpecs?.length || 0} selected
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3 w-12 text-center"></th>
                      <th className="px-4 py-3">Spec Name</th>
                      <th className="px-4 py-3 hidden sm:table-cell">
                        Product Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {printSpecs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500 text-sm"
                        >
                          No specs available in library.
                        </td>
                      </tr>
                    ) : (
                      printSpecs.map((spec) => {
                        const isAssigned =
                          customer.assignedSpecs?.includes(spec.id) || false;
                        return (
                          <tr
                            key={spec.id}
                            className={`hover:bg-gray-50 transition-colors cursor-pointer group ${isAssigned ? "bg-[#f0f7ff]" : ""}`}
                            onClick={() => {
                              const currentAssigned =
                                customer.assignedSpecs || [];
                              const newAssigned = isAssigned
                                ? currentAssigned.filter((id) => id !== spec.id)
                                : [...currentAssigned, spec.id];
                              handleUpdateCustomer({
                                ...customer,
                                assignedSpecs: newAssigned,
                              });
                            }}
                          >
                            <td className="px-4 py-3 text-center">
                              <div
                                className={`w-5 h-5 rounded-[3px] border flex items-center justify-center transition-colors mx-auto ${isAssigned ? "bg-primary border-primary" : "border-[#969696] bg-white group-hover:border-primary/50"}`}
                              >
                                {isAssigned && (
                                  <span
                                    className="material-symbols-outlined text-[14px] text-white font-bold"
                                    style={{
                                      fontVariationSettings: "'wght' 700",
                                    }}
                                  >
                                    check
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">
                                {spec.name}
                              </div>
                              {spec.description && (
                                <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px] lg:max-w-[300px]">
                                  {spec.description}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <span className="inline-flex px-2 py-0.5 rounded text-[11px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                {spec.productType}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="flex flex-col h-full gap-6">
              {/* Add New Note */}
              <div className="space-y-3 shrink-0">
                <label className="block text-sm font-semibold text-gray-700">
                  Add New Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter customer or account notes..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-alpha focus:border-primary transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="px-6 py-2 bg-primary text-white text-sm font-semibold rounded-[20px] hover:bg-primary-dark transition-all disabled:opacity-50 shadow-sm"
                  >
                    Save Note
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 shrink-0" />

              <div className="space-y-4 flex-1">
                {customer.notes
                  .filter((n) => !n.isPinned)
                  .map((note) => (
                    <div
                      key={note.id}
                      className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm group"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {note.author}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                            {note.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            title="Pin Note"
                            className="text-gray-400 hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              push_pin
                            </span>
                          </button>
                          {note.author === "Alex Miller" && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditingNoteText(note.text);
                                }}
                                title="Edit Note"
                                className="text-gray-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                title="Delete Note"
                                className="text-gray-400 hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  delete
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      {editingNoteId === note.id ? (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-primary-alpha focus:border-primary outline-none resize-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="text-xs text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateNote(note.id)}
                              className="text-xs text-[var(--color-link-blue)] font-semibold hover:underline"
                            >
                              Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {note.text}
                        </p>
                      )}
                    </div>
                  ))}

                {customer.notes.filter((n) => !n.isPinned).length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-sm">
                    No active notes.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StandardDrawer>
  );
}
