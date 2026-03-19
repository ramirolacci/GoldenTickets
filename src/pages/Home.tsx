import { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { EpicSubtitle } from '../components/EpicText';
import { supabase } from '../lib/supabase';



// --- CONFIGURACIÓN DE DATOS ---

type TicketTier = 'oro' | 'plata' | 'bronce' | null;

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
  const [selectedTier, setSelectedTier] = useState<TicketTier>(null);
  const [ticketId, setTicketId] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isIdFocused, setIsIdFocused] = useState(false);

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDni, setRegDni] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessfullyConfirmed, setIsSuccessfullyConfirmed] = useState(false);
  const [showIdHint, setShowIdHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();

  // --- SCROLL TO HASH OR SESSION STORAGE ---
  useEffect(() => {
    const checkScroll = () => {
      let targetId = '';
      if (location.hash) {
        targetId = location.hash.replace('#', '');
      } else if (sessionStorage.getItem('scrollToUbicacion') === 'true') {
        targetId = 'ubicacion-sucursal';
        sessionStorage.removeItem('scrollToUbicacion');
      }

      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 800); // Delay más largo para asegurar renderizado completo
        }
      }
    };

    checkScroll();
  }, [location]);

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

  const saveToLocalStorage = (data: Record<string, string>) => {
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
        // 1. Validación de Formato: MG + 7 caracteres + letra de nivel (G/S/B)
        const ticketRegex = /^MG[A-Z0-9]{7}[GSB]$/;
        if (!ticketRegex.test(ticketId)) {
          setIdError('ID no válido');
          return;
        }

        // 1.1 Validación de Letra Final (Nivel)
        const lastChar = ticketId[ticketId.length - 1];
        const expectedLastChar = selectedTier === 'oro' ? 'G' : selectedTier === 'plata' ? 'S' : 'B';
        
        if (lastChar !== expectedLastChar) {
          setIdError('El nivel del ticket ingresado es incorrecto');
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
            setIdError('ID no válido'); // Mantenemos el mensaje genérico si no existe
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

          // 3.1 Validación de Seguridad Extra: El ticket en DB debe coincidir con el seleccionado
          if (ticketTier !== selectedTier) {
            setIdError('El nivel del ticket ingresado es incorrecto');
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
  }, [ticketId, selectedTier]);

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen relative"
    >
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
                className="text-[13px] md:text-4xl font-black block mb-4 tracking-tight md:tracking-tighter whitespace-nowrap"
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
        className="relative py-6 md:py-28 px-4 overflow-hidden scroll-mt-24"
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
              Convertite en <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent italic leading-[1.2]">ANFITRIÓN </span><span className="whitespace-nowrap">Mi Gusto</span>
            </h2>
          </motion.div>

          {/* Botones ORO, PLATA, BRONCE - diseño moderno e innovador */}
          <div id="botones-tickets" className="flex justify-center items-center gap-3 md:gap-7 mb-12 md:mb-20 relative px-2 scroll-mt-24">
            {(['oro', 'plata', 'bronce'] as TicketTier[]).map((tier, idx) => (
              <motion.button
                key={tier}
                type="button"
                onClick={() => {
                  if (isCardFlipped || isRegistered) return;
                  setSelectedTier(tier);
                  setTicketId('');
                  setIdError(null);
                  document.getElementById('botones-tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  
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
                  w-32 md:w-72 p-6 md:p-14
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
                    className={`h-8 md:h-20 w-auto object-contain transition-all duration-500 brightness-200 contrast-125 ${selectedTier === tier ? 'drop-shadow-lg' : 'grayscale opacity-40 group-hover:opacity-70 group-hover:grayscale-0'
                      }`}
                  />
                </div>

                <h3 className={`relative text-lg md:text-5xl font-black uppercase tracking-tight transition-all duration-500 ${selectedTier === tier
                  ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
                  : 'text-white/40 group-hover:text-white/70'
                  }`}>
                  {tier === 'oro' ? 'Gold' : tier === 'plata' ? 'Silver' : 'Bronze'}
                </h3>

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

          {/* Premium Benefit Projection - Espacio entre botones y ticket */}
          <div className="h-32 md:h-48 flex flex-col items-center justify-center relative overflow-visible mb-8">
            <AnimatePresence mode="wait">
              {selectedTier && (
                <motion.div
                  key={selectedTier}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center"
                >
                  
                  {/* Texto Proyectado - Premium Look */}
                  <div className="relative flex flex-col items-center">
                    <motion.span
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-amber-400 font-black uppercase tracking-[0.15em] md:tracking-[0.3em] text-[10px] md:text-xl mb-1 md:mb-3 drop-shadow-md text-center max-w-[280px] md:max-w-none"
                    >
                      Un pack de 12 empanadas gratis por mes
                    </motion.span>
                    <motion.div
                      initial={{ opacity: 0, filter: 'blur(15px)', y: -10 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      className="text-4xl md:text-8xl font-black text-white uppercase tracking-tighter text-center"
                      style={{ 
                        textShadow: '0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(251,191,36,0.3)',
                        fontFamily: 'Outfit, sans-serif'
                      }}
                    >
                      {selectedTier === 'oro' ? 'Durante 12 Meses' : selectedTier === 'plata' ? 'Durante 6 Meses' : 'Durante 3 Meses'}
                    </motion.div>
                    
                    {/* Glow Pulse debajo del texto */}
                    <motion.div
                      animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-amber-400/20 blur-[30px] -z-10 rounded-full"
                    />

                    {/* Laser/Beam effect towards the ticket */}
                    <motion.div 
                       className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[2px] h-32 bg-gradient-to-t from-amber-400 to-transparent blur-[1px] hidden md:block"
                       animate={{ 
                         opacity: [0, 0.8, 0],
                         height: [0, 120],
                         y: [0, 20]
                       }}
                       transition={{ 
                         duration: 2, 
                         repeat: Infinity,
                         ease: "easeOut" 
                       }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            <AnimatePresence>
              {isIdFocused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <motion.div
                animate={{
                  scale: isIdFocused ? 1.05 : 1,
                  y: isIdFocused ? -280 : 0,
                  zIndex: isIdFocused ? 50 : 1
                }}
               className="relative z-50"
             >
               {/* Hint y Error reposicionados ARRIBA del ticket para que se vean al hacer zoom */}
               <div className="relative z-50 mb-4 px-4 min-h-[40px] flex flex-col items-center justify-end font-black uppercase tracking-wider text-center">
                 <AnimatePresence mode="wait">
                   {idError ? (
                     <motion.div
                       key="error"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                     >
                       <p className="text-red-500 text-xs md:text-sm bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-red-500/30 drop-shadow-lg">
                         {idError}
                       </p>
                     </motion.div>
                   ) : showIdHint ? (
                     <motion.p
                       key="hint"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -10 }}
                       className="text-amber-200/80 font-bold text-[10px] md:text-xs bg-black/20 backdrop-blur-sm px-4 py-1.5 rounded-full"
                     >
                        Encontrá tu ID en el dorso del ticket
                     </motion.p>
                   ) : null}
                 </AnimatePresence>
               </div>
               <div
                 className="perspective-[1000px] relative"
               >
              <motion.div
                animate={{
                  rotateY: isCardFlipped ? 180 : 0,
                  
                  
                  
                }}
                onClick={() => {
                  if (isRegistered) {
                    setIsCardFlipped(!isCardFlipped);
                  }
                }}
                className={`relative w-full max-w-2xl mx-auto aspect-[677/313] rounded-3xl ${isRegistered ? 'cursor-pointer' : ''}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Cara frontal */}
                 <div
                   className="absolute inset-0 flex flex-col p-6 md:p-10 rounded-[22px] overflow-hidden border-2"
                   style={{
                     backfaceVisibility: 'hidden',
                     WebkitBackfaceVisibility: 'hidden',
                     transform: 'rotateY(0deg)',
                     zIndex: 2,
                     background: selectedTier === 'oro'
                       ? 'linear-gradient(to bottom right, #6b5800, #c5a059, #4d3d00)'
                       : selectedTier === 'plata'
                         ? 'linear-gradient(to bottom right, #4a4a4a, #C0C0C0, #1a1a1a)'
                         : selectedTier === 'bronce'
                           ? 'linear-gradient(to bottom right, #6b3e26, #CD7F32, #2d1e16)'
                           : 'linear-gradient(to bottom right, #1a1a1a, #2a2a2a, #1a1a1a)',
                     borderColor: selectedTier === 'oro'
                       ? 'rgba(251, 191, 36, 0.5)'
                       : selectedTier === 'plata'
                         ? 'rgba(203, 213, 225, 0.4)'
                         : selectedTier === 'bronce'
                           ? 'rgba(217, 119, 6, 0.4)'
                           : 'rgba(255, 255, 255, 0.1)',
                     filter: selectedTier ? 'grayscale(0) opacity(1)' : 'grayscale(1) opacity(0.5)',
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
                            animate={idError ? {
                              x: [0, -10, 10, -10, 10, -10, 10, 0],
                              color: ["#000", "#ef4444", "#ef4444", "#000"]
                            } : { 
                              x: 0, 
                              color: selectedTier ? "#000" : "rgba(0,0,0,0.3)" 
                            }}
                            transition={{ duration: 1 }}
                            onFocus={() => setIsIdFocused(true)}
                            onBlur={() => setIsIdFocused(false)}
                            disabled={!selectedTier || isValidating}
                            className={`w-full bg-transparent text-[12px] md:text-[24px] font-black font-mono placeholder:text-black/40 focus:outline-none tracking-normal transition-colors text-center shadow-none border-none ${!selectedTier ? 'cursor-not-allowed' : ''} ${isValidating ? 'animate-pulse opacity-50' : ''}`}
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
                   className="absolute inset-0 flex flex-col p-3 md:p-10 overflow-hidden rounded-[22px] border-2"
                   style={{
                     backfaceVisibility: 'hidden',
                     WebkitBackfaceVisibility: 'hidden',
                     transform: 'rotateY(180deg)',
                     zIndex: 1,
                     background: selectedTier === 'oro'
                       ? 'linear-gradient(to bottom right, #6b5800, #c5a059, #4d3d00)'
                       : selectedTier === 'plata'
                         ? 'linear-gradient(to bottom right, #4a4a4a, #C0C0C0, #1a1a1a)'
                         : selectedTier === 'bronce'
                           ? 'linear-gradient(to bottom right, #6b3e26, #CD7F32, #2d1e16)'
                           : 'linear-gradient(to bottom right, #1a1a1a, #2a2a2a, #1a1a1a)',
                     borderColor: selectedTier === 'oro'
                       ? 'rgba(251, 191, 36, 0.5)'
                       : selectedTier === 'plata'
                         ? 'rgba(203, 213, 225, 0.4)'
                         : selectedTier === 'bronce'
                           ? 'rgba(217, 119, 6, 0.4)'
                           : 'rgba(255, 255, 255, 0.1)',
                   }}
                 >
                   {/* Header con Logo y Título - DORSO (Overlayed on Mockup if needed, or part of mockup) */}
                   <div className="absolute top-[8%] left-[8%] right-[8%] flex justify-between items-start z-30 opacity-60">
                     <span className={`text-[10px] md:text-sm font-black uppercase tracking-widest ${selectedTier ? tierStyles[selectedTier].label : ''}`}>
                       Registro de Socio
                     </span>
                     <img
                       src={`${import.meta.env.BASE_URL}Logo_MiGusto_Experience.png`}
                       alt="Mi Gusto"
                       className="h-4 md:h-8 w-auto object-contain brightness-200"
                     />
                   </div>

                   {/* Inputs Section - Positioned over the mockup's fields */}
                   <div className="absolute inset-0 z-30">
                     {/* NOMBRE Y APELLIDO */}
                     <div className="absolute top-[32%] left-[8%] w-[84%]">
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
                              onFocus={() => setIsIdFocused(true)}
                              onBlur={() => setIsIdFocused(false)}
                             className="w-full bg-transparent text-xl md:text-4xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left uppercase"
                           />
                         ) : (
                           <motion.span
                             key="name-printed"
                             initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                             animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                             className={`block w-full text-xl md:text-4xl font-black font-mono tracking-tighter text-left uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${selectedTier ? tierStyles[selectedTier].label : ''}`}
                           >
                             {regName}
                           </motion.span>
                         )}
                       </AnimatePresence>
                     </div>

                     {/* CELULAR */}
                     <div className="absolute bottom-[22%] left-[8%] w-[45%]">
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
                              onFocus={() => setIsIdFocused(true)}
                              onBlur={() => setIsIdFocused(false)}
                               maxLength={12}
                               className="w-full bg-transparent text-sm md:text-2xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left"
                             />
                           ) : (
                             <motion.span
                               key="phone-printed"
                               initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                               animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                               className={`block w-full text-sm md:text-2xl font-black font-mono tracking-tighter text-left drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${selectedTier ? tierStyles[selectedTier].label : ''}`}
                             >
                               {regPhone}
                             </motion.span>
                           )}
                         </AnimatePresence>
                     </div>

                     {/* DNI */}
                     <div className="absolute bottom-[22%] right-[8%] w-[35%]">
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
                              onFocus={() => setIsIdFocused(true)}
                              onBlur={() => setIsIdFocused(false)}
                               maxLength={10}
                               className="w-full bg-transparent text-sm md:text-2xl font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-right"
                             />
                           ) : (
                             <motion.span
                               key="dni-printed"
                               initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                               animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                               className={`block w-full text-sm md:text-2xl font-black font-mono tracking-tighter text-right drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${selectedTier ? tierStyles[selectedTier].label : ''}`}
                             >
                               {regDni}
                             </motion.span>
                           )}
                         </AnimatePresence>
                     </div>

                     {/* EMAIL */}
                     <div className="absolute bottom-[8%] left-[8%] w-[84%]">
                       <AnimatePresence mode="wait">
                         {!isRegistered ? (
                           <motion.input
                             key="email-input"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: 1 }}
                             exit={{ opacity: 0 }}
                             type="email"
                             placeholder="correo electrónico"
                             value={regEmail}
                             onChange={handleEmailChange}
                              onFocus={() => setIsIdFocused(true)}
                              onBlur={() => setIsIdFocused(false)}
                             className="w-full bg-transparent text-[10px] md:text-lg font-black font-mono text-white placeholder:text-white/20 focus:outline-none tracking-tighter text-left lowercase"
                           />
                         ) : (
                           <motion.span
                             key="email-printed"
                             initial={{ scale: 1.2, opacity: 0, filter: 'brightness(2)' }}
                             animate={{ scale: 1, opacity: 1, filter: 'brightness(1)' }}
                             className={`block w-full text-[10px] md:text-lg font-black font-mono tracking-tighter text-left lowercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${selectedTier ? tierStyles[selectedTier].label : ''}`}
                           >
                             {regEmail}
                           </motion.span>
                         )}
                       </AnimatePresence>
                     </div>
                   </div>

                   {/* Background overlay suave para la parte de atrás */}
                   <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
                 </div>
              </motion.div>
            </div>
            

           </motion.div>

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

      {/* EL CAMINO A LA EXPERIENCIA - Unified Section */}
      <section className="pt-24 pb-10 px-4 relative" id="camino-experiencia">
        <div className="container mx-auto max-w-[1400px] relative">
          <h2 className="text-4xl md:text-5xl font-black uppercase text-white mb-16 tracking-tight text-center md:text-left">
            El camino a la <span className="text-migusto-dorado">experiencia</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
            
            {/* Columna 1: Pasos */}
            <div className="flex flex-col gap-4 md:gap-6 lg:col-span-3">
              {[
                { step: 1, text: 'Encontraste un ticket especial en tu pedido' },
                { step: 2, text: 'Validamos ID y asociamos tu DNI al ticket' },
                { step: 3, text: 'Disfrutá tu canje mensual' }
              ].map(({ step, text }, idx) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.5 }}
                  className="flex flex-col p-4 md:p-8 rounded-2xl md:rounded-[2rem] glass-card relative overflow-hidden group h-full justify-center"
                >
                  <div className="w-10 h-10 md:w-16 md:h-16 bg-[#1a1a1a] rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 border border-white/5 shrink-0">
                    <span className="text-amber-400 font-black text-xl md:text-4xl">{step}</span>
                  </div>
                  <p className="text-white/90 text-sm md:text-xl font-medium leading-tight">{text}</p>
                </motion.div>
              ))}
            </div>

            {/* Columna 2: Reglas (Alertas) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col p-6 md:p-8 rounded-[2rem] glass-card relative overflow-hidden h-full lg:col-span-4"
            >
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-8 border border-white/5 shrink-0 mx-auto md:mx-0">
                <AlertCircle className="h-8 w-8 text-amber-500" />
              </div>
              <div className="flex flex-col flex-1 justify-around gap-6">
                {[
                  { title: 'Personal e Intransferible', text: 'Solo válido para el titular registrado' },
                  { title: 'Pérdida sin Reposición', text: 'No se emiten duplicados de tarjeta' },
                  { title: 'No Acumulable', text: 'Un premio por persona' },
                  { title: 'Canje Mensual', text: 'Un pack de 12 empanadas por mes' }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col text-center md:text-left">
                    <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight mb-2">{item.title}</h3>
                    <p className="text-sm md:text-base text-white/50 leading-tight">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Columna 3: Mapa */}
            <motion.div
              id="ubicacion-sucursal"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col h-full scroll-mt-32 relative lg:col-span-5 mt-10 md:mt-0"
            >
              <h3 className="absolute -top-8 md:-top-10 left-0 right-0 text-white font-bold text-center w-full leading-tight text-sm md:text-base uppercase tracking-wider">
                Beneficio exclusivo de Vicente Lopez
              </h3>

              <div className="p-6 md:p-8 rounded-[2rem] glass-card w-full flex-1 flex flex-col items-center">

                {/* Mapa Real */}
                <div className="w-full relative overflow-hidden rounded-3xl border border-white/10 flex-1 min-h-[160px] md:min-h-[200px] mb-6 shadow-inner bg-black/50">
                  <iframe 
                    src="https://maps.google.com/maps?q=Mi%20Gusto,%20Av.%20del%20Libertador%20962,%20Vicente%20L%C3%B3pez&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                    width="100%" 
                    height="100%" 
                    style={{border:0}} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full object-cover"
                  ></iframe>
                </div>

                <div className="w-full mt-auto">
                  <p className="text-white/80 font-medium mb-5 text-center text-sm md:text-base">
                    Av. del Libertador 962, Vte. Lopez.
                  </p>

                  <a
                    href="https://www.google.com/maps?q=Mi+Gusto+Vicente+Lopez+Av.+del+Libertador+962"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-white/5 hover:bg-amber-500 hover:text-black text-white rounded-full transition-all duration-300 border border-white/10 hover:border-transparent font-black tracking-widest text-xs uppercase"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Abrir Mapa</span>
                  </a>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>







    </motion.div>
  );
}