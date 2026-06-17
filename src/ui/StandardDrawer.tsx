import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

export function StandardDrawer({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  hasChanges,
  saveDisabled,
  saveLabel = "Save Changes",
  customWidth = "w-[95vw] lg:w-[600px]",
  footer,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  onSave?: () => void;
  hasChanges?: boolean;
  saveDisabled?: boolean;
  saveLabel?: string;
  customWidth?: string;
  footer?: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-[75539]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [1, 0.01, 0.01, 1] }}
            className={`fixed right-0 top-0 h-full ${customWidth} bg-white text-black z-[75540] flex flex-col rounded-l-[3px] shadow-[0_0_6px_rgba(156,156,156,0.7)]`}
          >
            <div className="h-[72px] pt-2 shrink-0 flex items-center justify-center relative bg-white border-b border-[#969696] px-4">
              <h2 className="text-lg font-semibold flex items-center h-full m-0 justify-center">
                {title}
              </h2>
              <IconButton
                icon="close"
                label="Close"
                onClick={onClose}
                className="absolute right-4 top-[calc(50%+4px)] -translate-y-1/2"
              />
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto w-full">
              {children}
            </div>

            {footer ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  bottom: "0px",
                  borderRadius: "0px",
                  boxShadow: "rgba(156, 156, 156, 0.7) 0px 0px 6px",
                  height: "auto",
                  padding: "12px 24px",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 9,
                  background: "rgb(255, 255, 255)",
                }}
                className="items-center shrink-0"
              >
                {footer}
              </div>
            ) : onSave ? (
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  bottom: "0px",
                  borderRadius: "0px",
                  boxShadow: "rgba(156, 156, 156, 0.7) 0px 0px 6px",
                  height: "auto",
                  padding: "12px 24px",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  position: "relative",
                  zIndex: 9,
                  background: "rgb(255, 255, 255)",
                }}
                className="items-center shrink-0"
              >
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={onSave}
                  disabled={hasChanges === false || saveDisabled === true}
                  className="ml-3"
                >
                  {saveLabel}
                </Button>
              </div>
            ) : null}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
