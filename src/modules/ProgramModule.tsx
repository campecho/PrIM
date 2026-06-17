import React, { useState, useEffect } from "react";
import { FileImportCard } from "../components/FileImportCard";
import { CustomerDetailsDrawer } from "../components/drawers/CustomerDetailsDrawer";
import { CustomerFilesDrawer } from "../components/drawers/CustomerFilesDrawer";
import { MOCK_CUSTOMERS } from "../data/mockData";
import { useFirestoreSync } from "../hooks/useFirestoreSync";
import { CustomerNote, FileAsset, PrintCustomer } from "../types";
import { SearchBar } from "../ui/SearchBar";

export function ProgramModule({
  onNavigateToFiles,
  files,
  setFiles,
}: {
  onNavigateToFiles: (account: string) => void;
  files: FileAsset[];
  setFiles: React.Dispatch<React.SetStateAction<FileAsset[]>>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<PrintCustomer | null>(null);
  const [newNote, setNewNote] = useState("");
  const [customers, setCustomers] = useFirestoreSync(
    "appData",
    "customers",
    MOCK_CUSTOMERS,
  );

  React.useEffect(() => {
    if (customers && customers.length > 0) {
      const acme = customers.find((c) => c.companyName === "Acme Corp");
      if (
        acme &&
        (!acme.assignedSpecs ||
          !acme.assignedSpecs.includes("spec-rack-card-4x12"))
      ) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === acme.id
              ? {
                  ...c,
                  assignedSpecs: [
                    ...(c.assignedSpecs || []),
                    "spec-rack-card-4x12",
                  ],
                }
              : c,
          ),
        );
      }
    }
  }, [customers, setCustomers]);

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [viewFilesForCustomer, setViewFilesForCustomer] =
    useState<PrintCustomer | null>(null);
  const [selectedCustomerFile, setSelectedCustomerFile] =
    useState<FileAsset | null>(null);
  const [returnToCustomerFiles, setReturnToCustomerFiles] =
    useState<PrintCustomer | null>(null);

  const [initialDrawerTab, setInitialDrawerTab] = useState<
    "details" | "notes" | "specs"
  >("details");

  const handleOpenDetailFromCustomer = (file: FileAsset) => {
    if (viewFilesForCustomer) {
      setReturnToCustomerFiles(viewFilesForCustomer);
      setViewFilesForCustomer(null);
      setTimeout(() => {
        setSelectedCustomerFile(file);
      }, 300);
    } else {
      setSelectedCustomerFile(file);
    }
  };

  const handleCloseDetail = (file: FileAsset | null) => {
    if (file === null) {
      setSelectedCustomerFile(null);
      if (returnToCustomerFiles) {
        setTimeout(() => {
          setViewFilesForCustomer(returnToCustomerFiles);
          setReturnToCustomerFiles(null);
        }, 600);
      }
    } else {
      setSelectedCustomerFile(file);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const safeCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedCustomers = filteredCustomers.slice(
    (safeCurrentPage - 1) * itemsPerPage,
    safeCurrentPage * itemsPerPage,
  );

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedCustomer) return;

    const note: CustomerNote = {
      id: Math.random().toString(36).substr(2, 9),
      author: "Alex Miller",
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }),
      text: newNote,
    };

    const updatedCustomers = customers.map((c) => {
      if (c.id === selectedCustomer.id) {
        return {
          ...c,
          notes: [note, ...c.notes],
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    setSelectedCustomer({
      ...selectedCustomer,
      notes: [note, ...selectedCustomer.notes],
    });
    setNewNote("");
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedCustomer) return;
    const updatedNotes = selectedCustomer.notes.filter((n) => n.id !== noteId);
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
  };

  const handleTogglePin = (noteId: string) => {
    if (!selectedCustomer) return;
    const updatedNotes = selectedCustomer.notes.map((n) =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n,
    );
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
  };

  const handleUpdateNote = (noteId: string) => {
    if (!selectedCustomer || !editingNoteText.trim()) return;
    const updatedNotes = selectedCustomer.notes.map((n) =>
      n.id === noteId ? { ...n, text: editingNoteText } : n,
    );
    setCustomers(
      customers.map((c) =>
        c.id === selectedCustomer.id ? { ...c, notes: updatedNotes } : c,
      ),
    );
    setSelectedCustomer({ ...selectedCustomer, notes: updatedNotes });
    setEditingNoteId(null);
    setEditingNoteText("");
  };

  return (
    <>
      {/* Full width row (12 columns) */}
      <div className="col-span-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Program Overview
        </h2>
        <p className="text-gray-600">
          This card spans all 12 columns. Use this for major summaries, data
          tables, or wide charts.
        </p>
      </div>

      {/* Half width row (6 columns each) */}
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Recent Activity
        </h2>
        <p className="text-gray-600">
          This card spans 6 columns (half width on large screens).
        </p>
      </div>
      <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Quick Actions
        </h2>
        <p className="text-gray-600">
          This card spans 6 columns (half width on large screens).
        </p>
      </div>

      {/* 8/4 split row */}
      <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Main Content Area
        </h2>
        <p className="text-gray-600">
          This card spans 8 columns. Good for primary content alongside a
          sidebar.
        </p>
      </div>
      <FileImportCard
        className="col-span-12 lg:col-span-4"
        onImport={(newFiles) => setFiles((prev) => [...newFiles, ...prev])}
      />

      {/* New Customers Table Card (12 columns) */}
      <div className="col-span-12 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Program Print Customers
          </h2>
          <SearchBar
            placeholder="Search by company or account..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="w-full sm:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Account Number
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Company Name
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  Files
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  Address
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100">
                  3PP
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  P2S
                </th>
                <th className="px-6 py-2.5 text-sm font-normal text-gray-900 border-b border-gray-100 text-center">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCustomers.length > 0 ? (
                paginatedCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.accountNumber}
                    </td>
                    <td className="px-6 py-2.5 text-sm">
                      <button
                        onClick={() => {
                          setInitialDrawerTab("details");
                          setSelectedCustomer(customer);
                        }}
                        className="text-[var(--color-link-blue)] hover:underline font-medium text-left"
                      >
                        {customer.companyName}
                      </button>
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center text-gray-900">
                      {files.filter((f) =>
                        f.customerAccounts.includes(customer.accountNumber),
                      ).length > 0 ? (
                        <button
                          onClick={() => setViewFilesForCustomer(customer)}
                          className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-[#f0f7ff] text-[var(--color-link-blue)] rounded-full text-xs font-semibold hover:bg-[#e0efff] transition-colors"
                        >
                          {
                            files.filter((f) =>
                              f.customerAccounts.includes(
                                customer.accountNumber,
                              ),
                            ).length
                          }
                        </button>
                      ) : (
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          0
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.city}, {customer.state}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-gray-900">
                      {customer.threePP}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center text-gray-900">
                      {customer.printToStore ? "Yes" : "No"}
                    </td>
                    <td className="px-6 py-2.5 text-sm text-center">
                      <button
                        onClick={() => {
                          setInitialDrawerTab("notes");
                          setSelectedCustomer(customer);
                        }}
                        className="text-gray-900 hover:text-gray-600 transition-colors p-1"
                        title="View Notes"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          notes
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500 text-sm"
                  >
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
            <span className="text-sm text-gray-500">
              Showing {(safeCurrentPage - 1) * itemsPerPage + 1} to{" "}
              {Math.min(
                safeCurrentPage * itemsPerPage,
                filteredCustomers.length,
              )}{" "}
              of {filteredCustomers.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                Previous
              </button>
              <div className="px-3 py-1 text-sm font-medium text-gray-700">
                {safeCurrentPage} / {totalPages}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <CustomerDetailsDrawer
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onNavigateToFiles={(acct) => {
          setSelectedCustomer(null);
          onNavigateToFiles(acct);
        }}
        handleTogglePin={handleTogglePin}
        handleAddNote={handleAddNote}
        handleDeleteNote={handleDeleteNote}
        handleUpdateNote={handleUpdateNote}
        handleUpdateCustomer={(c) => {
          setCustomers((prev) => prev.map((p) => (p.id === c.id ? c : p)));
          setSelectedCustomer(c);
        }}
        newNote={newNote}
        setNewNote={setNewNote}
        editingNoteId={editingNoteId}
        setEditingNoteId={setEditingNoteId}
        editingNoteText={editingNoteText}
        setEditingNoteText={setEditingNoteText}
        initialTab={initialDrawerTab}
      />

      <CustomerFilesDrawer
        customer={viewFilesForCustomer}
        onClose={() => setViewFilesForCustomer(null)}
        files={files}
        onOpenDetail={handleOpenDetailFromCustomer}
        onNavigateToFiles={(acct) => {
          setViewFilesForCustomer(null);
          onNavigateToFiles(acct);
        }}
      />
    </>
  );
}
