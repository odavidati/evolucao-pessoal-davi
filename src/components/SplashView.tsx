import React from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles } from 'lucide-react';

interface SplashViewProps {
  onEnter: () => void;
}

export default function SplashView({ onEnter }: SplashViewProps) {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden text-text-main font-sans">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30 mix-blend-multiply">
        <div className="w-80 h-80 bg-brand-blue/10 rounded-full blur-[80px]" />
      </div>

      <div className="h-6" /> {/* Top spacer */}

      {/* Main core info */}
      <motion.main 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex-1 flex flex-col items-center justify-center text-center z-10 max-w-sm"
      >
        <div className="mb-6 p-4 glass-panel rounded-3xl shadow-sm">
          <Compass className="w-16 h-16 text-brand-blue animate-pulse" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-4xl font-display font-extrabold tracking-tight text-text-main mb-3">
          Evolução Pessoal
        </h1>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/35 border border-brand-blue/20 rounded-full text-[11px] text-brand-blue font-extrabold uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Foco & Clareza Mental</span>
        </div>
      </motion.main>

      {/* Bottom statement & CTA */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 1.0 }}
        className="w-full max-w-sm flex flex-col items-center gap-8 z-10 text-center"
      >
        <p className="text-lg text-text-sec italic leading-relaxed px-2 font-light">
          "Eu não preciso controlar tudo. Eu preciso me situar e voltar para mim."
        </p>

        <button
          onClick={onEnter}
          className="w-full h-14 bg-brand-blue text-white rounded-full font-semibold text-lg hover:bg-opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          Entrar no Meu Dia
        </button>
        
        <p className="text-xs text-text-sec opacity-60">
          Feito com carinho para o Davi • 100% offline & seguro
        </p>
      </motion.footer>
    </div>
  );
}
