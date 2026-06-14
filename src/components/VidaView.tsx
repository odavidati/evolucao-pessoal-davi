import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Heart, Smile, HelpCircle, Archive, Clipboard, Compass, Sparkles, CheckSquare, Power, Check, TrendingUp, Award, Activity, BookOpen, Mic, Headphones, Brain, BedDouble, Home, BarChart2 } from 'lucide-react';
import { FechamentoDia, VidaHabitos } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface VidaViewProps {
  fechamentoHoje: FechamentoDia;
  onUpdateFechamento: (field: keyof FechamentoDia, val: any) => void;
  habitos: VidaHabitos;
  onToggleHabito: (key: keyof VidaHabitos) => void;
  onDesconectarSave: () => void;
  dailyHabitosVida?: Record<string, VidaHabitos>;
}

export default function VidaView({
  fechamentoHoje,
  onUpdateFechamento,
  habitos,
  onToggleHabito,
  onDesconectarSave,
  dailyHabitosVida = {}
}: VidaViewProps) {
  const [completeMsg, setCompleteMsg] = useState(false);
  const [chartMode, setChartMode] = useState<'geral' | 'frequencia'>('geral');
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  const handleDesconectar = () => {
    onDesconectarSave();
    setCompleteMsg(true);
    setTimeout(() => {
      setCompleteMsg(false);
    }, 4500);
  };

  const habitLabels: { key: keyof VidaHabitos; label: string; desc: string; icon: React.ElementType }[] = [
    { key: 'leitura', label: 'Leitura', desc: 'Ler 5 páginas de um bom livro físico ou digital', icon: BookOpen },
    { key: 'vicente', label: 'Estar com o Vicente', desc: 'Conversar, rir ou assistir algo sem dividirmos atenção com o celular', icon: Heart },
    { key: 'espiritualidade', label: 'Espiritualidade', desc: 'Fazer uma oração, meditar ou sintonizar com o invisível', icon: Compass },
    { key: 'cantoKaraoke', label: 'Cantar / Karaokê', desc: 'Soltar a voz, brincar ou ouvir uma trilha favorita', icon: Mic },
    { key: 'podcast', label: 'Ouvir Podcast', desc: 'Escutar conteúdos enriquecedores correndo ou lavando louça', icon: Headphones },
    { key: 'terapiaReflexao', label: 'Terapia / Reflexões', desc: 'Conversar ou ler anotações pessoais do terapeuta', icon: Brain },
    { key: 'descanso', label: 'Descanso Consciente', desc: 'Deitar sem telas antes do sono definitivo', icon: BedDouble },
    { key: 'casaMinima', label: 'Casa Mínima', desc: 'Deixar a pia e a sala minimamente organizadas para amanhã', icon: Home },
  ];

  // Generate trailing 7 days
  const trailingDays = (() => {
    const arr = [];
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = daysOfWeek[d.getDay()];
      arr.push({
        dateStr,
        dayName,
        label: `${dayName} (${dd}/${mm})`,
        shortLabel: dayName,
        dateLabel: `${dd}/${mm}`
      });
    }
    return arr;
  })();

  const dHabitos = dailyHabitosVida || {};

  // Compute daily stats
  const chartData = trailingDays.map(day => {
    const record = dHabitos[day.dateStr] || {};
    const completedCount = habitLabels.filter(h => record[h.key] === true).length;
    const rate = Math.round((completedCount / 8) * 100);
    return {
      name: day.dayName,
      fullDate: day.label,
      "Concluídos": completedCount,
      "Aproveitamento": rate,
    };
  });

  // Compute habit stats across the week for the second chart
  const habitStats = habitLabels.map(h => {
    let completedDays = 0;
    trailingDays.forEach(day => {
      const record = dHabitos[day.dateStr] || {};
      if (record[h.key] === true) {
        completedDays += 1;
      }
    });
    return {
      "hábito": h.label,
      "Dias Concluídos": completedDays,
      "Frequência %": Math.round((completedDays / 7) * 100)
    };
  });

  // General metrics
  const totalChecks = habitStats.reduce((acc, h) => acc + h["Dias Concluídos"], 0);
  const avgRate = Math.round(chartData.reduce((acc, d) => acc + d.Aproveitamento, 0) / 7);
  const bestDayIndex = chartData.reduce((bestIdx, current, idx, arr) => 
    current.Aproveitamento > arr[bestIdx].Aproveitamento ? idx : bestIdx, 0);
  const bestDay = chartData[bestDayIndex];

  // Daily target metrics for Donut chart
  const completedTodayCount = habitLabels.filter(item => habitos[item.key] === true).length;
  const totalHabitCount = habitLabels.length;
  const pendingTodayCount = totalHabitCount - completedTodayCount;
  const percentageToday = totalHabitCount > 0 ? Math.round((completedTodayCount / totalHabitCount) * 100) : 0;

  // Celebration monitoring hook
  React.useEffect(() => {
    if (completedTodayCount === totalHabitCount && totalHabitCount > 0) {
      if (!hasCelebrated) {
        setTriggerConfetti(true);
        setHasCelebrated(true);
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([10 * 10]); // Gentle dual pulse
          setTimeout(() => navigator.vibrate([15 * 10]), 150);
        }
        // Let the confetti cycle for 7 seconds
        const timer = setTimeout(() => {
          setTriggerConfetti(false);
        }, 7000);
        return () => clearTimeout(timer);
      }
    } else {
      // If any habit is unchecked, reset celebration so they can celebrate again when checking it back
      setHasCelebrated(false);
    }
  }, [completedTodayCount, totalHabitCount]);

  // Dynamically generate premium lightweight confetti specs for perfect visual reward
  const confettiColors = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6', '#FBBF24'];
  const confettiPieces = Array.from({ length: 80 }).map((_, i) => {
    const left = (i * 12.5) % 100; // Even distribution across the window width
    const size = 6 + (i % 3) * 5;  // Multi-sized shapes
    const delay = (i % 12) * 0.12; // Beautiful staggered entrance
    const duration = 3.0 + (i % 4) * 0.7; // Realistic gravity speeds
    const color = confettiColors[i % confettiColors.length];
    const rotate = (i * 45) % 360;
    // Elegant left/right wiggle paths
    const path = i % 2 === 0 ? [0, 40, -40, 10] : [0, -30, 30, -10];
    return { id: i, left, size, delay, duration, color, rotate, path };
  });

  const donutData = [
    { name: 'Concluído', value: completedTodayCount, color: '#d97706' }, // Amber-600
    { name: 'Pendente', value: pendingTodayCount, color: 'rgba(255, 255, 255, 0.08)' }
  ];

  return (
    <div className="space-y-6 pb-28 text-text-main font-sans min-h-screen pt-4">

      {/* Modern High-Fidelity Confetti Celebration Shower */}
      <AnimatePresence>
        {triggerConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]" style={{ width: '100vw', height: '100vh' }}>
            {confettiPieces.map(p => (
              <motion.div
                key={p.id}
                initial={{ y: -50, x: `${p.left}vw`, rotate: p.rotate, opacity: 1 }}
                animate={{ 
                  y: '105vh', 
                  rotate: p.rotate + 360,
                  x: p.path.map(val => `calc(${p.left}vw + ${val}px)`),
                  opacity: [1, 1, 0.8, 0]
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${p.size}px`,
                  height: `${p.size * 1.6}px`,
                  backgroundColor: p.color,
                  borderRadius: p.id % 3 === 0 ? '50%' : '3px',
                  opacity: 0.9,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Moon thematic heading */}
      <section className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-700/10 text-brand-amber rounded-full">
          <Moon className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-2xl font-display font-black text-text-main">
          Fechamento do Dia
        </h2>
        <p className="text-sm text-text-sec">
          Reflita com calma, acolha seu cansaço e prepare-se para descansar sem carregar o dia na cabeça.
        </p>
      </section>

      {/* Habits 100% Completed Congratulations Banner */}
      {completedTodayCount === totalHabitCount && totalHabitCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-500/30 rounded-3xl text-center space-y-2.5 shadow-sm max-w-lg mx-auto relative overflow-hidden backdrop-blur-sm group"
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/15 to-emerald-500/15 opacity-40 animate-pulse pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-center gap-2">
            <Award className="w-6 h-6 text-brand-amber animate-bounce" />
            <h3 className="text-sm font-display font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
              <span>Dia Lendário Concluído!</span>
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            </h3>
            <Award className="w-6 h-6 text-emerald-600 animate-bounce" />
          </div>
          
          <p className="text-base font-display font-extrabold text-text-main leading-snug">
            Parabéns, Davi! Todos os {totalHabitCount} Hábitos de hoje foram marcados.
          </p>
          <p className="text-[11px] text-text-sec font-bold italic">
            "A constância e o descanso consciente são os pilares da sua evolução."
          </p>
        </motion.div>
      )}

      {completeMsg && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-amber-700 text-amber-50 rounded-3xl text-center space-y-3 shadow-lg max-w-sm mx-auto"
        >
          <Sparkles className="w-8 h-8 text-amber-300 mx-auto animate-spin" />
          <p className="text-lg font-display font-extrabold">O dia terminou, Davi.</p>
          <p className="text-sm font-medium leading-relaxed opacity-90 p-1">
            “O dia terminou. O que ficou para amanhã não precisa ir para a cama contigo na sua cabeça. Durma em paz.”
          </p>
        </motion.div>
      )}

      {/* Structured Fechamento Dia forms cards */}
      <div className="space-y-4">
        {/* Q1: O que fiz */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Smile className="w-5 h-5 text-brand-amber" />
            <label className="block text-sm font-bold text-text-main uppercase tracking-wide">
              O que eu fiz de verdade hoje?
            </label>
          </div>
          <textarea
            rows={2}
            value={fechamentoHoje.oQueFiz}
            onChange={e => onUpdateFechamento('oQueFiz', e.target.value)}
            placeholder="Ex: Dei ótimas aulas, fui na musculação e ouvi podcast de marketing..."
            className="w-full text-sm p-3 bg-white/20 border border-white/35 rounded-2xl focus:outline-none focus:border-brand-amber text-text-main placeholder-gray-500 font-bold"
          />
        </div>

        {/* Q2: Onde me perdi */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            <label className="block text-sm font-bold text-text-main uppercase tracking-wide">
              Onde eu me perdi no tempo ou energia?
            </label>
          </div>
          <textarea
            rows={2}
            value={fechamentoHoje.ondePerdi}
            onChange={e => onUpdateFechamento('ondePerdi', e.target.value)}
            placeholder="Ex: Comecei três coisas ao mesmo tempo após o colégio..."
            className="w-full text-sm p-3 bg-white/20 border border-white/35 rounded-2xl focus:outline-none focus:border-brand-amber text-text-main placeholder-gray-500 font-bold"
          />
        </div>

        {/* Q3: Soltar */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-brand-amber" />
            <label className="block text-sm font-bold text-text-main uppercase tracking-wide">
              O que o Davi precisa soltar agora?
            </label>
          </div>
          <textarea
            rows={2}
            value={fechamentoHoje.precisarSoltar}
            onChange={e => onUpdateFechamento('precisarSoltar', e.target.value)}
            placeholder="Ex: A culpa de não ter fechado com o terceiro cliente no marketing..."
            className="w-full text-sm p-3 bg-white/20 border border-white/35 rounded-2xl focus:outline-none focus:border-brand-amber text-text-main placeholder-gray-500 font-bold"
          />
        </div>

        {/* Binary Toggles for presences */}
        <div className="glass-panel rounded-[32px] p-5 space-y-3">
          <span className="block text-xs font-bold text-text-sec uppercase tracking-wider px-1">Presenças Conscientes</span>
          
          <div className="flex items-center justify-between p-2 hover:bg-white/20 rounded-xl">
            <span className="text-sm font-semibold text-text-main">Tive presença real comigo?</span>
            <input
              type="checkbox"
              checked={fechamentoHoje.presencaComigo}
              onChange={e => onUpdateFechamento('presencaComigo', e.target.checked)}
              className="w-10 h-5 bg-gray-200 rounded-full checked:bg-brand-amber cursor-pointer"
              style={{ appearance: 'checkbox' }}
            />
          </div>

          <div className="flex items-center justify-between p-2 hover:bg-white/20 rounded-xl">
            <span className="text-sm font-semibold text-text-main">Pude dar presença consciente com Vicente?</span>
            <input
              type="checkbox"
              checked={fechamentoHoje.presencaVicente}
              onChange={e => onUpdateFechamento('presencaVicente', e.target.checked)}
              className="w-10 h-5 bg-gray-200 rounded-full checked:bg-brand-amber cursor-pointer"
              style={{ appearance: 'checkbox' }}
            />
          </div>
        </div>

        {/* Q4: Fica amanhã */}
        <div className="glass-panel rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Clipboard className="w-5 h-5 text-gray-500" />
            <label className="block text-sm font-bold text-text-main uppercase tracking-wide">
              O que fica para amanhã sem culpa alguma?
            </label>
          </div>
          <textarea
            rows={2}
            value={fechamentoHoje.ficaAmanha}
            onChange={e => onUpdateFechamento('ficaAmanha', e.target.value)}
            placeholder="Ex: Resolver o roteador do colégio e enviar contrato..."
            className="w-full text-sm p-3 bg-white/20 border border-white/35 rounded-2xl focus:outline-none focus:border-brand-amber text-text-main placeholder-gray-500 font-bold"
          />
        </div>
      </div>

      {/* NOVO PAINEL DE DATA VISUALIZATION (RECHARTS) - Evolução dos Hábitos na Semana */}
      <section className="glass-panel rounded-[32px] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/20 pb-3">
          <div>
            <h3 className="text-base font-display font-black text-text-main flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-amber animate-pulse" />
              <span>Evolução dos Hábitos</span>
            </h3>
            <p className="text-[11px] text-text-sec">Acompanhe seu progresso real com dados sincronizados</p>
          </div>

          {/* Segmented Controller Tab */}
          <div className="flex bg-slate-950/5 p-0.5 rounded-xl border border-white/20 text-xs self-stretch sm:self-auto justify-center select-none">
            <button
              onClick={() => setChartMode('geral')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all duration-200 ${
                chartMode === 'geral'
                  ? 'bg-white text-text-main shadow-sm'
                  : 'text-text-sec hover:text-text-main'
              }`}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />Aproveit. Semanal
            </button>
            <button
              onClick={() => setChartMode('frequencia')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all duration-200 ${
                chartMode === 'frequencia'
                  ? 'bg-white text-text-main shadow-sm'
                  : 'text-text-sec hover:text-text-main'
              }`}
            >
              <BarChart2 className="w-3 h-3 inline mr-1" />Por Hábito
            </button>
          </div>
        </div>

        {/* Small Metrics Bento Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/40 border border-white/20 rounded-2xl p-2.5">
            <span className="block text-[9px] font-bold text-text-sec uppercase tracking-wider">Média Semanal</span>
            <span className="text-lg font-display font-black text-brand-amber mt-0.5 block">{avgRate}%</span>
          </div>
          <div className="bg-white/40 border border-white/25 rounded-2xl p-2.5">
            <span className="block text-[9px] font-bold text-text-sec uppercase tracking-wider">Total Checks</span>
            <span className="text-lg font-display font-black text-slate-800 mt-0.5 block">{totalChecks}</span>
          </div>
          <div className="bg-white/40 border border-white/25 rounded-2xl p-2.5">
            <span className="block text-[9px] font-bold text-text-sec uppercase tracking-wider">Melhor Dia</span>
            <span className="text-[10px] font-display font-extrabold text-emerald-600 mt-1 block truncate" title={bestDay?.fullDate}>
              {bestDay?.name} ({bestDay?.Aproveitamento}%)
            </span>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-48 bg-white/45 border border-white/20 rounded-2xl p-2.5 flex items-center justify-center relative overflow-hidden">
          {chartMode === 'geral' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#b45309" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#b45309" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={9} 
                  fontWeight="bold"
                  domain={[0, 100]} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ color: '#b45309' }}
                  formatter={(value: any) => [`${value}% de aproveitamento`]}
                  labelFormatter={(label, items) => {
                    const item = items[0]?.payload;
                    return item ? `${item.fullDate}` : `${label}`;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Aproveitamento" 
                  stroke="#b45309" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRate)" 
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitStats} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15, 23, 42, 0.05)" vertical={false} />
                <XAxis 
                  dataKey="hábito" 
                  stroke="#64748b" 
                  fontSize={8} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => val.slice(0, 6)}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={9} 
                  fontWeight="bold"
                  domain={[0, 7]} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `${v}d`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(0,0,0,0.06)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    fontFamily: 'Inter, sans-serif'
                  }}
                  itemStyle={{ color: '#c2410c' }}
                  formatter={(value: any, name: any, props: any) => {
                    const payload = props.payload;
                    return [`${value} dias de 7 (${payload["Frequência %"]}%)`];
                  }}
                />
                <Bar 
                  dataKey="Dias Concluídos" 
                  fill="#c2410c" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Vida que nao pode sumir tracker card (brown visual/dark layout) */}
      <section className="glass-panel-dark text-[#F3EFE9] rounded-[32px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-1.5">
              <span>Vida que não pode sumir</span>
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </h3>
            <p className="text-xs text-amber-200/70">Atividades essenciais de autorrealização pessoal.</p>
          </div>
          <div className="bg-amber-500/20 text-brand-amber font-mono text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-500/30 self-start sm:self-auto uppercase tracking-wider">
            {completedTodayCount} de {totalHabitCount} Hábitos ({percentageToday}%)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Side: Modern Donut Chart with live indicator in center */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-[#241c14]/50 border border-white/5 rounded-2xl p-4 relative h-48 overflow-hidden">
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={600}
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Absolute positioning inside the donut hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-display font-black text-white animate-fade-in">
                {percentageToday}%
              </span>
              <span className="text-[9px] text-amber-200/60 font-black uppercase tracking-widest mt-0.5">
                Concluído
              </span>
            </div>
          </div>

          {/* Right Side: Interactive checklist of critical habits */}
          <div className="md:col-span-7 space-y-3 max-h-72 overflow-y-auto no-scrollbar pt-1 pr-1">
            {habitLabels.map(item => {
              const isDone = habitos[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => onToggleHabito(item.key)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left active:scale-[0.99] transition-all duration-200 ${
                    isDone 
                      ? 'bg-[#2E2419]/70 border-amber-500/20 text-amber-200' 
                      : 'bg-[#14100B]/40 border-transparent text-[#E3DEC6]/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-[#221B13] p-1.5 rounded-xl shrink-0 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isDone ? 'line-through text-amber-400/80' : 'text-white'}`}>
                        {item.label}
                      </h4>
                      <p className="text-[10px] opacity-60 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isDone ? 'bg-brand-amber border-brand-amber text-white ring-2 ring-amber-500/30' : 'border-gray-500'
                  }`}>
                    {isDone && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Big disconnect gateway button */}
      <section className="pt-2">
        <button
          onClick={handleDesconectar}
          className="w-full h-14 bg-brand-amber text-white rounded-full font-bold text-base hover:bg-opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Power className="w-5 h-5 text-amber-200" />
          Desconectar da rotina
        </button>
      </section>

    </div>
  );
}
