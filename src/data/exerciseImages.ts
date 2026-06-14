import abdominal_machine_crunch from '../assets/exercises/abdominal_machine_crunch.png';
import calf_raise from '../assets/exercises/calf_raise.png';
import chest_press from '../assets/exercises/chest_press.png';
import lat_pulldown from '../assets/exercises/lat_pulldown.png';
import leg_curl from '../assets/exercises/leg_curl.png';
import leg_extension from '../assets/exercises/leg_extension.png';
import leg_press_45 from '../assets/exercises/leg_press_45.png';
import seated_row from '../assets/exercises/seated_row.png';
import shoulder_press from '../assets/exercises/shoulder_press.png';
import triceps_rope from '../assets/exercises/triceps_rope.png';

// Mapa de IDs de exercício (usados no CorpoView) → imagem PNG local
export const EXERCISE_IMAGES: Record<string, string> = {
  // Treino X / Terça
  legpress: leg_press_45,
  latpulldown: lat_pulldown,
  chestpress: chest_press,
  mesaflexora: leg_curl,
  ombro_maquina: shoulder_press,

  // Treino Y / Quinta
  remada_sentada: seated_row,
  supino_chestdrop: chest_press,
  triceps_corda: triceps_rope,

  // Treino Z / Sábado
  extensora_sabado: leg_extension,
  flexora_sabado: leg_curl,
  panturrilha_maquina: calf_raise,
  puxada_sabado: lat_pulldown,
  chest_press_sabado: chest_press,
  abdominal_crunch_maquina: abdominal_machine_crunch,
};

// Helper: retorna a imagem local ou undefined se não houver
export function getLocalExerciseImage(exerciseId: string): string | undefined {
  return EXERCISE_IMAGES[exerciseId];
}

// SVG placeholders minimalistas para exercícios sem imagem dedicada (cardio, prancha, rosca)
function makeSvgPlaceholder(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#1E293B" rx="32"/>
    <circle cx="256" cy="190" r="72" fill="${color}" opacity="0.18"/>
    <circle cx="256" cy="170" r="28" fill="none" stroke="#E2E8F0" stroke-width="4"/>
    <path d="M256 198 L256 290 M256 235 L215 262 M256 235 L297 262 M256 290 L228 345 M256 290 L284 345"
      stroke="#E2E8F0" stroke-width="4" stroke-linecap="round" fill="none"/>
    <rect x="72" y="395" width="368" height="58" rx="14" fill="#0F172A" opacity="0.55"/>
    <text x="256" y="432" font-family="system-ui,sans-serif" font-size="22" font-weight="700"
      fill="${color}" text-anchor="middle">${label.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

export const EXERCISE_PLACEHOLDERS: Record<string, string> = {
  cardio_warmup: makeSvgPlaceholder('Cardio', '#06b6d4'),
  rosca_alternada: makeSvgPlaceholder('Rosca Alternada', '#ec4899'),
  prancha_quinta: makeSvgPlaceholder('Prancha', '#10b981'),
  abdominal_colchonete: makeSvgPlaceholder('Abdominal Chão', '#10b981'),
  prancha_sabado: makeSvgPlaceholder('Prancha', '#10b981'),
  dumbbells: makeSvgPlaceholder('Halteres', '#ec4899'),
  plank: makeSvgPlaceholder('Prancha', '#10b981'),
  mat: makeSvgPlaceholder('Colchonete', '#10b981'),
  cardio: makeSvgPlaceholder('Cardio', '#06b6d4'),
};
