import React, { useEffect } from "react";
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogBody
} from "./Dialog.styles";

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
  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when dialog is open
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

  return (
    <DialogOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <DialogContent>
        {(title || showCloseButton) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {showCloseButton && <DialogClose onClick={onClose}>×</DialogClose>}
          </DialogHeader>
        )}
        <DialogBody>{children}</DialogBody>
      </DialogContent>
    </DialogOverlay>
  );
};
