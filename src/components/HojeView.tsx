import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Sunrise, Coffee, Activity, ArrowRight, HelpCircle, Heart, CheckCircle2, Map, ShieldAlert, Sparkles, UserCheck, Wind, Smile, ThumbsUp, Zap, Brain, Lightbulb, Home, Users, Dumbbell } from 'lucide-react';
import { DailyCheckIn, EssentialItems } from '../types';
import { getActiveBlock, getNextBlock, DAY_BLOCKS } from '../data/initialData';

// Dynamic, daily-refreshing premium motivational & mindfulness tips
const TIPS = [
  "Tome 3 respirações profundas conscientes agora. Inspire clareza, expire as tensões acumuladas.",
  "As tarefas nunca vão terminar. O que você escolhe priorizar hoje para ganhar espaço de calma e presença?",
  "A mente ansiosa quer correr rápido demais. Dê um passo atrás: ande 10% mais devagar e sinta o peso dos seus pés.",
  "Conexão real: dê um abraço silencioso de 20 segundos em Vicente sem olhar o celular ou pensar em pendências.",
  "Uma pausa intencional de 2 minutos não é perda de tempo; é o seu escudo ativo contra o esgotamento silencioso.",
  "A consistência silenciosa gera mais impacto a longo prazo do que o caos produtivo de um único dia exaustivo.",
  "Pergunte-se antes de começar a próxima tarefa: 'Isso é realmente essencial para hoje ou posso adiar sem culpa?'",
  "Acolha suas imperfeições. Você está caminhando firme no seu próprio ritmo, construindo uma evolução linda.",
  "Faça sua próxima pausa ou refeição totalmente em silêncio e offline. Sinta o sabor real do alimento.",
  "Lembrete de presença: o único momento que você pode efetivamente agir, respirar e evoluir é o presente segundo."
];

interface HojeViewProps {
  checkIn: DailyCheckIn;
  onUpdateCheckIn: (category: keyof DailyCheckIn, val: number) => void;
  essentials: EssentialItems;
  onToggleEssential: (key: keyof EssentialItems) => void;
  onOpenEstouPerdido: () => void;
  domesticaAtual: string;
}

export default function HojeView({
  checkIn,
  onUpdateCheckIn,
  essentials,
  onToggleEssential,
  onOpenEstouPerdido,
  domesticaAtual
}: HojeViewProps) {
  const [timeStr, setTimeStr] = useState('08:00'); // Initial state for stability
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  // Mindfulness dynamic breathing tool state
  const [breathingState, setBreathingState] = useState<'idle' | 'inhale' | 'exhale' | 'success'>('idle');
  const [breathSeconds, setBreathSeconds] = useState(10);
  const [tipAbsorbed, setTipAbsorbed] = useState(false);

  // Generate date keys for today to lock persistence precisely
  const todayKey = new Date().toDateString();

  // Load absorbed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`dica_dia_absorbed_${todayKey}`);
      if (saved === 'true') {
        setTipAbsorbed(true);
      }
    } catch (e) {
      console.warn("Storage accessibility restricted", e);
    }
  }, [todayKey]);

  // Sync with actual client system clock dynamic
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${h}:${m}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 10000); // 10s is perfect balance
    return () => clearInterval(interval);
  }, []);

  // Breathing simulation countdown logic
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (breathingState === 'inhale' || breathingState === 'exhale') {
      timerId = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            if (breathingState === 'inhale') {
              setBreathingState('exhale');
              return 5; // 5s to exhale
            } else {
              setBreathingState('success');
              setTipAbsorbed(true);
              try {
                localStorage.setItem(`dica_dia_absorbed_${todayKey}`, 'true');
              } catch (e) {
                console.warn(e);
              }
              // Active micro-vibration check for reward completeness
              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                navigator.vibrate([60, 30, 60]);
              }
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [breathingState, todayKey]);

  const currentHour = parseInt(timeStr.split(':')[0]);
  
  // Decide Greeting 
  let greeting = "Bom dia";
  let GreetingIcon = Sunrise;
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Boa tarde";
    GreetingIcon = Coffee;
  } else if (currentHour >= 18 || currentHour < 5) {
    greeting = "Boa noite";
    GreetingIcon = Moon;
  }

  const activeBlock = getActiveBlock(timeStr);
  const nextBlock = getNextBlock(timeStr);

  // Suggest a tiny action next step based on the block
  let nextStepSuggestion = "Beba um copo cheio de água fresca do filtro.";
  if (activeBlock) {
    if (activeBlock.label.includes('Manhã')) {
      nextStepSuggestion = "Faça seu check-in de humor de 15 segundos abaixo.";
    } else if (activeBlock.label.includes('Colégio')) {
      nextStepSuggestion = "Guarde 5 minutos de intervalo para esticar os braços e respirar.";
    } else if (activeBlock.label.includes('Transição')) {
      nextStepSuggestion = "Tome um banho ou deite 10 minutos ouvindo uma boa música sem celular.";
    } else if (activeBlock.label.includes('Clientes')) {
      nextStepSuggestion = "Defina exatamente UMA entrega prioritária para esta 1h de foco.";
    } else if (activeBlock.label.includes('Corpo')) {
      nextStepSuggestion = "Troque de roupa e calce os tênis imediatamente.";
    } else if (activeBlock.label.includes('Vicente')) {
      nextStepSuggestion = "Dê um abraço apertado de 20 segundos em Vicente sem olhar o celular.";
    }
  }

  // Choose the daily tip dynamically
  const todayDateObj = new Date();
  const dayOfMonth = todayDateObj.getDate();
  const monthOfYr = todayDateObj.getMonth();
  const tipIndex = (dayOfMonth + monthOfYr * 31) % TIPS.length;
  const currentTipText = TIPS[tipIndex];

  const scoreColors = ['text-red-500', 'text-orange-500', 'text-amber-500', 'text-lime-600', 'text-emerald-600'];
  const scoreDots = ['bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-500', 'bg-emerald-500'];

  const checkInCategories: { key: keyof DailyCheckIn; label: string; icon: React.ElementType; colorClass: string }[] = [
    { key: 'energia', label: 'Energia', icon: Zap, colorClass: 'text-amber-500 bg-amber-500/10' },
    { key: 'mente', label: 'Mente', icon: Brain, colorClass: 'text-brand-blue bg-brand-blue/10' },
    { key: 'ansiedade', label: 'Calma', icon: Wind, colorClass: 'text-emerald-600 bg-emerald-500/10' },
    { key: 'sono', label: 'Sono', icon: Moon, colorClass: 'text-brand-purple bg-brand-purple/10' },
    { key: 'corpo', label: 'Corpo', icon: Activity, colorClass: 'text-pink-600 bg-pink-500/10' }
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Mini App Header Greeting */}
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-3xl glass-panel flex items-center justify-center text-brand-blue">
            <GreetingIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-display font-extrabold text-text-main">
              {greeting}, Davi
            </h2>
            <p className="text-xs text-text-sec flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Sua rotina hoje • {timeStr}
            </p>
          </div>
        </div>

        {/* SOS Panic Button */}
        <button
          onClick={onOpenEstouPerdido}
          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 px-3.5 py-2.5 rounded-2xl text-red-700 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
        >
          <ShieldAlert className="w-4 h-4 text-red-500 animate-bounce" />
          <span>Estou Perdido</span>
        </button>
      </section>

      {/* Intro comforting message card */}
      <div className="glass-panel-blue p-5 rounded-3xl text-sm leading-relaxed text-brand-blue space-y-1.5">
        <p className="font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5 opacity-90 text-brand-blue">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          Lembrete do Dia
        </p>
        <p className="font-semibold text-text-main text-[15px]">
          “Hoje tu não precisa resolver a vida inteira. Só precisa conduzir bem o próximo bloco.”
        </p>
      </div>

      {/* DICA DO DIA COMPONENT (Renewed daily, with breathing exercise action) */}
      <section className="glass-panel rounded-[32px] p-5 border border-amber-500/15 bg-gradient-to-tr from-amber-500/[0.03] to-white/50 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-brand-amber flex items-center justify-center">
              <Smile className="w-5 h-5 text-brand-amber" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-text-main font-sans">
                Dica de Presença
              </h3>
              <p className="text-[10px] text-text-sec font-semibold">Renovada a cada novo amanhecer</p>
            </div>
          </div>
          
          {tipAbsorbed ? (
            <span className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Sintonizado
            </span>
          ) : (
            <span className="bg-amber-500/10 text-amber-800 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-brand-amber animate-pulse" />
              Ativo Hoje
            </span>
          )}
        </div>

        {/* Tip body content card */}
        <div className="bg-slate-900/[0.02] border border-black/5 rounded-2xl p-4 relative overflow-hidden">
          <p className="text-sm font-bold text-text-main leading-relaxed relative z-10">
            "{currentTipText}"
          </p>
          <div className="absolute right-2 bottom-1 opacity-[0.04] pointer-events-none">
            <Heart className="w-20 h-20 text-brand-amber" fill="currentColor" stroke="none" />
          </div>
        </div>

        {/* Interactive micro mindfulness meditation */}
        <div className="pt-1.5">
          {breathingState === 'idle' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/40 border border-white p-3.5 rounded-2xl">
              <div>
                <h4 className="text-xs font-black text-text-main flex items-center gap-1">
                  <Wind className="w-4 h-4 text-brand-blue animate-pulse" />
                  Quer testar a dica agora?
                </h4>
                <p className="text-[10.5px] text-text-sec font-medium mt-0.5">Faça 10 segundos de treino de respiração rápida.</p>
              </div>
              <button
                onClick={() => {
                  setBreathingState('inhale');
                  setBreathSeconds(5);
                }}
                className="bg-brand-blue text-white hover:bg-brand-blue-hover active:scale-95 transition-all text-xs font-extrabold uppercase tracking-wider px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shrink-0 self-stretch sm:self-auto shadow-sm"
              >
                <span>Respirar 10s</span>
              </button>
            </div>
          )}

          {/* Active breathing loops */}
          {(breathingState === 'inhale' || breathingState === 'exhale') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-brand-blue/5 border border-brand-blue/15 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden"
            >
              {/* Expanding abstract aura pulse according to breath */}
              <div 
                className={`absolute w-32 h-32 rounded-full border border-brand-blue/10 bg-brand-blue/5 transition-transform duration-1000 ease-in-out ${
                  breathingState === 'inhale' ? 'scale-[2.4] opacity-35' : 'scale-[0.8] opacity-10'
                }`} 
              />

              <div className="relative z-10 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#414E69]">
                  {breathingState === 'inhale' ? 'EXERCÍCIO DE SINTONIA • INALE' : 'EXERCÍCIO DE SINTONIA • EXALE'}
                </p>
                <h4 className="text-lg font-black text-brand-blue">
                  {breathingState === 'inhale' ? 'Inspire profundamente...' : 'Solte o ar com calma...'}
                </h4>
              </div>

              {/* Countdown circle */}
              <div className="w-12 h-12 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm shadow-md animate-pulse relative z-10">
                {breathSeconds}s
              </div>
            </motion.div>
          )}

          {/* Success completed breathing feedback */}
          {breathingState === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200/60 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <ThumbsUp className="w-5 h-5 fill-white stroke-[2.5px]" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-emerald-800">Prontinho, sintonizado com o agora!</h4>
                <p className="text-xs text-emerald-600/90 font-medium mt-0.5">Sua mente agradece pela pausa consciente.</p>
              </div>
              <button
                onClick={() => setBreathingState('idle')}
                className="mt-1 text-[10px] bg-emerald-600/10 hover:bg-emerald-600/15 text-emerald-800 font-extrabold uppercase tracking-wide px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                Voltar
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Agora: Present Active block card with frosted panel primary */}
      <section className="glass-panel-primary rounded-[32px] p-6 space-y-4">
        <div>
          <span className="text-xs font-bold text-text-sec uppercase tracking-wider">No momento • Bloco Agora</span>
          <div className="flex items-center justify-between mt-2.5">
            <div>
              <h3 className="text-3xl font-display font-black text-text-main tracking-tight leading-none">
                {activeBlock ? activeBlock.label : "Intervalo livre"}
              </h3>
              <p className="text-sm font-semibold text-brand-blue mt-2 flex items-center gap-1">
                {activeBlock ? `${activeBlock.start} até ${activeBlock.end}` : "Sem horário rígido"}
              </p>
            </div>
            <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center shadow-inner">
              <Sun className="w-7 h-7" strokeWidth={1.5} />
            </div>
          </div>
          {activeBlock && (
            <p className="text-sm text-text-sec font-medium leading-relaxed mt-3.5 border-t border-white/20 pt-3 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
              {activeBlock.hint}
            </p>
          )}
        </div>

        {/* Suggestion next step card inside Agora with slight glass layer */}
        <div className="bg-white/30 border border-white/40 py-3.5 px-4 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
            <ArrowRight className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#5c6579] uppercase tracking-widest block font-sans">Próximo passinho</span>
            <span className="text-sm font-semibold text-text-main">{nextStepSuggestion}</span>
          </div>
        </div>

        {/* Ver mapa do dia collapsible button */}
        <button
          onClick={() => setShowFullTimeline(!showFullTimeline)}
          className="w-full py-2.5 border border-dashed border-gray-200 text-text-sec hover:text-text-main font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:bg-gray-50 rounded-xl"
        >
          <Map className="w-4 h-4 text-brand-blue" />
          <span>{showFullTimeline ? 'Fechar mapa do dia' : 'Ver mapa do dia completo'}</span>
        </button>

        {/* Collapsible fully detailed map of the day timeline */}
        <AnimatePresence>
          {showFullTimeline && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3 pt-2"
            >
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {DAY_BLOCKS.map((blk) => {
                  const isActive = activeBlock?.label === blk.label;
                  return (
                    <div 
                      key={blk.label} 
                      className={`flex items-start gap-4 p-3 rounded-2xl border transition-colors ${
                        isActive 
                          ? 'border-brand-blue/30 bg-brand-blue/5 shadow-sm' 
                          : 'border-transparent hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-brand-blue shrink-0 w-24">
                        {blk.start} - {blk.end}
                      </span>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className={`text-sm font-bold ${isActive ? 'text-brand-blue' : 'text-text-main'}`}>
                            {blk.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] bg-brand-blue text-white font-extrabold rounded-md px-1 py-0.5">AGORA</span>
                          )}
                        </div>
                        <p className="text-xs text-text-sec mt-0.5">{blk.hint}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Check-in rápido widget panel with glass look */}
      <section className="glass-panel rounded-[32px] p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-display font-extrabold text-text-main">
              Check-in Rápido
            </h3>
            <p className="text-xs text-text-sec">Apenas observe e sintonize com seu corpo.</p>
          </div>
          <UserCheck className="w-5 h-5 text-text-sec opacity-40" />
        </div>

        <div className="space-y-4 divide-y divide-gray-50">
          {checkInCategories.map(({ key, label, icon: IconComp, colorClass }) => {
            const currentScore = checkIn[key];
            return (
              <div key={key} className="pt-3.5 first:pt-0 space-y-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-text-main flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${colorClass}`}>
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    {label}
                  </span>
                  <span className="text-xs text-brand-blue bg-brand-blue/5 px-2.5 py-0.5 rounded-full font-bold">
                    {currentScore ? `${currentScore}/5` : '—'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 p-1 bg-white/30 rounded-2xl border border-white/45">
                  {[1, 2, 3, 4, 5].map((score) => {
                    const isSelected = currentScore === score;
                    return (
                      <button
                        key={score}
                        type="button"
                        onClick={() => onUpdateCheckIn(key, score)}
                        className={`h-11 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-brand-blue text-white shadow-sm scale-105'
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <span className={`text-sm font-black ${isSelected ? 'text-white' : scoreColors[score - 1]}`}>
                          {score}
                        </span>
                        <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/60' : scoreDots[score - 1]}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Essenciais do dia tracker */}
      <section className="glass-panel rounded-[32px] p-6 space-y-4">
        <div>
          <h3 className="text-lg font-display font-extrabold text-text-main">
            Os 3 Essenciais de Hoje
          </h3>
          <p className="text-xs text-text-sec">As únicas 3 coisas não-negociáveis para Davi viver bem.</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* E0: Corpo */}
          <button
            onClick={() => onToggleEssential('corpo')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left active:scale-[0.99] transition-all ${
              essentials.corpo 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' 
                : 'bg-white/40 border-white/55'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                essentials.corpo ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-blue/10 text-brand-blue'
              }`}>
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold text-base ${essentials.corpo ? 'line-through text-[#5c6579] opacity-60' : 'text-text-main'}`}>
                  Cuidar do Corpo
                </p>
                <p className="text-xs text-text-sec font-medium mt-0.5">Musculação, aula coletiva ou o plano mínimo.</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              essentials.corpo ? 'bg-brand-green border-brand-green text-white' : 'border-neutral-300'
            }`}>
              {essentials.corpo && <CheckCircle2 className="w-5 h-5 text-white" />}
            </div>
          </button>

          {/* E1: Casa Mínima */}
          <button
            onClick={() => onToggleEssential('casaMinima')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left active:scale-[0.99] transition-all ${
              essentials.casaMinima 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' 
                : 'bg-white/40 border-white/55'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                essentials.casaMinima ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-purple/10 text-brand-purple'
              }`}>
                <Home className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold text-base ${essentials.casaMinima ? 'line-through text-[#5c6579] opacity-60' : 'text-text-main'}`}>
                  Casa Mínima
                </p>
                <p className="text-xs text-text-sec font-medium mt-0.5">Ação rápida de 10 min: <span className="text-brand-purple font-semibold">{domesticaAtual}</span></p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              essentials.casaMinima ? 'bg-brand-green border-brand-green text-white' : 'border-neutral-300'
            }`}>
              {essentials.casaMinima && <CheckCircle2 className="w-5 h-5 text-white" />}
            </div>
          </button>

          {/* E2: Vicente */}
          <button
            onClick={() => onToggleEssential('presencaVicente')}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left active:scale-[0.99] transition-all ${
              essentials.presencaVicente 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900' 
                : 'bg-white/40 border-white/55'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                essentials.presencaVicente ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-500'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className={`font-semibold text-base ${essentials.presencaVicente ? 'line-through text-[#5c6579] opacity-60' : 'text-text-main'}`}>
                  Presença com Vicente
                </p>
                <p className="text-xs text-text-sec font-medium mt-0.5">Momento real, livre de estresse conjugal ou cansaço.</p>
              </div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              essentials.presencaVicente ? 'bg-brand-green border-brand-green text-white' : 'border-neutral-300'
            }`}>
              {essentials.presencaVicente && <CheckCircle2 className="w-5 h-5 text-white" />}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
