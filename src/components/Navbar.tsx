import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-migusto-tierra-oscuro/80 backdrop-blur-md border-b border-white/10 shadow-premium">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <a href="https://www.migusto.com.ar/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <img
                src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                alt="Mi Gusto"
                className="h-12 md:h-16 w-auto object-contain"
              />
            </motion.div>
          </a>

          <div className="hidden md:flex items-center">
            <button
              onClick={() => navigate('/faq')}
              className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase hover:opacity-80 transition-opacity cursor-pointer"
            >
              FAQ
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => navigate('/faq')}
              className="text-[10px] font-black text-gold-gradient tracking-[0.3em] uppercase hover:opacity-80 transition-opacity cursor-pointer"
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
