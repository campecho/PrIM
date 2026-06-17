import React, { useState, useRef, useEffect } from "react";
import { MOCK_CUSTOMERS } from "../../data/mockData";
import { formatDisplayDate, getCompanyName } from "../../lib/format";
import { StandardDrawer } from "../../ui/StandardDrawer";
import { StandardModal } from "../../ui/StandardModal";

export function SharedFileDetailDrawer({
  selectedFile,
  setSelectedFile,
  files,
  setFiles,
  selectedFileIds,
}: any) {
  const [draftFile, setDraftFile] = React.useState<any>(null);
  const [hasChanges, setHasChanges] = React.useState(false);
  const [activeDrawerTab, setActiveDrawerTab] = React.useState<
    "information" | "users" | "print"
  >("information");
  const [accountToRemove, setAccountToRemove] = React.useState<string | null>(
    null,
  );
  const [newAccountsInput, setNewAccountsInput] = React.useState("");
  const [isAddingAccount, setIsAddingAccount] = React.useState(false);
  const printSettingsRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    setDraftFile(selectedFile);
    setHasChanges(false);
    setActiveDrawerTab("information");
    setIsAddingAccount(false);
    setNewAccountsInput("");
    setAccountToRemove(null);
  }, [selectedFile]);

  // A standalone simple lookup
  const getCompanyName = (acc: string) => {
    if (acc === "123456789") return "Acme Corp";
    if (acc === "987654321") return "Globex";
    if (acc === "555666777") return "Stark Ind.";
    if (acc === "111222333") return "Initech";
    if (acc === "444555666") return "Umbrella Corp";
    if (acc === "777888999") return "Wayne Ent.";
    if (acc === "222333444") return "Cyberdyne";
    if (acc === "555444333") return "Massive Dynamic";
    return "-";
  };

  const titleNode = (
    <div className="flex items-center gap-4 w-full pr-12 justify-center">
      {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = selectedFileIds.indexOf(selectedFile.id);
              const prevId =
                selectedFileIds[
                  (currentIndex - 1 + selectedFileIds.length) %
                    selectedFileIds.length
                ];
              const prevFile = files.find((f: any) => f.id === prevId);
              if (prevFile) setSelectedFile(prevFile);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -ml-10 text-primary hover:text-primary-dark"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_left
            </span>
          </button>
        )}

      <span className="h-full min-w-[120px] flex items-center justify-center font-semibold text-lg text-black">
        {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id)
          ? `File ${selectedFileIds.indexOf(selectedFile.id) + 1} of ${selectedFileIds.length}`
          : "File Details"}
      </span>

      {selectedFileIds.length > 1 &&
        !!selectedFile &&
        selectedFileIds.includes(selectedFile.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = selectedFileIds.indexOf(selectedFile.id);
              const nextId =
                selectedFileIds[(currentIndex + 1) % selectedFileIds.length];
              const nextFile = files.find((f: any) => f.id === nextId);
              if (nextFile) setSelectedFile(nextFile);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -mr-10 text-primary hover:text-primary-dark"
          >
            <span className="material-symbols-outlined text-[20px]">
              chevron_right
            </span>
          </button>
        )}
    </div>
  );

  return (
    <>
      <StandardDrawer
        isOpen={!!(selectedFile && draftFile)}
        onClose={() => setSelectedFile(null)}
        title={titleNode}
        customWidth="w-[95vw] lg:w-[1100px]"
        hasChanges={hasChanges}
        saveDisabled={!draftFile?.name.trim()}
        onSave={() => {
          if (!hasChanges) return;
          setFiles(
            files.map((a: any) => (a.id === draftFile.id ? draftFile : a)),
          );
          setHasChanges(false);
          setSelectedFile(null);
        }}
      >
        {selectedFile && draftFile && (
          <div className="flex-1 flex overflow-hidden flex-col lg:flex-row w-full h-full">
            {/* Left Column: Fixed File Preview */}
            <div className="w-full lg:w-1/2 bg-[#e6e6e6] border-r border-[#d4d4d4] flex flex-col items-center justify-center p-8 relative shrink-0 min-h-[50vh] lg:min-h-0">
              <div className="w-full max-w-[400px] aspect-[4/5] bg-white shadow-xl flex flex-col items-center justify-center relative">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                  image
                </span>
                <p className="text-sm font-medium text-gray-400">
                  {draftFile.dimensions}
                </p>
                <p className="text-xs text-gray-300 uppercase mt-2">
                  {draftFile.type}
                </p>
              </div>

              {/* Pagination Controls */}
              {draftFile.pageCount > 1 && (
                <div className="absolute bottom-10 flex items-center justify-center gap-6">
                  <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors">
                    <span className="material-symbols-outlined font-light text-4xl text-black select-none">
                      chevron_left
                    </span>
                  </button>
                  <div className="px-5 py-2 bg-[#2d2d2d] text-white font-medium text-sm rounded-full tracking-widest leading-none flex items-center h-10 select-none">
                    1 / {draftFile.pageCount}
                  </div>
                  <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors">
                    <span className="material-symbols-outlined font-normal text-2xl text-black select-none">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Scrollable Data Layout */}
            <div className="w-1/2 flex flex-col bg-white border-l border-gray-200">
              {/* Tabs */}
              <div className="flex px-8 pt-6 pb-0 border-b border-gray-200 gap-8 shrink-0">
                <button
                  onClick={() => setActiveDrawerTab("information")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "information" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Information
                </button>
                <button
                  onClick={() => setActiveDrawerTab("users")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "users" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Users & Accounts
                </button>
                <button
                  onClick={() => setActiveDrawerTab("print")}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeDrawerTab === "print" ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}
                >
                  Print Settings
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-xl mx-auto space-y-10">
                  {/* Information Section */}
                  {activeDrawerTab === "information" && (
                    <section>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-[#cc0000]">*</span>
                          </label>
                          <input
                            type="text"
                            value={draftFile.name}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                name: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={draftFile.description}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                description: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            File ID
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={draftFile.fileId}
                            className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-md p-1.5 outline-none font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Version
                          </label>
                          <div className="flex items-center gap-3 h-[34px]">
                            <span className="text-sm text-gray-900">
                              {draftFile.version.replace(/^v/, "")}
                            </span>
                            <label className="text-sm text-[var(--color-link-blue)] hover:underline cursor-pointer font-medium">
                              Replace file
                              <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  if (
                                    e.target.files &&
                                    e.target.files.length > 0
                                  ) {
                                    setHasChanges(true);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Updated
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {formatDisplayDate(draftFile.updatedAt)} by{" "}
                            {draftFile.lastUpdatedBy}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            File Size
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.fileSize}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Page Size
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.dimensions}
                          </div>
                        </div>
                        {!["PNG", "JPG", "SVG", "GIF"].includes(
                          draftFile.type,
                        ) && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Page Count
                            </label>
                            <div className="text-sm text-gray-900 mt-1">
                              {draftFile.pageCount}{" "}
                              {draftFile.pageCount === 1 ? "Page" : "Pages"}
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color Mode
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.colorMode}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Resolution
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.resolutionDpi} dpi
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Preflight Check
                          </label>
                          <div className="text-sm text-green-600 mt-1 flex items-center gap-1 font-medium">
                            <span className="material-symbols-outlined text-[18px]">
                              check_circle
                            </span>
                            Passed
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Users & Accounts Section */}
                  {activeDrawerTab === "users" && (
                    <section>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Customer Accounts
                          </label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {draftFile.customerAccounts.map((account) => {
                              const customer = MOCK_CUSTOMERS.find(
                                (c) => c.accountNumber === account,
                              );
                              const companyName = customer
                                ? customer.companyName
                                : getCompanyName(account);
                              return (
                                <span
                                  key={account}
                                  className="inline-flex items-center max-w-full px-3 h-[30px] rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 shadow-sm gap-1.5 box-border"
                                >
                                  <span className="font-mono shrink-0">
                                    {account}
                                  </span>
                                  <span className="text-gray-400 shrink-0">
                                    |
                                  </span>
                                  <span className="truncate font-normal min-w-0">
                                    {companyName}
                                  </span>
                                  <button
                                    onClick={() => setAccountToRemove(account)}
                                    className="ml-1 -mr-1.5 shrink-0 flex items-center justify-center w-5 h-5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-800 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">
                                      close
                                    </span>
                                  </button>
                                </span>
                              );
                            })}
                            {!isAddingAccount ? (
                              <button
                                onClick={() => setIsAddingAccount(true)}
                                className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-full bg-gray-100 text-gray-600 border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors box-border"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  add
                                </span>
                              </button>
                            ) : (
                              <div className="flex gap-2 w-full lg:w-auto items-center mt-2 lg:mt-0">
                                <input
                                  type="text"
                                  value={newAccountsInput}
                                  onChange={(e) =>
                                    setNewAccountsInput(e.target.value)
                                  }
                                  placeholder="Add accounts (comma separated)"
                                  className="flex-1 min-w-[200px] border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none"
                                />
                                <button
                                  onClick={() => {
                                    setIsAddingAccount(false);
                                    setNewAccountsInput("");
                                  }}
                                  className="px-[19px] py-1.5 text-sm font-semibold text-black bg-white border border-[#969696] hover:bg-gray-50 rounded-[20px] transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const newAccs = newAccountsInput
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean);
                                    if (newAccs.length > 0) {
                                      setDraftFile({
                                        ...draftFile,
                                        customerAccounts: Array.from(
                                          new Set([
                                            ...draftFile.customerAccounts,
                                            ...newAccs,
                                          ]),
                                        ),
                                      });
                                      setHasChanges(true);
                                      setNewAccountsInput("");
                                      setIsAddingAccount(false);
                                    }
                                  }}
                                  disabled={!newAccountsInput.trim()}
                                  className="px-[28px] py-1.5 text-sm font-semibold text-white bg-[#cc0000] hover:bg-[#a30000] rounded-[22px] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors border border-transparent"
                                >
                                  Add
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Added By
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.addedBy}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Owned By
                          </label>
                          <div className="text-sm text-gray-900 mt-1">
                            {draftFile.ownedBy}
                          </div>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Personal / Shared
                          </label>
                          <button
                            onClick={() => {
                              setDraftFile({
                                ...draftFile,
                                isShared: !draftFile.isShared,
                              });
                              setHasChanges(true);
                            }}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${draftFile.isShared ? "bg-primary" : "bg-gray-200"}`}
                            role="switch"
                            aria-checked={draftFile.isShared}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${draftFile.isShared ? "translate-x-4" : "translate-x-0"}`}
                            />
                          </button>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Print Settings Section */}
                  {activeDrawerTab === "print" && (
                    <section ref={printSettingsRef}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Assigned SKU / Item #
                          </label>
                          <input
                            type="text"
                            value={draftFile.sku}
                            onChange={(e) => {
                              setDraftFile({
                                ...draftFile,
                                sku: e.target.value,
                              });
                              setHasChanges(true);
                            }}
                            placeholder="Enter alphanumeric SKU"
                            className="w-full border border-gray-300 rounded-md p-1.5 text-sm focus:border-primary outline-none uppercase"
                          />
                        </div>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </StandardDrawer>

      {/* Account Removal Modal */}
      <StandardModal
        isOpen={!!(accountToRemove && draftFile)}
        onClose={() => setAccountToRemove(null)}
        title="Remove Account"
        danger={true}
        icon={<span className="material-symbols-outlined">delete</span>}
        primaryAction={{
          label: "Remove Account",
          onClick: () => {
            if (draftFile) {
              setDraftFile({
                ...draftFile,
                customerAccounts: draftFile.customerAccounts.filter(
                  (a) => a !== accountToRemove,
                ),
              });
              setHasChanges(true);
              setAccountToRemove(null);
            }
          },
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setAccountToRemove(null),
        }}
      >
        Are you sure you want to remove account{" "}
        <span className="font-mono text-gray-900 font-medium">
          {accountToRemove}
        </span>{" "}
        from this file? This action will not be saved until you apply changes to
        the drawer.
      </StandardModal>
    </>
  );
}
