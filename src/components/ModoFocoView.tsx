import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb, ParkingSquare, CheckCircle2, Edit3, ChevronRight } from 'lucide-react';
import { DayBlock } from '../data/initialData';

interface ModoFocoViewProps {
  block: DayBlock;
  intention: string;
  currentTime: string;
  onSetIntention: (text: string) => void;
  onParkIdea: (text: string) => void;
  onClose: () => void;
}

export default function ModoFocoView({
  block,
  intention,
  currentTime,
  onSetIntention,
  onParkIdea,
  onClose,
}: ModoFocoViewProps) {
  const [editingIntention, setEditingIntention] = useState(!intention);
  const [intentionDraft, setIntentionDraft] = useState(intention);
  const [showParkForm, setShowParkForm] = useState(false);
  const [parkText, setParkText] = useState('');
  const [parkedCount, setParkedCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const blockProgress = useMemo(() => {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const start = toMin(block.start);
    const end = toMin(block.end);
    const now = toMin(currentTime);
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [block, currentTime]);

  const timeRemaining = useMemo(() => {
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const remaining = toMin(block.end) - toMin(currentTime);
    if (remaining <= 0) return 'Bloco encerrado';
    const h = Math.floor(remaining / 60);
    const m = remaining % 60;
    if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ''} restantes`;
    return `${m} min restantes`;
  }, [block, currentTime]);

  const saveIntention = () => {
    if (!intentionDraft.trim()) return;
    onSetIntention(intentionDraft.trim());
    setEditingIntention(false);
  };

  const handlePark = () => {
    if (!parkText.trim()) return;
    onParkIdea(parkText.trim());
    setParkText('');
    setShowParkForm(false);
    setParkedCount(c => c + 1);
  };

  const handleConclude = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      onClose();
    }, 2200);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0A0F1E]"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-brand-blue"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <CheckCircle2 className="w-20 h-20 text-white mb-4" strokeWidth={1.5} />
            <p className="text-white text-2xl font-display font-black text-center px-8">Bloco concluído.</p>
            <p className="text-white/70 text-sm mt-2 text-center px-8">Consistência é o que separa quem sonha de quem realiza.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4 shrink-0">
        <div>
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Modo Foco</span>
          <p className="text-white/60 text-xs font-bold mt-0.5">{timeRemaining}</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition-transform"
        >
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="px-6 shrink-0">
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-brand-blue rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${blockProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-white/30 text-[10px]">{block.start}</span>
          <span className="text-white/30 text-[10px]">{block.end}</span>
        </div>
      </div>

      {/* Block name */}
      <div className="px-6 pt-8 shrink-0">
        <h1 className="text-4xl font-display font-black text-white leading-tight">{block.label}</h1>
      </div>

      {/* Intention */}
      <div className="px-6 pt-6 flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-3">
          <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Minha intenção agora</span>

          {editingIntention ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                rows={3}
                placeholder="O que você vai concluir nesse bloco? Escreva 1 coisa específica."
                value={intentionDraft}
                onChange={e => setIntentionDraft(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white text-base font-bold placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              />
              <button
                onClick={saveIntention}
                disabled={!intentionDraft.trim()}
                className="w-full h-12 rounded-2xl bg-brand-blue text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
              >
                Definir intenção <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className="bg-white/10 border border-white/15 rounded-2xl px-5 py-4 flex items-start gap-3 cursor-pointer active:scale-[.98] transition-transform"
              onClick={() => { setIntentionDraft(intention); setEditingIntention(true); }}
            >
              <p className="text-white text-lg font-bold flex-1 leading-snug">{intention}</p>
              <Edit3 className="w-4 h-4 text-white/30 shrink-0 mt-0.5" />
            </div>
          )}
        </div>

        {/* Motivational phrase */}
        {!editingIntention && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Lembre-se</span>
            </div>
            <p className="text-white/65 text-sm font-medium leading-relaxed italic">
              "{block.hint}"
            </p>
          </motion.div>
        )}

        {/* Parked ideas counter */}
        {parkedCount > 0 && (
          <motion.div
            className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          >
            <ParkingSquare className="w-4 h-4 text-brand-purple" />
            <p className="text-white/50 text-xs font-bold">
              {parkedCount} ideia{parkedCount > 1 ? 's' : ''} estacionada{parkedCount > 1 ? 's' : ''} — você não perdeu nada.
            </p>
          </motion.div>
        )}
      </div>

      {/* Park idea form */}
      <AnimatePresence>
        {showParkForm && (
          <motion.div
            className="px-6 pb-4 shrink-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="bg-white/10 rounded-2xl p-4 space-y-3">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Estacionar ideia</p>
              <input
                autoFocus
                type="text"
                placeholder="Escreve aqui e volta pro foco..."
                value={parkText}
                onChange={e => setParkText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePark()}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 h-11 text-white text-sm font-bold placeholder-white/25 focus:outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowParkForm(false)} className="flex-1 h-10 rounded-xl bg-white/10 text-white/60 font-bold text-sm active:scale-95 transition-transform">
                  Cancelar
                </button>
                <button onClick={handlePark} disabled={!parkText.trim()} className="flex-1 h-10 rounded-xl bg-brand-purple text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-40">
                  Estacionar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom actions */}
      {!editingIntention && (
        <div className="px-6 pb-10 pt-4 space-y-3 shrink-0">
          {!showParkForm && (
            <button
              onClick={() => setShowParkForm(true)}
              className="w-full h-14 rounded-2xl bg-white/10 border border-white/15 text-white font-bold text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <ParkingSquare className="w-5 h-5 text-brand-purple" />
              Tive uma ideia — estacionar e voltar ao foco
            </button>
          )}
          <button
            onClick={handleConclude}
            className="w-full h-14 rounded-2xl bg-brand-blue text-white font-bold text-base flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg shadow-brand-blue/30"
          >
            <CheckCircle2 className="w-5 h-5" />
            Concluí esse bloco
          </button>
        </div>
      )}
    </motion.div>
  );
}
