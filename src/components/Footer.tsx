
import { Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-migusto-tierra-oscuro border-t border-white/5 mt-20 py-10 relative">
      <div className="w-full px-8">
        <div className="flex flex-col md:flex-row items-center justify-center relative min-h-[60px]">
          
          {/* Esquina Inferior Izquierda: Logo + Texto (Absoluto en desktop) */}
          <div className="md:absolute md:left-0 md:bottom-0 flex items-center gap-4 group mb-6 md:mb-0">
            <img 
              src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
              alt="Mi Gusto"
              className="h-8 w-auto object-contain brightness-200 contrast-125 grayscale opacity-40 group-hover:opacity-100 transition-opacity"
            />
            <div className="flex flex-col">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] text-migusto-crema/40 font-black">
                Golden Tickets Mi Gusto Lovers · 2026
              </p>
              <p className="text-[8px] text-migusto-crema/20 uppercase tracking-[0.2em]">
                La calidad no se negocia
              </p>
            </div>
          </div>

          {/* Centrado en el medio de la pantalla */}
          <div className="text-center">
            <p className="text-white/40 text-[10px] md:text-xs font-medium tracking-tight">
              © Desarrollado por el <span className="text-white/60 font-bold border-b border-white/20 pb-0.5">Departamento de Sistemas</span> de Mi Gusto | Todos los derechos reservados.
            </p>
          </div>

          {/* Esquina Inferior Derecha: Instagram (Absoluto en desktop) */}
          <div className="md:absolute md:right-0 md:bottom-0 mt-6 md:mt-0">
            <a 
              href="https://www.instagram.com/migustoar/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 group text-migusto-crema/40 hover:text-white transition-colors"
            >
              <span className="text-[10px] uppercase tracking-widest font-black hidden md:block">@migustoar</span>
              <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:bg-migusto-rojo group-hover:border-transparent transition-all">
                <Instagram className="h-5 w-5" />
              </div>
            </a>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
