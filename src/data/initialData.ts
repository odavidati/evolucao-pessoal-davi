import { CustomChecklistItem } from '../types';

export const DOMESTIC_TASKS = [
  "Tirar lixo e recicláveis",
  "Lavar o copo e talheres acumulados na louça",
  "Organizar roupa limpa ou esticar as toalhas",
  "Passar um lenço na bancada e superfícies",
  "Arrumar a cama para dar ordem ao quarto"
];

export interface DayBlock {
  start: string; // "05:00"
  end: string;   // "06:30"
  label: string; // "Manhã e saída"
  hint: string;  // Advice for that block
  icon: string;
}

export const DAY_BLOCKS: DayBlock[] = [
  { start: "05:00", end: "06:20", label: "Rotina Matinal", hint: "Banho, leitura rápida e café sem tela. Esse bloco define o tom do dia todo.", icon: "sunrise" },
  { start: "06:20", end: "07:00", label: "Deslocamento", hint: "Use o trajeto para ouvir um podcast ou simplesmente respirar. Não é hora de resolver problemas.", icon: "commute" },
  { start: "07:00", end: "13:00", label: "Guanella – Manhã", hint: "Foco total nas aulas. Nos intervalos, hidrate e descanse a mente — não abra o MEI agora.", icon: "school" },
  { start: "13:00", end: "14:20", label: "Almoço e Recarga", hint: "Coma devagar, longe da tela. Esse intervalo é combustível real para o segundo turno.", icon: "restaurant" },
  { start: "14:20", end: "16:20", label: "Guanella – Tarde", hint: "Segundo turno — você já está no ritmo. Mantenha o foco e deixe o MEI para depois das 18h.", icon: "school" },
  { start: "16:20", end: "17:00", label: "Deslocamento", hint: "Começa a transição mental. Pense em 1 coisa que quer resolver no MEI hoje à noite.", icon: "commute" },
  { start: "17:00", end: "18:00", label: "Academia", hint: "Troca de roupa imediatamente ao chegar. O treino limpa o stress da escola e prepara o cérebro pro MEI.", icon: "fitness_center" },
  { start: "18:00", end: "18:30", label: "Pausa Intencional", hint: "Entretenimento, livro ou podcast. Sem MEI ainda — esse intervalo evita o esgotamento noturno.", icon: "battery_charging_20" },
  { start: "18:30", end: "22:00", label: "Foco no MEI", hint: "Bloco nobre de 3h30 para o Job. Defina 1 entrega prioritária antes de começar e proteja esse tempo.", icon: "laptop_chromebook" },
  { start: "22:00", end: "23:30", label: "Vicente e Desacelerar", hint: "Presença real com Vicente. Guarde o celular e esteja disponível de verdade antes de dormir.", icon: "favorite" },
];

export function getActiveBlock(currentTimeStr: string): DayBlock | null {
  // Parse currentTimeStr "HH:MM"
  const [nowH, nowM] = currentTimeStr.split(':').map(Number);
  const nowInMinutes = nowH * 60 + nowM;

  for (const block of DAY_BLOCKS) {
    const [startH, startM] = block.start.split(':').map(Number);
    const [endH, endM] = block.end.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    const endInMinutes = endH * 60 + endM;

    // Check if within bounds
    if (nowInMinutes >= startInMinutes && nowInMinutes <= endInMinutes) {
      return block;
    }
  }

  return null;
}

export function getNextBlock(currentTimeStr: string): DayBlock | null {
  const [nowH, nowM] = currentTimeStr.split(':').map(Number);
  const nowInMinutes = nowH * 60 + nowM;

  let soonestNext: DayBlock | null = null;
  let soonestDiff = Infinity;

  for (const block of DAY_BLOCKS) {
    const [startH, startM] = block.start.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;

    if (startInMinutes > nowInMinutes) {
      const diff = startInMinutes - nowInMinutes;
      if (diff < soonestDiff) {
        soonestDiff = diff;
        soonestNext = block;
      }
    }
  }

  // Fallback to first block of tomorrow if we are past all blocks
  return soonestNext || DAY_BLOCKS[0];
}

export function getCorpoRecommendation(dayOfWeek: number): { title: string; subtitle: string; minOption: string } {
  // 0 is Sunday, 1 is Monday, etc.
  switch (dayOfWeek) {
    case 2: // Terça
      return {
        title: "Pump (19:15)",
        subtitle: "Aula dinâmica coletiva ou seu treino de máquinas focado.",
        minOption: "Plano mínimo: 20 min de esteira leve ou ir fazer só 1 bloco de exercícios."
      };
    case 4: // Quinta
      return {
        title: "Step (19:15) ou Pilates (20:15)",
        subtitle: "Aulas ótimas para queimar energia ou alongar profundamente.",
        minOption: "Plano mínimo: 20 min de caminhada ou alongamento em casa."
      };
    case 5: // Sexta
      return {
        title: "Fitdance (19:30) ou Funcional (18:30)",
        subtitle: "Liberar o estresse da semana dançando ou com exercícios dinâmicos.",
        minOption: "Plano mínimo: Ir até a academia só para caminhar ouvindo um bom podcast."
      };
    case 6: // Sábado
      return {
        title: "Treino Livre ou Caminhada",
        subtitle: "Dia perfeito para uma caminhada longa ao ar livre ou treino leve de recuperação.",
        minOption: "Plano mínimo: 15 minutos de mobilidade e alongamento leve na sala."
      };
    default: // Segunda, Quarta, Domingo
      return {
        title: "Descanso Ativo ou Caminhada",
        subtitle: "Deixe o corpo recuperar. Uma caminhada leve ou treino de máquinas bem moderado.",
        minOption: "Plano mínimo: Relaxamento consciente, banho quente e dormir cedo."
      };
  }
}

export const INITIAL_CHECKLIST_ATRASO: CustomChecklistItem[] = [
  { id: '1', label: 'Banhado e renovado', icon: 'shower', checked: false, essential: false },
  { id: '2', label: 'Roupa vestida', icon: 'checkroom', checked: false, essential: true },
  { id: '3', label: 'Café tomado sem pressa', icon: 'coffee', checked: false, essential: false },
  { id: '4', label: 'Mochila pronta', icon: 'backpack', checked: false, essential: false },
  { id: '5', label: 'Chaves na mão', icon: 'key', checked: false, essential: true },
  { id: '6', label: 'Carteira no bolso', icon: 'wallet', checked: false, essential: true },
  { id: '7', label: 'Garrafa de água cheia', icon: 'water_drop', checked: false, essential: true },
  { id: '8', label: 'Sair e trancar tudo', icon: 'door_open', checked: false, essential: true },
];
