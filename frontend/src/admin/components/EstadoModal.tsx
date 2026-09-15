import React from "react";

interface EstadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  nombreDocente: string;
  nuevoEstado: "Activo" | "Inactivo";
}

export const EstadoModal: React.FC<EstadoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  nombreDocente,
  nuevoEstado,
}) => {
  if (!isOpen) return null;

  const accion = nuevoEstado === "Activo" ? "activar" : "inactivar";

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Confirmación de estado
        </h2>
        <p className="text-gray-600 mb-4 text-center text-md">
          ¿Estás seguro de <span className="font-semibold">{accion}</span> a{" "}
          <span className="font-semibold">{nombreDocente}</span>?
        </p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded text-white text-md ${
              nuevoEstado === "Activo"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {accion.charAt(0).toUpperCase() + accion.slice(1)}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
