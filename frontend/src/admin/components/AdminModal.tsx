import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "max-w-2xl",
}) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start md:items-center justify-center p-4 md:p-10 overflow-y-auto custom-scrollbar bg-[#0E1C2B]/60 backdrop-blur-md">
          {/* Backdrop (Click to close) */}
          <div className="fixed inset-0 z-0" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className={`relative w-full ${maxWidth} bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 z-10 my-4 md:my-auto`}
          >
            {/* Header */}
            <div className="px-5 md:px-8 py-5 md:py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-white">
              <h2 className="text-xl md:text-2xl font-black text-[#0E1C2B] tracking-tight">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all active:scale-90"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 md:px-8 py-6 max-h-[50vh] md:max-h-[60vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-5 md:px-8 pt-5 pb-10 md:py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-end gap-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AdminModal;
