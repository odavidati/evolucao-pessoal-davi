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
  {
    start: "05:00", end: "06:20", label: "Rotina Matinal", icon: "sunrise",
    hint: "Esse silêncio da manhã é seu. Enquanto o mundo dorme, você está construindo a versão de si mesmo que o Vicente vai se orgulhar de chamar de pai."
  },
  {
    start: "06:20", end: "07:00", label: "Deslocamento", icon: "commute",
    hint: "Você não está indo trabalhar — está indo construir o homem que quer ser. Use esse trajeto com intenção, não no piloto automático."
  },
  {
    start: "07:00", end: "13:00", label: "Guanella – Manhã", icon: "school",
    hint: "Você não é só um professor. Você é a referência que alguém vai carregar pela vida inteira. Apareça inteiro hoje — eles percebem quando você está presente de verdade."
  },
  {
    start: "13:00", end: "14:20", label: "Almoço e Recarga", icon: "restaurant",
    hint: "Atletas de elite sabem que a recuperação é parte do treino. Descanse sem culpa — você vai precisar do melhor de você no segundo turno."
  },
  {
    start: "14:20", end: "16:20", label: "Guanella – Tarde", icon: "school",
    hint: "A tarde é onde a consistência vence o talento. Você ainda está aqui, entregando, quando muitos já desistiram. Isso é caráter."
  },
  {
    start: "16:20", end: "17:00", label: "Deslocamento", icon: "commute",
    hint: "A escola ficou para trás. O MEI espera. Pense em 1 coisa que você quer entregar essa noite — só uma — e deixe o resto para amanhã."
  },
  {
    start: "17:00", end: "18:00", label: "Academia", icon: "fitness_center",
    hint: "Cada série é uma promessa que você cumpre consigo mesmo. O corpo forte que você está construindo é o mesmo que vai te dar energia para o MEI, para o Vicente, para tudo."
  },
  {
    start: "18:00", end: "18:30", label: "Pausa Intencional", icon: "battery_charging_20",
    hint: "Recarregue de verdade. Esses 30 minutos não são perda de tempo — são o que separa uma noite produtiva de uma noite de esforço sem resultado."
  },
  {
    start: "18:30", end: "22:00", label: "Foco no MEI", icon: "laptop_chromebook",
    hint: "Essas 3h30 são o investimento mais importante no seu futuro. O negócio que vai te dar liberdade — e dar ao Vicente um pai realizado — é construído aqui, nessas noites."
  },
  {
    start: "22:00", end: "23:30", label: "Vicente e Desacelerar", icon: "favorite",
    hint: "O Vicente não precisa do melhor profissional do mundo. Ele precisa de você — presente, aqui, agora. Guarda o celular. Esse momento não volta."
  },
];

export const WEEKEND_BLOCKS: DayBlock[] = [
  {
    start: "07:00", end: "09:00", label: "Manhã Tranquila", icon: "sunrise",
    hint: "A semana foi intensa. Esse silêncio de fim de semana é um presente. Use-o para ouvir o que o barulho da rotina costuma abafar."
  },
  {
    start: "09:00", end: "11:30", label: "Estudos / MEI", icon: "laptop_chromebook",
    hint: "O fim de semana que você usa para avançar enquanto o mundo descansa é o diferencial que você ainda não consegue ver — mas vai sentir nos resultados."
  },
  {
    start: "11:30", end: "13:00", label: "Casa e Organização", icon: "home",
    hint: "Ambiente arrumado é mente mais livre. Você está criando as condições externas para o seu melhor trabalho interno."
  },
  {
    start: "13:00", end: "15:00", label: "Almoço e Descanso", icon: "restaurant",
    hint: "Descanso intencional não é fraqueza — é a escolha de quem pensa a longo prazo. Você está jogando um jogo longo. Cuide do jogador."
  },
  {
    start: "15:00", end: "19:00", label: "Tempo Livre / Saídas", icon: "explore",
    hint: "Viva. Explore. Ria. Esse bloco recarrega o que nenhuma planilha de produtividade consegue. Uma vida boa não é só construída — é vivida."
  },
  {
    start: "19:00", end: "22:00", label: "Vicente e Família", icon: "favorite",
    hint: "No final, o Vicente não vai lembrar das conquistas. Ele vai lembrar se o pai estava presente. Esteja aqui de verdade — sem distrações."
  },
  {
    start: "22:00", end: "23:30", label: "Desacelerar", icon: "bedtime",
    hint: "Você chegou até aqui. Semana nova começa com você descansado. Prepare o corpo e a mente — o melhor ainda está por vir."
  },
];

export function getActiveBlock(currentTimeStr: string, blocks: DayBlock[] = DAY_BLOCKS): DayBlock | null {
  const [nowH, nowM] = currentTimeStr.split(':').map(Number);
  const nowInMinutes = nowH * 60 + nowM;
  for (const block of blocks) {
    const [startH, startM] = block.start.split(':').map(Number);
    const [endH, endM] = block.end.split(':').map(Number);
    if (nowInMinutes >= startH * 60 + startM && nowInMinutes <= endH * 60 + endM) {
      return block;
    }
  }
  return null;
}

export function getNextBlock(currentTimeStr: string, blocks: DayBlock[] = DAY_BLOCKS): DayBlock | null {
  const [nowH, nowM] = currentTimeStr.split(':').map(Number);
  const nowInMinutes = nowH * 60 + nowM;
  let soonestNext: DayBlock | null = null;
  let soonestDiff = Infinity;
  for (const block of blocks) {
    const [startH, startM] = block.start.split(':').map(Number);
    const startInMinutes = startH * 60 + startM;
    if (startInMinutes > nowInMinutes) {
      const diff = startInMinutes - nowInMinutes;
      if (diff < soonestDiff) { soonestDiff = diff; soonestNext = block; }
    }
  }
  return soonestNext || (blocks[0] ?? null);
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
