import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { IoAlertCircle } from "react-icons/io5";

type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
  title?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message = "¿Estás seguro de continuar?",
  title = "Confirmación",
}: ConfirmModalProps) {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0E1C2B]/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
              <IoAlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-[#0E1C2B] mb-2">{title}</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              >
                No, cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-[#0E1C2B] text-white hover:bg-sky-600 transition-all shadow-lg active:scale-95"
              >
                Sí, continuar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}