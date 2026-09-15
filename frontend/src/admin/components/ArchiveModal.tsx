import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoArchiveOutline, IoCloudUploadOutline } from "react-icons/io5";

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  nuevoEstado: string;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  nuevoEstado,
}) => {
  const isPublishing = nuevoEstado === "Publicado";
  const Icon = isPublishing ? IoCloudUploadOutline : IoArchiveOutline;
  const colorClass = isPublishing ? "text-emerald-500 bg-emerald-50" : "text-amber-500 bg-amber-50";
  const btnClass = isPublishing ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-900/10" : "bg-amber-500 hover:bg-amber-600 shadow-amber-900/10";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center border border-gray-100"
          >
            <div className={`w-16 h-16 rounded-2xl ${colorClass} flex items-center justify-center mb-4`}>
              <Icon size={32} />
            </div>
            <h2 className="text-xl font-black text-[#0E1C2B] mb-2">
              {isPublishing ? "Publicar Item" : "Archivar Item"}
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              ¿Estás seguro de que deseas {isPublishing ? "publicar" : "archivar"} a <span className="font-bold text-[#0E1C2B]">{itemName}</span>?
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
                className={`flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95 ${btnClass}`}
              >
                {isPublishing ? "Publicar" : "Archivar"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
