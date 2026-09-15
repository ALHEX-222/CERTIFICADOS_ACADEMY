import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, FolderClosed, FolderOpen } from "lucide-react";

interface AccordionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 relative overflow-hidden group
          ${isOpen ? "text-white bg-white/5" : "text-slate-500 hover:text-white hover:bg-white/5"}
        `}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className={`transition-colors duration-500 ${isOpen ? "text-sky-400" : "text-slate-500 group-hover:text-white"}`}>
            {icon ? icon : (isOpen ? <FolderOpen size={16} /> : <FolderClosed size={16} />)}
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider">{title}</span>
        </div>

        <div className={`transition-all duration-500 relative z-10 ${isOpen ? "rotate-180 text-sky-400" : "text-slate-600 group-hover:text-white"}`}>
          <ChevronDown size={14} />
        </div>

        {/* Active Indicator Glow */}
        {isOpen && (
          <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-sky-500/50 shadow-[0_0_10px_rgba(14,165,233,0.5)] rounded-full" />
        )}
      </button>

      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 py-1 space-y-0.5 border-l border-white/5 ml-6 mt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
