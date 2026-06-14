import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, ArrowDownCircle, ArrowUpCircle, CheckSquare, Hourglass, Send, Check } from 'lucide-react';
import { LancamentoRapido } from '../types';

interface LancamentoRapidoViewProps {
  onAddLancamento: (text: string, type: 'gasto' | 'entrada' | 'conta_paga' | 'espera') => void;
  onBack: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function LancamentoRapidoView({
  onAddLancamento,
  onBack,
  showToast
}: LancamentoRapidoViewProps) {
  const [inputText, setInputText] = useState('');
  const [selectedType, setSelectedType] = useState<'gasto' | 'entrada' | 'conta_paga' | 'espera'>('gasto');
  const [rotatorIndex, setRotatorIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const rotativeExamples = [
    "Gastei 28 com Uber",
    "Paguei 70 terapia",
    "Recebi 300 de cliente",
    "Mercado 112"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setRotatorIndex(prev => (prev + 1) % rotativeExamples.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleRegister = () => {
    if (!inputText.trim()) {
      if (showToast) showToast('Escreva o que aconteceu com o dinheiro!', 'warning');
      return;
    }

    onAddLancamento(inputText.trim(), selectedType);
    setCompleted(true);
    setTimeout(() => {
      onBack();
    }, 2000);
  };

  const selectExample = (ex: string) => {
    setInputText(ex);
    // Deduce type simple heuristics
    const low = ex.toLowerCase();
    if (low.includes('recebi') || low.includes('ganhei')) {
      setSelectedType('entrada');
    } else if (low.includes('paguei') || low.includes('conta') || low.includes('boleto')) {
      setSelectedType('conta_paga');
    } else if (low.includes('espera') || low.includes('quase')) {
      setSelectedType('espera');
    } else {
      setSelectedType('gasto');
    }
  };

  return (
    <div className="min-h-screen text-text-main flex flex-col p-6 font-sans relative">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 mb-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/45 text-text-sec active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-display font-bold text-lg text-text-main">
          Lançamento rápido
        </span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 flex flex-col justify-start max-w-sm mx-auto w-full pt-4">
        {completed ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 glass-panel-blue border border-brand-blue/30 rounded-3xl text-[#1e293b] text-center font-bold space-y-2 mt-12"
          >
            <p className="text-base text-brand-blue font-extrabold flex items-center justify-center gap-2"><Check className="w-5 h-5" strokeWidth={3} /> Lançado!</p>
            <p className="text-sm font-semibold">Seu dinheiro sem neblina e sob total controle sem chateações.</p>
          </motion.div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <label htmlFor="transaction-input" className="block text-base font-extrabold text-text-main">
                O que aconteceu com teu dinheiro?
              </label>
              
              {/* Natural Input Box */}
              <div className="relative w-full rounded-2xl bg-white/20 p-4 min-h-[140px] shadow-sm border border-white/45 focus-within:ring-2 focus-within:ring-brand-blue/20 transition-all">
                <textarea
                  id="transaction-input"
                  autoFocus
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder=""
                  rows={3}
                  className="w-full text-xl text-text-main font-bold bg-transparent border-none outline-none resize-none focus:ring-0 p-0 placeholder-gray-400"
                />
                
                {inputText.length === 0 && (
                  <div className="absolute top-4 left-4 pointer-events-none text-xl font-bold text-text-sec/45 select-none animate-pulse">
                    Ex: {rotativeExamples[rotatorIndex]}
                  </div>
                )}
              </div>
            </div>

            {/* Tap examples helpers */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-text-sec uppercase tracking-wider block px-1">
                Toque em um exemplo rápido para testar:
              </span>
              <div className="flex flex-wrap gap-2">
                {rotativeExamples.map(ex => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => selectExample(ex)}
                    className="px-3.5 py-1.5 bg-white/35 border border-white/45 rounded-xl text-xs font-bold text-text-main hover:bg-white/45 active:scale-95 transition-all text-left"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual type selector chips */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-text-sec uppercase tracking-wider block px-1">
                Qual o tipo dessa transação?
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedType('gasto')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    selectedType === 'gasto'
                      ? 'bg-red-500/20 border-red-500/60 text-red-950 font-extrabold shadow-sm'
                      : 'bg-white/35 border border-white/45 text-text-sec hover:bg-white/45'
                  }`}
                >
                  <ArrowDownCircle className="w-4 h-4 text-red-600 font-bold" />
                  Gasto / Despesa
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('entrada')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    selectedType === 'entrada'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-950 font-extrabold shadow-sm'
                      : 'bg-white/35 border border-white/45 text-text-sec hover:bg-white/45'
                  }`}
                >
                  <ArrowUpCircle className="w-4 h-4 text-emerald-600 font-bold" />
                  Recebimento
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('conta_paga')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    selectedType === 'conta_paga'
                      ? 'bg-slate-500/20 border-slate-500/60 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-white/35 border border-white/45 text-text-sec hover:bg-white/45'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-slate-600 font-bold" />
                  Conta paga
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('espera')}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${
                    selectedType === 'espera'
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-950 font-extrabold shadow-sm'
                      : 'bg-white/35 border border-white/45 text-text-sec hover:bg-white/45'
                  }`}
                >
                  <Hourglass className="w-4 h-4 text-amber-600 font-bold" />
                  Compra em espera
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button footer */}
      {!completed && (
        <div className="fixed bottom-0 left-0 w-full px-6 pt-4 pb-10 bg-white/20 backdrop-blur-xl border-t border-white/45 z-50 max-w-sm mx-auto right-0 rounded-t-3xl shadow-lg">
          <button
            onClick={handleRegister}
            disabled={!inputText.trim()}
            className={`w-full h-14 rounded-full font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              inputText.trim() 
                ? 'bg-brand-blue text-white shadow-md font-extrabold' 
                : 'bg-white/10 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            Registrar lançamento
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
