import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Award, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import { EpicTitle, EpicSubtitle } from '../components/EpicText';

const faqs = [
  {
    question: '¿En mi Pack de 12 recibí un cupón, qué hago?',
    answer: 'Debes canjearlo en esta web e ir por primera vez a canjear tu primer pack 12 gratis, ahí recibirás tu Lover Ticket para poder retirar tu pack cada mes.'
  },
  {
    question: '¿Cómo canjeo cada mes?',
    answer: 'Presencial con DNI y Tarjeta Lovers.'
  },
  {
    question: '¿Qué pasa si pierdo el ticket?',
    answer: 'Se considera perdido, sin reposición.'
  },
  {
    question: '¿Hasta cuándo canjeo?',
    answer: 'Último día del mes, o caduca.'
  },
  {
    question: '¿Dónde?',
    answer: 'Solo disponible en nuestra sucursal de Vicente López.'
  },
  {
    question: '¿Por app/web?',
    answer: 'No, solo presencial.'
  },
  {
    question: '¿Otro puede usarlo?',
    answer: 'No, personal e intransferible.'
  },
  {
    question: '¿Puedo regalarlo?',
    answer: 'Solo antes de registrar datos, se debe registrar a nombre de la persona que recibirá el regalo.'
  }
];

// --- CONFIGURACIÓN DE DATOS ---

// IDs válidos simulando una base de datos real. 
// Cada ID está vinculado a una categoría de ticket (oro, plata, bronce).
const validDatabaseIds: Record<string, TicketTier> = {
  'MG001A': 'oro',
  'MG999Z': 'oro',
  'PL123B': 'plata',
  'PL888X': 'plata',
  'BR456C': 'bronce',
  'BR777Y': 'bronce',
};

type TicketTier = 'oro' | 'plata' | 'bronce';

const tierStyles = {
  oro: {
    gradient: 'from-[#6b5800] via-[#c5a059] to-[#4d3d00]',
    border: 'border-amber-400/50',
    icon: 'text-amber-300',
    bg: 'bg-amber-400/10',
    label: 'text-amber-200',
    shadow: 'shadow-[0_0_50px_rgba(251,191,36,0.4)]',
    glow: 'bg-amber-400/20'
  },
  plata: {
    gradient: 'from-[#4a4a4a] via-[#C0C0C0] to-[#1a1a1a]',
    border: 'border-slate-300/40',
    icon: 'text-slate-100',
    bg: 'bg-slate-300/10',
    label: 'text-slate-200',
    shadow: 'shadow-[0_0_40px_rgba(148,163,184,0.3)]',
    glow: 'bg-slate-300/20'
  },
  bronce: {
    gradient: 'from-[#6b3e26] via-[#CD7F32] to-[#2d1e16]',
    border: 'border-amber-600/40',
    icon: 'text-amber-400',
    bg: 'bg-amber-600/10',
    label: 'text-amber-300',
    shadow: 'shadow-[0_0_35px_rgba(217,119,6,0.3)]',
    glow: 'bg-amber-600/20'
  }
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<TicketTier>('oro');
  const [ticketId, setTicketId] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);

  // Estados para el formulario de registro (Dorso)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState('');

  // Parallax configuration for the rewards section
  const rewardsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: rewardsRef,
    offset: ["start end", "end start"]
  });

  const yGrid = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);
  const yContentBase = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);

  /**
   * Maneja el cambio en el input del ID del Ticket.
   * - Fuerza mayúsculas.
   * - Limita a 6 caracteres alfanuméricos.
   * - Resetea estados de error y de giro al modificar.
   */
  const handleTicketIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setTicketId(value);
    
    if (idError) setIdError(null);
    if (isCardFlipped) setIsCardFlipped(false);
  };

  /**
   * Efecto de Validación:
   * Cuando el ID llega a 6 caracteres, gira la tarjeta automáticamente.
   * Para esta etapa, permitimos que CUALQUIER ID de 6 caracteres proceda al registro.
   */
  useEffect(() => {
    if (ticketId.length === 6) {
      // Intentamos machear con la base de datos para el estilo,
      // pero si no existe, permitimos continuar con estilo 'oro' por defecto.
      const matchedTier = validDatabaseIds[ticketId] || 'oro';
      
      setSelectedTier(matchedTier);
      setIsCardFlipped(true);
      setIdError(null);
    }
  }, [ticketId]);


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-0 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-migusto-rojo/10 blur-[150px] rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-migusto-dorado/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-migusto-dorado uppercase tracking-[0.5em] text-xs font-black block mb-6"
            >
              Presentamos
            </motion.span>

            <div className="flex flex-col items-center justify-center mb-10">
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                alt="Mi Gusto"
                className="h-32 md:h-48 w-auto mb-4"
              />
              <EpicTitle
                text="Experience"
                goldWord="Experience"
                className="text-6xl md:text-8xl"
                delay={0.5}
              />
            </div>
            <EpicSubtitle
              text="¡Bienvenidos! Sé parte del exclusivo club Lovers"
              goldWord="Lovers"
              className="text-xl md:text-3xl mb-12 max-w-2xl mx-auto"
              delay={0.4}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                type="button"
                onClick={() => document.getElementById('niveles-premios')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255,255,255,0.1)',
                    '0 0 60px rgba(255, 215, 0, 0.7), inset 0 0 30px rgba(255,255,255,0.2)',
                    '0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255,255,255,0.1)'
                  ],
                  y: [-3, 3, -3]
                }}
                transition={{
                  boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="group relative px-16 py-6 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 text-migusto-tierra-oscuro rounded-full font-black text-2xl md:text-3xl uppercase overflow-hidden"
              >
                {/* Shimmer continuo */}
                <div
                  className="absolute inset-0 animate-shimmer opacity-80"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                    backgroundSize: '200% 100%'
                  }}
                />
                {/* Borde dorado brillante */}
                <div className="absolute inset-0 rounded-full border-2 border-yellow-300/80 group-hover:border-yellow-200 group-hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-300" />
                {/* Efecto de profundidad */}
                <div className="absolute inset-x-4 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 drop-shadow-sm tracking-tight">CANJEÁ TU CUPÓN</span>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reward Cards Section - Botones clickeables */}
      <motion.section
        ref={rewardsRef}
        id="niveles-premios"
        className="relative py-28 px-4 overflow-hidden scroll-mt-24"
      >
        {/* Fondo moderno - mesh gradient + grid sutil con Parallax */}
        <motion.div style={{ y: yGrid }} className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-950/5 to-transparent" />
        <motion.div style={{ y: yGrid }} className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] animate-glow-pulse" />

        <motion.div style={{ y: yContentBase }} className="container mx-auto max-w-5xl scale-[1.15] origin-top pb-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black text-amber-400/80 uppercase tracking-[0.4em] block mb-3">Elegí tu ticket</span>
            <h2 className="text-5xl md:text-6xl font-bold text-migusto-crema">
              Mi Gusto <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent italic leading-[1.2]">Lovers</span> rewards
            </h2>
          </motion.div>

          {/* Botones ORO, PLATA, BRONCE - diseño moderno e innovador */}
          <div className="flex justify-center items-center gap-5 md:gap-7 mb-20">
            {(['oro', 'plata', 'bronce'] as TicketTier[]).map((tier, idx) => (
              <motion.button
                key={tier}
                type="button"
                onClick={() => {
                  setSelectedTier(tier);
                  document.getElementById('tarjeta-previa')?.scrollIntoView({ behavior: 'smooth' });
                }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1, y: -12 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative flex flex-col items-center rounded-[2.5rem] ${tier === 'oro' ? 'w-48 md:w-56 p-10' : tier === 'plata' ? 'w-40 md:w-44 p-7' : 'w-32 md:w-36 p-5'
                  } overflow-hidden transition-all duration-700 premium-border ${selectedTier === tier
                    ? `animate-float ${tierStyles[tier].shadow} bg-gradient-to-br ${tierStyles[tier].gradient} border-2 ${tierStyles[tier].border}`
                    : 'bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/30'
                  }`}
              >
                {/* Shine animation overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-[200%] animate-shine" />
                </div>

                {/* Background glow rotation */}
                {selectedTier === tier && (
                  <div className="absolute -inset-10 bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-30 animate-rotate-slow pointer-events-none" />
                )}

                <div className={`relative p-5 rounded-3xl mb-4 transition-all duration-500 ${selectedTier === tier
                  ? `${tierStyles[tier].glow} shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110`
                  : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                  <Award className={`h-12 w-12 md:h-16 md:w-16 transition-all duration-500 ${selectedTier === tier ? tierStyles[tier].icon : 'text-white/40 group-hover:text-white/60'
                    }`} />
                </div>

                <h3 className={`relative text-2xl md:text-3xl font-black uppercase tracking-tight transition-all duration-500 ${selectedTier === tier
                  ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
                  : 'text-white/40 group-hover:text-white/70'
                  }`}>
                  {tier}
                </h3>

                <div className={`relative flex flex-col items-center mt-3 transition-colors ${selectedTier === tier ? 'text-white/90' : 'text-white/30 group-hover:text-white/50'
                  }`}>
                  <span className="text-[12px] md:text-lg uppercase tracking-[0.25em] font-black leading-tight drop-shadow-sm">
                    {tier === 'oro' ? 'por 12 meses' : tier === 'plata' ? 'por 6 meses' : 'por 3 meses'}
                  </span>
                  <span className="text-[8px] md:text-[10px] uppercase mt-1 tracking-[0.1em] font-medium opacity-50">
                    Pack 12 empanadas cada mes
                  </span>
                </div>

                {/* Particle sparkle effects */}
                {selectedTier === tier && (
                  <>
                    <div className="absolute top-4 left-4 w-1 h-1 bg-white rounded-full animate-twinkle-hyper" />
                    <div className="absolute bottom-8 right-6 w-1.5 h-1.5 bg-white rounded-full animate-twinkle-hyper" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 right-4 w-1 h-1 bg-white rounded-full animate-twinkle-hyper" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </motion.button>
            ))}
          </div>

          {/* Golden Ticket - Molde con inputs */}
          <motion.div
            id="tarjeta-previa"
            className="max-w-md mx-auto scroll-mt-32"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-serif font-bold text-migusto-crema text-center mb-6">
              Tu Golden Ticket
            </h3>

            {/* Inputs eliminados, ahora están dentro de la tarjeta */}

            {/* Molde de tarjeta flipeable - placeholder para CodePen */}
            <div
              className="perspective-[1000px] relative"
            >
              <motion.div
                animate={{
                  rotateY: isCardFlipped ? 180 : 0,
                  background: selectedTier === 'oro'
                    ? 'linear-gradient(to bottom right, #6b5800, #c5a059, #4d3d00)'
                    : selectedTier === 'plata'
                      ? 'linear-gradient(to bottom right, #4a4a4a, #C0C0C0, #1a1a1a)'
                      : 'linear-gradient(to bottom right, #6b3e26, #CD7F32, #2d1e16)',
                  borderColor: selectedTier === 'oro'
                    ? 'rgba(251, 191, 36, 0.5)' // amber-400
                    : selectedTier === 'plata'
                      ? 'rgba(203, 213, 225, 0.4)' // slate-300
                      : 'rgba(217, 119, 6, 0.4)' // amber-600
                }}
                transition={{
                  rotateY: { duration: 0.6, ease: 'easeInOut' },
                  background: { duration: 0.8, ease: 'easeOut' },
                  borderColor: { duration: 0.8, ease: 'easeOut' }
                }}
                className={`relative w-full max-w-sm mx-auto aspect-[1.586/1] rounded-2xl border-2`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Cara frontal */}
                <div
                  className="absolute inset-0 flex flex-col p-6 rounded-[14px] overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(0deg)',
                    zIndex: isCardFlipped ? 0 : 1 
                  }}
                >
                  {/* Overlay Confirmación removido en esta etapa */}

                  <div className="flex justify-between items-start w-full relative z-10">
                    <span className={`text-lg font-black uppercase tracking-widest opacity-80 ${tierStyles[selectedTier].label}`}>
                      Mi Gusto Lovers
                    </span>
                    <img
                      src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                      alt="Mi Gusto"
                      className="h-10 w-auto object-contain drop-shadow-md filter grayscale brightness-200 contrast-125"
                      style={{ filter: selectedTier === 'oro' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'grayscale(1) brightness(2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    />
                  </div>

                  {/* Inputs Section */}
                  <div className="flex flex-col flex-1 justify-center items-center w-full relative z-10 pt-4">
                    {/* ID Input Only */}
                    <div className="w-full text-center">
                      <motion.input
                        type="text"
                        maxLength={6}
                        value={ticketId}
                        onChange={handleTicketIdChange}
                        placeholder="MG000X"
                        animate={idError ? { 
                          x: [0, -10, 10, -10, 10, -10, 10, 0],
                          color: ["#fff", "#ef4444", "#ef4444", "#fff"]
                        } : { x: 0, color: "#fff" }}
                        transition={{ duration: 1 }}
                        className={`w-full bg-transparent text-4xl font-black font-mono placeholder:text-white/30 focus:outline-none tracking-[0.2em] transition-colors text-center shadow-none border-none`}
                      />

                    </div>
                  </div>
                </div>
                {/* 
                  CARA TRASERA (REGISTRO)
                  Esta sección aparece automáticamente mediante un giro (rotateY(180deg))
                  cuando el ID ingresado en el frente es validado correctamente.
                */}
                <div
                  className="absolute inset-0 flex flex-col p-5 bg-black/40 backdrop-blur-sm rounded-[14px] overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    transform: 'rotateY(180deg)',
                    zIndex: isCardFlipped ? 1 : 0
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-white text-sm font-black uppercase tracking-widest">Registro Lovers</h4>
                    <img
                      src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                      alt="Mi Gusto"
                      className="h-6 w-auto object-contain brightness-200 contrast-125"
                    />
                  </div>

                  <div className="flex flex-col gap-3 flex-1 justify-center">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        placeholder="NOMBRE Y APELLIDO"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value.toUpperCase())}
                        className="w-full bg-white/5 border-b border-white/20 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all uppercase font-bold"
                      />
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="email"
                        placeholder="CORREO ELECTRÓNICO"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white/5 border-b border-white/20 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all font-mono"
                      />
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="tel"
                        placeholder="NÚMERO DE CELULAR"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full bg-white/5 border-b border-white/20 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
                      />
                    </div>
                    <div className="flex flex-col">
                      <input
                        type="text"
                        placeholder="EDAD"
                        value={regAge}
                        onChange={(e) => setRegAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        className="w-full bg-white/5 border-b border-white/20 px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      disabled={!regName || !regEmail || !regPhone || !regAge}
                      className={`w-full py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        (!regName || !regEmail || !regPhone || !regAge)
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : `bg-white text-black hover:bg-white/90 shadow-lg active:scale-95`
                      }`}
                    >
                      CONFIRMAR REGISTRO
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Error Message below the card */}
            <AnimatePresence>
              {idError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 text-center"
                >
                  <span className="text-red-500 text-sm font-bold uppercase tracking-[0.2em]">
                    {idError}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Steps Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-serif text-center mb-16 text-migusto-crema">
            El camino al <span className="text-migusto-rojo italic">Premio</span>
          </h2>
          <div className="space-y-4">
            {/* Paso 0 - Distintivo especial */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0 }}
              className="flex items-center space-x-6 glass-card p-6 rounded-2xl border-2 border-migusto-dorado/50 bg-gradient-to-r from-migusto-dorado/10 to-transparent hover:bg-migusto-dorado/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 text-migusto-dorado/10 text-6xl font-black">¡</div>
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-migusto-dorado to-amber-700 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-migusto-dorado/30">
                0
              </div>
              <p className="text-xl text-migusto-crema font-bold">{'Encontraste un ticket especial en tu pedido'}</p>
              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle2 className="h-8 w-8 text-migusto-dorado" />
              </div>
            </motion.div>
            {[
              { step: 1, text: 'Presentate a la sucursal de Vicente Lopez con tu DNI fisico' },
              { step: 2, text: 'Validamos ID y DNI asociado al ticket.' },
              { step: 3, text: 'Entregamos tu Tarjeta Lovers' },
              { step: 4, text: 'Disfrutá tu canje mensual' }
            ].map(({ step, text }) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: step * 0.1 }}
                key={step}
                className="flex items-center space-x-6 glass-card p-6 rounded-2xl hover:bg-white/10 transition-all group"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-migusto-rojo to-migusto-rojo-oscuro rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-migusto-rojo/20">
                  {step}
                </div>
                <p className="text-xl text-migusto-crema/90 font-medium">{text}</p>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="h-8 w-8 text-migusto-rojo" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-black/10 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-serif text-center mb-16 text-migusto-crema">
            Preguntas <span className="text-gold-gradient italic">Frecuentes</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`w-full px-8 py-5 text-left flex items-center justify-between transition-all rounded-2xl ${openFaq === index ? 'bg-migusto-rojo text-white' : 'glass-card text-migusto-crema hover:bg-white/10'
                    }`}
                >
                  <span className="text-lg font-bold">{faq.question}</span>
                  <ChevronDown
                    className={`h-6 w-6 transition-transform duration-500 ${openFaq === index ? 'transform rotate-180' : ''
                      }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 py-6 text-migusto-crema/70 leading-relaxed text-lg italic flex flex-col items-start gap-4">
                    {faq.answer}
                    {faq.question === '¿Dónde?' && (
                      <button
                        onClick={() => document.getElementById('ubicacion-mapa')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-white/10 hover:bg-migusto-rojo rounded-full transition-all border border-white/10 hover:border-transparent"
                      >
                        Ver ubicación
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location/Map Section */}
      <section id="ubicacion-mapa" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-migusto-rojo/5" />
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <div className="flex flex-col items-center">
            <p className="text-xl md:text-2xl text-white/60 mb-2 uppercase tracking-widest font-medium">Solo disponible en:</p>
            <p className="text-3xl md:text-5xl font-black text-migusto-crema mb-8 uppercase tracking-tighter">
              Mi Gusto Vicente López <span className="text-migusto-rojo">·</span> Av. del Libertador 962
            </p>
            <motion.a
              href="https://www.google.com/maps/search/?api=1&query=Mi+Gusto+Vicente+Lopez+Av.+del+Libertador+962"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:border-migusto-rojo hover:bg-migusto-rojo/10 text-white rounded-xl font-black uppercase tracking-widest transition-all"
            >
              <span>abrir mapa</span>
              <svg className="w-5 h-5 fill-current text-migusto-rojo" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </motion.a>
          </div>
        </div>
      </section>

      {/* Terms Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: AlertCircle, title: 'Personal e Intransferible', text: 'Solo válido para el titular registrado' },
              { icon: AlertCircle, title: 'No Acumulable', text: 'Un premio por persona' },
              { icon: AlertCircle, title: 'Canje Mensual', text: 'Un pack de 12 empanadas por mes' },
              { icon: AlertCircle, title: 'Pérdida sin Reposición', text: 'No se emiten duplicados de tarjeta' }
            ].map((item, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="inline-flex p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 group-hover:bg-migusto-rojo/10 group-hover:border-migusto-rojo/30 transition-all">
                  <item.icon className="h-10 w-10 text-migusto-rojo" />
                </div>
                <h3 className="text-lg font-black text-migusto-crema mb-3 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-sm text-migusto-crema/40 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
