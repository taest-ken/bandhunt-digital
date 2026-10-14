import { TourNode } from "@/types/hitmap";
import { calculateHaversineDistance } from "@/lib/geo/distance";

// Generously padded bounding box around Mumbai metropolitan region (comfortable bounds)
export const MUMBAI_BOUNDS: [[number, number], [number, number]] = [
  [72.6500, 18.7500], // Southwest (Arabian Sea / Alibaug buffer)
  [73.1500, 19.4500], // Northeast (Thane / Navi Mumbai / Borivali buffer)
];

// Diverse candidate landmass spawn zones in Mumbai
const MUMBAI_LAND_ZONES: Array<{ name: string; coord: [number, number] }> = [
  { name: "Colaba / Gateway", coord: [72.8347, 18.9220] },
  { name: "Fort / CST", coord: [72.8358, 18.9400] },
  { name: "Nariman Point", coord: [72.8220, 18.9270] },
  { name: "Worli Sea Face", coord: [72.8160, 19.0060] },
  { name: "Shivaji Park / Dadar West", coord: [72.8380, 19.0260] },
  { name: "Bandra Reclamation", coord: [72.8250, 19.0430] },
  { name: "Khar Danda", coord: [72.8280, 19.0720] },
  { name: "Santacruz East / Vakola", coord: [72.8550, 19.0820] },
  { name: "Juhu Tara Rd", coord: [72.8260, 19.0980] },
  { name: "Versova Village", coord: [72.8120, 19.1350] },
  { name: "Kurla West", coord: [72.8750, 19.0680] },
  { name: "Chembur Diamond Garden", coord: [72.8980, 19.0550] },
  { name: "Ghatkopar West", coord: [72.9050, 19.0920] },
];

/**
 * Returns a randomized safe spawn location inside Mumbai
 * Guaranteed to be at least minDistanceKm (default 3.0km) away from the secret node
 */
export function getRandomMumbaiSpawn(targetCoord?: [number, number], minDistanceKm: number = 3.0): [number, number] {
  if (!targetCoord) {
    const randomPick = MUMBAI_LAND_ZONES[Math.floor(Math.random() * MUMBAI_LAND_ZONES.length)];
    const lng = randomPick.coord[0] + (Math.random() - 0.5) * 0.008;
    const lat = randomPick.coord[1] + (Math.random() - 0.5) * 0.008;
    return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
  }

  const farCandidates = MUMBAI_LAND_ZONES.filter((z) => {
    const d = calculateHaversineDistance(z.coord, targetCoord);
    return d >= minDistanceKm;
  });

  const pool = farCandidates.length > 0 ? farCandidates : MUMBAI_LAND_ZONES;
  const picked = pool[Math.floor(Math.random() * pool.length)];

  const lng = picked.coord[0] + (Math.random() - 0.5) * 0.008;
  const lat = picked.coord[1] + (Math.random() - 0.5) * 0.008;
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

// 6 Official Mumbai Nodes in sequential order: Andheri -> Bandra -> Dadar -> Chor Bazaar -> Marine Drive -> Asiatic Society
export const TOUR_NODES: TourNode[] = [
  {
    id: "andheri_station",
    spotNumber: 1,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 1 unlocked: Andheri Railway Station",
    locationName: "Andheri Railway Station",
    storyTitle: "Fred just got down a moving\nlocal train at Andheri.",
    levelName: "Level 1",
    discoveryQuote: "Band was last seen 15m ago on the packed Andheri platforms.",
    clueText: "Everybody on a little mission, mission\nMoney make a, go-go missin', missin'\nI can turn you on in, on in, on in, on in\nLeave me, leave me, leave me alone",
    catchphrase: "He is on a mission mission. Leave him alone. Leave him alone.",
    coordinates: [72.845693, 19.120523],
    trackTitle: "leavemealone",
    trackArtist: "Fred Again.. & Baby Keem",
    timecodes: "0:11-0:45 clue, 0:34-1:43 extended, 1:04 Drop, 1:22 Drop 2",
    trackUrl: "/assets/tracks/andheri x leavemealone.mp3",
    audioLoopStart: 11,
    audioLoopEnd: 45,
    imageUrl: "/assets/nodes/spot1_andheri.jpg",
    videoLoopUrl: "/assets/videos/andheri station.mp4",
  },
  {
    id: "paagal_pan",
    spotNumber: 2,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 2 unlocked: Paagal Paan Bhandaar Bandra",
    locationName: "Paagal Paan Bhandaar Bandra",
    storyTitle: "Fred just ate a fire paan\nat Paagal Panwaadi.",
    levelName: "Level 2",
    discoveryQuote: "Band was last seen 10m ago outside Pali Hill paan shop.",
    clueText: "You can smell it on my breath\nYou can see it on my chest\nGot to be hardstyle, my style, hostile\nGot to be hardstyle, my style, hostile",
    catchphrase: "Someone give him an Aadhar card already for his hardstyle.",
    coordinates: [72.831500, 19.062000],
    trackTitle: "Hardstyle 2",
    trackArtist: "Fred Again..",
    timecodes: "0:40-2:06 extended, 0:44 Drop 1, 1:11 Drop 2, 1:45-2:06",
    trackUrl: "/assets/tracks/paan bhandaar bandra x hardstyle.mp3",
    audioLoopStart: 40,
    audioLoopEnd: 75,
    imageUrl: "/assets/nodes/spot3_paagal_pan.jpg",
    videoLoopUrl: "/assets/videos/paagal paan bhandaar bandra.mp4",
  },
  {
    id: "dadar_flower_market",
    spotNumber: 3,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 3 unlocked: Dadar Flower Market",
    locationName: "Dadar Flower Market",
    storyTitle: "Fred just walked Dadar flower market\nwithout being picpocketed.",
    levelName: "Level 3",
    discoveryQuote: "Band was last seen 20m ago under the fragrant marigold sheds in Dadar.",
    clueText: "But when I just got here, I was just a bit like\nI don't want to be here anymore\nPull me out of this\nPull me out of this\nPull me out of this\nYou know how to calm me down\nYou know how to calm me down",
    catchphrase: "Didn’t want to be here at first, now try & pull him out of this.",
    coordinates: [72.843700, 19.018200],
    trackTitle: "Adore you / Pull me out of this",
    trackArtist: "Fred Again.. & Obongjayar",
    timecodes: "0:00-1:33 extended, 0:00-1:10 clue hidden, 0:35 Drop 1, 0:49 Drop 2",
    trackUrl: "/assets/tracks/dadar x pull me out of this.mp3",
    audioLoopStart: 0,
    audioLoopEnd: 45,
    imageUrl: "/assets/nodes/spot2_dadar.jpg",
    videoLoopUrl: "/assets/videos/dadar flower mkt.mp4",
  },
  {
    id: "chor_bazaar",
    spotNumber: 4,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 4 unlocked: Antique Market Chor Bazaar",
    locationName: "Antique Market Chor Bazaar",
    storyTitle: "Fred just found the fortune-telling\nweight machines in Chor Bazaar",
    levelName: "Level 4",
    discoveryQuote: "Band was last seen 30m ago near the antique gramophones in Chor Bazaar.",
    clueText: "In this smoking chaos, our shoulder blades kissed\nI found you\nI found you\nI found you\nI found you beautiful\nI found you exploding\nI found you",
    catchphrase: "He found it beautiful. He found it exploding. He found it beautiful.",
    coordinates: [72.829000, 18.960200],
    trackTitle: "Kyle (I Found You)",
    trackArtist: "Fred Again..",
    timecodes: "0:03-0:28 clue hidden, 0:03-1:28 extended, 0:49 Drop 1",
    trackUrl: "/assets/tracks/Chor Bazaar x I Found You.mp3",
    audioLoopStart: 3,
    audioLoopEnd: 35,
    imageUrl: "/assets/nodes/spot4_chor_bazaar.jpg",
    videoLoopUrl: "/assets/videos/chor bazaar bhendi bazaar.mp4",
  },
  {
    id: "marine_drive",
    spotNumber: 5,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 5 unlocked: Marine Drive Promenade",
    locationName: "Marine Drive Promenade",
    storyTitle: "Fred just got a sea-view tel-maalish\nat Marine Drive Promenade",
    levelName: "Level 5",
    discoveryQuote: "Band was last seen 15m ago on the tetrapods near Queen's Necklace.",
    clueText: "Turn on the lights\nTurn on the lights\nTurn on the lights\nTurn on the lights",
    catchphrase: "Turn off your mind. Turn on the night lights.",
    coordinates: [72.822777, 18.943576],
    trackTitle: "Turn on the lights again..",
    trackArtist: "Fred Again.. & Swedish House Mafia",
    timecodes: "0:22-1:12 extended play, 0:51-1:14 clue drop, 1:14 Drop",
    trackUrl: "/assets/tracks/marine drive x turn on the lights.mp3",
    audioLoopStart: 22,
    audioLoopEnd: 75,
    imageUrl: "/assets/nodes/spot5_marine_drive.jpg",
    videoLoopUrl: "/assets/videos/marine drive promenade.mp4",
  },
  {
    id: "asiatic_library",
    spotNumber: 6,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 6 unlocked: Asiatic Society Library Stairs",
    locationName: "Asiatic Society Library Stairs",
    storyTitle: "Fred just romanced a girl\non the Asiatic Library stairs",
    levelName: "Level 6",
    discoveryQuote: "Band was last seen 5m ago on the neoclassical white steps of Town Hall.",
    clueText: "I'll let you take a piece of me (Piece of mind, piece of mind)\nI hope you get the peace you need\nI'll let you take a piece of me (Piece of mind, piece of mind)\nI hope you get the peace you need",
    catchphrase: "Ahhh hope you get the place you need ",
    coordinates: [72.835800, 18.932000],
    trackTitle: "Peace you need",
    trackArtist: "Fred Again..",
    timecodes: "0:48-2:25 extended, 0:50-1:22 Clue drop",
    trackUrl: "/assets/tracks/asiatic society x peace u need.mp3",
    audioLoopStart: 48,
    audioLoopEnd: 82,
    imageUrl: "/assets/nodes/spot6_asiatic_library.jpg",
    videoLoopUrl: "/assets/videos/asiatic society library.mp4",
    isFinalNode: true,
  }
];

// Master Schedule Defaults
export const TOUR_CONFIG = {
  tourStartTime: Date.now() - 1000 * 60 * 45, // Started 45 mins ago
  nodeDurationMinutes: 180, // 3 hours per node
  activePhase: "PHASE_1_HUNT" as const,
  activeCity: "mumbai",
  nextCity: "New Delhi",
  meetupCoordinates: [72.835800, 18.932000] as [number, number], // Asiatic Society Library / Fort
};
