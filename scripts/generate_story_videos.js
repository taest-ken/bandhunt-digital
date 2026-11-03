const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'assets', 'videos', 'stories');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Generate the transparent 720x1280 Story Overlay with Top & Bottom Text and @taest.club
async function createStoryOverlay() {
  const overlayPath = path.join(projectRoot, 'public', 'assets', 'videos', 'stories', 'story_overlay.png');
  
  const svg = `
  <svg width="720" height="1280" viewBox="0 0 720 1280" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.9" />
      </filter>
      <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#FF3B30" />
        <stop offset="50%" stop-color="#FF2E9A" />
        <stop offset="100%" stop-color="#E1306C" />
      </linearGradient>
    </defs>

    <!-- Top Headline: Show Fred Bombay's Actual Life -->
    <text x="360" y="270" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="url(#textGrad)" 
          stroke="#000000" 
          stroke-width="2.5" 
          text-anchor="middle" 
          filter="url(#drop-shadow)" 
          letter-spacing="0.5">
      Show Fred Bombay's Actual Life
    </text>

    <!-- Bottom Headline: Win tickets to watch him live -->
    <text x="360" y="990" 
          font-family="'Impact', 'Arial Black', sans-serif" 
          font-size="44" 
          font-weight="900" 
          fill="url(#textGrad)" 
          stroke="#000000" 
          stroke-width="2.5" 
          text-anchor="middle" 
          filter="url(#drop-shadow)" 
          letter-spacing="0.5">
      Win tickets to watch him live
    </text>

    <!-- Mention Tag: @taest.club -->
    <g transform="translate(260, 1030)">
      <rect x="0" y="0" width="200" height="40" rx="12" fill="#CFFF04" stroke="#1C1C1C" stroke-width="2.5" />
      <text x="100" y="26" 
            font-family="'Arial Black', sans-serif" 
            font-size="16" 
            font-weight="900" 
            fill="#1C1C1C" 
            text-anchor="middle" 
            letter-spacing="0.5">
        @taest.club
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(overlayPath);

  console.log('Created story overlay at:', overlayPath);
  return overlayPath;
}

// 2. Generate 9:16 Video for each Level
async function generateAllStories() {
  const overlayPath = await createStoryOverlay();

  const levelVideos = [
    { level: 1, file: 'andheri station.mp4' },
    { level: 2, file: 'paagal paan bhandaar bandra.mp4' },
    { level: 3, file: 'dadar flower mkt.mp4' },
    { level: 4, file: 'chor bazaar bhendi bazaar.mp4' },
    { level: 5, file: 'marine drive promenade.mp4' },
    { level: 6, file: 'asiatic society library.mp4' },
  ];

  for (const item of levelVideos) {
    const inputVideo = path.join(projectRoot, 'public', 'assets', 'videos', item.file);
    const outputFile = path.join(outputDir, `story_level_${item.level}.mp4`);

    console.log(`Processing Level ${item.level}: ${item.file}...`);

    // ffmpeg filter:
    // [1:v] scale=720:-2 [scaled];
    // [0:v][scaled] overlay=(W-w)/2:(H-h)/2 [with_vid];
    // [with_vid][2:v] overlay=0:0 [outv]
    const cmd = `ffmpeg -f lavfi -i color=c=black:s=720x1280:d=7 -i "${inputVideo}" -i "${overlayPath}" -filter_complex "[1:v]scale=720:-2[scaled];[0:v][scaled]overlay=(W-w)/2:(H-h)/2:shortest=1[with_vid];[with_vid][2:v]overlay=0:0[outv]" -map "[outv]" -map 1:a? -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 -c:a aac -b:a 128k -shortest -y "${outputFile}"`;

    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`✓ Completed Story for Level ${item.level} -> ${outputFile}`);
    } catch (err) {
      console.error(`Error generating story for Level ${item.level}:`, err.message);
    }
  }

  console.log('All 6 story templates generated successfully!');
}

generateAllStories().catch(console.error);
