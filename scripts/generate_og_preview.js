const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createOgPreview() {
  const width = 1200;
  const height = 630;

  // Read happy_fred and resize
  const happyFredPath = path.join(process.cwd(), 'public', 'assets', 'stickers', 'happy_fred_trimmed.png');
  const happyFredBuffer = await sharp(happyFredPath)
    .resize(320, null, { fit: 'inside' })
    .toBuffer();

  const headphonesPath = path.join(process.cwd(), 'public', 'assets', 'stickers', 'headphones_trimmed.png');
  const headphonesBuffer = await sharp(headphonesPath)
    .resize(120, null, { fit: 'inside' })
    .toBuffer();

  // Create SVG overlay for rich brutalist graphics
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="75%" cy="35%" r="70%">
          <stop offset="0%" stop-color="#1E163B" />
          <stop offset="60%" stop-color="#0C0E17" />
          <stop offset="100%" stop-color="#05060A" />
        </radialGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
        </pattern>
        <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="6" dy="6" stdDeviation="0" flood-color="#000000" />
        </filter>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
      <rect width="${width}" height="${height}" fill="url(#grid)" />

      <!-- Outer Brutalist Border -->
      <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="28" fill="none" stroke="#FFE600" stroke-width="5" />
      <rect x="26" y="26" width="${width - 52}" height="${height - 52}" rx="22" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" />

      <!-- Top Tag Row -->
      <g transform="translate(55, 60)">
        <!-- Brand Badge -->
        <rect x="0" y="0" width="310" height="42" rx="10" fill="#CFFF04" stroke="#1C1C1C" stroke-width="3" filter="url(#shadow)" />
        <text x="155" y="27" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" fill="#1C1C1C" text-anchor="middle" letter-spacing="1.5">
          FRED AGAIN.. ✕ TAEST.CLUB
        </text>

        <!-- Live Status Pill -->
        <rect x="330" y="0" width="190" height="42" rx="10" fill="#FF0040" stroke="#1C1C1C" stroke-width="3" filter="url(#shadow)" />
        <circle cx="350" cy="21" r="5" fill="#FFFFFF" />
        <text x="425" y="26" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">
          LIVE AUDIO HUNT
        </text>
      </g>

      <!-- Main Headline -->
      <g transform="translate(55, 175)">
        <text x="0" y="0" font-family="'Helvetica Neue', Arial, sans-serif" font-size="48" font-weight="900" fill="#FFFFFF" letter-spacing="-1">
          FRED’S INDIA TOUR
        </text>
        <text x="0" y="58" font-family="'Helvetica Neue', Arial, sans-serif" font-size="48" font-weight="900" fill="#FFE600" letter-spacing="-1">
          BEFORE THE INDIA TOUR
        </text>

        <!-- Subheading -->
        <text x="0" y="116" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="800" fill="#A5B4FC" letter-spacing="1">
          THE HITMAP // AN EPISODIC DIGITAL HUNT ACROSS MUMBAI
        </text>
      </g>

      <!-- Feature Badges -->
      <g transform="translate(55, 345)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="215" height="46" rx="12" fill="#1E1E2E" stroke="#CFFF04" stroke-width="2" />
        <text x="107" y="29" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          🎧 6 AUDIO LOCATIONS
        </text>

        <!-- Badge 2 -->
        <rect x="230" y="0" width="240" height="46" rx="12" fill="#1E1E2E" stroke="#FF2E9A" stroke-width="2" />
        <text x="350" y="29" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          🎟️ REAL CONCERT PASSES
        </text>

        <!-- Badge 3 -->
        <rect x="485" y="0" width="215" height="46" rx="12" fill="#1E1E2E" stroke="#00F0FF" stroke-width="2" />
        <text x="592" y="29" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          📍 PROXIMITY RADAR
        </text>
      </g>

      <!-- Bottom Bar -->
      <g transform="translate(55, 520)">
        <rect x="0" y="0" width="1090" height="52" rx="16" fill="#121624" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
        <text x="24" y="33" font-family="'Courier New', monospace" font-size="17" font-weight="900" fill="#CFFF04" letter-spacing="1">
          PLAY NOW ➔ bandhunt.taest.in
        </text>
        <text x="1066" y="33" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="800" fill="#E2E8F0" text-anchor="end" letter-spacing="1">
          MOVE FRED • FOLLOW THE BEAT • FIND THE BANDS
        </text>
      </g>

      <!-- Right Card Frame for Happy Fred -->
      <g transform="translate(790, 80)">
        <!-- Glow behind card -->
        <rect x="10" y="10" width="330" height="400" rx="24" fill="#5D00FF" opacity="0.3" filter="url(#glow)" />
        <!-- Card -->
        <rect x="0" y="0" width="330" height="400" rx="24" fill="#161926" stroke="#FFE600" stroke-width="3.5" filter="url(#shadow)" />
      </g>

      <!-- Floating Badge above Happy Fred (Zero Overlap) -->
      <g transform="translate(865, 52)">
        <rect x="0" y="0" width="245" height="36" rx="8" fill="#FFE600" stroke="#1C1C1C" stroke-width="2.5" filter="url(#shadow)" />
        <text x="122" y="23" font-family="'Helvetica Neue', Arial, sans-serif" font-size="12" font-weight="900" fill="#1C1C1C" text-anchor="middle" letter-spacing="1">
          ★ MUMBAI OFFLINE BANDHUNT
        </text>
      </g>
    </svg>
  `);

  // Composite the base with SVG and Happy Fred sticker
  const outputFilePath = path.join(process.cwd(), 'public', 'assets', 'og_preview.png');
  
  await sharp(svgOverlay)
    .composite([
      {
        input: happyFredBuffer,
        top: 105,
        left: 795,
      },
      {
        input: headphonesBuffer,
        top: 45,
        left: 735,
      }
    ])
    .png({ quality: 95 })
    .toFile(outputFilePath);

  console.log('Successfully generated og_preview.png at:', outputFilePath);
}

createOgPreview().catch(console.error);
