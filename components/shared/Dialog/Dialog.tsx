import React, { useEffect } from "react";
import { cn } from "@lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className="relative mx-4 max-h-[90vh] w-full max-w-[500px] overflow-y-auto rounded-xl border border-glass-border glass-panel shadow-2xl animate-fade-up">
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-glass-border px-6 py-4">
            {title && (
              <h2 className="font-title text-lg font-semibold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-transparent text-2xl text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
