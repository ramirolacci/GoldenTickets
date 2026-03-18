import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { EpicTitle, EpicSubtitle } from '../components/EpicText';
import { supabase } from '../lib/supabase';

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
  const [isValidating, setIsValidating] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDni, setRegDni] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessfullyConfirmed, setIsSuccessfullyConfirmed] = useState(false);
  const [showIdHint, setShowIdHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- PERSISTENCIA LOCALSTORAGE ---
  useEffect(() => {
    const savedData = localStorage.getItem('mi-gusto-ticket-reg');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setTicketId(data.ticketId || '');
        setRegName(data.regName || '');
        setRegEmail(data.regEmail || '');
        setRegPhone(data.regPhone || '');
        setRegDni(data.regDni || '');
        setIsRegistered(data.isRegistered || false);
        setSelectedTier(data.selectedTier || 'oro');
        if (data.isRegistered) {
          setIsCardFlipped(true);
        }
      } catch (e) {
        console.error("Error loading localStorage", e);
      }
    }
  }, []);

  const saveToLocalStorage = (data: any) => {
    localStorage.setItem('mi-gusto-ticket-reg', JSON.stringify({
      ...data,
      ticketId,
      selectedTier,
      isRegistered: true
    }));
  };

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
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setTicketId(value);

    if (idError) setIdError(null);
    if (isCardFlipped) setIsCardFlipped(false);
  };

  /**
   * Efecto de Validación:
   * Cuando el ID llega a 6 caracteres, valida contra la base de datos de Supabase.
   */
  useEffect(() => {
    const validateTicket = async () => {
      if (ticketId.length === 10) {
        // 1. Validación de Formato: MG + 8 caracteres alfanuméricos
        const ticketRegex = /^MG[A-Z0-9]{8}$/;
        if (!ticketRegex.test(ticketId)) {
          setIdError('Formato inválido (Ej: MG12345678)');
          return;
        }

        setIsValidating(true);
        try {
          // 2. Consulta a Supabase
          const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id_ticket', ticketId)
            .single();

          if (error || !data) {
            setIdError('Ticket no encontrado');
            return;
          }

          // 2.2 Validación de Uso: Verificar si ya fue utilizado
          if (data.usado) {
            setIdError('Este ticket ya fue utilizado');
            return;
          }

          // 3. Mapeo de Categoría
          const tierMap: Record<string, TicketTier> = {
            'ORO': 'oro',
            'PLATA': 'plata',
            'BRONCE': 'bronce'
          };

          const ticketTier = tierMap[data.tipo] || 'oro';

          // 3.1 Validación de Nivel: El ticket debe coincidir con el seleccionado
          if (ticketTier !== selectedTier) {
            setIdError('Este ID no pertenece a este nivel de premio');
            return;
          }

          setIsCardFlipped(true);
          setIdError(null);
        } catch (err) {
          console.error('Error validating ticket:', err);
          setIdError('Error al conectar con el servidor');
        } finally {
          setIsValidating(false);
        }
      }
    };

    validateTicket();
  }, [ticketId]);

  // --- HANDLERS PARA REGISTRO ---

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo letras y espacios
    const value = e.target.value.replace(/[^a-zA-Z\sñÑáéíóúÁÉÍÓÚ]/g, '');
    setRegName(value.toUpperCase());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo números
    let value = e.target.value.replace(/\D/g, '');

    // Limitar a 10 dígitos
    if (value.length > 10) value = value.slice(0, 10);

    // Aplicar máscara: XX XXXX-XXXX
    let formattedValue = '';
    if (value.length > 0) {
      formattedValue = value.slice(0, 2);
      if (value.length > 2) {
        formattedValue += ' ' + value.slice(2, 6);
        if (value.length > 6) {
          formattedValue += '-' + value.slice(6, 10);
        }
      }
    }

    setRegPhone(formattedValue);
  };

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo números
    let value = e.target.value.replace(/\D/g, '');

    // Limitar a 8 dígitos (standard DNI argentino)
    if (value.length > 8) value = value.slice(0, 8);

    // Aplicar máscara: XX-XXX-XXX o X-XXX-XXX dependiendo el largo
    let formattedValue = '';
    if (value.length > 0) {
      if (value.length <= 7) {
        // Formato para 7 dígitos: X-XXX-XXX
        if (value.length <= 1) {
          formattedValue = value;
        } else if (value.length <= 4) {
          formattedValue = value.slice(0, 1) + '-' + value.slice(1);
        } else {
          formattedValue = value.slice(0, 1) + '-' + value.slice(1, 4) + '-' + value.slice(4);
        }
      } else {
        // Formato para 8 dígitos: XX-XXX-XXX
        formattedValue = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5);
      }
    }

    setRegDni(formattedValue);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // No permitir espacios en el email
    const value = e.target.value.replace(/\s/g, '').toLowerCase();
    setRegEmail(value);
  };

  const isEmailValid = regEmail.includes('@');
  const isFormValid = regName.length >= 2 && isEmailValid && regPhone.length >= 6 && regDni.length >= 1;

  useEffect(() => {
    console.log('Form Validity:', { isFormValid, name: regName.length, email: isEmailValid, phone: regPhone.length, dni: regDni.length });
  }, [isFormValid, regName, regEmail, regPhone, regDni]);

  const handleConfirmClick = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // --- PROCESAMIENTO DE DATOS ---
      // Dividimos el nombre en nombre y apellido para Supabase
      const nameParts = regName.trim().split(/\s+/);
      const nombre = nameParts[0] || '';
      const apellido = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'REQUERIDO';

      // 1. Guardar en Supabase - Tabla 'registros'
      const { error: registroError } = await supabase
        .from('registros')
        .insert([
          {
            id_ticket: ticketId,
            nombre: nombre,
            apellido: apellido,
            dni: regDni,
            telefono: regPhone,
            fecha_registro: new Date().toISOString(),
            activo: true
          }
        ]);

      if (registroError) throw registroError;

      // 2. Actualizar Ticket - Tabla 'tickets'
      // Marcamos como usado y guardamos metadata de validación
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({
          usado: true,
          dni_validado: regDni,
          fecha_validacion: new Date().toISOString()
        })
        .eq('id_ticket', ticketId);

      if (ticketError) throw ticketError;

      // 3. Guardar en LocalStorage
      saveToLocalStorage({ regName, regPhone, regEmail, regDni });

      // 4. Update UI
      setIsRegistered(true);
      setIsSuccessfullyConfirmed(true);
    } catch (err) {
      console.error('Error during registration:', err);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20 pb-36 px-4 overflow-hidden">
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
                src={`${import.meta.env.BASE_URL}Logo_MiGusto_Experience.png`}
                alt="Mi Gusto Experience"
                className="h-56 md:h-80 w-auto mb-4"
              />
            </div>
            <div className="mb-12">
              <EpicSubtitle
                text="¡DISFRUTÁ DE TU BENEFICIO EXCLUSIVO!"
                className="text-xl md:text-4xl font-black block mb-4 tracking-tight md:tracking-tighter"
                delay={0.4}
              />
            </div>

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
                className="group relative px-10 py-4 md:px-16 md:py-6 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-600 text-migusto-tierra-oscuro rounded-full font-black text-xl md:text-3xl uppercase overflow-hidden"
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
            <span className="text-xs font-black text-amber-400/80 uppercase tracking-[0.2em] block mb-3">Elegí tu ticket y activalo</span>
            <h2 className="text-5xl md:text-6xl font-bold text-migusto-crema">
              Convertite en <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent italic leading-[1.2]">ANFITRIÓN </span> Mi Gusto
            </h2>
          </motion.div>

          {/* Botones ORO, PLATA, BRONCE - diseño moderno e innovador */}
          <div className="flex justify-center items-center gap-3 md:gap-7 mb-12 md:mb-20 relative px-2">
            {(['oro', 'plata', 'bronce'] as TicketTier[]).map((tier, idx) => (
              <motion.button
                key={tier}
                type="button"
                onClick={() => {
                  if (isCardFlipped || isRegistered) return;
                  setSelectedTier(tier);
                  setTicketId('');
                  setIdError(null);
                  document.getElementById('tarjeta-previa')?.scrollIntoView({ behavior: 'smooth' });
                  
                  // Mostrar leyenda de ID por 5 segundos
                  if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
                  setShowIdHint(true);
                  hintTimeoutRef.current = setTimeout(() => setShowIdHint(false), 5000);
                }}
                disabled={isCardFlipped || isRegistered}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                whileHover={(!isCardFlipped && !isRegistered) ? { scale: 1.1, y: -12 } : {}}
                whileTap={(!isCardFlipped && !isRegistered) ? { scale: 0.95 } : {}}
                className={`group relative flex flex-col items-center rounded-3xl md:rounded-[2.5rem] 
                  w-28 md:w-56 p-4 md:p-10
                  overflow-hidden transition-all duration-700 premium-border ${(isCardFlipped || isRegistered) ? 'opacity-40 grayscale-[0.5] cursor-not-allowed' : ''} ${selectedTier === tier
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

                <div className={`relative p-2 md:p-5 rounded-xl md:rounded-3xl mb-2 md:mb-4 transition-all duration-500 flex items-center justify-center ${selectedTier === tier
                  ? `${tierStyles[tier].glow} shadow-[0_0_20px_rgba(255,255,255,0.2)] md:shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110`
                  : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                  <img
                    src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                    alt="Mi Gusto"
                    className={`h-6 md:h-16 w-auto object-contain transition-all duration-500 brightness-200 contrast-125 ${selectedTier === tier ? 'drop-shadow-lg' : 'grayscale opacity-40 group-hover:opacity-70 group-hover:grayscale-0'
                      }`}
                  />
                </div>

                <h3 className={`relative text-sm md:text-3xl font-black uppercase tracking-tight transition-all duration-500 ${selectedTier === tier
                  ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
                  : 'text-white/40 group-hover:text-white/70'
                  }`}>
                  {tier === 'oro' ? 'Gold' : tier === 'plata' ? 'Silver' : 'Bronze'}
                </h3>

                <div className={`relative flex flex-col items-center mt-1 md:mt-3 transition-colors ${selectedTier === tier ? 'text-white/90' : 'text-white/30 group-hover:text-white/50'
                  }`}>
                  <span className="text-[6px] md:text-lg uppercase tracking-[0.1em] md:tracking-[0.25em] font-black leading-tight drop-shadow-sm text-center">
                    {tier === 'oro' ? 'por 12 meses' : tier === 'plata' ? 'por 6 meses' : 'por 3 meses'}
                  </span>
                  <span className="text-[4px] md:text-[10px] uppercase mt-0.5 md:mt-1 tracking-[0.05em] md:tracking-[0.1em] font-medium opacity-50 hidden md:block">
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
            className="max-w-2xl mx-auto scroll-mt-32 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AnimatePresence>
              {isSuccessfullyConfirmed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-green-500/90 backdrop-blur-md text-white px-6 py-4 rounded-3xl mb-8 text-center border border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                >
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <CheckCircle2 className="w-6 h-6 text-green-200" />
                    <h4 className="text-xl font-black uppercase tracking-widest">¡Registro Exitoso!</h4>
                  </div>
                  <p className="text-sm font-medium opacity-90">Tu ticket ha sido activado correctamente.</p>
                </motion.div>
              )}
            </AnimatePresence>


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
                onClick={() => {
                  if (isRegistered) {
                    setIsCardFlipped(!isCardFlipped);
                  }
                }}
                transition={{
                  rotateY: { duration: 0.6, ease: 'easeInOut' },
                  background: { duration: 0.8, ease: 'easeOut' },
                  borderColor: { duration: 0.8, ease: 'easeOut' }
                }}
                className={`relative w-full max-w-2xl mx-auto aspect-[677/313] rounded-3xl border-2 ${isRegistered ? 'cursor-pointer' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Cara frontal */}
                <div
                  className="absolute inset-0 flex flex-col p-6 md:p-10 rounded-[22px] overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                    zIndex: isCardFlipped ? 0 : 1
                  }}
                >
                  {/* Overlay Confirmación removido en esta etapa */}

                  {/* Mockup Overlay */}
                  <img
                    src={`${import.meta.env.BASE_URL}ticketMockup.png`}
                    alt=""
                    className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none opacity-90"
                  />

                  {/* Inputs Section - Positioned over the mockup's ID field */}
                  <div className="absolute bottom-[17%] right-[11%] w-[35%] h-[12%] z-30 flex items-center justify-center">
                    {/* ID Input Only */}
                    <div className="w-full text-center">
                      <AnimatePresence mode="wait">
                        {!isRegistered ? (
                          <motion.input
                            key="id-input"
                            type="text"
                            maxLength={10}
                            value={ticketId}
                            onChange={handleTicketIdChange}
                            placeholder="MG-XXXXXXXX"
                            disabled={isValidating}
                            animate={idError ? {
                              x: [0, -10, 10, -10, 10, -10, 10, 0],
                              color: ["#000", "#ef4444", "#ef4444", "#000"]
                            } : { x: 0, color: "#000" }}
                            transition={{ duration: 1 }}
                            className={`w-full bg-transparent text-[12px] md:text-[24px] font-black font-mono placeholder:text-black/40 focus:outline-none tracking-normal transition-colors text-center shadow-none border-none ${isValidating ? 'animate-pulse opacity-50' : ''}`}
                          />
                        ) : (
                          <motion.span
                            key="id-printed"
                            initial={{ scale: 1.2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`block w-full text-[12px] md:text-[24px] font-black font-mono tracking-normal text-center text-black/80`}
                          >
                            {ticketId}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                {/* 
                  CARA TRASERA (REGISTRO)
                  Esta sección aparece automáticamente mediante un giro (rotateY(180deg))
                  cuando el ID ingresado en el frente es validado correctamente.
                */}
                <div
                  className="absolute inset-0 flex flex-col p-3 md:p-10 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    zIndex: isCardFlipped ? 1 : 0
                  }}
                >
                  {/* Header con Logo y Título - DORSO */}
                  <div className="flex justify-between items-start w-full relative z-10 mb-1 md:mb-6">
                    <span className={`text-[12px] md:text-lg font-black uppercase tracking-widest opacity-60 ${tierStyles[selectedTier].label}`}>
                      Registro de Socio
                    </span>
                    <img
                      src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
                      alt="Mi Gusto"
                      className="h-5 md:h-10 w-auto object-contain brightness-200 opacity-60"
                    />
                  </div>

                  <div className="flex flex-col gap-2 md:gap-8 flex-1 justify-center w-full relative z-10">
                    {/* NOMBRE Y APELLIDO - Full Width, Left Aligned */}
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        {!isRegistered ? (
                          <motion.input
                            key="name-input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            type="text"
                            placeholder="NOMBRE Y APELLIDO"
                            value={regName}
                            onChange={handleNameChange}
                            className="w-full bg-transparent text-3xl md:text-5xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left uppercase"
                          />
                        ) : (
                          <motion.span
                            key="name-printed"
                            initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                            className={`block w-full text-3xl md:text-5xl font-black font-mono tracking-tighter text-left uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${tierStyles[selectedTier].label}`}
                          >
                            {regName}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* CELULAR Y DNI - Same Row */}
                    <div className="w-full flex gap-5 md:gap-8">
                      <div className="flex-1">
                        <AnimatePresence mode="wait">
                          {!isRegistered ? (
                            <motion.input
                              key="phone-input"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              type="tel"
                              placeholder="11 1234-5678"
                              value={regPhone}
                              onChange={handlePhoneChange}
                              maxLength={12}
                              className="w-full bg-transparent text-lg md:text-3xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left"
                            />
                          ) : (
                            <motion.span
                              key="phone-printed"
                              initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                              animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                              className={`block w-full text-lg md:text-3xl font-black font-mono tracking-tighter text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${tierStyles[selectedTier].label}`}
                            >
                              {regPhone}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="w-28 md:w-48">
                        <AnimatePresence mode="wait">
                          {!isRegistered ? (
                            <motion.input
                              key="dni-input"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              type="text"
                              placeholder="DNI"
                              value={regDni}
                              onChange={handleDniChange}
                              maxLength={10}
                              className="w-full bg-transparent text-lg md:text-3xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left"
                            />
                          ) : (
                            <motion.span
                              key="dni-printed"
                              initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                              animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                              className={`block w-full text-lg md:text-3xl font-black font-mono tracking-tighter text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${tierStyles[selectedTier].label}`}
                            >
                              {regDni}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* EMAIL - Full Width, Left Aligned */}
                    <div className="w-full">
                      <AnimatePresence mode="wait">
                        {!isRegistered ? (
                          <motion.input
                            key="email-input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            type="email"
                            placeholder="CORREO ELECTRÓNICO"
                            value={regEmail}
                            onChange={handleEmailChange}
                            className="w-full bg-transparent text-[14px] md:text-2xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left lowercase"
                          />
                        ) : (
                          <motion.span
                            key="email-printed"
                            initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                            className={`block w-full text-[14px] md:text-2xl font-black font-mono tracking-tighter text-left lowercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${tierStyles[selectedTier].label}`}
                          >
                            {regEmail}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Background overlay suave para la parte de atrás */}
                  <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none" />
                </div>
              </motion.div>
            </div>
            
            <AnimatePresence>
              {showIdHint && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center mt-6 text-amber-200/60 font-medium text-sm tracking-wide"
                >
                  Encontrá tu ID en el dorso del ticket.
                </motion.p>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {idError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 text-center"
                >
                  <p className="text-red-500 text-sm font-black uppercase tracking-wider drop-shadow-sm">
                    {idError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* CONFIRMAR Button below the card (only when flipped and NOT registered) */}
            <AnimatePresence>
              {isCardFlipped && !isRegistered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="mt-10 flex flex-col items-center relative"
                >
                  <motion.button
                    type="button"
                    onClick={handleConfirmClick}
                    disabled={!isFormValid || isSubmitting}
                    whileHover={(isFormValid && !isSubmitting) ? { scale: 1.05 } : {}}
                    whileTap={(isFormValid && !isSubmitting) ? { scale: 0.95 } : {}}
                    className={`px-8 py-3 rounded-full text-base font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl relative ${(!isFormValid || isSubmitting)
                      ? 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                      : `bg-gradient-to-br ${tierStyles[selectedTier].gradient} text-white shadow-[0_10px_40px_rgba(0,0,0,0.4)]`
                      }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        CARGANDO...
                      </div>
                    ) : 'CONFIRMAR'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Steps Section */}
      <section className="py-24 px-4 relative">
        <div className="container mx-auto max-w-4xl relative">
          <h2 className="text-4xl font-serif text-center mb-16 text-migusto-crema">
            El camino a la <span className="text-migusto-rojo italic">experiencia</span>
          </h2>
          <div className="space-y-4 relative">
            {[
              { step: 1, text: 'Encontraste un ticket especial en tu pedido' },
              { step: 2, text: 'Validamos ID y DNI asociado al ticket.' },
              { step: 3, text: 'Entregamos tu Tarjeta Lovers' },
              { step: 4, text: 'Disfrutá tu canje mensual' }
            ].map(({ step, text }, idx) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  backgroundColor: "rgba(255,255,255,0.05)"
                }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  delay: idx * 0.15,
                  duration: 0.8,
                  ease: "easeOut"
                }}
                className="flex items-center space-x-6 glass-card p-6 rounded-2xl transition-all group relative overflow-hidden"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-migusto-rojo to-migusto-rojo-oscuro rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ring-4 ring-migusto-rojo/20">
                  {step}
                </div>
                <p className="text-xl text-migusto-crema/90 font-medium">{text}</p>
                <div className="ml-auto">
                  <motion.div
                    initial={{ color: "#ef4444", opacity: 0.4 }}
                    whileInView={{ color: "#22c55e", opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: (idx * 0.15) + 0.4,
                      duration: 0.6,
                      ease: "easeOut"
                    }}
                  >
                    <CheckCircle2 className="h-8 w-8" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-black/10 backdrop-blur-sm relative scroll-mt-24">
        <div className="container mx-auto max-w-4xl relative">
          <h2 className="text-4xl font-serif text-center mb-16 text-migusto-crema">
            Preguntas <span className="text-gold-gradient italic">Frecuentes</span>
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="overflow-hidden relative"
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
                        onClick={() => document.getElementById('ubicacion-sucursal')?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-white/10 hover:bg-migusto-rojo rounded-full transition-all border border-white/10 hover:border-transparent inline-block"
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



      {/* Terms Section */}
      <section className="pt-16 pb-8 md:py-16 px-4 relative">
        <div className="container mx-auto max-w-6xl relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                <div className="inline-flex p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 mb-3 md:mb-6 group-hover:bg-migusto-rojo/10 group-hover:border-migusto-rojo/30 transition-all">
                  <item.icon className="h-7 w-7 md:h-10 md:w-10 text-migusto-rojo" />
                </div>
                <h3 className="text-xs md:text-lg font-black text-migusto-crema mb-1 md:mb-3 uppercase tracking-tighter">{item.title}</h3>
                <p className="text-[10px] md:text-sm text-migusto-crema/40 leading-tight md:leading-relaxed h-8 md:h-auto flex items-center justify-center underline-offset-2">{item.text}</p>
              </div>
            ))}
          </div>

          {/* Bloque de Ubicación */}
          <motion.div
            id="ubicacion-sucursal"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-20 flex flex-col items-center scroll-mt-32"
          >
            <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 max-w-2xl w-full text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-migusto-rojo/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Wireframe de Mapa */}
                <div className="mb-8 relative group/map overflow-hidden rounded-3xl border border-white/10 aspect-video bg-black/40">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:20px_20px]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-migusto-rojo/20 blur-2xl rounded-full animate-pulse" />
                      <MapPin className="h-16 w-16 text-migusto-rojo relative z-10 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                    </div>
                  </div>
                  {/* Sutiles líneas de mapa ficticias */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
                    <path d="M0 20 L100 20 M0 50 L100 50 M0 80 L100 80 M20 0 L20 100 M50 0 L50 100 M80 0 L80 100" stroke="white" strokeWidth="0.5" fill="none" />
                  </svg>
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-tight text-white/70">Sucursal Activa</span>
                    </div>
                    <span className="text-[8px] font-medium text-white/30 uppercase tracking-widest leading-none text-right">Vicente López<br />Libertador 962</span>
                  </div>
                </div>

                <p className="text-lg text-migusto-crema/60 mb-8 leading-relaxed">
                  Esta promoción es válida únicamente en <br />
                  <span className="text-white font-black">Mi Gusto Vicente López</span><br />
                  <span className="text-migusto-rojo italic font-medium">Av. del Libertador 962</span>
                </p>

                <a
                  href="https://www.google.com/maps?q=Mi+Gusto+Vicente+Lopez+Av.+del+Libertador+962"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 px-10 py-4 bg-white/5 hover:bg-migusto-rojo text-white rounded-full transition-all duration-300 border border-white/10 hover:border-transparent font-black tracking-widest text-sm uppercase group/btn"
                >
                  <MapPin className="h-4 w-4 group-hover:animate-bounce" />
                  <span>Abrir Mapa</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>


    </div>
  );
}
