/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Dumbbell, Clock, DollarSign, Heart, LogOut, ArrowRight, BookOpen, AlertTriangle, Zap, Smartphone, X } from 'lucide-react';

import { AppState, DailyCheckIn, EssentialItems, CustomChecklistItem, BodyMetrics, FechamentoDia, VidaHabitos } from './types';
import { DOMESTIC_TASKS, INITIAL_CHECKLIST_ATRASO } from './data/initialData';

// Subcomponents
import SplashView from './components/SplashView';
import EstouPerdidoView from './components/EstouPerdidoView';
import ModoAtrasoView from './components/ModoAtrasoView';
import QueroComprarView from './components/QueroComprarView';
import LancamentoRapidoView from './components/LancamentoRapidoView';

// Nav Tab panels
import HojeView from './components/HojeView';
import CorpoView from './components/CorpoView';
import RotinaView from './components/RotinaView';
import DinheiroView from './components/DinheiroView';
import VidaView from './components/VidaView';

const STORAGE_KEY = 'evolucao_pessoal_davi_state_v1';

// Daily Default Templates
export const DEFAULT_DAILY_CHECKIN: DailyCheckIn = { energia: 3, mente: 3, ansiedade: 3, sono: 3, corpo: 3 };
export const DEFAULT_DAILY_ESSENTIALS: EssentialItems = { corpo: false, casaMinima: false, presencaVicente: false };
export const DEFAULT_DAILY_HABITOS: VidaHabitos = {
  leitura: false,
  vicente: false,
  espiritualidade: false,
  cantoKaraoke: false,
  podcast: false,
  terapiaReflexao: false,
  descanso: false,
  casaMinima: false
};
export const DEFAULT_DAILY_METRICS: BodyMetrics = { peso: 0, cintura: 0, energia: 4 };

const DEFAULT_STATE: AppState = {
  hasEnteredSplash: false,
  dailyCheckIns: {},
  dailyEssentials: {},
  dailyHabitosVida: {},
  dailyMetrics: {},
  dailyDomesticaCompleted: {},
  fechamentos: {},
  
  // Clean, empty globals as requested!
  filaUnica: [],
  estacionamento: [],
  domesticaAtual: "Tirar lixo e recicláveis",
  checklistAtraso: INITIAL_CHECKLIST_ATRASO,
  disponivelSeguro: 0.00,
  dinheiroProtegido: 0.00,
  comprasEspera: [],
  lancamentos: [],
  exerciseLogs: {},
  completedWorkouts: {}
};

// Simple helper to fetch today's date in yyyy-mm-dd format
function getTodayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Smart Financial parser recognizing values like: "28", "28,90", "28.90", "R$ 28,90"
export function parseMoneyValue(text: string): number | undefined {
  // Pattern extracts numbers possibly preceded by currency tags R$
  const pattern = /(?:R\$\s*)?(\d+(?:\s*\d+)*(?:[.,]\d+)?)/i;
  const match = text.match(pattern);
  if (match) {
    let numStr = match[1].replace(/\s/g, ''); // strip spacing
    // Replace comma decimals with periods
    numStr = numStr.replace(',', '.');
    const parsed = parseFloat(numStr);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

export default function App() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [activeTab, setActiveTab] = useState<'hoje' | 'corpo' | 'rotina' | 'dinheiro' | 'vida'>('hoje');
  
  // Overlay flows (Hiding standard nav tabs when active)
  const [activeOverlay, setActiveOverlay] = useState<
    'lost' | 'atraso' | 'comprar' | 'lancamento' | null
  >(null);

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: 'success' | 'info' | 'warning' | 'error' }>>([]);
  const [pendingConfirmAction, setPendingConfirmAction] = useState<'reset' | 'clearWorkout' | null>(null);
  const [showPwaTip, setShowPwaTip] = useState(() => {
    try { return !localStorage.getItem('pwa_tip_dismissed'); } catch { return true; }
  });

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = String(Date.now() + Math.random());
    setToasts(prev => [...prev, { id, message, type }].slice(-2)); // Keep at most 2 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Helper date variable
  const today = getTodayString();

  // Load from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        
        // Safe, backward-compatible migration logic:
        const migratedDailyCheckIns = parsed.dailyCheckIns || (parsed.checkIn ? { [today]: parsed.checkIn } : {});
        const migratedDailyEssentials = parsed.dailyEssentials || (parsed.essentials ? { [today]: parsed.essentials } : {});
        const migratedDailyHabitosVida = parsed.dailyHabitosVida || (parsed.habitosVida ? { [today]: parsed.habitosVida } : {});
        const migratedDailyMetrics = parsed.dailyMetrics || (parsed.metrics ? { [today]: parsed.metrics } : {});
        const migratedDailyDomesticaCompleted = parsed.dailyDomesticaCompleted || (parsed.domesticaCompleted !== undefined ? { [today]: parsed.domesticaCompleted } : {});

        setState({
          ...DEFAULT_STATE,
          ...parsed,
          dailyCheckIns: migratedDailyCheckIns,
          dailyEssentials: migratedDailyEssentials,
          dailyHabitosVida: migratedDailyHabitosVida,
          dailyMetrics: migratedDailyMetrics,
          dailyDomesticaCompleted: migratedDailyDomesticaCompleted,
          fechamentos: parsed.fechamentos || DEFAULT_STATE.fechamentos,
          filaUnica: parsed.filaUnica || DEFAULT_STATE.filaUnica,
          estacionamento: parsed.estacionamento || DEFAULT_STATE.estacionamento,
          checklistAtraso: parsed.checklistAtraso || DEFAULT_STATE.checklistAtraso,
          comprasEspera: parsed.comprasEspera || DEFAULT_STATE.comprasEspera,
          lancamentos: parsed.lancamentos || DEFAULT_STATE.lancamentos,
          exerciseLogs: parsed.exerciseLogs || {},
          completedWorkouts: parsed.completedWorkouts || {}
        });
      }
    } catch (e) {
      console.error("Erro carregando o localStorage", e);
    }
  }, []);

  // Save to local storage
  const updateState = (updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (err) {
        console.error("Erro salvando local storage", err);
      }
      return next;
    });
  };

  // Splash logic
  const handleEnterSplash = () => {
    updateState(prev => ({ ...prev, hasEnteredSplash: true }));
  };

  const handleResetApp = () => {
    setPendingConfirmAction('reset');
  };

  const handleConfirmAction = () => {
    if (pendingConfirmAction === 'reset') {
      localStorage.removeItem(STORAGE_KEY);
      setState({ ...DEFAULT_STATE, hasEnteredSplash: false });
      setActiveTab('hoje');
      setActiveOverlay(null);
      showToast("Dados resetados para o padrão limpo.", "info");
    } else if (pendingConfirmAction === 'clearWorkout') {
      updateState(prev => ({ ...prev, exerciseLogs: {}, completedWorkouts: {} }));
      showToast("Histórico de treino limpo com segurança.", "info");
    }
    setPendingConfirmAction(null);
  };

  // Resolving specific daily elements
  const currentCheckIn = state.dailyCheckIns[today] ?? DEFAULT_DAILY_CHECKIN;
  const currentEssentials = state.dailyEssentials[today] ?? DEFAULT_DAILY_ESSENTIALS;
  const currentHabitosVida = state.dailyHabitosVida[today] ?? DEFAULT_DAILY_HABITOS;
  const currentMetrics = state.dailyMetrics[today] ?? DEFAULT_DAILY_METRICS;
  const currentDomesticaCompleted = state.dailyDomesticaCompleted[today] ?? false;

  // Metric updates (Check-in rápido)
  const handleUpdateCheckIn = (category: keyof DailyCheckIn, val: number) => {
    updateState(prev => {
      const todayRecord = prev.dailyCheckIns[today] ?? DEFAULT_DAILY_CHECKIN;
      return {
        ...prev,
        dailyCheckIns: {
          ...prev.dailyCheckIns,
          [today]: {
            ...todayRecord,
            [category]: val
          }
        }
      };
    });
  };

  // Essential trackers
  const handleToggleEssential = (key: keyof EssentialItems) => {
    updateState(prev => {
      const todayRecord = prev.dailyEssentials[today] ?? DEFAULT_DAILY_ESSENTIALS;
      return {
        ...prev,
        dailyEssentials: {
          ...prev.dailyEssentials,
          [today]: {
            ...todayRecord,
            [key]: !todayRecord[key]
          }
        }
      };
    });
  };

  // Fila Única task managers
  const handleAddFilaTask = (title: string) => {
    updateState(prev => ({
      ...prev,
      filaUnica: [
        ...prev.filaUnica,
        { id: String(Date.now()), title, completed: false }
      ]
    }));
    showToast("Adicionado à Fila Única.");
  };

  const handleToggleFilaTask = (id: string) => {
    updateState(prev => ({
      ...prev,
      filaUnica: prev.filaUnica.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const handleClearFilaCompleted = () => {
    updateState(prev => ({
      ...prev,
      filaUnica: prev.filaUnica.filter(t => !t.completed)
    }));
  };

  // Estacionamento Mental helpers
  const handleAddEstacionamento = (text: string) => {
    updateState(prev => ({
      ...prev,
      estacionamento: [
        ...prev.estacionamento,
        { id: String(Date.now()), text, createdAt: new Date().toISOString() }
      ]
    }));
    showToast("Isso fica arquivado. Tire do pensamento.", "info");
  };

  const handleRemoveEstacionamento = (id: string) => {
    updateState(prev => ({
      ...prev,
      estacionamento: prev.estacionamento.filter(i => i.id !== id)
    }));
  };

  // Domesticas checklist (daily)
  const handleRotateDomestica = () => {
    const currentIndex = DOMESTIC_TASKS.indexOf(state.domesticaAtual);
    const nextIndex = (currentIndex + 1) % DOMESTIC_TASKS.length;
    updateState(prev => {
      return {
        ...prev,
        domesticaAtual: DOMESTIC_TASKS[nextIndex],
        dailyDomesticaCompleted: {
          ...prev.dailyDomesticaCompleted,
          [today]: false
        }
      };
    });
  };

  const handleToggleDomestica = () => {
    updateState(prev => {
      const previousDone = prev.dailyDomesticaCompleted[today] ?? false;
      const nextDone = !previousDone;
      const currentEssentialsRecord = prev.dailyEssentials[today] ?? DEFAULT_DAILY_ESSENTIALS;
      
      return {
        ...prev,
        dailyDomesticaCompleted: {
          ...prev.dailyDomesticaCompleted,
          [today]: nextDone
        },
        // Sync with the 3 essentials checkbox triggers
        dailyEssentials: {
          ...prev.dailyEssentials,
          [today]: {
            ...currentEssentialsRecord,
            casaMinima: nextDone
          }
        }
      };
    });
  };

  // Atraso checklists
  const handleToggleChecklistAtraso = (id: string) => {
    updateState(prev => ({
      ...prev,
      checklistAtraso: prev.checklistAtraso.map(c => c.id === id ? { ...c, checked: !c.checked } : c)
    }));
  };

  const handleSetOnlyEssentialsAtraso = () => {
    updateState(prev => ({
      ...prev,
      checklistAtraso: prev.checklistAtraso.map(c => ({
        ...c,
        checked: c.essential // Force only essentials checked
      }))
    }));
    showToast("Foco total no essencial para sair agora!", "info");
  };

  // Update metrics (daily)
  const handleUpdateMetrics = (peso: number, cintura: number, energia: number) => {
    updateState(prev => {
      return {
        ...prev,
        dailyMetrics: {
          ...prev.dailyMetrics,
          [today]: { peso, cintura, energia }
        }
      };
    });
  };

  const handlePlanMinimoCompleted = () => {
    updateState(prev => {
      const currentRecord = prev.dailyEssentials[today] ?? DEFAULT_DAILY_ESSENTIALS;
      return {
        ...prev,
        dailyEssentials: {
          ...prev.dailyEssentials,
          [today]: {
            ...currentRecord,
            corpo: true
          }
        }
      };
    });
    showToast("Plano mínimo registrado. Cada passo conta!", "success");
  };

  const handleUpdateExerciseLog = (exerciseId: string, log: { completed: boolean; weight: string; notes: string }) => {
    updateState(prev => {
      const logs = prev.exerciseLogs || {};
      return {
        ...prev,
        exerciseLogs: {
          ...logs,
          [`${today}_${exerciseId}`]: log
        }
      };
    });
  };

  const handleCompleteWorkout = (type: string, name?: string) => {
    updateState(prev => {
      const workouts = prev.completedWorkouts || {};
      return {
        ...prev,
        completedWorkouts: {
          ...workouts,
          [today]: { completed: true, type, name }
        }
      };
    });
    showToast("Treino concluído com êxito! Registro arquivado.", "success");
  };

  const handleClearWorkoutData = () => {
    setPendingConfirmAction('clearWorkout');
  };

  const handleImportState = (newState: AppState) => {
    setState(newState);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      showToast("Dados recuperados via backup com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao importar dados.", "error");
    }
  };

  // Money triggers
  const handleSetDisponivelSeguro = (amount: number) => {
    updateState(prev => ({
      ...prev,
      disponivelSeguro: amount
    }));
  };

  const handleAddCompraEspera = (name: string, cost: number, category: 'necessidade' | 'desejo' | 'alivio', emotion: string, wait24h: boolean) => {
    updateState(prev => {
      const newWaitItem = {
        id: String(Date.now()),
        name,
        cost,
        category,
        emotion,
        timestamp: new Date().toISOString(),
        status: 'espera' as const
      };

      const nextWaitList = wait24h ? [...prev.comprasEspera, newWaitItem] : prev.comprasEspera;
      const nextLancamentos = [
        {
          id: String(Date.now() + 1),
          text: `Espera: ${name} (R$ ${cost.toFixed(2)})`,
          type: 'espera' as const,
          amount: cost,
          date: getTodayString()
        },
        ...prev.lancamentos
      ];

      return {
        ...prev,
        comprasEspera: nextWaitList,
        lancamentos: nextLancamentos
      };
    });
    if (wait24h) {
      showToast("Item enviado para espera de 24h.", "info");
    } else {
      showToast("Compra planejada adicionada.");
    }
  };

  const handleAddDinheiroProtegido = (amount: number) => {
    updateState(prev => ({
      ...prev,
      dinheiroProtegido: prev.dinheiroProtegido + amount
    }));
    showToast("Gasto evitado! Orçamento protegido.");
  };

  const handleResolveCompraEspera = (id: string, action: 'comprado' | 'desistido') => {
    updateState(prev => {
      const item = prev.comprasEspera.find(c => c.id === id);
      const nextList = prev.comprasEspera.filter(c => c.id !== id);
      
      let protectedAdded = 0;
      let balanceUpdated = prev.disponivelSeguro;

      if (action === 'desistido' && item) {
        protectedAdded = item.cost;
      } else if (action === 'comprado' && item) {
        balanceUpdated -= item.cost;
      }

      // Add fresh log history entry
      const logText = action === 'desistido'
        ? `Resistiu: Desistiu de ${item?.name}`
        : `Comprou após espera: ${item?.name}`;

      const log = {
        id: String(Date.now()),
        text: logText,
        type: action === 'desistido' ? ('espera' as const) : ('gasto' as const),
        amount: item?.cost || 0,
        date: getTodayString()
      };

      return {
        ...prev,
        comprasEspera: nextList,
        dinheiroProtegido: prev.dinheiroProtegido + protectedAdded,
        disponivelSeguro: balanceUpdated,
        lancamentos: [log, ...prev.lancamentos]
      };
    });
    
    if (action === 'desistido') {
      showToast("Dinamismo mental! Foco no que importa.");
    } else {
      showToast("Lançamento resolvido com sucesso.");
    }
  };

  const handleAddLancamento = (text: string, type: 'gasto' | 'entrada' | 'conta_paga' | 'espera') => {
    updateState(prev => {
      const detectedAmount = parseMoneyValue(text);

      let nextDisponivel = prev.disponivelSeguro;
      let nextProtegido = prev.dinheiroProtegido;

      if (detectedAmount) {
        if (type === 'gasto' || type === 'conta_paga') {
          nextDisponivel -= detectedAmount;
        } else if (type === 'entrada') {
          nextDisponivel += detectedAmount;
        } else if (type === 'espera') {
          nextProtegido += detectedAmount;
        }
      }

      const newLan = {
        id: String(Date.now()),
        text,
        type,
        amount: detectedAmount,
        date: getTodayString()
      };

      return {
        ...prev,
        lancamentos: [newLan, ...prev.lancamentos],
        disponivelSeguro: nextDisponivel,
        dinheiroProtegido: nextProtegido
      };
    });
    showToast("Lançamento salvo.", "success");
  };

  // Night reflection closure questions
  const handleUpdateFechamento = (field: keyof FechamentoDia, val: any) => {
    const todayStr = getTodayString();
    updateState(prev => {
      const previousToday = prev.fechamentos[todayStr] ?? {
        oQueFiz: "",
        ondePerdi: "",
        precisarSoltar: "",
        presencaComigo: false,
        presencaVicente: false,
        ficaAmanha: "",
        concluido: false
      };

      return {
        ...prev,
        fechamentos: {
          ...prev.fechamentos,
          [todayStr]: {
            ...previousToday,
            [field]: val
          }
        }
      };
    });
  };

  const handleToggleHabito = (key: keyof VidaHabitos) => {
    updateState(prev => {
      const todayRecord = prev.dailyHabitosVida[today] ?? DEFAULT_DAILY_HABITOS;
      return {
        ...prev,
        dailyHabitosVida: {
          ...prev.dailyHabitosVida,
          [today]: {
            ...todayRecord,
            [key]: !todayRecord[key]
          }
        }
      };
    });
  };

  const handleDesconectarSave = () => {
    const todayStr = getTodayString();
    updateState(prev => {
      const todayFile = prev.fechamentos[todayStr] ?? {
        oQueFiz: "",
        ondePerdi: "",
        precisarSoltar: "",
        presencaComigo: false,
        presencaVicente: false,
        ficaAmanha: "",
        concluido: false
      };

      return {
        ...prev,
        fechamentos: {
          ...prev.fechamentos,
          [todayStr]: {
            ...todayFile,
            concluido: true
          }
        }
      };
    });
    showToast("Dia encerrado. Descanse com leveza.", "success");
  };

  // Retrieve today's closures
  const todayStr = getTodayString();
  const fechamentoHojeParsed = state.fechamentos[todayStr] ?? {
    oQueFiz: "",
    ondePerdi: "",
    precisarSoltar: "",
    presencaComigo: false,
    presencaVicente: false,
    ficaAmanha: "",
    concluido: false
  };

  // Intercept for SOS overlays
  if (activeOverlay === 'lost') {
    return (
      <EstouPerdidoView
        onBack={() => setActiveOverlay(null)}
        onOpenModoAtraso={() => setActiveOverlay('atraso')}
        onOpenQueroComprar={() => setActiveOverlay('comprar')}
        onOpenDescarregarCabeca={() => {
          setActiveOverlay(null);
          setActiveTab('rotina');
        }}
        onOpenFilaUnica={() => {
          setActiveOverlay(null);
          setActiveTab('rotina');
        }}
        onCompletePlanMinimo={handlePlanMinimoCompleted}
      />
    );
  }

  if (activeOverlay === 'atraso') {
    return (
      <ModoAtrasoView
        checklist={state.checklistAtraso}
        onToggleItem={handleToggleChecklistAtraso}
        onSetOnlyEssentials={handleSetOnlyEssentialsAtraso}
        onSairAgora={(msg) => showToast("Vai agora! O resto fica para depois. Foco no caminho!", "warning")}
        onBack={() => setActiveOverlay(null)}
      />
    );
  }

  if (activeOverlay === 'comprar') {
    return (
      <QueroComprarView
        onAddCompraEspera={handleAddCompraEspera}
        onAddDinheiroProtegido={handleAddDinheiroProtegido}
        onBack={() => setActiveOverlay(null)}
        showToast={showToast}
      />
    );
  }

  if (activeOverlay === 'lancamento') {
    return (
      <LancamentoRapidoView
        onAddLancamento={handleAddLancamento}
        onBack={() => setActiveOverlay(null)}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#E2E8F0] via-[#F1F5F9] to-[#E2E8F0] text-text-main flex justify-center antialiased relative">
      
      {/* Toast notifications container inside custom iOS styling */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="pointer-events-auto bg-slate-900/95 backdrop-blur-md px-4.5 py-3 rounded-2xl border border-white/10 shadow-xl flex items-center justify-between gap-3 text-white"
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  toast.type === 'error' ? 'bg-red-500' :
                  toast.type === 'warning' ? 'bg-amber-500' :
                  toast.type === 'info' ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'
                }`} />
                <span className="text-xs font-semibold tracking-tight text-white">{toast.message}</span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-white/40 hover:text-white/80 text-[10px] uppercase font-bold tracking-wider"
              >
                fechar
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Inline confirmation dialog */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 bg-black/25 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-text-main text-lg">
              {pendingConfirmAction === 'reset' ? 'Zerar todos os dados?' : 'Apagar histórico de treinos?'}
            </h3>
            <p className="text-sm text-text-sec">
              {pendingConfirmAction === 'reset'
                ? 'Esta ação é irreversível. Todos os seus dados locais serão perdidos.'
                : 'Histórico de exercícios e cargas serão perdidos permanentemente.'}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPendingConfirmAction(null)}
                className="h-12 rounded-2xl border border-gray-200 font-bold text-sm text-text-main bg-white active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="h-12 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Background colorful glowing blur circles (blobs) matching high-fidelity Frosted Glass */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-20 w-[350px] h-[350px] rounded-full bg-brand-blue/12 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] -right-20 w-[400px] h-[400px] rounded-full bg-brand-purple/12 blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[45%] left-[25%] w-[180px] h-[180px] rounded-full bg-brand-green/8 blur-[90px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[320px] h-[320px] rounded-full bg-brand-amber/10 blur-[115px]" />
      </div>

      {/* Mobile-first centered containment container with glass pane background */}
      <div className="w-full max-w-md bg-white/45 backdrop-blur-[32px] border-x border-white/40 min-h-screen flex flex-col relative shadow-[0_0_60px_rgba(12,27,55,0.08)] px-6 z-10">
        
        {/* Top bar with mini avatar logo and settings controller updated with transparent frosted rules */}
        <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-white/40 backdrop-blur-[24px] z-40 h-16 px-6 flex items-center justify-between border-b border-white/20">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/60 border border-white/50 flex items-center justify-center text-brand-blue shadow-inner shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-base font-display font-black text-text-main tracking-tight">
              Evolução Pessoal
            </h1>
          </div>
          
          <button
            onClick={handleResetApp}
            className="p-2 text-text-sec opacity-75 hover:opacity-100 active:scale-90 transition-transform h-10 w-10 flex items-center justify-center bg-white/50 border border-white/40 rounded-xl"
            title="Resetar dados do App"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Dynamic Nav Tabs Core Router Container */}
        <main className="flex-1 pt-24 pb-20 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {activeTab === 'hoje' && (
                <HojeView
                  checkIn={currentCheckIn}
                  onUpdateCheckIn={handleUpdateCheckIn}
                  essentials={currentEssentials}
                  onToggleEssential={handleToggleEssential}
                  onOpenEstouPerdido={() => setActiveOverlay('lost')}
                  domesticaAtual={state.domesticaAtual}
                />
              )}
              {activeTab === 'corpo' && (
                <CorpoView
                  metrics={currentMetrics}
                  onUpdateMetrics={handleUpdateMetrics}
                  onPlanMinimoCompleted={handlePlanMinimoCompleted}
                  exerciseLogs={state.exerciseLogs || {}}
                  completedWorkouts={state.completedWorkouts || {}}
                  onUpdateExerciseLog={handleUpdateExerciseLog}
                  onCompleteWorkout={handleCompleteWorkout}
                  onClearWorkoutData={handleClearWorkoutData}
                  onImportState={handleImportState}
                  fullState={state}
                />
              )}
              {activeTab === 'rotina' && (
                <RotinaView
                  filaUnica={state.filaUnica}
                  onAddFilaTask={handleAddFilaTask}
                  onToggleFilaTask={handleToggleFilaTask}
                  onClearFilaCompleted={handleClearFilaCompleted}
                  estacionamento={state.estacionamento}
                  onAddEstacionamento={handleAddEstacionamento}
                  onRemoveEstacionamento={handleRemoveEstacionamento}
                  domesticaCompleted={currentDomesticaCompleted}
                  domesticaAtual={state.domesticaAtual}
                  onToggleDomestica={handleToggleDomestica}
                  onRotateDomestica={handleRotateDomestica}
                  onOpenModoAtraso={() => setActiveOverlay('atraso')}
                  onOpenEstouPerdido={() => setActiveOverlay('lost')}
                />
              )}
              {activeTab === 'dinheiro' && (
                <DinheiroView
                  disponivelSeguro={state.disponivelSeguro}
                  dinheiroProtegido={state.dinheiroProtegido}
                  comprasEspera={state.comprasEspera}
                  lancamentos={state.lancamentos}
                  onSetDisponivelSeguro={handleSetDisponivelSeguro}
                  onOpenQueroComprar={() => setActiveOverlay('comprar')}
                  onOpenLancamentoRapido={() => setActiveOverlay('lancamento')}
                  onResolveCompraEspera={handleResolveCompraEspera}
                  showToast={showToast}
                />
              )}
              {activeTab === 'vida' && (
                <VidaView
                  fechamentoHoje={fechamentoHojeParsed}
                  onUpdateFechamento={handleUpdateFechamento}
                  habitos={currentHabitosVida}
                  onToggleHabito={handleToggleHabito}
                  onDesconectarSave={handleDesconectarSave}
                  dailyHabitosVida={state.dailyHabitosVida}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Floating Bottom Safari IOS Premium Navigator Bar with translucent body */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/35 backdrop-blur-[24px] h-20 pt-1 pb-safe-area-bottom px-4 border-t border-white/20 flex justify-around items-center rounded-t-[32px] shadow-[0_-8px_32px_rgba(12,27,55,0.06)] z-40">
          
          {/* Hoje */}
          <button
            onClick={() => setActiveTab('hoje')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-all ${
              activeTab === 'hoje' ? 'text-brand-blue bg-white/60 shadow-sm border border-white/55 font-extrabold' : 'text-text-sec opacity-70'
            }`}
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Hoje</span>
          </button>

          {/* Corpo */}
          <button
            onClick={() => setActiveTab('corpo')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-all ${
              activeTab === 'corpo' ? 'text-brand-blue bg-white/60 shadow-sm border border-white/55 font-extrabold' : 'text-text-sec opacity-70'
            }`}
          >
            <Dumbbell className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Corpo</span>
          </button>

          {/* Rotina */}
          <button
            onClick={() => setActiveTab('rotina')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-all ${
              activeTab === 'rotina' ? 'text-brand-blue bg-white/60 shadow-sm border border-white/55 font-extrabold' : 'text-text-sec opacity-70'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Rotina</span>
          </button>

          {/* Dinheiro */}
          <button
            onClick={() => setActiveTab('dinheiro')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-all ${
              activeTab === 'dinheiro' ? 'text-brand-blue bg-white/60 shadow-sm border border-white/55 font-extrabold' : 'text-text-sec opacity-70'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Dinheiro</span>
          </button>

          {/* Vida */}
          <button
            onClick={() => setActiveTab('vida')}
            className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl active:scale-90 transition-all ${
              activeTab === 'vida' ? 'text-brand-blue bg-white/60 shadow-sm border border-white/55 font-extrabold' : 'text-text-sec opacity-70'
            }`}
          >
            <Heart className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">Vida</span>
          </button>

        </nav>

        {/* PWA Installation tooltip — shown once, dismissible */}
        {showPwaTip && (
          <div className="absolute top-[72px] right-2 bg-text-main text-white text-[10px] py-1.5 px-3 rounded-xl z-30 opacity-90 flex items-center gap-2 shadow-md max-w-[220px]">
            <Smartphone className="w-3 h-3 shrink-0" />
            <span>Safari → Compartilhar → Tela de Início</span>
            <button
              onClick={() => {
                try { localStorage.setItem('pwa_tip_dismissed', '1'); } catch {}
                setShowPwaTip(false);
              }}
              className="ml-1 opacity-70 hover:opacity-100 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
