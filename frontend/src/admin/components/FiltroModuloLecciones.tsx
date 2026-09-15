import type { Modulo } from "../../types/models";
import type { Dispatch, SetStateAction } from "react";

export interface FiltroModuloLeccionesProps {
  value: number | "";
  onChange: Dispatch<SetStateAction<number | "">>;
  modulos: Modulo[];
}

export function FiltroModuloLecciones({
  value,
  onChange,
  modulos,
}: FiltroModuloLeccionesProps) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value === "" ? "" : Number(e.target.value))
      }
      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
    >
      <option value="">Todos los módulos</option>
      {modulos.map((mod) => (
        <option key={mod.id_modulo} value={mod.id_modulo}>
          {mod.titulo}
        </option>
      ))}
    </select>
  );
}
