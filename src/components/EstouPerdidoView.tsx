import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, AlertTriangle, ArrowLeft, Heart, ShoppingBag, EyeOff, ClipboardList, PenTool } from 'lucide-react';

interface EstouPerdidoViewProps {
  onBack: () => void;
  onOpenModoAtraso: () => void;
  onOpenQueroComprar: () => void;
  onOpenDescarregarCabeca: () => void;
  onOpenFilaUnica: () => void;
  onCompletePlanMinimo: () => void;
}

type LostReason = 'tarefas' | 'atrasado' | 'comprar' | 'treino' | 'ansioso' | 'descarregar' | null;

export default function EstouPerdidoView({
  onBack,
  onOpenModoAtraso,
  onOpenQueroComprar,
  onOpenDescarregarCabeca,
  onOpenFilaUnica,
  onCompletePlanMinimo
}: EstouPerdidoViewProps) {
  const [selectedReason, setSelectedReason] = useState<LostReason>(null);
  const [breaths, setBreaths] = useState(0);

  const reasons = [
    { id: 'tarefas' as const, label: 'Muitas tarefas', icon: ClipboardList, color: 'text-brand-blue bg-brand-blue/15' },
    { id: 'atrasado' as const, label: 'Estou atrasado', icon: AlertTriangle, color: 'text-amber-700 bg-amber-500/15' },
    { id: 'comprar' as const, label: 'Quero comprar algo', icon: ShoppingBag, color: 'text-brand-purple bg-brand-purple/15' },
    { id: 'treino' as const, label: 'Quero faltar treino', icon: Heart, color: 'text-emerald-700 bg-emerald-500/15' },
    { id: 'ansioso' as const, label: 'Estou ansioso', icon: HelpCircle, color: 'text-pink-700 bg-pink-500/15' },
    { id: 'descarregar' as const, label: 'Preciso descarregar a cabeça', icon: PenTool, color: 'text-gray-700 bg-gray-500/15' },
  ];

  return (
    <div className="min-h-screen text-text-main flex flex-col p-6 font-sans">
      {/* Absolute top minimal back-to-today action */}
      <div className="flex items-center justify-between h-14 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-sec text-sm font-bold hover:text-text-main active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para Hoje</span>
        </button>
        <span className="text-xs bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
          SOS
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-start max-w-sm mx-auto w-full pt-4">
        <div className="mb-6">
          <h1 className="text-4xl font-display font-extrabold tracking-tight text-text-main">
            Calma.
          </h1>
          <p className="text-lg text-text-sec mt-1">
            Uma coisa de cada vez. O que está pegando agora?
          </p>
        </div>

        <AnimatePresence mode="wait">
          {selectedReason === null ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 gap-3"
            >
              {reasons.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedReason(item.id)}
                    className="w-full min-h-16 flex items-center justify-between p-4 glass-panel active:scale-[0.98] transition-all text-left shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-extrabold text-text-main text-base">{item.label}</span>
                    </div>
                    <span className="text-xs text-[#5c6579] font-bold bg-white/35 border border-white/40 px-2 py-1 rounded-lg">Focar</span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              key="tip"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Contextual rescue advice */}
              <div className="glass-panel p-6 rounded-3xl my-4 space-y-6">
                {selectedReason === 'tarefas' && (
                  <>
                    <h3 className="font-display text-xl font-black text-brand-blue">Excesso de Tarefas</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      "Escolhe uma missão única para os próximos 25 minutos. O resto vai para o estacionamento mental."
                    </p>
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button 
                        onClick={onOpenFilaUnica}
                        className="w-full h-12 bg-brand-blue text-white rounded-full font-bold text-sm active:scale-95 transition-transform"
                      >
                        Criar missão única na Fila
                      </button>
                      <button 
                        onClick={onOpenDescarregarCabeca}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Estacionamento mental / Descarregar
                      </button>
                    </div>
                  </>
                )}

                {selectedReason === 'atrasado' && (
                  <>
                    <h3 className="font-display text-xl font-bold text-amber-700">Alerta de Atraso</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      "Depois deste horário, não começa tarefa nova. Só o básico para sair de casa livre."
                    </p>
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button 
                        onClick={onOpenModoAtraso}
                        className="w-full h-12 bg-amber-600 text-white rounded-full font-bold text-sm active:scale-95 transition-transform"
                      >
                        Abrir modo atraso
                      </button>
                      <button 
                        onClick={() => {
                          onOpenModoAtraso();
                        }}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Ir só com o essencial
                      </button>
                    </div>
                  </>
                )}

                {selectedReason === 'comprar' && (
                  <>
                    <h3 className="font-display text-xl font-bold text-brand-purple">Impulso de Compra</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      "Tu quer comprar isso ou quer aliviar uma sensação desagradável do dia?"
                    </p>
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button 
                        onClick={onOpenQueroComprar}
                        className="w-full h-12 bg-brand-purple text-white rounded-full font-bold text-sm active:scale-95 transition-transform"
                      >
                        Abrir analisador antifadiga
                      </button>
                      <button 
                        onClick={onBack}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Esperar 24 horas
                      </button>
                    </div>
                  </>
                )}

                {selectedReason === 'treino' && (
                  <>
                    <h3 className="font-display text-xl font-bold text-brand-green">Sem Vontade de Treinar?</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      "Não precisa fazer perfeito ou se esgotar. Escolha simplesmente o plano mínimo."
                    </p>
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button 
                        onClick={() => {
                          onCompletePlanMinimo();
                          onBack();
                        }}
                        className="w-full h-12 bg-brand-green text-white rounded-full font-bold text-sm active:scale-95 transition-transform"
                      >
                        Registrar plano mínimo (20 min)
                      </button>
                      <button 
                        onClick={onBack}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Ver aula coletiva recomendada
                      </button>
                    </div>
                  </>
                )}

                {selectedReason === 'ansioso' && (
                  <>
                    <h3 className="font-display text-xl font-bold text-pink-700">Presença & Respiração</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      Inale por 4s, segure o ar por 4s, expire por 4s. Sinta seus pés no chão, Davi. Você está seguro.
                    </p>
                    
                    <div className="flex flex-col items-center justify-center p-3 py-6 bg-pink-500/10 rounded-2xl border border-pink-500/20">
                      <span className="text-3xl font-display font-extrabold text-pink-700 animate-pulse">
                        {breaths > 0 ? `Ciclo ${breaths}` : "Pronto?"}
                      </span>
                      <button 
                        onClick={() => setBreaths(b => b + 1)}
                        className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-full font-bold text-xs active:scale-95 transition-transform"
                      >
                        Fiz uma respiração completa
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                      <button 
                        onClick={onBack}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Voltar para o Dia
                      </button>
                    </div>
                  </>
                )}

                {selectedReason === 'descarregar' && (
                  <>
                    <h3 className="font-display text-xl font-bold text-text-main">Esvaziar a Mente</h3>
                    <p className="text-text-sec text-base font-medium leading-relaxed">
                      Coloque tudo para fora agora mesmo. Nenhum pensamento é besta demais para ser estacionado.
                    </p>
                    <div className="flex flex-col gap-2.5 pt-2">
                      <button 
                        onClick={onOpenDescarregarCabeca}
                        className="w-full h-12 bg-brand-blue text-white rounded-full font-bold text-sm active:scale-95 transition-transform"
                      >
                        Escrever pensamentos agora
                      </button>
                      <button 
                        onClick={onBack}
                        className="w-full h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-sm active:scale-95 transition-transform hover:bg-white/60"
                      >
                        Voltar para o Hoje
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Back to list button */}
              <button
                onClick={() => setSelectedReason(null)}
                className="w-full h-14 border border-dashed border-white/50 text-text-sec rounded-full font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 mb-4 bg-white/20 hover:bg-white/30"
              >
                Voltar à lista de resgates
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
