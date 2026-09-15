import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoTrashOutline } from "react-icons/io5";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-red-950/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center border border-red-100"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <IoTrashOutline size={32} />
            </div>
            <h2 className="text-xl font-black text-red-900 mb-2">Confirmar Eliminación</h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              ¿Estás seguro de que deseas eliminar <span className="font-bold text-red-600">{itemName}</span>? Esta acción no se puede deshacer.
            </p>
            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 active:scale-95"
              >
                Sí, eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteModal;
