import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, ShieldCheck, Hourglass, PlusCircle, ShoppingBag, PiggyBank, History, Eye, ArrowRight, ArrowDownRight, Edit3, Check } from 'lucide-react';
import { AppState, CompraEspera, LancamentoRapido } from '../types';

interface DinheiroViewProps {
  disponivelSeguro: number;
  dinheiroProtegido: number;
  comprasEspera: CompraEspera[];
  lancamentos: LancamentoRapido[];
  onSetDisponivelSeguro: (amount: number) => void;
  onOpenQueroComprar: () => void;
  onOpenLancamentoRapido: () => void;
  onResolveCompraEspera: (id: string, action: 'comprado' | 'desistido') => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function DinheiroView({
  disponivelSeguro,
  dinheiroProtegido,
  comprasEspera,
  lancamentos,
  onSetDisponivelSeguro,
  onOpenQueroComprar,
  onOpenLancamentoRapido,
  onResolveCompraEspera,
  showToast
}: DinheiroViewProps) {
  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(String(disponivelSeguro));

  const handleUpdateBalance = () => {
    const val = parseFloat(tempBalance) || 0;
    onSetDisponivelSeguro(val);
    setIsEditingBalance(false);
  };

  // Safe money traffic light colors
  let trafficColor = 'glass-panel-green text-emerald-900';
  let trafficLabel = 'Verde • Orçamento Saudável';
  let trafficDesc = 'Disponível seguro confortável. Siga mantendo compras planejadas.';
  if (disponivelSeguro <= 200) {
    trafficColor = 'bg-red-500/15 text-red-900 border border-red-500/25';
    trafficLabel = 'Atenção Suave • Alerta';
    trafficDesc = 'Orçamento quase esgotado. Evite novos gastos impulsivos hoje.';
  } else if (disponivelSeguro <= 800) {
    trafficColor = 'bg-amber-500/15 text-amber-900 border border-amber-500/25';
    trafficLabel = 'Amarelo • Moderado';
    trafficDesc = 'Atenção leve ao saldo restante. Resguarde antes de gastar.';
  }

  // Calculate remaining hours for wait list items
  const getRemainingHoursStr = (item: CompraEspera) => {
    const addedTime = new Date(item.timestamp).getTime();
    const nowTime = new Date().getTime();
    const elapsedMs = nowTime - addedTime;
    const dayMs = 24 * 60 * 60 * 1000;
    
    if (elapsedMs >= dayMs) {
      return "✓ Pronto para decidir!";
    } else {
      const remainingMs = dayMs - elapsedMs;
      const h = Math.ceil(remainingMs / (60 * 60 * 1000));
      return `Falta ${h}h de reflexão`;
    }
  };

  const isReadyToDecide = (item: CompraEspera) => {
    const addedTime = new Date(item.timestamp).getTime();
    const nowTime = new Date().getTime();
    return (nowTime - addedTime) >= 24 * 60 * 60 * 1000;
  };

  return (
    <div className="space-y-6 pb-28 text-text-main font-sans">
      {/* Header */}
      <section className="space-y-1">
        <h2 className="text-2xl font-display font-extrabold text-text-main flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-brand-blue" />
          Finanças sem Neblina
        </h2>
        <p className="text-xs text-text-sec italic font-semibold">
          “Calma. Uma decisão financeira por vez.”
        </p>
      </section>

      {/* Main card: Available positive secure cash */}
      <section className="glass-panel rounded-[32px] p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-text-sec uppercase tracking-widest block">Disponível Seguro</span>
            {isEditingBalance ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xl font-bold text-text-sec">R$</span>
                <input
                  type="number"
                  value={tempBalance}
                  onChange={e => setTempBalance(e.target.value)}
                  className="w-32 h-10 px-3 bg-white/30 border border-white/40 rounded-xl font-bold text-lg text-text-main focus:outline-none focus:border-brand-blue"
                  autoFocus
                />
                <button
                  onClick={handleUpdateBalance}
                  className="w-8 h-8 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Check className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-1 mt-1">
                <h3 className="text-3xl font-display font-black text-text-main tracking-tight">
                  R$ {disponivelSeguro.toFixed(2)}
                </h3>
                <button
                  onClick={() => setIsEditingBalance(true)}
                  className="text-text-sec hover:text-text-main hover:bg-white/45 p-1 rounded-lg transition-colors ml-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>

        {/* Reactive low-stress semaphore layout */}
        <div className={`p-4 rounded-2xl border text-xs leading-normal font-medium ${trafficColor}`}>
          <p className="font-extrabold uppercase tracking-wider text-[10px] mb-0.5">{trafficLabel}</p>
          <p className="opacity-90">{trafficDesc}</p>
        </div>
      </section>

      {/* Motivation Shield: Dinheiro Protegido sum */}
      <section className="glass-panel-purple rounded-[32px] p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/60 border border-white/50 rounded-2xl flex items-center justify-center text-brand-purple shadow-sm shrink-0">
          <ShieldCheck className="w-6 h-6 text-brand-purple" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-brand-purple uppercase tracking-widest block">Total de impulsos evitados</span>
          <h4 className="text-2xl font-display font-black text-text-main mt-0.5">
            R$ {dinheiroProtegido.toFixed(2)}
          </h4>
          <span className="text-xs text-text-sec font-medium">Dinheiro protegido com sucesso!</span>
        </div>
      </section>

      {/* Floating Action Quick Triggers */}
      <section className="grid grid-cols-1 gap-2.5">
        <button
          onClick={onOpenQueroComprar}
          className="w-full h-14 bg-brand-purple text-white rounded-2xl font-bold text-sm tracking-wide shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          Análise de impulso: Quero Comprar
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenLancamentoRapido}
            className="h-12 bg-white/45 border border-white/50 text-text-main font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-brand-blue" />
            Lançar gasto/entrada
          </button>
          
          <button
            onClick={() => {
              const payment = prompt('O que você pagou? (Ex: Conta de Luz)');
              const amtStr = prompt('Qual o valor?');
              const amt = parseFloat(amtStr || '0') || 0;
              if (payment && amt > 0) {
                onResolveCompraEspera('custom', 'comprado'); // triggers update
                onSetDisponivelSeguro(disponivelSeguro - amt);
                if (showToast) {
                  showToast(`Pago: ${payment} de R$ ${amt.toFixed(2)} registrado!`, 'success');
                }
              }
            }}
            className="h-12 bg-white/45 border border-white/50 text-text-main font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-sm"
          >
            💳 Pagar Boleto
          </button>
        </div>
      </section>

      {/* Compras em espera section */}
      {comprasEspera.length > 0 && (
        <section className="glass-panel rounded-[32px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Hourglass className="w-5 h-5 text-brand-purple" />
            <h3 className="text-lg font-display font-extrabold">Compras em Espera</h3>
          </div>
          <p className="text-xs text-text-sec">Itens sob a regra de 24 horas. Decida com serenidade.</p>
 
          <div className="space-y-3 pt-1">
            {comprasEspera.map(item => {
              const ready = isReadyToDecide(item);
              return (
                <div key={item.id} className="p-4 bg-white/30 rounded-2xl border border-white/40 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base text-text-main">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-brand-purple bg-brand-purple/15 px-2 py-0.5 rounded">
                          R$ {item.cost.toFixed(2)}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {getRemainingHoursStr(item)}
                        </span>
                      </div>
                    </div>
                  </div>
 
                  {/* Actions for waiting list decision gates */}
                  <div className="grid grid-cols-2 gap-2 border-t border-white/20 pt-3">
                    <button
                      onClick={() => onResolveCompraEspera(item.id, 'comprado')}
                      className="h-10 bg-white/45 hover:bg-white/60 border border-white/50 text-text-main font-bold text-xs rounded-xl transition-all"
                    >
                      Ainda preciso/Quero
                    </button>
                    <button
                      onClick={() => onResolveCompraEspera(item.id, 'desistido')}
                      className="h-10 bg-brand-green text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                    >
                      Desistir • Proteger
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent launches history */}
      <section className="glass-panel rounded-[32px] p-6 space-y-4">
        <div className="flex items-center gap-2 text-text-main">
          <History className="w-5 h-5 text-brand-blue" />
          <h3 className="text-lg font-display font-extrabold">Últimos Lançamentos</h3>
        </div>
 
        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
          {lancamentos.length === 0 ? (
            <p className="text-xs text-text-sec text-center py-4">Nenhum lançamento gravado nos últimos dias.</p>
          ) : (
            lancamentos.slice(0, 8).map(lan => {
              const isGasto = lan.type === 'gasto' || lan.type === 'conta_paga';
              return (
                <div key={lan.id} className="flex justify-between items-center p-3.5 hover:bg-white/45 rounded-2xl border border-white/20 transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs ${
                      lan.type === 'entrada' 
                        ? 'bg-emerald-50 text-emerald-700 font-bold' 
                        : lan.type === 'conta_paga'
                          ? 'bg-slate-100 text-slate-700 font-bold'
                          : 'bg-red-50 text-red-700 font-bold'
                    }`}>
                      {lan.type === 'entrada' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-main leading-tight">{lan.text}</p>
                      <span className="text-[10px] text-text-sec font-mono uppercase">{lan.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  
                  {lan.amount && (
                    <span className={`text-sm font-bold shrink-0 ${lan.type === 'entrada' ? 'text-brand-green' : 'text-red-700'}`}>
                      {lan.type === 'entrada' ? '+' : '-'} R$ {lan.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

    </div>
  );
}
