import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function Faq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen pt-[70px] pb-20 px-4 relative flex flex-col items-center"
    >
      <div className="container mx-auto max-w-4xl relative z-10 w-full mt-0 flex-1">
        
        {/* Botón Volver Posicionado en el Recuadro Rojo de la esquina del Contenedor */}
        <button 
          onClick={() => navigate('/')}
          className="absolute -top-[56px] md:top-0 left-2 md:-left-24 flex flex-col items-center gap-1 text-migusto-crema/70 hover:text-white transition-colors group z-40 cursor-pointer"
        >
          <span className="font-black tracking-[0.2em] uppercase text-[10px] md:text-xs">Volver</span>
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-2" />
        </button>

        <h1 className="text-3xl md:text-5xl font-serif text-center mb-4 lg:mb-6 text-migusto-crema -mt-4">
          Preguntas <span className="text-gold-gradient italic">Frecuentes</span>
        </h1>
        
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden relative"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className={`w-full px-6 md:px-8 py-4 md:py-5 text-left flex items-center justify-between transition-all rounded-2xl glass-card text-migusto-crema hover:bg-white/10 ${
                  openFaq === index ? 'bg-white/10' : ''
                }`}
              >
                <span className="text-base md:text-lg font-bold pr-4">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 md:h-6 md:w-6 transition-transform duration-500 flex-shrink-0 ${
                    openFaq === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === index ? 'auto' : 0, opacity: openFaq === index ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 md:px-8 py-6 text-migusto-crema/70 leading-relaxed text-sm md:text-lg italic flex flex-col items-start gap-4">
                  <p>{faq.answer}</p>
                  {faq.question === '¿Dónde?' && (
                    <button
                      onClick={() => {
                        sessionStorage.setItem('scrollToUbicacion', 'true');
                        navigate('/');
                      }}
                      className="text-xs font-black uppercase tracking-widest px-4 py-2 bg-white/10 hover:bg-migusto-rojo rounded-full transition-all border border-white/10 hover:border-transparent inline-block text-white not-italic"
                    >
                      Ver ubicación en el Mapa
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
