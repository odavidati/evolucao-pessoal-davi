import React, { useState, useEffect, useRef } from 'react';
import { 
  Dumbbell, Play, Pause, RotateCcw, Check, ChevronRight, Info, ChevronLeft, 
  Trash2, Download, Upload, Zap, Calendar, Heart, Award, ArrowRight, Activity, Clock
} from 'lucide-react';
import { BodyMetrics, AppState } from '../types';
import { EXERCISE_IMAGES, EXERCISE_PLACEHOLDERS } from '../data/exerciseImages';

interface CorpoViewProps {
  metrics: BodyMetrics;
  onUpdateMetrics: (peso: number, cintura: number, energia: number) => void;
  onPlanMinimoCompleted: () => void;
  exerciseLogs: Record<string, { completed: boolean; weight: string; notes: string }>;
  completedWorkouts: Record<string, { completed: boolean; type: string; name?: string }>;
  onUpdateExerciseLog: (exerciseId: string, log: { completed: boolean; weight: string; notes: string }) => void;
  onCompleteWorkout: (type: string, name?: string) => void;
  onClearWorkoutData: () => void;
  onImportState: (newState: AppState) => void;
  fullState: AppState;
}

// Custom technical SVG icons for each gym machine to look like high-fidelity architectural blue prints
function MachineSVG({ type }: { type: string }) {
  const getSVG = () => {
    switch (type) {
      case 'legpress':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Base platform */}
            <path d="M20 100 h120" strokeLinecap="round" stroke="#94A3B8" strokeWidth="4" />
            {/* Slide rails at 45 degree angle */}
            <path d="M35 95 L115 35" strokeDasharray="3,3" stroke="#64748B" />
            {/* The Sled plate carriage */}
            <g transform="translate(10, -10)">
              <rect x="55" y="45" width="45" height="15" rx="2" transform="rotate(-30 55 45)" fill="#3B82F6" stroke="#2563EB" />
              {/* Load pegs */}
              <line x1="75" y1="35" x2="65" y2="20" stroke="#EF4444" strokeWidth="4" />
              <line x1="85" y1="41" x2="95" y2="56" stroke="#EF4444" strokeWidth="4" />
            </g>
            {/* Heavy-duty inclined seat */}
            <rect x="25" y="65" width="25" height="25" rx="3" fill="#0F172A" stroke="#1E293B" />
            <path d="M20 70 L20 95" stroke="#0F172A" strokeWidth="4" /> {/* backrest */}
            {/* Foot plate slider platform */}
            <line x1="110" y1="30" x2="125" y2="45" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
            {/* Hydraulic foot pistons */}
            <line x1="75" y1="85" x2="110" y2="50" stroke="#10B981" strokeWidth="3" />
            {/* Indicator label */}
            <text x="80" y="110" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Plataforma 45°</text>
          </svg>
        );
      case 'latpull':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Overhead frame column */}
            <path d="M40 100 V25 M40 25 H120" stroke="#0F172A" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Seat & leg hold-down roller roller */}
            <rect x="65" y="70" width="35" height="15" rx="3" fill="#1E293B" stroke="#0F172A" />
            <circle cx="60" cy="65" r="5" fill="#F59E0B" stroke="#D97706" /> {/* thigh pad */}
            {/* Weight stacks column */}
            <rect x="110" y="45" width="20" height="55" rx="2" fill="#E2E8F0" stroke="#475569" />
            <g fill="#3B82F6">
              <rect x="112" y="55" width="16" height="5" />
              <rect x="112" y="63" width="16" height="5" />
              <rect x="112" y="71" width="16" height="5" />
              <rect x="112" y="79" width="16" height="5" fill="#EF4444" /> {/* Selected weight */}
              <rect x="112" y="87" width="16" height="5" />
              <rect x="112" y="95" width="16" height="5" />
            </g>
            {/* Overhead steel cable pully */}
            <path d="M120 25 L120 45" stroke="#64748B" strokeWidth="1.5" />
            {/* Hanger Cable and Lat pull wide bar */}
            <path d="M85 25 V45" stroke="#475569" strokeWidth="1.5" />
            <path d="M60 45 H110" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
            <text x="80" y="115" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Torre Polia Lat Pulley</text>
          </svg>
        );
      case 'chestpress':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Seat & Back support frame */}
            <path d="M40 100 H120" stroke="#94A3B8" strokeWidth="3" />
            <path d="M50 40 V95" stroke="#1E293B" strokeWidth="4" /> {/* Backrest */}
            <rect x="52" y="65" width="22" height="12" rx="2" fill="#0F172A" stroke="#1E293B" /> {/* Seat bottom */}
            {/* Rotation pivot with arm structure */}
            <circle cx="50" cy="35" r="4" fill="#64748B" />
            {/* Pressed Arm handle with directions directions */}
            <path d="M50 35 L75 55 M75 55 V80" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            <circle cx="65" cy="55" r="4" fill="#EF4444" /> {/* Grip adjustment node */}
            <path d="M72 80 H82" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" /> {/* Double Handle grips */}
            {/* Motion arrow */}
            <path d="M78 60 Q95 62 108 55" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M108 55 L102 51 M108 55 L105 59" stroke="#10B981" strokeWidth="2" />
            {/* Weight selectors stack column */}
            <rect x="115" y="45" width="20" height="55" rx="2" fill="#E2E8F0" stroke="#475569" />
            <rect x="117" y="70" width="16" height="6" fill="#F59E0B" />
            <text x="80" y="112" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Supino Máquina</text>
          </svg>
        );
      case 'mesaflexora':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Main horizontal training bench pad */}
            <path d="M25 100 h110" stroke="#94A3B8" strokeWidth="3.5" />
            <g transform="translate(0, 15)">
              <rect x="35" y="50" width="80" height="12" rx="4" fill="#0F172A" stroke="#1E293B" />
              {/* Bench inclined angle pivot */}
              <path d="M75 50 L85 62 L95 50" stroke="#EF4444" strokeWidth="1.5" />
            </g>
            {/* Calf Leg Roller arm pivot lever */}
            <circle cx="105" cy="65" r="5" fill="#F59E0B" stroke="#D97706" />
            <path d="M105 65 L125 50" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            {/* Highlighting Roller pad cushion around heel */}
            <circle cx="125" cy="50" r="7.5" fill="#EF4444" stroke="#DC2626" />
            {/* Leg trajectory arrow */}
            <path d="M125 40 Q105 25 85 45" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M85 45 L91 44 M85 45 L88 39" stroke="#10B981" strokeWidth="2" />
            {/* Hand anchor bars */}
            <path d="M35 70 L25 82" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
            <text x="80" y="111" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Mesa Flexora Horizontal</text>
          </svg>
        );
      case 'desenvolvimento':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Base platform */}
            <path d="M30 105 h100" stroke="#94A3B8" strokeWidth="3" />
            {/* Seated upright column with 90 deg seat and headrest support */}
            <rect x="45" y="45" width="22" height="48" rx="2" fill="#1E293B" stroke="#0F172A" />
            <rect x="42" y="70" width="28" height="8" rx="1.5" fill="#0F172A" />
            {/* Pressing pivot point */}
            <circle cx="55" cy="85" r="4" fill="#F59E0B" stroke="#D97706" />
            {/* Vertical lifting lever bar system */}
            <path d="M55 85 L75 40 H95" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Lifting path indicators */}
            <path d="M85 35 V15" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M85 15 L81 21 M85 15 L89 21" stroke="#10B981" strokeWidth="2" />
            {/* Red pressing grips handles */}
            <line x1="95" y1="35" x2="95" y2="45" stroke="#EF4444" strokeWidth="4.5" strokeLinecap="round" />
            {/* Back stacks weight */}
            <rect x="110" y="50" width="16" height="50" rx="2" fill="#E2E8F0" stroke="#475569" />
            <line x1="105" y1="85" x2="110" y2="85" stroke="#64748B" />
            <text x="80" y="113" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Prensa de Ombro Vetical</text>
          </svg>
        );
      case 'remada':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Seated horizontally layout */}
            <path d="M25 100 h110" stroke="#94A3B8" strokeWidth="3" />
            {/* Seat and padded chest support post */}
            <rect x="45" y="72" width="25" height="12" rx="3" fill="#1E293B" stroke="#0F172A" />
            <path d="M85 100 V60" stroke="#0F172A" strokeWidth="4" /> {/* Chest supporter column */}
            <rect x="80" y="50" width="10" height="20" rx="2" fill="#0F172A" /> {/* chest cushion */}
            {/* Dynamic hand gripper handles pulls pivoting backwards */}
            <circle cx="85" cy="45" r="4.5" fill="#F59E0B" />
            <path d="M85 45 L68 62 H55" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            <rect x="52" y="58" width="5" height="8" rx="1" fill="#EF4444" /> {/* Gripper bar */}
            {/* Motion horizontal arrow pulling */}
            <path d="M62 62 h-15" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M47 62 L53 58 M47 62 L53 66" stroke="#10B981" strokeWidth="2" />
            {/* Front stacks */}
            <rect x="115" y="45" width="18" height="55" rx="2" fill="#E2E8F0" stroke="#475569" />
            <text x="80" y="112" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Remada na Máquina</text>
          </svg>
        );
      case 'triceps':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Pulley system cabinet box column */}
            <rect x="35" y="20" width="30" height="82" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="3" />
            {/* Cable wheel top */}
            <circle cx="50" cy="30" r="7.5" fill="#94A3B8" stroke="#334155" />
            {/* Steel Cable dropping out */}
            <path d="M57 30 L85 48" stroke="#64748B" strokeWidth="1.5" />
            {/* Weighted cable dropping straight down with double rope attachment */}
            <path d="M85 48 V70" stroke="#475569" strokeWidth="2" />
            <path d="M85 70 L78 85 M85 70 L92 85" stroke="#EF4444" strokeWidth="3.5" strokeLinecap="round" /> {/* Red rope grips */}
            <circle cx="77" cy="85" r="3.5" fill="#D97706" /> {/* Bottom thick handles knots */}
            <circle cx="93" cy="85" r="3.5" fill="#D97706" />
            {/* Highlighting down arrow push */}
            <path d="M85 58 V78" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M85 78 L80 72 M85 78 L90 72" stroke="#10B981" strokeWidth="2" />
            {/* Foot plate footprint locator */}
            <ellipse cx="85" cy="100" rx="15" ry="4" fill="#E2E8F0" stroke="#94A3B8" />
            <text x="85" y="112" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Polia Tríceps Corda</text>
          </svg>
        );
      case 'extensora':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Rigid base */}
            <path d="M30 100 h100" stroke="#94A3B8" strokeWidth="3.5" />
            {/* Upright seated post and back cushion */}
            <rect x="42" y="45" width="20" height="42" rx="2.5" fill="#0F172A" stroke="#1E293B" /> {/* Back cushion */}
            <rect x="58" y="70" width="30" height="12" rx="2" fill="#1E293B" stroke="#475569" /> {/* Seat plate cushion */}
            {/* Knee pivot rod joint indicator */}
            <circle cx="85" cy="74" r="5" fill="#F59E0B" stroke="#D97706" />
            {/* Shin Roller mechanical plate bar extension */}
            <path d="M85 74 L98 96" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            {/* Glowing roller roller for shins */}
            <circle cx="98" cy="96" r="6.5" fill="#EF4444" stroke="#DC2626" />
            {/* Directional upward rotation indicator */}
            <path d="M104 90 Q120 74 105 52" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" strokeLinecap="round" />
            <path d="M105 52 L111 56 M105 52 L105 58" stroke="#10B981" strokeWidth="2" />
            <text x="80" y="112" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Cadeira Extensora</text>
          </svg>
        );
      case 'panturrilha':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Base platform block */}
            <path d="M25 100 h110" stroke="#94A3B8" strokeWidth="4" />
            <rect x="95" y="86" width="30" height="14" rx="1" fill="#475569" stroke="#334155" /> {/* Calf Elevated plate */}
            {/* Frame support post & seated pads */}
            <path d="M45 100 V52 h40" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            <rect x="35" y="65" width="22" height="10" rx="2" fill="#0F172A" /> {/* Seat cushion */}
            {/* Knee press lever pad assembly */}
            <path d="M45 55 L90 73" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="90" cy="73" r="6" fill="#EF4444" stroke="#DC2626" /> {/* Roller pad cushion atop thigh */}
            {/* Heel ankle rotation vectors */}
            <path d="M110 84 V70" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3,3" />
            <path d="M110 70 L114 74 M110 70 L106 74" stroke="#10B981" strokeWidth="1.5" />
            <text x="80" y="114" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Panturrilha Sentado</text>
          </svg>
        );
      case 'crunch':
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* Base structure floor support */}
            <path d="M20 100 h120" stroke="#94A3B8" strokeWidth="3" />
            <path d="M40 100 V40" stroke="#0F172A" strokeWidth="4.5" /> {/* Structural Spine column */}
            {/* Curving seat & padding setup */}
            <rect x="42" y="70" width="20" height="10" rx="2" fill="#1E293B" />
            <rect x="42" y="48" width="18" height="20" rx="3" fill="#0F172A" /> {/* Head Chest frame curve */}
            {/* Rotating crunch arm bars with pivots */}
            <circle cx="40" cy="40" r="5.5" fill="#F59E0B" stroke="#D97706" />
            <path d="M40 40 Q75 42 75 62" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
            <path d="M75 62 h-10" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" /> {/* Front crunch pulling bar */}
            {/* Motion bending trajectory */}
            <path d="M78 48 Q98 62 82 82" stroke="#10B981" strokeWidth="2" strokeDasharray="3,3" />
            <text x="80" y="113" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Abdominal Crunch Máquina</text>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 160 120" className="w-full h-full text-brand-blue" fill="none" stroke="currentColor" strokeWidth="2.5">
            {/* General gorgeous schematic placeholder icon */}
            <rect x="40" y="30" width="80" height="60" rx="12" fill="none" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="80" cy="60" r="16" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="4,4" />
            <line x1="45" y1="90" x2="115" y2="90" stroke="#1E293B" strokeWidth="4" />
            <text x="80" y="110" className="text-[10px] uppercase tracking-wider font-mono font-bold" fill="#64748B" textAnchor="middle">Exercício Geral</text>
          </svg>
        );
    }
  };

  return (
    <div className="w-full h-36 bg-slate-950/50 backdrop-blur-md rounded-2xl border border-white/20 p-4 flex items-center justify-center overflow-hidden relative shadow-inner">
      <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent pointer-events-none" />
      {getSVG()}
    </div>
  );
}

// Full Structured database for Gym Workouts and Machines
const WORKOUT_PLANS = [
  {
    day: 'Terça',
    name: 'Treino X',
    subtitle: 'Foco em Cadeias Posteriores, Dorsais e Peitoral',
    warmup: 'Giro de ombros + Aquecimento articular (2 séries sem carga)',
    cardio: 'Terça: HIIT Dinâmico - 2 min leve + 1 min moderado alternado por 4 Ciclos = 12 Minutos.',
    exercises: [
      {
        id: 'legpress',
        name: 'Leg Press 45°',
        reps: '3 séries de 12 repetições',
        imgType: 'legpress',
        recognize: 'Plataforma móvel grande com banco inclinado a 45 graus, com suporte para carga lateral por anilhas.',
        setup: 'Ajuste a inclinação do encosto para apoiar lombar por completo. Posição dos pés na largura dos ombros na parte superior da plataforma.',
        execution: 'Destrave a barra de segurança, flexione os joelhos controladamente até quase 90 graus sem tirar o quadril do banco, empurre com força aplicando pressão nos calcanhares.',
        mistakes: 'Tirar o quadril do banco no ponto mais baixo; estender os joelhos completamente com trava no final, colapsando para dentro valgo.',
        tip: 'Mantenha os calcanhares totalmente plantados. Sinta a tração em quadríceps e glúteos.'
      },
      {
        id: 'latpulldown',
        name: 'Puxada Frente na Máquina',
        reps: '3 séries de 12 repetições',
        imgType: 'latpull',
        recognize: 'Coluna de placas com banco, rolo estofado para travar os joelhos e uma barra longa suspensa por cabo de aço.',
        setup: 'Ajuste os rolos de suporte na altura das suas coxas de forma que seus pés fiquem firmes e travamos no solo.',
        execution: 'Segure a barra com pegada aberta e pronada. Incline ligeiramente o tronco para trás e puxe a barra direcionando o peito enquanto aduz as escápulas por trás.',
        mistakes: 'Descer a barra atrás da nuca; usar peso do corpo gangorrando excessivamente para trás; flexionar punhos.',
        tip: 'Pense em puxar com os cotovelos direcionados para baixo, e não com as mãos arrastando a barra.'
      },
      {
        id: 'chestpress',
        name: 'Chest Press na Máquina',
        reps: '3 séries de 12 repetições',
        imgType: 'chestpress',
        recognize: 'Cadeira com encosto vertical para peito, com hastes horizontais de tração empurradas para a frente.',
        setup: 'Ajuste a altura do banco para que os pegadores fiquem alinhados com a linha média do seu mamilo / peitoral.',
        execution: 'Apoie as costas firmemente, mantenha pés planos ao chão. Empurre as alças para a frente mantendo os ombros encaixados para trás e para baixo.',
        mistakes: 'Deixar os ombros subirem em direção às orelhas; esticar os cotovelos gerando impacto articular; desencostar costas.',
        tip: 'Gere torque nos pés empurrando o chão e esprema o peitoral no pico da contração máxima de movimento.'
      },
      {
        id: 'mesaflexora',
        name: 'Mesa Flexora Horizontal',
        reps: '3 séries de 12 repetições',
        imgType: 'mesaflexora',
        recognize: 'Banco comprido de deitar onde seus calcanhares se encaixam sob um rolo cilíndrico móvel conectando a pesos.',
        setup: 'Deite de bruços de forma que a articulação do seu joelho fique alinhada com o eixo de rotação lateral da polia redonda.',
        execution: 'Contraia o abdômen e flexione os calcanhares trazendo o rolo em direção aos glúteos de forma explosiva e retorne lentamente freando o peso.',
        mistakes: 'Elevar o quadril saindo do banco; balançar o corpo gerando força de embalo brusco; hiperestender joelhos de impacto.',
        tip: 'Segure firmemente nas alças de apoio frontais para manter o quadril estabilizado firmemente.'
      },
      {
        id: 'ombro_maquina',
        name: 'Desenvolvimento de Ombro Máquina',
        reps: '2 séries de 12 repetições',
        imgType: 'desenvolvimento',
        recognize: 'Banco com encosto curto, alças suspensas em paralelo para serem empurradas verticalmente.',
        setup: 'Banco com altura permitindo que as alças comecem exatamente ao nível da linha do seu queixo.',
        execution: 'Abrace o suporte com a lombar firme, respire e empurre as pegadas diretamente para o teto controlando a descida rente.',
        mistakes: 'Arquear a coluna lombar projetando o umbigo para a frente; abrir cotovelos excessivamente para os lados.',
        tip: 'Feche um pouco os cotovelos para dentro, alinhando com o plano escapular para proteger a articulação dos ombros.'
      }
    ]
  },
  {
    day: 'Quinta',
    name: 'Treino Y',
    subtitle: 'Cardio, Fortalecimento Geral de Braços e Core',
    warmup: 'Alongamento dinâmico de punhos, antebraços e mobilidade de quadril.',
    cardio: 'Quinta: Resistência Confortável - Bicicleta ou caminhada rápida: 3 min confortável + 1 min forte por 5 Ciclos = 20 Minutos.',
    exercises: [
      {
        id: 'cardio_warmup',
        name: 'Aquecimento: Bike ou Esteira Inclinada',
        reps: '8 minutos leves a moderados',
        imgType: 'cardio',
        recognize: 'Painel digital de corrida ou pedais, com controles rápidos de velocidade e inclinação programada.',
        setup: 'Ajuste a bicicleta na altura do seu osso do quadril ou nivele a esteira com inclinação inicial de 3.0%.',
        execution: 'Inicie de forma suave para despertar fluxo de sangue sistêmico. Respire fundo pelo nariz e mande embora os problemas do colégio.',
        mistakes: 'Começar correndo rápido demais; ler no celular enquanto treina perdendo a mecânica postural.',
        tip: 'Consumo focado de energia. Esse aquecimento sintoniza sua respiração para as cargas pesadas seguintes!'
      },
      {
        id: 'remada_sentada',
        name: 'Remada Sentada na Máquina',
        reps: '3 séries de 12 repetições',
        imgType: 'remada',
        recognize: 'Plaqueta com banco comprido horizontal, alça triangular conectada ao cabo baixo.',
        setup: 'Mantenha os joelhos sutilmente flexionados no suporte, coluna neutra ereta.',
        execution: 'Puxe o triângulo em direção ao abdômen inferior espremendo as "asas" das costas e empurrando o peito altivo à frente.',
        mistakes: 'Girar os ombros para dentro ao puxar; inclinar demais o tronco para trás se balançando como balanço.',
        tip: 'Abra o peito antes de começar a puxar. Tração total nas dorsais inferiores.'
      },
      {
        id: 'supino_chestdrop',
        name: 'Supino Máquina Adaptado',
        reps: '3 séries de 12 repetições',
        imgType: 'chestpress',
        recognize: 'Press horizontal de empunhaduras de ferro, regulável por pinos no encosto.',
        setup: 'Mantenha a sola dos pés ancorada ao chão, retraia as escápulas firmes no banco.',
        execution: 'Estenda os braços à frente de forma síncrona empurrando a barra guia com velocidade e controle e recue retendo a carga.',
        mistakes: 'Deixar as costas se descolarem do encosto acolchoado ao empurrar; punhos caídos ou frouxos.',
        tip: 'Controle o ritmo! Uma descida de 3 segundos de retenção maximiza os resultados.'
      },
      {
        id: 'rosca_alternada',
        name: 'Rosca Alternada com Halteres',
        reps: '2 séries de 12 repetições',
        imgType: 'dumbbells',
        recognize: 'Dois halteres manuais de mesma carga retirados no suporte centralizador da academia.',
        setup: 'Em pé ou sentado em banco com empunhadura neutra dos braços esticados ao lado da coxa.',
        execution: 'Flexione os cotovelos girando o antebraço ao longo da subida (palma para cima no topo) espremendo o bíceps individualmente.',
        mistakes: 'Oscilar o ombro ou cotovelo para frente para compensar peso; apoiar o corpo para trás gerando embalo nas pernas.',
        tip: 'Mantenha os cotovelos "colados" ao tronco. Não movimente eles para frente nem para trás na rosca.'
      },
      {
        id: 'triceps_corda',
        name: 'Tríceps Corda no Pulley',
        reps: '2 séries de 12 repetições',
        imgType: 'triceps',
        recognize: 'Rope/Corda preta espessa bifurcada presa ao cabo mosquetão da polia alta de aço.',
        setup: 'Fique na frente do aparelho, dê um passo leve para trás, tronco inclinado levemente para frente (15°).',
        execution: 'Estenda totalmente os braços empurrando as pontas da corda para baixo e, no final do curso, separe as pontas para fora.',
        mistakes: 'Deixar os cotovelos se afastarem do corpo; mover os braços como alavanca do ombro; não esticar tudo.',
        tip: 'Force a extensão final do cotovelo. É lá que o tríceps recebe o máximo estímulo concentrado.'
      },
      {
        id: 'prancha_quinta',
        name: 'Prancha de Estabilização Core',
        reps: '3 séries de 20 a 30 segundos',
        imgType: 'plank',
        recognize: 'Colchonete plano esticado no solo da academia.',
        setup: 'Apoie os antebraços no solo alinhando cotovelos exatamente sob a projeção vertical de seus ombros.',
        execution: 'Suba o corpo sustentando-se somente nos cotovelos e dedos dos pés, alinhando quadril, pescoço e coluna perfeitamente.',
        mistakes: 'Deixar o quadril despencar curvado, pesando a coluna; elevar o bumbum muito alto como cabana triangular.',
        tip: 'Contraia o abdômen e esprema os calcanhares para trás. Respire de forma curta e controlada.'
      }
    ]
  },
  {
    day: 'Sábado',
    name: 'Treino Z',
    subtitle: 'Mix Completo: Cardio, Extensora, Panturrilhas e abdômen',
    warmup: 'Giro de quadril leve e mobilidade de joelhos por 3 minutos.',
    cardio: 'Sábado: Sprint e Resistência - Corrida ou bike em Countdown de 10 ou 12 minutos mantendo o ritmo acelerado.',
    exercises: [
      {
        id: 'extensora_sabado',
        name: 'Cadeira Extensora de Coxa',
        reps: '2 séries de 15 repetições',
        imgType: 'extensora',
        recognize: 'Aparelho sentado onde seus pés posicionam-se atrás de um rolo macio inferior de empurre.',
        setup: 'Ajuste o encosto de forma que a sua dobra traseira do joelho repouse exatamente no limite final do estofado.',
        execution: 'Segure as alças laterais, empurre o rolo para cima até estender quase completamente os joelhos. Segure 1s e flexione lentamente.',
        mistakes: 'Subir dando chutes bruscos soltando a carga; quadril se levantando do assento em balanço.',
        tip: 'Trave o seu bumbum no assento puxando os pegadores de metal laterais para cima com as mãos.'
      },
      {
        id: 'flexora_sabado',
        name: 'Mesa Flexora Horizontal',
        reps: '2 séries de 15 repetições',
        imgType: 'mesaflexora',
        recognize: 'Banco deitado de barriga para baixo com braço giratório estofado apoiado nos tornozelos.',
        setup: 'Alinhamento completo dos joelhos fora da borda rígida do estofamento central.',
        execution: 'Tracione o rolo em direção aos glúteos e controle a descida resistindo ao peso da máquina.',
        mistakes: 'Curvar a lombar compensando peso; fazer repetição parcial abreviada.',
        tip: 'Force a ponta dos dedos do pé apontando para a sua canela (dorsiflexão) para isolar panturrilha de ação.'
      },
      {
        id: 'panturrilha_maquina',
        name: 'Panturrilha Sentado Máquina',
        reps: '2 séries de 15 repetições',
        imgType: 'panturrilha',
        recognize: 'Aparelho com banco, base em rampa para as pontas dos pés e almofadas que se deitam acima dos joelhos.',
        setup: 'Apoie a seção de bola das pontas dos pés na barra plana, calcanhares projetados para fora suspensos.',
        execution: 'Abaixe totalmente os calcanhares alongando a panturrilha e eleve subindo na ponta dos pés o máximo possível.',
        mistakes: 'Fazer movimentos curtos e rápidos sem amplitude total; saltar o peso usando o corpo de rebote.',
        tip: 'Segure 1 segundo na contração máxima de pontinha de pé para obter resultados melhores!'
      },
      {
        id: 'puxada_sabado',
        name: 'Puxada Frente de Costas',
        reps: '2 séries de 15 repetições',
        imgType: 'latpull',
        recognize: 'Pegadores ergonômicos por cabos na polia alta.',
        setup: 'Pés cravados no solo, trave as coxas confortavelmente com firmeza.',
        execution: 'Abaixe a barra controladamente direcionando o esforço até o queixo e concentre a subida.',
        mistakes: 'Espasmos rápidos ao puxar; inclinação lateral desregulada.',
        tip: 'Puxe sorrindo! Sorrir diminui a sensação de sobrecarga física e foca os neurônios.'
      },
      {
        id: 'chest_press_sabado',
        name: 'Chest Press de Peitoral',
        reps: '2 séries de 15 repetições',
        imgType: 'chestpress',
        recognize: 'Painel com alças estofadas e banco regulável em altura.',
        setup: 'Cotovelos alinhados ligeiramente abaixo dos ombros para preservar manguito.',
        execution: 'Empurre à frente expirando todo o ar pulmonar e inspire na descida controlada.',
        mistakes: 'Desencostar a cabeça do estufado; cotovelos muito altos.',
        tip: 'Mantenha os cotovelos em ângulo para baixo. Nunca projete os cotovelos soltos para cima.'
      },
      {
        id: 'abdominal_colchonete',
        name: 'Abdominal Supra no Colchonete',
        reps: '2 séries de 15 repetições',
        imgType: 'mat',
        recognize: 'Apenas colchonete ou tapete macio de yoga estendido no chão plano.',
        setup: 'Deite de costas, flexione os joelhos apontando para cima, sola dos pés apoiadas no assoalho.',
        execution: 'Mãos atrás das orelhas (não no pescoço). Contraia o abdômen elevando as escápulas do chão projetando o peito ao teto.',
        mistakes: 'Puxar o pescoço com as mãos esmagando a cervical; tirar totalmente a lombar do colchonete sem controle.',
        tip: 'Imagine que tem uma laranja entre seu queixo e o peito e você não pode esmagá-la durante a subida.'
      },
      {
        id: 'prancha_sabado',
        name: 'Prancha de Isometria Horizontal',
        reps: '2 séries de 20 a 30 segundos',
        imgType: 'plank',
        recognize: 'Colchonete firme esticado no piso.',
        setup: 'Corpo esticado paralelo ao colchoado, equilíbrio sobre antebraços.',
        execution: 'Eleve o quadril acionando glúteo e transverso do abdômen, respiração longa sustentada.',
        mistakes: 'Cair bacia no colchonete arqueando lombar dolorida.',
        tip: 'Empurre os antebraços ativamente contra o solo para encher o espaço escápulo-toráxico posterior.'
      },
      {
        id: 'abdominal_crunch_maquina',
        name: 'Abdominal Crunch na Máquina',
        reps: '2 séries de 12 repetições',
        imgType: 'crunch',
        recognize: 'Aparelho com alças estofadas superiores ao lado da cabeça e apoio curvo giratório de peito.',
        setup: 'Sente-se encaixando a cintura bem de encontro ao fundo giratório ajustando o pino regulador de arco.',
        execution: 'Segure as pegadas superiores, flexione a coluna enrolando o tronco puxando as costelas em direção à bacia.',
        mistakes: 'Fazer força com os braços empurrando as alças em vez de usar somente a musculatura do abdômen.',
        tip: 'Não pense em ir para a frente, pense em enrolar a sua própria espinha cilíndrica como um tatuzinho.'
      }
    ]
  }
];

// Classes coletivas data schema
const TIMETABLE_CLASSES = [
  { day: 'Terça', time: '19:15', name: 'Pump', icon: '⚡' },
  { day: 'Quinta', time: '19:15', name: 'Step', icon: '🛹' },
  { day: 'Quinta', time: '20:15', name: 'Pilates', icon: '🧘' },
  { day: 'Sexta', time: '18:30', name: 'Funcional', icon: '🔋' },
  { day: 'Sexta', time: '19:30', name: 'Fitdance', icon: '🕺' }
];

// Prioridade: PNG local > SVG placeholder. Sem CDN externo — funciona offline no PWA.
function getRealExerciseImage(exerciseId: string): string {
  return EXERCISE_IMAGES[exerciseId] || EXERCISE_PLACEHOLDERS[exerciseId] || EXERCISE_PLACEHOLDERS['cardio_warmup'];
}

export default function CorpoView({
  metrics,
  onUpdateMetrics,
  onPlanMinimoCompleted,
  exerciseLogs,
  completedWorkouts,
  onUpdateExerciseLog,
  onCompleteWorkout,
  onClearWorkoutData,
  onImportState,
  fullState
}: CorpoViewProps) {
  // Navigation active tab inside Corpo tab
  const [corpoTab, setCorpoTab] = useState<'treino' | 'historico' | 'planoMinimo' | 'timer' | 'aulas'>('treino');

  // Exercise screen state
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<typeof WORKOUT_PLANS[0] | null>(null);

  // Expanded Gym mode
  const [gymMode, setGymMode] = useState<boolean>(false);
  const [currentLoad, setCurrentLoad] = useState<string>('');
  const [currentNotes, setCurrentNotes] = useState<string>('');
  const [currentDone, setCurrentDone] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<'photo' | 'esquema'>('photo');

  // Timer inside Corpo module
  const [timerPreset, setTimerPreset] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerTotal, setTimerTotal] = useState<number>(0);
  const [customSecs, setCustomSecs] = useState<string>('');

  // Cardio interval settings
  const [cardioRunning, setCardioRunning] = useState<boolean>(false);
  const [cardioIntervalId, setCardioIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [cardioMinutesLeft, setCardioMinutesLeft] = useState<number>(0);
  const [cardioSecondsLeft, setCardioSecondsLeft] = useState<number>(0);
  const [cardioCurrentPhase, setCardioCurrentPhase] = useState<'leve' | 'moderado' | 'forte' | 'concluido' | 'countdown'>('countdown');
  const [cardioTotalTimeSec, setCardioTotalTimeSec] = useState<number>(0);
  const [cardioElapsedSec, setCardioElapsedSec] = useState<number>(0);
  const [cardioDescription, setCardioDescription] = useState<string>('');

  // Daily Metrics fields
  const [pesoInput, setPesoInput] = useState<string>(metrics.peso > 0 ? String(metrics.peso) : '');
  const [cinturaInput, setCinturaInput] = useState<string>(metrics.cintura > 0 ? String(metrics.cintura) : '');
  const [energiaInput, setEnergiaInput] = useState<number>(metrics.energia || 3);
  const [obsInput, setObsInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const todayStr = () => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const todayDate = todayStr();

  // Detect recommendation day
  const getTodayDayOfWeekString = () => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date().getDay()];
  };

  const weekdayName = getTodayDayOfWeekString();

  // Auto detect pre-defined workout for today
  useEffect(() => {
    const match = WORKOUT_PLANS.find(p => p.day === weekdayName);
    if (match) {
      setSelectedWorkout(match);
    } else {
      setSelectedWorkout(WORKOUT_PLANS[0]); // fallback to Treino X
    }
  }, [weekdayName]);

  // Synchronize loading details when a certain exercise is clicked
  useEffect(() => {
    if (selectedWorkout && activeExerciseIdx !== null) {
      const exercise = selectedWorkout.exercises[activeExerciseIdx];
      const savedKey = `${todayDate}_${exercise.id}`;
      const log = exerciseLogs[savedKey] || { completed: false, weight: '', notes: '' };
      
      setCurrentLoad(log.weight);
      setCurrentNotes(log.notes);
      setCurrentDone(log.completed);
    }
  }, [activeExerciseIdx, selectedWorkout, todayDate, exerciseLogs]);

  // General countdown core clock effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      handleFinishAlert();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft]);

  // Core cardio interval clock timer process
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cardioRunning) {
      interval = setInterval(() => {
        setCardioElapsedSec(prev => {
          const nextVal = prev + 1;
          if (nextVal >= cardioTotalTimeSec) {
            setCardioRunning(false);
            setCardioCurrentPhase('concluido');
            handleFinishAlert();
            return cardioTotalTimeSec;
          }
          return nextVal;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cardioRunning, cardioTotalTimeSec]);

  // Simple vibration/noise trigger
  const handleFinishAlert = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 100, 150, 100, 200]);
    }
  };

  const startPresetTimer = (secs: number) => {
    setTimeLeft(secs);
    setTimerTotal(secs);
    setTimerActive(true);
  };

  const handleCustomSecsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomSecs(e.target.value);
  };

  const launchCustomTimer = () => {
    const num = parseInt(customSecs);
    if (num > 0) {
      startPresetTimer(num);
      setCustomSecs('');
    }
  };

  // Launch preconfigured cardio routines
  const startCardioRoutine = (type: 'terca' | 'quinta' | 'sabado') => {
    setCardioRunning(true);
    setCardioElapsedSec(0);
    if (type === 'terca') {
      // 2 min leve + 1 min mod x 4 = 12 min = 720 secs
      setCardioTotalTimeSec(720);
      setCardioDescription('HIIT: 2m Leve ➔ 1m Moderado (4 Ciclos)');
      setCardioCurrentPhase('leve');
    } else if (type === 'quinta') {
      // 3 min confortable + 1 min forte x 5 = 20 min = 1200 secs
      setCardioTotalTimeSec(1200);
      setCardioDescription('HIIT: 3m Confortável ➔ 1m Forte (5 Ciclos)');
      setCardioCurrentPhase('leve');
    } else {
      // Countdown 10 min = 600 secs
      setCardioTotalTimeSec(600);
      setCardioDescription('Countdown constante de 10 minutos ritmado');
      setCardioCurrentPhase('countdown');
    }
  };

  // Dynamically calculate and display remaining cardio time & current interval state
  const getCardioStatusDetails = () => {
    const remainingTotal = cardioTotalTimeSec - cardioElapsedSec;
    const mins = Math.floor(remainingTotal / 60);
    const secs = remainingTotal % 60;
    const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let currentPhase = 'Esforço';
    let phaseColor = 'text-blue-500';

    if (cardioDescription.includes('terca')) {
      const activeMinutes = Math.floor(cardioElapsedSec / 60);
      const cycle = Math.floor(activeMinutes / 3);
      const cycleMinutes = activeMinutes % 3;
      if (cycleMinutes < 2) {
        currentPhase = `Caminhada Leve (Ciclo ${cycle + 1}/4)`;
        phaseColor = 'text-green-600';
      } else {
        currentPhase = `Trote Moderado (Ciclo ${cycle + 1}/4)`;
        phaseColor = 'text-amber-600 font-extrabold';
      }
    } else if (cardioDescription.includes('quinta')) {
      const activeMinutes = Math.floor(cardioElapsedSec / 60);
      const cycle = Math.floor(activeMinutes / 4);
      const cycleMinutes = activeMinutes % 4;
      if (cycleMinutes < 3) {
        currentPhase = `Pedalada Confortável (Ciclo ${cycle + 1}/5)`;
        phaseColor = 'text-emerald-600';
      } else {
        currentPhase = `Velocidade Máxima / Forte (Ciclo ${cycle + 1}/5)`;
        phaseColor = 'text-red-600 font-black animate-pulse';
      }
    } else {
      currentPhase = 'Caminhada Ritmo Firme';
      phaseColor = 'text-brand-blue';
    }

    return {
      timeLeftFormatted: timeFormatted,
      currentPhase,
      phaseColor,
      pctProgress: (cardioElapsedSec / cardioTotalTimeSec) * 100
    };
  };

  // Fast tracking metrics action
  const handleSaveMetrics = () => {
    const p = parseFloat(pesoInput) || 0;
    const c = parseFloat(cinturaInput) || 0;
    onUpdateMetrics(p, c, energiaInput);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Backups export/import handlers
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `modulo_corpo_backup_${new Date().toISOString().slice(0,10)}.json`);
    dlAnchorElem.click();
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object') {
            onImportState(parsed);
          } else {
            alert("Formato de arquivo inválido.");
          }
        } catch (err) {
          alert("Falha ao ler arquivo. JSON corrompido.");
        }
      };
    }
  };

  const saveGymExerciseProgress = () => {
    if (selectedWorkout && activeExerciseIdx !== null) {
      const exercise = selectedWorkout.exercises[activeExerciseIdx];
      onUpdateExerciseLog(exercise.id, {
        completed: currentDone,
        weight: currentLoad,
        notes: currentNotes
      });
      // Complete individual element
      if (currentDone) {
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(60);
        }
      }
    }
  };

  // Find previous workloads for visual comparing "Última carga: X kg"
  const getPreviousLoadForExercise = (exerciseId: string) => {
    // Traverse completed exerciseLogs in backwards search omitting today
    const keys = Object.keys(exerciseLogs).filter(k => k.includes(`_${exerciseId}`) && !k.startsWith(todayDate));
    if (keys.length > 0) {
      // Sort keys descending
      keys.sort((a,b) => b.localeCompare(a));
      const lastSessionLog = exerciseLogs[keys[0]];
      if (lastSessionLog && lastSessionLog.weight) {
        return lastSessionLog.weight;
      }
    }
    return null;
  };

  // Calculate current completion of today's exercises
  const getWorkoutSummaryStats = () => {
    if (!selectedWorkout) return { total: 0, done: 0, pct: 0 };
    const list = selectedWorkout.exercises;
    let done = 0;
    list.forEach(ex => {
      const log = exerciseLogs[`${todayDate}_${ex.id}`];
      if (log && log.completed) {
        done++;
      }
    });

    return {
      total: list.length,
      done,
      pct: list.length > 0 ? Math.round((done / list.length) * 100) : 0
    };
  };

  const stats = getWorkoutSummaryStats();

  // Active alternative class collective checks
  const todayClasses = TIMETABLE_CLASSES.filter(c => c.day === weekdayName);

  // Trigger ending workout
  const completeCurrentWholeWorkout = () => {
    if (selectedWorkout) {
      onCompleteWorkout(selectedWorkout.name, selectedWorkout.subtitle);
      // Automatically triggers standard essentials
      onPlanMinimoCompleted();
    }
  };

  return (
    <div className="space-y-6 pb-24 text-text-main font-sans">
      
      {/* Corpo Applet Tab and Inner Nav Selector buttons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-extrabold text-text-main flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-brand-blue" />
              Treino & Academia
            </h2>
            <p className="text-xs text-text-sec italic font-semibold">
              PWA de Treino do Davi • Força & Constância
            </p>
          </div>
          <span className="text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] px-2.5 py-1 rounded-full uppercase tracking-wider">
            {weekdayName}
          </span>
        </div>

        {/* Tab row switchers */}
        <div className="grid grid-cols-5 gap-1 bg-white/30 backdrop-blur-md p-1 rounded-2xl border border-white/55">
          <button
            onClick={() => { setCorpoTab('treino'); setGymMode(false); }}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-xl transition-all ${
              corpoTab === 'treino' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-sec opacity-70 hover:opacity-100'
            }`}
          >
            Treinar
          </button>
          <button
            onClick={() => { setCorpoTab('timer'); setGymMode(false); }}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-xl transition-all ${
              corpoTab === 'timer' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-sec opacity-70 hover:opacity-100'
            }`}
          >
            Timers
          </button>
          <button
            onClick={() => { setCorpoTab('planoMinimo'); setGymMode(false); }}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-xl transition-all ${
              corpoTab === 'planoMinimo' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-sec opacity-70 hover:opacity-100'
            }`}
          >
            Mínimo
          </button>
          <button
            onClick={() => { setCorpoTab('historico'); setGymMode(false); }}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-xl transition-all ${
              corpoTab === 'historico' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-sec opacity-70 hover:opacity-100'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => { setCorpoTab('aulas'); setGymMode(false); }}
            className={`py-2 px-1 text-[10px] font-black uppercase rounded-xl transition-all ${
              corpoTab === 'aulas' ? 'bg-brand-blue text-white shadow-sm' : 'text-text-sec opacity-70 hover:opacity-100'
            }`}
          >
            Aulas
          </button>
        </div>
      </section>

      {/* CORE WORKOUT AREA */}
      {corpoTab === 'treino' && !gymMode && (
        <div className="space-y-4">
          <div className="glass-panel rounded-[32px] p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.04]">
              <Dumbbell className="w-36 h-36" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest bg-brand-blue/10 px-2.5 py-1 rounded-md inline-block">
                Musculação Recomendada
              </span>
              <h3 className="text-2xl font-display font-black text-text-main flex items-center gap-1.5 pt-1">
                {selectedWorkout ? selectedWorkout.name : "Treino X"}
              </h3>
              <p className="text-xs text-text-sec font-medium">
                {selectedWorkout ? selectedWorkout.subtitle : "Posteriores, peito e dorsal"}
              </p>
            </div>

            <div className="space-y-2 bg-white/20 p-3.5 rounded-2xl border border-white/40">
              <div className="flex gap-2 items-start text-xs text-text-main">
                <span className="text-brand-blue font-extrabold shrink-0">❖ Aquecimento:</span>
                <span className="font-semibold text-text-sec leading-snug">{selectedWorkout?.warmup}</span>
              </div>
              <div className="flex gap-2 items-start text-xs text-text-main border-t border-gray-100/50 pt-2 mt-2">
                <span className="text-brand-green font-extrabold shrink-0">❖ Cardio sugerido:</span>
                <span className="font-semibold text-text-sec leading-snug">{selectedWorkout?.cardio}</span>
              </div>
            </div>

            {/* Quick Stats loop */}
            {stats.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs text-text-sec font-bold">
                  <span>Progresso do Treino</span>
                  <span>{stats.done}/{stats.total} Exercícios</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-white/50">
                  <div 
                    className="bg-brand-blue h-full transition-all duration-300 rounded-full"
                    style={{ width: `${stats.pct}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => {
                if (selectedWorkout && selectedWorkout.exercises.length > 0) {
                  setActiveExerciseIdx(0);
                  setGymMode(true);
                }
              }}
              className="w-full h-12 bg-brand-blue text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Iniciar Modo Academia (Tela Cheia)
            </button>
          </div>

          {/* GALLERY OF EXERCISES */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-sec px-1">Guia Rápido de Aparelhos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedWorkout?.exercises.map((ex, index) => {
                const specKey = `${todayDate}_${ex.id}`;
                const complete = exerciseLogs[specKey]?.completed || false;
                const weightSaved = exerciseLogs[specKey]?.weight;
                const prevWeight = getPreviousLoadForExercise(ex.id);

                return (
                  <div
                    key={ex.id}
                    className={`glass-panel rounded-[24px] border transition-all duration-300 flex flex-col overflow-hidden hover:shadow-md hover:-translate-y-0.5 group ${
                      complete ? 'border-emerald-200 bg-emerald-50/25' : 'border-white/50 bg-white/40'
                    }`}
                  >
                    {/* Image Header with Prominence */}
                    <div 
                      onClick={() => {
                        setActiveExerciseIdx(index);
                        setGymMode(true);
                      }}
                      className="w-full h-44 bg-[#161F30] relative overflow-hidden flex items-center justify-center cursor-pointer p-4 group-hover:opacity-95"
                    >
                      <img
                        src={getRealExerciseImage(ex.id)}
                        alt={ex.name}
                        className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

                      {/* Top-Left: Carga Anterior Visível */}
                      <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10 shadow-sm flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-brand-amber animate-pulse" />
                        <span>Carga Ant: <strong className="text-brand-amber font-extrabold">{prevWeight ? `${prevWeight} kg` : 'N/A'}</strong></span>
                      </div>

                      {/* Top-Right: Dynamic Done status */}
                      <div className="absolute top-3 right-3 shadow-md">
                        {complete ? (
                          <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-500/30">
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            Concluído
                          </span>
                        ) : (
                          <span className="bg-slate-900/70 backdrop-blur-md text-[#E2E8F0] text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/5">
                            Pendente
                          </span>
                        )}
                      </div>

                      {/* Bottom Overlay Info */}
                      <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                        <span className="inline-block bg-brand-blue/90 text-white font-mono text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-0.5 shadow-sm">
                          {ex.reps}
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Ergonomic Actions */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-extrabold text-text-main leading-tight group-hover:text-brand-blue transition-colors">
                            {ex.name}
                          </h4>
                        </div>
                        {ex.tip && (
                          <p className="text-[11px] text-text-sec font-medium leading-relaxed italic bg-black/5 p-2 rounded-xl border border-black/[0.02]">
                            💡 {ex.tip}
                          </p>
                        )}
                      </div>

                      {/* Ergonomic Action Buttons section */}
                      <div className="grid grid-cols-12 gap-2 pt-1 border-t border-slate-950/5">
                        {/* Option to view/start workout detail directly in gym view */}
                        <button
                          onClick={() => {
                            setActiveExerciseIdx(index);
                            setGymMode(true);
                          }}
                          className="col-span-8 h-11 bg-brand-blue text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm pl-2 pr-1"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white animate-bounce" />
                          <span>Iniciar Academia</span>
                        </button>

                        {/* Fast ergonomic check trigger with stopPropagation */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextDone = !complete;
                            const savedNotes = exerciseLogs[specKey]?.notes || '';
                            onUpdateExerciseLog(ex.id, {
                              completed: nextDone,
                              weight: weightSaved || prevWeight || '0',
                              notes: savedNotes
                            });
                            if (nextDone && typeof window !== 'undefined' && 'vibrate' in navigator) {
                              navigator.vibrate([45]);
                            }
                          }}
                          className={`col-span-4 h-11 rounded-xl flex items-center justify-center gap-1 font-extrabold text-[11px] uppercase tracking-wider transition-all active:scale-95 border ${
                            complete 
                              ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm' 
                              : 'bg-white/60 border-slate-200 text-text-main hover:bg-slate-50'
                          }`}
                          title={complete ? "Marcar como pendente" : "Marcar como feito"}
                        >
                          <Check className={`w-4 h-4 ${complete ? 'stroke-[3px]' : 'text-gray-400'}`} />
                          <span>{complete ? 'Feito' : 'Check'}</span>
                        </button>
                      </div>

                      {/* Today's Weight Logged representation */}
                      {weightSaved && weightSaved !== '0' && (
                        <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-2 flex justify-between items-center text-[10px] font-bold text-brand-blue animate-fade-in mt-1.5">
                          <span>REGISTRADO HOJE:</span>
                          <span className="bg-brand-blue text-white px-2 py-0.5 rounded-md font-extrabold">{weightSaved} kg</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FINISH WORKOUT ACTION */}
          {stats.done >= 3 && (
            <button
              onClick={completeCurrentWholeWorkout}
              className="w-full h-14 bg-emerald-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-6"
            >
              <Award className="w-5 h-5" />
              Finalizar e Registrar Treino de Máquinas!
            </button>
          )}

          {/* Quick workout toggle options */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {WORKOUT_PLANS.map(wp => (
              <button
                key={wp.name}
                onClick={() => setSelectedWorkout(wp)}
                className={`py-3 rounded-2xl text-xs font-extrabold border transition-all ${
                  selectedWorkout?.name === wp.name
                    ? 'bg-white border-brand-blue text-brand-blue shadow-sm'
                    : 'bg-white/40 border-white/50 text-text-sec'
                }`}
              >
                {wp.day} ({wp.name})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FULL GYM MODE INTERFACE (1-HAND USE REDESIGN) */}
      {corpoTab === 'treino' && gymMode && selectedWorkout && activeExerciseIdx !== null && (
        <div className="space-y-4">
          {/* Header Controls */}
          <div className="flex justify-between items-center bg-white/40 backdrop-blur-md p-3 rounded-2xl border border-white/50">
            <button
              onClick={() => setGymMode(false)}
              className="flex items-center gap-1 text-xs text-text-sec font-bold hover:text-text-main"
            >
              <ChevronLeft className="w-4 h-4" />
              Sair Modo Academia
            </button>
            <span className="text-[10px] font-mono font-bold text-text-sec">
              {activeExerciseIdx + 1} de {selectedWorkout.exercises.length}
            </span>
          </div>

          {/* Core Exercise display machine slide */}
          {(() => {
            const currentEx = selectedWorkout.exercises[activeExerciseIdx];
            const prevWeight = getPreviousLoadForExercise(currentEx.id);
            const specKey = `${todayDate}_${currentEx.id}`;
            const currentDone = exerciseLogs[specKey]?.completed || false;

            return (
              <div className="space-y-4">
                
                {/* Embedded Big Machine Illustration with Ilustração 3D/Esquema Toggle */}
                <div className="glass-panel p-3.5 rounded-[32px] overflow-hidden border border-white/60 relative bg-white/30 space-y-3.5">
                  {/* Segmented Controller Tab */}
                  <div className="flex bg-slate-950/5 p-1 rounded-xl border border-white/40">
                    <button
                      onClick={() => setVisualMode('photo')}
                      className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        visualMode === 'photo'
                          ? 'bg-white text-brand-blue shadow-sm'
                          : 'text-text-sec hover:text-text-main'
                      }`}
                    >
                      📸 Ilustração 3D
                    </button>
                    <button
                      onClick={() => setVisualMode('esquema')}
                      className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        visualMode === 'esquema'
                          ? 'bg-white text-brand-blue shadow-sm'
                          : 'text-text-sec hover:text-text-main'
                      }`}
                    >
                      📐 Desenho Técnico
                    </button>
                  </div>

                  <div className="relative overflow-hidden rounded-[24px]">
                    {visualMode === 'photo' ? (
                      <div className="w-full h-44 bg-white border border-slate-200/50 shadow-inner overflow-hidden flex items-center justify-center rounded-[24px] p-2">
                        <img
                          src={getRealExerciseImage(currentEx.id)}
                          alt={currentEx.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-center p-1 bg-slate-950/50 rounded-[24px]">
                        <MachineSVG type={currentEx.imgType} />
                      </div>
                    )}
                    
                    {/* Floating load comparing */}
                    {prevWeight && (
                      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 shadow-md">
                        Última Carga: {prevWeight} kg
                      </div>
                    )}

                    {/* Complete checkmark */}
                    {currentDone && (
                      <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/10">
                        <Check className="w-3.5 h-3.5 stroke-[2.5px]" />
                        Feito
                      </div>
                    )}
                  </div>
                </div>

                {/* Title and details */}
                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-black text-text-main leading-tight">{currentEx.name}</h3>
                  <p className="text-sm text-brand-blue font-extrabold uppercase tracking-wider">{currentEx.reps}</p>
                </div>

                {/* EXPANDED ACCORDION STEPS */}
                <div className="space-y-2">
                  
                  {/* Reconhecimento */}
                  <div className="bg-white/40 rounded-2xl border border-white/50 p-3.5 text-xs text-text-sec">
                    <span className="font-extrabold text-text-main block mb-1">Como Reconhecer a Máquina:</span>
                    <p className="leading-relaxed font-semibold">{currentEx.recognize}</p>
                  </div>

                  {/* Ajustes e Execução */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/40 rounded-2xl border border-white/50 p-3 text-xs text-text-sec">
                      <span className="font-extrabold text-text-main block mb-1">Ajuste & Início:</span>
                      <p className="leading-normal font-medium">{currentEx.setup}</p>
                    </div>
                    <div className="bg-white/40 rounded-2xl border border-white/50 p-3 text-xs text-text-sec">
                      <span className="font-extrabold text-text-main block mb-1">Execução Correta:</span>
                      <p className="leading-normal font-medium">{currentEx.execution}</p>
                    </div>
                  </div>

                  {/* Evitar erros & Tip */}
                  <div className="bg-amber-50/40 rounded-2xl border border-amber-200/40 p-3.5 text-xs text-amber-900">
                    <span className="font-extrabold block mb-0.5">⚠️ Erro para evitar:</span>
                    <p className="leading-relaxed font-semibold">{currentEx.mistakes}</p>
                  </div>

                  <div className="bg-sky-50/40 rounded-2xl border border-sky-200/40 p-3.5 text-xs text-sky-950">
                    <span className="font-extrabold block mb-0.5">💡 Dica do dia:</span>
                    <p className="leading-relaxed font-semibold">{currentEx.tip}</p>
                  </div>

                </div>

                {/* ON THE SPOT INPUT FORM */}
                <div className="glass-panel p-5 rounded-3xl space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-black text-text-sec uppercase tracking-wider mb-1">Carga Hoje (kg)</label>
                      <input
                        type="text"
                        value={currentLoad}
                        onChange={(e) => {
                          setCurrentLoad(e.target.value);
                          // Auto trigger saving on change to prevent lost dataloss
                          const savedKey = `${todayDate}_${currentEx.id}`;
                          onUpdateExerciseLog(currentEx.id, {
                            completed: currentDone,
                            weight: e.target.value,
                            notes: currentNotes
                          });
                        }}
                        placeholder="Ex: 45"
                        className="w-full h-12 rounded-xl bg-white/40 border border-white/55 text-center font-bold text-xl focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-text-sec uppercase tracking-wider mb-1">Anotações / Obs</label>
                      <input
                        type="text"
                        value={currentNotes}
                        onChange={(e) => {
                          setCurrentNotes(e.target.value);
                          const savedKey = `${todayDate}_${currentEx.id}`;
                          onUpdateExerciseLog(currentEx.id, {
                            completed: currentDone,
                            weight: currentLoad,
                            notes: e.target.value
                          });
                        }}
                        placeholder="Sentido mais leve"
                        className="w-full h-12 rounded-xl bg-white/40 border border-white/55 px-3 text-xs font-semibold focus:border-brand-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Mark as Done action with big sensory button */}
                  <button
                    onClick={() => {
                      const nextDone = !currentDone;
                      setCurrentDone(nextDone);
                      onUpdateExerciseLog(currentEx.id, {
                        completed: nextDone,
                        weight: currentLoad,
                        notes: currentNotes
                      });
                      if (nextDone && typeof window !== 'undefined' && 'vibrate' in navigator) {
                        navigator.vibrate([40]);
                      }
                    }}
                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all active:scale-95 border ${
                      currentDone 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-inner' 
                        : 'bg-white/60 border-white/65 text-text-main shadow-sm'
                    }`}
                  >
                    <Check className={`w-5 h-5 ${currentDone ? 'stroke-[3px]' : 'text-gray-400'}`} />
                    {currentDone ? 'MÁQUINA CONCLUÍDA!' : 'MARCAR COMO CONCLUÍDO'}
                  </button>
                </div>

                {/* MODAL WORKOUT NAV BAR (ONE HAND SLIDER CONTROL) */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      if (activeExerciseIdx > 0) {
                        saveGymExerciseProgress();
                        setActiveExerciseIdx(activeExerciseIdx - 1);
                      }
                    }}
                    disabled={activeExerciseIdx === 0}
                    className="h-14 bg-white/40 border border-white/55 text-text-main font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1 disabled:opacity-30 disabled:pointer-events-none active:scale-95"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>

                  <button
                    onClick={() => {
                      saveGymExerciseProgress();
                      if (activeExerciseIdx < selectedWorkout.exercises.length - 1) {
                        setActiveExerciseIdx(activeExerciseIdx + 1);
                      } else {
                        // End of loop, prompt finished
                        setGymMode(false);
                        alert("Parabéns Davi! Todos os aparelhos do dia visualizados. Lembre-se de registrar o treino!");
                      }
                    }}
                    className="h-14 bg-brand-blue text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1 active:scale-95"
                  >
                    {activeExerciseIdx === selectedWorkout.exercises.length - 1 ? 'Concluir Guia' : 'Próximo'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* INTEGRATED MINI TIMER ON ACADEMIA MODE FOR RESTING */}
                <div className="bg-slate-900/90 text-white p-4 rounded-3xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-white/50 block font-bold">Temporizador de Descanso</span>
                    <span className="text-xl font-mono font-black">{timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}` : '00:00'}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[30, 45, 60, 90].map(s => (
                      <button
                        key={s}
                        onClick={() => startPresetTimer(s)}
                        className="w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-90 text-[11px] font-extrabold rounded-lg transition-transform flex items-center justify-center"
                      >
                        {s}s
                      </button>
                    ))}
                    {timeLeft > 0 && (
                      <button
                        onClick={() => setTimeLeft(0)}
                        className="w-10 h-10 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 active:scale-90 transition-transform"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* ADVANCED TIMERS HUB */}
      {corpoTab === 'timer' && (
        <div className="space-y-4">
          <div className="glass-panel-blue rounded-[32px] p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] px-2.5 py-1 rounded-md uppercase tracking-wider block w-max">
                Hub de Descanso & Isometria
              </span>
              <h3 className="text-lg font-display font-black text-brand-blue pt-1">Rest & Focus Timer</h3>
              <p className="text-xs text-text-sec">Para gerenciar descansos de séries, prancha isométrica ou alongamentos.</p>
            </div>

            {/* General Timer Output Clock */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-950/90 backdrop-blur-md rounded-3xl border border-white/10 relative overflow-hidden text-white">
              {/* Radial background pulse if active */}
              {timerActive && (
                <div className="absolute inset-0 bg-radial-gradient from-blue-500/20 to-transparent pointer-events-none animate-pulse" />
              )}
              
              <div className="font-mono text-5xl font-black tracking-widest text-white relative z-10">
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
              <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-1 relative z-10">
                {timerActive ? 'Contagem Regressiva ativa...' : 'Temporizador Dormindo'}
              </span>

              {/* Progress bar inside clock panel */}
              {timerTotal > 0 && (
                <div className="w-[80%] bg-white/10 h-1 rounded-full overflow-hidden mt-4 relative z-10">
                  <div 
                    className="bg-brand-blue h-full transition-all duration-300"
                    style={{ width: `${(timeLeft / timerTotal) * 100}%` }}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 mt-5 relative z-10">
                <button
                  onClick={() => setTimerActive(!timerActive)}
                  disabled={timeLeft === 0}
                  className={`px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
                    timeLeft === 0 
                      ? 'bg-white/10 text-white/30 cursor-not-allowed'
                      : timerActive
                        ? 'bg-amber-600 text-white hover:bg-amber-700'
                        : 'bg-brand-blue text-white hover:bg-blue-600'
                  }`}
                >
                  {timerActive ? 'Pausar' : 'Iniciar'}
                </button>
                <button
                  onClick={() => { setTimerActive(false); setTimeLeft(0); setTimerTotal(0); }}
                  className="px-5 py-2.5 bg-white/10 border border-white/10 text-white rounded-full font-bold text-xs uppercase tracking-wider hover:bg-white/20 active:scale-95 transition-all"
                >
                  Zerar
                </button>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <span className="text-xs font-black text-text-sec uppercase tracking-wider block px-1">Padrões de Descanso</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 45, 60, 90].map(s => (
                  <button
                    key={s}
                    onClick={() => startPresetTimer(s)}
                    className="h-11 bg-white border border-white/55 text-text-main rounded-xl font-bold text-xs hover:border-brand-blue active:scale-95 transition-transform"
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Prancha Presets */}
            <div className="space-y-2">
              <span className="text-xs font-black text-text-sec uppercase tracking-wider block px-1">Isometria Prancha Treino</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[20, 25, 30, 40].map(s => (
                  <button
                    key={s}
                    onClick={() => startPresetTimer(s)}
                    className="h-11 bg-orange-500/10 border border-orange-500/20 text-orange-900 rounded-xl font-extrabold text-xs hover:bg-orange-500 hover:text-white active:scale-95 transition-all"
                  >
                    {s}s prancha
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex gap-2 items-center pt-2">
              <input
                type="number"
                placeholder="Segundos..."
                value={customSecs}
                onChange={handleCustomSecsChange}
                className="flex-1 h-11 px-3 rounded-xl bg-white/40 border border-white/55 text-xs font-extrabold focus:border-brand-blue focus:outline-none"
              />
              <button
                onClick={launchCustomTimer}
                className="h-11 px-4 bg-brand-blue text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform shadow-sm"
              >
                Ativar
              </button>
            </div>
          </div>

          {/* CARDIO COMPLETO CONTROLLER */}
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <div>
              <span className="text-[10px] font-bold bg-emerad-500/15 text-emerald-700 px-2.5 py-1 rounded-md uppercase tracking-wider block w-max bg-emerald-500/10">
                Aeróbicos Planejados
              </span>
              <h3 className="text-lg font-display font-black text-emerald-950 pt-1">Estação de Cardio</h3>
              <p className="text-xs text-text-sec">Acelere os batimentos com intervalos de tempos programados.</p>
            </div>

            {/* active cardio monitor */}
            {cardioRunning || cardioCurrentPhase === 'concluido' ? (
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-white/10 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity className="w-16 h-16 text-emerald-500 animate-bounce" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-widest text-[#10B981] font-bold">Roteiro Ativo:</span>
                  <h4 className="text-sm font-extrabold text-white">{cardioDescription}</h4>
                </div>

                <div className="py-4 text-center">
                  <div className="text-4xl font-mono font-black">{getCardioStatusDetails().timeLeftFormatted}</div>
                  <div className={`text-xs mt-2.5 font-black uppercase tracking-wider ${getCardioStatusDetails().phaseColor}`}>
                    {getCardioStatusDetails().currentPhase}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${getCardioStatusDetails().pctProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setCardioRunning(!cardioRunning)}
                    className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
                  >
                    {cardioRunning ? 'Pausar' : 'Retomar'}
                  </button>
                  <button
                    onClick={() => { setCardioRunning(false); setCardioCurrentPhase('countdown'); setCardioElapsedSec(0); }}
                    className="py-2.5 px-4 bg-red-600/90 text-white rounded-xl text-xs font-black uppercase tracking-wider active:scale-95 transition-transform"
                  >
                    Parar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => startCardioRoutine('terca')}
                  className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl flex justify-between items-center text-left active:scale-[0.98] transition-transform"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-brand-blue uppercase">HIIT Terça (12 min)</span>
                    <p className="text-[11px] text-text-sec">Acelera metabolismo: 2m leve + 1m moderado x4</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => startCardioRoutine('quinta')}
                  className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl flex justify-between items-center text-left active:scale-[0.98] transition-transform"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-brand-blue uppercase">HIIT Quinta (20 min)</span>
                    <p className="text-[11px] text-text-sec">Queima profunda: 3m confortável + 1m forte x5</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>

                <button
                  onClick={() => startCardioRoutine('sabado')}
                  className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl flex justify-between items-center text-left active:scale-[0.98] transition-transform"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-brand-blue uppercase">Countdown Sábado (10 min)</span>
                    <p className="text-[11px] text-text-sec">Aeróbico cronometrado mantendo ritmo fixo</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALTERNATIVE PLANS MODULE ("Movimento feito é melhor...") */}
      {corpoTab === 'planoMinimo' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-xs bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold block w-max border border-amber-500/15">
                SOS Baixa Energia
              </span>
              <h3 className="text-xl font-display font-black text-amber-950 pt-2">Plano Mínimo do Davi</h3>
              <p className="text-xs text-text-sec leading-relaxed leading-relaxed">
                Tem dias que a mente do colégio ou o cansaço pesam de verdade. Nesse momento, o ideal não é treinar até desabar, é evitar o zero! O movimento feito, mesmo menor, preserva o hábito.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                onClick={onPlanMinimoCompleted}
                className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl text-left active:scale-[0.98] transition-transform"
              >
                <h4 className="text-xs font-black uppercase text-brand-blue">🚲 Opção 1: 20 Min Pedal ou Caminhada</h4>
                <p className="text-[10px] text-text-sec mt-0.5">Eixo cardiorrespiratório leve sem peso, ouvindo podcast.</p>
              </button>

              <button
                onClick={onPlanMinimoCompleted}
                className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl text-left active:scale-[0.98] transition-transform"
              >
                <h4 className="text-xs font-black uppercase text-brand-blue">🦾 Opção 2: Fazer Apenas 3 Máquinas</h4>
                <p className="text-[10px] text-text-sec mt-0.5">Sem pressão por séries completas. Só a carga básica de aquecimento.</p>
              </button>

              <button
                onClick={onPlanMinimoCompleted}
                className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl text-left active:scale-[0.98] transition-transform"
              >
                <h4 className="text-xs font-black uppercase text-brand-blue">🧘 Opção 3: Mobilidade + Banho + Dormir cedo</h4>
                <p className="text-[10px] text-text-sec mt-0.5">Recuperação celular prioritária. Nada de celular na cama hoje.</p>
              </button>

              <button
                onClick={onPlanMinimoCompleted}
                className="p-4 bg-white/45 hover:bg-white/60 border border-white/50 rounded-2xl text-left active:scale-[0.98] transition-transform"
              >
                <h4 className="text-xs font-black uppercase text-brand-blue">🚪 Opção 4: Só de chegar na academia já conta!</h4>
                <p className="text-[10px] text-text-sec mt-0.5">Cravou a presença. É vencer a preguiça e registrar a constância.</p>
              </button>
            </div>

            <button
              onClick={onPlanMinimoCompleted}
              className="w-full h-12 bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl active:scale-95 transition-all shadow shadow-amber-500/10 mt-2"
            >
              Registrar Movimento Mínimo Feito!
            </button>
          </div>
        </div>
      )}

      {/* GYM TIMETABLE CLASSES */}
      {corpoTab === 'aulas' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold bg-[#3B82F6]/15 text-[#3B82F6] px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                Integração Coletiva
              </span>
              <h3 className="text-lg font-display font-black text-text-main pt-1">Grade de Aulas Coletivas</h3>
              <p className="text-xs text-text-sec">Aulas em grupo guiadas por instrutores como alternativas dinâmicas.</p>
            </div>

            <div className="bg-[#10B981]/10 text-[#047857] p-3.5 rounded-2xl text-xs border border-emerald-500/10 mb-2">
              <p className="font-extrabold leading-relaxed">
                “Se musculação pesar hoje, escolhe uma aula. Movimento feito é melhor que plano perfeito abandonado.”
              </p>
            </div>

            {/* Timetable listing */}
            <div className="space-y-2">
              {TIMETABLE_CLASSES.map((c, idx) => {
                const isToday = c.day === weekdayName;
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      onPlanMinimoCompleted();
                      alert(`Aula de ${c.name} registrada no histórico de hoje!`);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] ${
                      isToday 
                        ? 'border-brand-blue bg-blue-50/40 shadow-sm' 
                        : 'border-white/50 bg-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <span className="text-xs font-black text-text-main block">{c.name}</span>
                        <span className="text-[10px] text-text-sec font-semibold">{c.day} • {c.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isToday && (
                        <span className="text-[9px] bg-brand-blue text-white font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider block mr-1 animate-pulse">
                          Hoje
                        </span>
                      )}
                      <span className="text-[9px] bg-slate-100 text-text-sec font-black uppercase px-2 py-1 rounded-lg">
                        Marcar Aula
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* METRICS & WORKOUT HISTORY BACKUP SECTION */}
      {corpoTab === 'historico' && (
        <div className="space-y-4">
          
          {/* Daily metrics capture */}
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <div>
              <h3 className="text-lg font-display font-extrabold text-text-main">
                Acompanhamento Peso & Saúde
              </h3>
              <p className="text-xs text-text-sec">Apenas números para regulação corporal sem agressividade.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text-sec uppercase tracking-wider mb-1.5">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={pesoInput}
                  onChange={e => setPesoInput(e.target.value)}
                  placeholder="Ex: 95.0"
                  className="w-full h-12 px-4 rounded-xl border border-white/40 bg-white/20 text-text-main font-bold focus:outline-none focus:border-brand-blue text-center text-lg placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5c6579] uppercase tracking-wider mb-1.5">
                  Cintura (cm)
                </label>
                <input
                  type="number"
                  value={cinturaInput}
                  onChange={e => setCinturaInput(e.target.value)}
                  placeholder="Ex: 90"
                  className="w-full h-12 px-4 rounded-xl border border-white/40 bg-white/20 text-text-main font-bold focus:outline-none focus:border-brand-blue text-center text-lg placeholder-gray-400"
                />
              </div>
            </div>

            {/* Today energy level */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-text-sec uppercase tracking-wider">
                Nível de energia para treinar hoje
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((lvl) => {
                  const active = energiaInput === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEnergiaInput(lvl)}
                      className={`h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center transition-all ${
                        active
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'bg-white/30 border border-white/45 text-text-sec'
                      }`}
                    >
                      <Zap className={`w-4.5 h-4.5 ${active ? 'fill-white text-white' : 'text-text-sec/40'}`} />
                      <span className="text-[10px] mt-0.5">{lvl}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveMetrics}
              className="w-full h-12 bg-white/50 border border-white/55 text-text-main rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-white/70 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSaved ? "Métricas Salvas no Histórico!" : "Registrar Peso & Energia hoje"}
            </button>
          </div>

          {/* COMPRESSED COMPLETED LOGS DISPLAY */}
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-text-sec">Histórico de Treinos Feitos</h3>
            
            {Object.keys(completedWorkouts).length === 0 ? (
              <p className="text-xs text-text-sec leading-relaxed italic text-center py-4 bg-white/20 rounded-2xl border border-dashed border-gray-200">
                Ainda não há treinos registrados como concluídos.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                {Object.keys(completedWorkouts)
                  .sort((a,b) => b.localeCompare(a))
                  .map(date => {
                    const workout = completedWorkouts[date];
                    return (
                      <div key={date} className="p-3 bg-white/35 rounded-xl border border-white/40 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-extrabold text-text-main block">{workout.type}</span>
                          <span className="text-[10px] text-text-sec font-semibold">{date} • {workout.name || 'Concluído'}</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-md uppercase">
                          Cravado
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* BACKUPS DATA CONTROLLER */}
          <div className="glass-panel rounded-[32px] p-6 space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-text-sec">Gerenciamento & Backups</h3>
              <p className="text-[11px] text-text-sec">Exporte ou recupere cargas e dados em caso de troca de celular.</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportBackup}
                className="h-12 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Download className="w-4 h-4 text-white" />
                Backup JSON
              </button>

              <label className="h-12 bg-white/60 border border-white/65 hover:bg-white text-text-main rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer">
                <Upload className="w-4 h-4 text-text-sec" />
                Upload Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackupFile}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={onClearWorkoutData}
              className="w-full h-11 bg-red-100 border border-red-200 hover:bg-red-200 text-red-900 rounded-2xl text-[10px] font-black uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4 text-red-700" />
              Limpar dados de treinos antigos
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
