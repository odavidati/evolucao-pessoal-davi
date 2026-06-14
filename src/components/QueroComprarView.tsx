import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Clock, Heart, DollarSign } from 'lucide-react';
import { CompraEspera } from '../types';

interface QueroComprarViewProps {
  onAddCompraEspera: (name: string, cost: number, category: 'necessidade' | 'desejo' | 'alivio', emotion: string, wait24h: boolean) => void;
  onAddDinheiroProtegido: (amount: number) => void;
  onBack: () => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function QueroComprarView({
  onAddCompraEspera,
  onAddDinheiroProtegido,
  onBack,
  showToast
}: QueroComprarViewProps) {
  const [name, setName] = useState('');
  const [costStr, setCostStr] = useState('');
  const [category, setCategory] = useState<'necessidade' | 'desejo' | 'alivio'>('desejo');
  const [emotion, setEmotion] = useState('tédio');
  const [wait24h, setWait24h] = useState(true);
  const [completedMessage, setCompletedMessage] = useState<string | null>(null);

  const cost = parseFloat(costStr) || 0;

  const emotionsList = [
    { label: 'Estresse', value: 'estresse' },
    { label: 'Ansiedade', value: 'ansiedade' },
    { label: 'Tédio', value: 'tédio' },
    { label: 'Recompensa', value: 'recompensa' },
    { label: 'Cansaço', value: 'cansaço' },
    { label: 'Comparação', value: 'comparação' }
  ];

  const handleEspera24h = () => {
    if (!name.trim()) {
      if (showToast) showToast('Insira o nome do item para iniciar reflexão.', 'warning');
      return;
    }
    onAddCompraEspera(name, cost, category, emotion, true);
    setCompletedMessage(`Excelente escolha! "${name}" foi colocado na fila de espera de 24 horas para clareza mental.`);
    setTimeout(() => {
      onBack();
    }, 2500);
  };

  const handleCompraPlanejada = () => {
    if (!name.trim()) {
      if (showToast) showToast('Insira o nome do item para salvar.', 'warning');
      return;
    }
    onAddCompraEspera(name, cost, category, emotion, false);
    setCompletedMessage(`Lançado como compra planejada. Cuidado racional com as contas!`);
    setTimeout(() => {
      onBack();
    }, 2500);
  };

  const handleNaoAgora = () => {
    if (!name.trim()) {
      onBack();
      return;
    }
    onAddDinheiroProtegido(cost);
    setCompletedMessage(`Incrível, Davi! Você acaba de proteger R$ ${cost.toFixed(2)} de impulsos. Dinheiro seguro somado!`);
    setTimeout(() => {
      onBack();
    }, 2800);
  };

  return (
    <div className="min-h-screen text-text-main flex flex-col p-6 font-sans relative">
      {/* Header */}
      <div className="flex items-center justify-between h-14 mb-4 select-none">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/45 text-text-sec active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <span className="font-display font-bold text-lg text-text-main">
          Quero comprar
        </span>
        <div className="w-10 h-10" />
      </div>

      <div className="flex-1 flex flex-col justify-start max-w-sm mx-auto w-full pb-36 pt-2">
        {/* Intro */}
        <section className="mb-6 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-blue/10 text-brand-blue">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-text-main leading-tight">
            Tu quer comprar isso ou quer aliviar uma sensação?
          </h2>
          <p className="text-sm text-text-sec">
            Pausa de 1 minuto para dar clareza financeira.
          </p>
        </section>

        {completedMessage ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 glass-panel-green rounded-3xl text-emerald-950 text-center font-bold space-y-2 mt-6 border border-emerald-500/20"
          >
            <p className="text-base text-brand-green font-black">✨ Mandou bem!</p>
            <p className="text-sm font-semibold">{completedMessage}</p>
          </motion.div>
        ) : (
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            {/* Card 1: What and expense */}
            <div className="glass-panel rounded-3xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-sec uppercase tracking-wider mb-1.5 font-sans">
                  O que tu quer comprar?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Tênis novo de corrida"
                  className="w-full h-12 px-4 rounded-xl border border-white/40 bg-white/20 text-text-main focus:outline-none focus:border-brand-blue text-base font-bold placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-sec uppercase tracking-wider mb-1.5 font-sans">
                  Quanto custa?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sec font-bold text-base">
                    R$
                  </span>
                  <input
                    type="number"
                    value={costStr}
                    onChange={e => setCostStr(e.target.value)}
                    placeholder="0,00"
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-white/40 bg-white/20 text-text-main focus:outline-none focus:border-brand-blue text-base font-bold placeholder-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Necessity, desire or relief */}
            <div className="glass-panel rounded-3xl p-5 space-y-3">
              <label className="block text-xs font-bold text-text-sec uppercase tracking-wider font-sans">
                É necessidade, desejo ou alívio emocional?
              </label>
              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                {(['necessidade', 'desejo', 'alivio'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2.5 rounded-full text-xs font-extrabold transition-all border ${
                      category === cat
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-white/35 border border-white/45 text-text-sec'
                    }`}
                  >
                    {cat === 'necessidade' && 'Necessidade'}
                    {cat === 'desejo' && 'Desejo'}
                    {cat === 'alivio' && 'Alívio Emocional'}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 3: Emotions associated */}
            <div className={`glass-panel rounded-3xl p-5 space-y-3 transition-opacity ${category === 'alivio' || category === 'desejo' ? 'opacity-100' : 'opacity-60'}`}>
              <label className="block text-xs font-bold text-text-sec uppercase tracking-wider font-sans">
                Qual emoção está ligada a esse impulso?
              </label>
              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                {emotionsList.map(emo => (
                  <button
                    key={emo.value}
                    type="button"
                    onClick={() => setEmotion(emo.value)}
                    className={`px-3 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                      emotion === emo.value
                        ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                        : 'bg-white/35 border border-white/45 text-text-sec'
                    }`}
                  >
                    {emo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4: Switcher for 24h wait */}
            <div className="glass-panel rounded-3xl p-5 flex items-center justify-between">
              <div>
                <label className="block text-sm font-black text-text-main">
                  Pode esperar 24 horas?
                </label>
                <p className="text-xs text-text-sec">
                  A regra de ouro contra o impulso financeiro.
                </p>
              </div>
              <input
                type="checkbox"
                checked={wait24h}
                onChange={e => setWait24h(e.target.checked)}
                className="w-11 h-6 rounded-full bg-gray-200 checked:bg-brand-blue checked:border-brand-blue transition-colors outline-none cursor-pointer"
                style={{ appearance: 'checkbox' }} // simplistic switcher
              />
            </div>
          </form>
        )}
      </div>

      {/* Sticky Bottom Actions */}
      {!completedMessage && (
        <div className="fixed bottom-0 left-0 w-full px-6 pt-4 pb-10 bg-white/20 backdrop-blur-xl border-t border-white/40 z-50 flex flex-col gap-2.5 max-w-sm mx-auto right-0 rounded-t-3xl shadow-lg">
          <button
            onClick={handleEspera24h}
            disabled={!name.trim()}
            className={`w-full h-14 rounded-full font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 ${
              name.trim() 
                ? 'bg-brand-blue text-white shadow-md' 
                : 'bg-white/10 text-gray-500 border border-transparent cursor-not-allowed opacity-50'
            }`}
          >
            <Clock className="w-5 h-5" />
            ESPERA 24H
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCompraPlanejada}
              disabled={!name.trim()}
              className={`h-12 rounded-full font-bold text-xs border transition-all ${
                name.trim()
                  ? 'bg-white/45 border-white/50 text-text-main active:scale-95 hover:bg-white/60'
                  : 'bg-white/10 border-transparent text-gray-500 opacity-50'
              }`}
            >
              COMPRA PLANEJADA
            </button>
            <button
              onClick={() => {
                if (name.trim()) {
                  if (showToast) showToast('Melhor outra prioridade! Item arquivado por enquanto.', 'info');
                  onBack();
                } else {
                  setName('Outra prioridade');
                }
              }}
              className="h-12 bg-white/45 border border-white/50 text-text-main rounded-full font-bold text-xs active:scale-95 transition-all hover:bg-white/60"
            >
              OUTRA PRIORIDADE
            </button>
          </div>

          <button
            onClick={handleNaoAgora}
            className="w-full py-3 text-text-sec hover:text-text-main font-bold text-xs uppercase tracking-wider text-center"
          >
            NÃO AGORA (Proteger Dinheiro)
          </button>
        </div>
      )}
    </div>
  );
}
