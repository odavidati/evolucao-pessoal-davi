/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyCheckIn {
  energia: number; // 1-5
  mente: number; // 1-5
  ansiedade: number; // 1-5
  sono: number; // 1-5
  corpo: number; // 1-5
}

export interface EssentialItems {
  corpo: boolean;
  casaMinima: boolean;
  presencaVicente: boolean;
}

export interface FilaTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface EstacionamentoItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface CustomChecklistItem {
  id: string;
  label: string;
  icon: string;
  checked: boolean;
  essential: boolean;
}

export interface BodyMetrics {
  peso: number;
  cintura: number;
  energia: number;
}

export interface CompraEspera {
  id: string;
  name: string;
  cost: number;
  category: 'necessidade' | 'desejo' | 'alivio';
  emotion: string;
  timestamp: string; // ISO string when wait started
  status: 'espera' | 'comprado' | 'desistido';
}

export interface LancamentoRapido {
  id: string;
  text: string; // "Gastei 28 com Uber"
  type: 'gasto' | 'entrada' | 'conta_paga' | 'espera';
  amount?: number;
  date: string;
}

export interface FechamentoDia {
  oQueFiz: string;
  ondePerdi: string;
  precisarSoltar: string;
  presencaComigo: boolean;
  presencaVicente: boolean;
  ficaAmanha: string;
  concluido: boolean;
}

export interface VidaHabitos {
  leitura: boolean;
  vicente: boolean;
  espiritualidade: boolean;
  cantoKaraoke: boolean;
  podcast: boolean;
  terapiaReflexao: boolean;
  descanso: boolean;
  casaMinima: boolean;
}

// Global App State to hold all properties synced to localStorage
export interface AppState {
  hasEnteredSplash: boolean;
  dailyCheckIns: Record<string, DailyCheckIn>; // key: yyyy-mm-dd
  dailyEssentials: Record<string, EssentialItems>; // key: yyyy-mm-dd
  dailyHabitosVida: Record<string, VidaHabitos>; // key: yyyy-mm-dd
  dailyMetrics: Record<string, BodyMetrics>; // key: yyyy-mm-dd
  dailyDomesticaCompleted: Record<string, boolean>; // key: yyyy-mm-dd
  fechamentos: Record<string, FechamentoDia>; // key: yyyy-mm-dd
  
  // Global App States (not saved per day)
  filaUnica: FilaTask[];
  estacionamento: EstacionamentoItem[];
  domesticaAtual: string; // E.g. "Tirar o lixo"
  checklistAtraso: CustomChecklistItem[];
  disponivelSeguro: number;
  dinheiroProtegido: number;
  comprasEspera: CompraEspera[];
  lancamentos: LancamentoRapido[];
  exerciseLogs?: Record<string, { completed: boolean; weight: string; notes: string }>; // key: yyyy-mm-dd_exerciseId
  completedWorkouts?: Record<string, { completed: boolean; type: string; name?: string }>; // key: yyyy-mm-dd
}
