import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, AlertTriangle, ShieldCheck, Check, Sparkles, Star } from 'lucide-react';
import { CustomChecklistItem } from '../types';

interface ModoAtrasoViewProps {
  checklist: CustomChecklistItem[];
  onToggleItem: (id: string) => void;
  onSetOnlyEssentials: () => void;
  onSairAgora: (msg: string) => void;
  onBack: () => void;
}

export default function ModoAtrasoView({
  checklist,
  onToggleItem,
  onSetOnlyEssentials,
  onSairAgora,
  onBack
}: ModoAtrasoViewProps) {
  const [salvaStatus, setSalvaStatus] = useState<string | null>(null);

  const handleSairAgora = () => {
    onSairAgora("Vai agora! O que ficou pendente fica para depois. Foco no caminho!");
    setSalvaStatus("Mensagem de emergência ativada");
    setTimeout(() => {
      onBack();
    }, 2800);
  };

  return (
    <div className="min-h-screen text-text-main flex flex-col p-6 font-sans">
      {/* Top minimal header */}
      <div className="flex items-center justify-between h-14 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-sec text-sm font-bold hover:text-text-main active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Rotina</span>
        </button>
        <span className="text-xs bg-amber-500/15 text-amber-900 border border-amber-500/25 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          Atrasado
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-start max-w-sm mx-auto w-full pt-2">
        <div className="mb-6">
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-text-main">
            Modo atraso
          </h1>
          <p className="text-base text-text-sec mt-1">
            Depois deste horário, não começa tarefa nova de jeito nenhum.
          </p>
        </div>

        {/* Time cards bento layout */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-panel p-4 rounded-3xl flex flex-col gap-1 relative overflow-hidden shadow-sm">
            <span className="text-xs font-bold text-text-sec uppercase tracking-wider">Alvo de Saída</span>
            <span className="text-2xl font-display font-extrabold text-brand-blue mt-1">08:15</span>
            <div className="absolute right-2 bottom-2 text-brand-blue/10">
              <Clock className="w-12 h-12" />
            </div>
          </div>
          
          <div className="glass-panel-purple p-4 rounded-3xl flex flex-col gap-1 relative overflow-hidden shadow-sm">
            <span className="text-xs font-bold text-brand-purple uppercase tracking-wider flex items-center gap-1">
              Limite Máximo
            </span>
            <span className="text-2xl font-display font-extrabold text-brand-purple mt-1">08:30</span>
            <div className="absolute right-2 bottom-2 text-brand-purple/10">
              <AlertTriangle className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Big visual banner status if user triggers leaving */}
        {salvaStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-brand-blue text-white rounded-2xl shadow-md text-center text-sm font-semibold"
          >
            Vai. O resto fica para depois!
          </motion.div>
        )}

        {/* Checklist Container */}
        <div className="flex flex-col gap-4 mb-44">
          <div className="flex justify-between items-center px-1">
            <h2 className="font-display font-bold text-lg text-text-main">Checklist de Saída</h2>
            <span className="text-xs text-text-sec">Toque para marcar</span>
          </div>

          <div className="flex flex-col gap-2">
            {checklist.map((item) => {
               return (
                <button
                  key={item.id}
                  onClick={() => onToggleItem(item.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all hover:bg-white/30 text-left active:scale-[0.99] ${
                    item.checked 
                      ? 'bg-white/15 border-white/10 opacity-60' 
                      : item.essential 
                        ? 'glass-panel border-amber-500/30' 
                        : 'glass-panel'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${
                      item.checked 
                        ? 'bg-white/30 text-gray-500' 
                        : item.essential 
                          ? 'bg-amber-500/20 text-amber-900 font-bold' 
                          : 'bg-brand-blue/15 text-brand-blue font-bold'
                    }`}>
                      {item.checked ? (
                        <Check className="w-5 h-5 text-gray-400" strokeWidth={3} />
                      ) : item.essential ? (
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ) : (
                        <Check className="w-4 h-4 opacity-30" strokeWidth={2.5} />
                      )}
                    </div>
                    <div>
                      <p className={`font-bold text-base ${item.checked ? 'line-through text-text-sec opacity-60' : 'text-text-main'}`}>
                        {item.label}
                      </p>
                      {item.essential && !item.checked && (
                        <span className="text-[10px] text-amber-900 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Essencial
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.checked 
                      ? 'bg-brand-blue border-brand-blue text-white' 
                      : 'border-gray-200'
                  }`}>
                    {item.checked && <Check className="w-4 h-4" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 w-full px-6 pt-4 pb-10 bg-white/25 backdrop-blur-xl border-t border-white/40 z-50 flex flex-col gap-3 max-w-sm mx-auto right-0 rounded-t-3xl shadow-lg">
        <button
          onClick={handleSairAgora}
          className="w-full h-14 bg-brand-blue text-white rounded-full font-bold text-base transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
        >
          Sair agora
        </button>
        <button
          onClick={onSetOnlyEssentials}
          className="w-full h-14 bg-white/45 border border-white/50 text-amber-900 font-bold rounded-full text-base transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          Só o essencial
        </button>
      </div>
    </div>
  );
}
