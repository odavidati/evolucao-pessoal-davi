import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hourglass, Trash2, Plus, AlertCircle, Briefcase, Check, RefreshCw, ArrowRightLeft, Calendar, Loader2, WifiOff, MapPin } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { FilaTask, EstacionamentoItem } from '../types';
import { GCalEvent, getEventTimes, isEventNow } from '../services/googleCalendar';
import { getActiveBlock, getNextBlock } from '../data/initialData';

interface RotinaViewProps {
  filaUnica: FilaTask[];
  onAddFilaTask: (title: string) => void;
  onToggleFilaTask: (id: string) => void;
  onClearFilaCompleted: () => void;
  
  estacionamento: EstacionamentoItem[];
  onAddEstacionamento: (text: string) => void;
  onRemoveEstacionamento: (id: string) => void;
  
  domesticaCompleted: boolean;
  domesticaAtual: string;
  onToggleDomestica: () => void;
  onRotateDomestica: () => void;
  
  onOpenModoAtraso: () => void;
  onOpenEstouPerdido: () => void;
  gCalToken: string | null;
  calendarEvents: GCalEvent[];
  calendarLoading: boolean;
  onGCalConnect: (token: string) => void;
  onGCalDisconnect: () => void;
}

export default function RotinaView({
  filaUnica,
  onAddFilaTask,
  onToggleFilaTask,
  onClearFilaCompleted,
  estacionamento,
  onAddEstacionamento,
  onRemoveEstacionamento,
  domesticaCompleted,
  domesticaAtual,
  onToggleDomestica,
  onRotateDomestica,
  onOpenModoAtraso,
  onOpenEstouPerdido,
  gCalToken,
  calendarEvents,
  calendarLoading,
  onGCalConnect,
  onGCalDisconnect,
}: RotinaViewProps) {
  const [currentTime, setCurrentTime] = useState('08:00');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newParkedText, setNewParkedText] = useState('');
  
  const parkInputRef = useRef<HTMLInputElement>(null);

  const googleLogin = useGoogleLogin({
    onSuccess: (res) => onGCalConnect(res.access_token),
    onError: () => {},
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  // Sync clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now);
    };
    const setTime = (d: Date) => {
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  const activeBlock = getActiveBlock(currentTime);
  const nextBlock = getNextBlock(currentTime);

  const blockProgress = useMemo(() => {
    if (!activeBlock) return 0;
    const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const start = toMin(activeBlock.start);
    const end = toMin(activeBlock.end);
    const now = toMin(currentTime);
    if (now <= start) return 0;
    if (now >= end) return 100;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [activeBlock, currentTime]);

  const handleCreateFilaTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddFilaTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const handleCreateParked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParkedText.trim()) return;
    onAddEstacionamento(newParkedText.trim());
    setNewParkedText('');
  };

  const handleFocusPark = () => {
    if (parkInputRef.current) {
      parkInputRef.current.focus();
      parkInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="space-y-6 pb-28 text-text-main font-sans">
      
      {/* Block info card from mockup */}
      <section className="glass-panel rounded-[32px] p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-text-sec uppercase tracking-widest block">Bloco Atual</span>
            <h2 className="text-3xl font-display font-black text-text-main mt-1">
              {activeBlock ? activeBlock.label : "Momento Livre / Pausa"}
            </h2>
          </div>
          <div className="w-12 h-12 rounded-3xl bg-brand-blue/15 flex items-center justify-center text-brand-blue shadow-inner">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-text-sec font-semibold leading-relaxed">
          Uma coisa por bloco. Se surgir outra tarefa, estacione ao lado para depois.
        </p>
        
        {/* Progress display */}
        <div className="space-y-2 border-t border-white/25 pt-4">
          <div className="flex justify-between text-xs font-bold text-text-sec uppercase tracking-wider">
            <span>Progresso do Bloco</span>
            <span>{activeBlock ? "Falta pouco" : "Livre"}</span>
          </div>
          <div className="h-3 w-full bg-brand-blue/15 rounded-full overflow-hidden">
            <div className="h-full bg-brand-blue rounded-full shadow-md transition-all duration-1000" style={{ width: `${blockProgress}%` }} />
          </div>
        </div>
      </section>

      {/* Next transition block card */}
      {nextBlock && (
        <section className="glass-panel-blue rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/60 border border-white/50 flex items-center justify-center text-brand-blue shadow-sm shrink-0">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-blue uppercase tracking-wider block">Próxima transição</span>
            <p className="text-xs text-text-main font-semibold mt-0.5">
              {nextBlock.hint}
            </p>
          </div>
        </section>
      )}

      {/* Google Calendar Integration */}
      <section className="space-y-3">
        {!gCalToken ? (
          <div className="glass-panel rounded-3xl p-5 border border-dashed border-brand-blue/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-brand-blue" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-text-main">Google Calendar</p>
                <p className="text-xs text-text-sec">Ver escola e MEI aqui</p>
              </div>
            </div>
            <button
              onClick={() => googleLogin()}
              className="shrink-0 h-10 px-4 bg-brand-blue text-white rounded-2xl font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              Conectar
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-blue" />
                <h3 className="text-sm font-bold text-text-main">Hoje no Google</h3>
                {calendarLoading && <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />}
              </div>
              <button
                onClick={onGCalDisconnect}
                className="text-[10px] text-text-sec hover:text-text-main font-bold uppercase tracking-wider"
              >
                Desconectar
              </button>
            </div>

            {calendarEvents.length === 0 && !calendarLoading ? (
              <div className="glass-panel rounded-2xl p-4 text-center">
                <p className="text-xs text-text-sec font-medium">Nenhum evento hoje no Google Calendar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {calendarEvents
                  .filter(e => !!e.start.dateTime)
                  .map(event => {
                    const { start, end } = getEventTimes(event);
                    const now = isEventNow(event);
                    return (
                      <div
                        key={event.id}
                        className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                          now
                            ? 'glass-panel-primary border-brand-blue/30 shadow-sm'
                            : 'bg-white/30 border-white/40'
                        }`}
                      >
                        <div className="shrink-0 text-right w-14">
                          <span className={`text-xs font-extrabold block ${now ? 'text-brand-blue' : 'text-text-sec'}`}>{start}</span>
                          <span className="text-[10px] text-text-sec">{end}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm leading-tight truncate ${now ? 'text-text-main' : 'text-text-main'}`}>
                            {event.summary}
                          </p>
                          {event.location && (
                            <p className="text-[10px] text-text-sec mt-0.5 flex items-center gap-1 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {event.location}
                            </p>
                          )}
                        </div>
                        {now && (
                          <span className="text-[9px] bg-brand-blue text-white font-extrabold px-1.5 py-0.5 rounded shrink-0 uppercase">
                            Agora
                          </span>
                        )}
                      </div>
                    );
                  })
                }
                {calendarEvents.some(e => !e.start.dateTime) && (
                  <div className="space-y-1.5">
                    {calendarEvents
                      .filter(e => !e.start.dateTime)
                      .map(event => (
                        <div key={event.id} className="flex items-center gap-2 px-2 py-1.5 bg-white/20 rounded-xl border border-white/30">
                          <span className="text-[10px] text-brand-blue font-bold uppercase tracking-wider w-14 shrink-0">Dia todo</span>
                          <span className="text-xs font-semibold text-text-main truncate">{event.summary}</span>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Fila Única Block */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <div>
            <h3 className="text-lg font-display font-bold text-text-main">
              Fila Única
            </h3>
            <p className="text-xs text-text-sec">Apenas a primeira tarefa é o seu foco imediato ativo.</p>
          </div>
          {filaUnica.some(t => t.completed) && (
            <button
              onClick={onClearFilaCompleted}
              className="text-xs text-brand-blue hover:underline font-bold"
            >
              Limpar feitas
            </button>
          )}
        </div>

        {/* Fila Única List Container */}
        <div className="space-y-2.5">
          {filaUnica.map((task, idx) => {
            const isFirstActive = idx === 0 && !task.completed;
            return (
              <div
                key={task.id}
                className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all ${
                  isFirstActive
                    ? 'glass-panel-primary ring-2 ring-brand-blue/10'
                    : 'bg-white/20 border-white/20 shadow-none opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 select-none">
                  <button
                    type="button"
                    onClick={() => onToggleFilaTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      task.completed
                        ? 'bg-brand-green border-brand-green text-white'
                        : 'border-gray-300 hover:border-brand-blue'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                  </button>
                  <span className={`text-base font-semibold ${task.completed ? 'line-through text-text-sec' : 'text-text-main'}`}>
                    {task.title}
                  </span>
                </div>
                
                {isFirstActive && (
                  <span className="text-[10px] bg-brand-blue/10 text-brand-blue font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                    Foco
                  </span>
                )}
              </div>
            );
          })}

          {/* Quick inline task generator */}
          <form onSubmit={handleCreateFilaTask} className="flex gap-2 bg-white/30 p-2 rounded-2xl border border-white/45">
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Adicionar nova missão única..."
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold pl-2 placeholder-gray-500"
            />
            <button
              type="submit"
              className="w-10 h-10 bg-brand-blue text-white rounded-xl flex items-center justify-center active:scale-95 transition-transform shrink-0 shadow-sm"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>

      {/* Estacionamento mental Quick dumping area */}
      <section className="glass-panel rounded-[32px] p-6 border-dashed border-gray-300 space-y-4">
        <div className="flex items-center gap-2 text-text-main">
          <Hourglass className="w-5 h-5 text-brand-purple" />
          <h3 className="text-lg font-display font-extrabold justify-between">
            Estacionamento Mental
          </h3>
        </div>
        <p className="text-xs text-[#5c6579] font-medium">
          Se surgir um pensamento, faça o descarregamento rápido aqui. Não execute nem guarde na memória agora.
        </p>

        {/* Display parked items */}
        {estacionamento.length > 0 && (
          <div className="space-y-2 border-b border-white/25 pb-4 max-h-48 overflow-y-auto no-scrollbar">
            {estacionamento.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white/30 rounded-xl border border-white/40">
                <span className="text-sm font-semibold text-text-main">{item.text}</span>
                <button
                  onClick={() => onRemoveEstacionamento(item.id)}
                  className="w-8 h-8 rounded-full text-red-500 hover:bg-white/50 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rapid dump input form */}
        <form onSubmit={handleCreateParked} className="flex gap-2">
          <input
            ref={parkInputRef}
            type="text"
            value={newParkedText}
            onChange={e => setNewParkedText(e.target.value)}
            placeholder="Estacionar pensamento/tarefa..."
            className="flex-1 h-12 bg-white/30 border border-white/40 rounded-xl px-4 text-sm font-bold placeholder-gray-500 focus:outline-none focus:bg-white/50 focus:ring-1 focus:ring-brand-blue"
          />
          <button
            type="submit"
            className="w-12 h-12 bg-white/45 border border-white/50 text-brand-purple rounded-xl flex items-center justify-center active:scale-95 transition-transform shrink-0 shadow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </section>

      {/* Domestica quick action green block */}
      <section className="glass-panel-green rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-white/70 border border-white/80 rounded-full flex items-center justify-center text-brand-green font-extrabold shrink-0 shadow-sm text-lg">
            10
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider block">Ação Doméstica de 10 min</span>
            <span className={`text-base font-bold ${domesticaCompleted ? 'line-through text-text-sec opacity-60' : 'text-emerald-900 font-extrabold'}`}>
              {domesticaAtual}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRotateDomestica}
            type="button"
            className="w-8 h-8 rounded-full bg-white/60 text-gray-700 flex items-center justify-center shadow-sm active:scale-95 hover:text-text-main"
            title="Alternar tarefa"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={onToggleDomestica}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-sm ${
              domesticaCompleted ? 'bg-brand-green text-white' : 'bg-white/60 text-brand-green'
            }`}
          >
            <Check className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </section>

      {/* Custom Bottom Actions */}
      <section className="flex flex-col gap-3 pt-2">
        <button
          onClick={handleFocusPark}
          className="w-full h-14 bg-brand-blue text-white rounded-full font-bold text-base hover:bg-opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          Descarregar cabeça
        </button>
        <button
          onClick={onOpenModoAtraso}
          className="w-full h-14 bg-amber-500/15 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 rounded-full font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
        >
          <AlertCircle className="w-4 h-4 text-amber-500" />
          Ativar Modo Atraso
        </button>
      </section>

    </div>
  );
}
