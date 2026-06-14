import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Minimalist, premium vector SVG representive of 'Evolução Pessoal' (personal growth, evolution)
const SVG_MARKUP = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient: Deep royal blue to sophisticated midnight navy -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0051DF" />
      <stop offset="45%" stop-color="#003DB7" />
      <stop offset="100%" stop-color="#04123F" />
    </linearGradient>

    <!-- Glowing golden amber gradient representing self-connection, success and warmth -->
    <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <!-- Sleek translucent glassmorphic white bar gradients representing rising stats/habits -->
    <linearGradient id="pillar-1" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.5" />
    </linearGradient>

    <linearGradient id="pillar-2" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.7" />
    </linearGradient>

    <linearGradient id="pillar-3" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.95" />
    </linearGradient>

    <!-- Filter for drop shadow -->
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>

  <!-- Complete square background for iOS/Android compliance, no-alpha border gaps -->
  <rect width="512" height="512" fill="url(#bg-grad)" />

  <!-- Subtle grid layout overlay mimicking self-improvement calendars & habits tracker -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1.5">
    <!-- Verticals -->
    <line x1="64" y1="0" x2="64" y2="512" />
    <line x1="128" y1="0" x2="128" y2="512" />
    <line x1="192" y1="0" x2="192" y2="512" />
    <line x1="256" y1="0" x2="256" y2="512" />
    <line x1="320" y1="0" x2="320" y2="512" />
    <line x1="384" y1="0" x2="384" y2="512" />
    <line x1="448" y1="0" x2="448" y2="512" />
    <!-- Horizontals -->
    <line x1="0" y1="64" x2="512" y2="64" />
    <line x1="0" y1="128" x2="512" y2="128" />
    <line x1="0" y1="192" x2="512" y2="192" />
    <line x1="0" y1="256" x2="512" y2="256" />
    <line x1="0" y1="320" x2="512" y2="320" />
    <line x1="0" y1="384" x2="512" y2="384" />
    <line x1="0" y1="448" x2="512" y2="448" />
  </g>

  <!-- Ambient Light glows around target -->
  <circle cx="340" cy="180" r="160" fill="#FBBF24" opacity="0.12" filter="blur(65px)" />
  <circle cx="170" cy="360" r="120" fill="#0051DF" opacity="0.35" filter="blur(55px)" />

  <!-- Inner Content Group - Margined gracefully for safe zone (Android/iOS) -->
  <g filter="url(#shadow)">
    <!-- Goal milestone (glowing amber sun and destination) -->
    <circle cx="340" cy="180" r="50" fill="url(#glow-grad)" />

    <!-- Sleek step-based columns of evolution rising towards the upper-right goal.
         We slightly tilt the columns for dynamic energy and speed -->
    <g transform="translate(45, 30) rotate(-10 256 256)">
      <!-- Step 1: Starting habits (low level) -->
      <rect x="130" y="300" width="40" height="90" rx="20" fill="url(#pillar-1)" />

      <!-- Step 2: Steady dedication (intermediate level) -->
      <rect x="195" y="210" width="44" height="180" rx="22" fill="url(#pillar-2)" />

      <!-- Step 3: Elite evolution (climax level pointing into the sun zone) -->
      <rect x="264" y="110" width="48" height="280" rx="24" fill="url(#pillar-3)" />

      <!-- Accent white light atop pinnacle pillar -->
      <circle cx="288" cy="110" r="10" fill="#FFFFFF" opacity="0.9" />
    </g>
  </g>
</svg>`;

async function main() {
  const outputDir = path.join(process.cwd(), 'public', 'icons');
  
  // Create folder 'public/icons' if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    console.log('Creating directory public/icons...');
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const svgBuffer = Buffer.from(SVG_MARKUP);

  const targets = [
    { name: 'icon-512.png', size: 512 },
    { name: 'icon-192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  for (const target of targets) {
    const targetPath = path.join(outputDir, target.name);
    console.log(`Generating ${target.name} (${target.size}x${target.size})...`);
    
    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png({ compressionLevel: 9 })
      .toFile(targetPath);
  }

  console.log('All premium PWA icons generated successfully!');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
