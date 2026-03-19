import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Shield, AlertTriangle, Ticket } from 'lucide-react';
import { supabase, type Ticket as TicketData } from '../lib/supabase';

type ValidatorForm = {
  dni: string;
  id_ticket: string;
};

type ValidationResult = {
  success: boolean;
  message: string;
  ticket?: TicketData;
};

export default function Validator() {
  const [validatedTickets, setValidatedTickets] = useState<TicketData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ValidatorForm>();

  useEffect(() => {
    document.title = "Mi Gusto | Ticket System";
    loadValidatedTickets();
    
    // Opcionalmente restaurar el título al salir si es necesario
    return () => {
      document.title = "Mi Gusto | Ticket Ganador";
    };
  }, []);

  const loadValidatedTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('usado', true)
      .order('fecha_validacion', { ascending: false });

    if (!error && data) {
      setValidatedTickets(data);
    }
  };

  const onSubmit = async (data: ValidatorForm) => {
    setIsLoading(true);
    setValidationResult(null);

    try {
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('id_ticket', data.id_ticket)
        .maybeSingle();

      if (error) {
        setValidationResult({
          success: false,
          message: 'Error al validar el ticket. Intente nuevamente.'
        });
      } else if (!ticket) {
        setValidationResult({
          success: false,
          message: 'Ticket inválido. El ID no existe en el sistema.'
        });
      } else if (ticket.usado) {
        setValidationResult({
          success: false,
          message: `Ticket ya usado. Fue validado el ${new Date(ticket.fecha_validacion!).toLocaleDateString()} con DNI ${ticket.dni_validado}.`
        });
      } else {
        const { error: updateError } = await supabase
          .from('tickets')
          .update({
            usado: true,
            dni_validado: data.dni,
            fecha_validacion: new Date().toISOString()
          })
          .eq('id_ticket', data.id_ticket);

        if (updateError) {
          setValidationResult({
            success: false,
            message: 'Error al actualizar el ticket. Intente nuevamente.'
          });
        } else {
          setValidationResult({
            success: true,
            message: `Válido: ${ticket.tipo} - ${ticket.meses} meses. Listo para registro.`,
            ticket
          });
          loadValidatedTickets();
        }
      }

      setShowModal(true);
      reset();
    } catch (err) {
      setValidationResult({
        success: false,
        message: 'Error inesperado. Intente nuevamente.'
      });
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-5 rounded-3xl bg-migusto-rojo/10 border border-migusto-rojo/20 mb-6"
          >
            <Shield className="h-14 w-14 text-migusto-rojo" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-migusto-crema tracking-tight">
            Validador de <span className="text-migusto-rojo italic">Sucursal</span>
          </h1>
          <p className="text-migusto-crema/40 text-xl font-light">Sistema de validación exclusivo para empleados Mi Gusto</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] relative group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Ticket className="h-24 w-24 text-migusto-rojo" />
            </div>

            <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright mb-8">Validar Ticket</h2>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="h-6 w-6 text-migusto-dorado-bright flex-shrink-0 mt-1" />
                <div className="text-sm text-migusto-crema/60 leading-relaxed">
                  <p className="font-bold mb-2 text-migusto-crema uppercase tracking-widest text-xs">Protocolo de Seguridad:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-migusto-rojo"></div>
                      <span>Verificar DNI físico original del cliente</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-migusto-rojo"></div>
                      <span>Validar autenticidad del Ticket Dorado</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1 h-1 rounded-full bg-migusto-rojo"></div>
                      <span>Carga obligatoria de datos en sistema</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-3">
                <label className="block text-migusto-crema/70 text-sm font-bold uppercase tracking-widest ml-1">
                  DNI del Cliente
                </label>
                <input
                  type="text"
                  {...register('dni', {
                    required: 'DNI es requerido',
                    pattern: { value: /^[0-9]+$/, message: 'Solo números' },
                    minLength: { value: 7, message: 'Mínimo 7 dígitos' }
                  })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 focus:border-migusto-rojo transition-all text-lg font-medium placeholder:text-white/10"
                  placeholder="Sin puntos ni espacios"
                />
                {errors.dni && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium ml-1">{errors.dni.message}</motion.p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-migusto-crema/70 text-sm font-bold uppercase tracking-widest ml-1">
                  ID del Ticket Dorado
                </label>
                <input
                  type="text"
                  {...register('id_ticket', { required: 'ID del ticket es requerido' })}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-migusto-crema focus:outline-none focus:ring-2 focus:ring-migusto-rojo/50 focus:border-migusto-rojo transition-all text-lg font-medium placeholder:text-white/10 uppercase"
                  placeholder="Ej: ORO1-50"
                />
                {errors.id_ticket && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-medium ml-1">{errors.id_ticket.message}</motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-migusto-rojo text-white py-5 rounded-2xl font-black text-xl shadow-premium hover:bg-migusto-rojo-claro transition-all disabled:opacity-50 flex items-center justify-center space-x-3 group relative overflow-hidden"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>Validar Ahora</span>
                    <Shield className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] flex flex-col h-full max-h-[750px]"
          >
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-serif font-bold text-migusto-dorado-bright">Actividad Reciente</h2>
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sistema Activo</span>
              </div>
            </div>

            <div className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-grow">
              {validatedTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                  <Ticket className="h-16 w-16 mb-4" />
                  <p className="text-lg font-bold uppercase tracking-tighter">No hay validaciones registradas</p>
                </div>
              ) : (
                validatedTickets.map((ticket: TicketData) => (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={ticket.id_ticket}
                    className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 ${ticket.tipo === 'ORO' ? 'bg-migusto-oro' : ticket.tipo === 'PLATA' ? 'bg-migusto-plata' : 'bg-migusto-bronce'
                      }`}></div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="font-black text-2xl tracking-tighter text-migusto-crema">{ticket.id_ticket}</span>
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${ticket.tipo === 'ORO' ? 'bg-migusto-oro/20 text-migusto-oro border-migusto-oro/30' :
                        ticket.tipo === 'PLATA' ? 'bg-migusto-plata/20 text-migusto-plata border-migusto-plata/30' :
                          'bg-migusto-bronce/20 text-migusto-bronce border-migusto-bronce/30'
                        }`}>
                        {ticket.tipo}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs relative z-10">
                      <div className="space-y-1">
                        <p className="text-white/30 uppercase tracking-widest font-bold">DNI Cliente</p>
                        <p className="text-migusto-crema font-bold">{ticket.dni_validado}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white/30 uppercase tracking-widest font-bold">Vigencia</p>
                        <p className="text-migusto-crema font-bold">{ticket.meses} Meses</p>
                      </div>
                      <div className="col-span-2 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] text-white/40 font-bold uppercase">{new Date(ticket.fecha_validacion!).toLocaleDateString()}</span>
                        </div>
                        <Ticket className="h-4 w-4 text-white/10 group-hover:text-migusto-rojo/30 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {showModal && validationResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`glass-card p-10 rounded-[3rem] max-w-md w-full border-2 relative overflow-hidden ${validationResult.success ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}
          >
            <div className="flex flex-col items-center text-center relative z-10">
              {validationResult.success ? (
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                  <XCircle className="h-12 w-12 text-red-400" />
                </div>
              )}
              <h3 className="text-3xl font-serif font-bold text-migusto-crema mb-4 tracking-tight">
                {validationResult.success ? '¡Validación Existosa!' : 'Error de Validación'}
              </h3>
              <p className="text-migusto-crema/60 mb-10 leading-relaxed text-lg italic">{validationResult.message}</p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-migusto-rojo text-white py-5 rounded-2xl font-black text-xl hover:bg-migusto-rojo-claro transition-all shadow-premium"
              >
                Continuar
              </button>
            </div>
            {/* Background dynamic light */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] opacity-20 rounded-full ${validationResult.success ? 'bg-emerald-500' : 'bg-red-500'
              }`}></div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
