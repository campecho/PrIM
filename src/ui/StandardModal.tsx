import React from "react";
import { motion, AnimatePresence } from "motion/react";

export function StandardModal({
  isOpen,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  danger = false,
  maxWidth = "max-w-sm",
  fullScreen = false,
  icon,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  secondaryAction?: { label: string; onClick: () => void; disabled?: boolean };
  danger?: boolean;
  maxWidth?: string;
  fullScreen?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center ${fullScreen ? "" : "p-4"}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={fullScreen ? undefined : onClose}
            className={`absolute inset-0 ${fullScreen ? "bg-white" : "bg-black/30 backdrop-blur-sm"}`}
          />
          <motion.div
            initial={
              fullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }
            }
            animate={
              fullScreen ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              fullScreen ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 10 }
            }
            className={`relative w-full ${fullScreen ? "h-full rounded-none" : `${maxWidth} rounded-xl shadow-xl`} bg-white overflow-hidden flex flex-col`}
          >
            <div
              className={`shrink-0 flex ${fullScreen ? "h-[72px] items-center justify-center px-4 border-b border-[#969696]" : "items-start px-5 pt-5 pb-2 gap-4"} bg-white relative`}
            >
              {icon && !fullScreen && (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${danger ? "bg-red-100 text-[#cc0000]" : "bg-gray-100 text-gray-600"}`}
                >
                  {icon}
                </div>
              )}
              <div
                className={
                  fullScreen
                    ? "flex items-center justify-center h-full"
                    : "flex-1 pt-1"
                }
              >
                {fullScreen ? (
                  <h2 className="text-lg font-semibold flex items-center h-full m-0 min-w-[120px] justify-center text-gray-900">
                    {title}
                  </h2>
                ) : (
                  <h3 className="text-lg font-bold text-gray-900 mx-0 mb-1">
                    {title}
                  </h3>
                )}
              </div>
              {fullScreen && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-2xl">
                    close
                  </span>
                </button>
              )}
            </div>

            <div
              className={`flex-1 ${fullScreen ? "bg-gray-50 flex flex-col min-h-0" : "overflow-auto px-5 pb-6 pt-1"}`}
            >
              {!fullScreen && typeof children === "string" ? (
                <div
                  className={`text-sm text-gray-600 leading-relaxed ${icon ? "ml-14" : ""}`}
                >
                  {children}
                </div>
              ) : !fullScreen && icon ? (
                <div className="ml-14">{children}</div>
              ) : (
                children
              )}
            </div>

            {(primaryAction || secondaryAction) && (
              <div className="p-4 bg-gray-50 flex items-center justify-end gap-3 shrink-0 border-t border-gray-200">
                {secondaryAction && (
                  <button
                    onClick={secondaryAction.onClick}
                    disabled={secondaryAction.disabled}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-[20px] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {secondaryAction.label}
                  </button>
                )}
                {primaryAction && (
                  <button
                    onClick={primaryAction.onClick}
                    disabled={primaryAction.disabled}
                    className={`px-4 py-2 text-sm font-semibold text-white rounded-[20px] transition-colors shadow-sm disabled:opacity-50 ${danger ? "bg-[#cc0000] hover:bg-[#a30000]" : "bg-primary hover:bg-primary-dark"}`}
                  >
                    {primaryAction.label}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
