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

// 6 Official Mumbai Nodes from k.pdf
export const TOUR_NODES: TourNode[] = [
  {
    id: "andheri_station",
    spotNumber: 1,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 1 unlocked: Andheri Railway Station",
    locationName: "Andheri Railway Station",
    storyTitle: "Fred just got down a moving local train.",
    levelName: "Level 1",
    discoveryQuote: "Band was last seen 15m ago on the packed Andheri platforms.",
    clueText: "Everybody on a little mission, mission\nMoney make a - go-go missin'\nLeave me, leave me alone",
    catchphrase: "Fred missed the fast train while testing an edit on his headphones on Platform 3.",
    coordinates: [72.845693, 19.120523],
    trackTitle: "leavemealone",
    trackArtist: "Fred Again.. & Baby Keem",
    timecodes: "0:30-1:43 extended, 0:33-0:44 clue hidden, 1:03 Drop 1, 1:23 Drop 2",
    trackUrl: "/audio/tracks/leavemealone.mp3",
    imageUrl: "/assets/nodes/spot1_andheri.jpg",
  },
  {
    id: "dadar_flower_market",
    spotNumber: 2,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 2 unlocked: Dadar Flower Market",
    locationName: "Dadar Flower Market",
    storyTitle: "Fred just walked Dadar flower market without being pickpocketed.",
    levelName: "Level 2",
    discoveryQuote: "Band was last seen 20m ago under the fragrant marigold sheds in Dadar.",
    clueText: "When you pray, you're answered\nYou walk through life just like a dancer\nOoh, I adore you",
    catchphrase: "Lost in a sea of yellow marigolds under the Dadar bridge at 5 AM.",
    coordinates: [72.843700, 19.018200],
    trackTitle: "Adore u",
    trackArtist: "Fred Again.. & Obongjayar",
    timecodes: "0:38-1:24 extended, 1:08 Drop, 0:46-1:00 clue hidden",
    trackUrl: "/audio/tracks/adore_u.mp3",
    imageUrl: "/assets/nodes/spot2_dadar.jpg",
  },
  {
    id: "paagal_pan",
    spotNumber: 3,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 3 unlocked: Paagal Paan Bhandaar Bandra",
    locationName: "Paagal Paan Bhandaar Bandra",
    storyTitle: "Someone give Fred an Aadhar card already. He just ate a fire paan at Paagal Panwaadi.",
    levelName: "Level 3",
    discoveryQuote: "Band was last seen 10m ago outside Pali Hill paan shop.",
    clueText: "You can smell it on my breath\nYou can see it on my chest\nGot to be hardstyle, my style, hostile",
    catchphrase: "Red-stained smile on Pali Hill after trying fire paan with a local rickshaw crew.",
    coordinates: [72.831500, 19.062000],
    trackTitle: "Hardstyle 2",
    trackArtist: "Fred Again..",
    timecodes: "0:40-2:06 extended, 0:44 Drop 1, 1:11 Drop 2",
    trackUrl: "/audio/tracks/hardstyle2.mp3",
    imageUrl: "/assets/nodes/spot3_paagal_pan.jpg",
  },
  {
    id: "chor_bazaar",
    spotNumber: 4,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 4 unlocked: Anti Market Chor Bazaar",
    locationName: "Anti Market Chor Bazaar",
    storyTitle: "The fortune-telling weight machines in Chor Bazaar just told Fred his fortune.",
    levelName: "Level 4",
    discoveryQuote: "Band was last seen 30m ago near the antique gramophones in Chor Bazaar.",
    clueText: "Ain't no love in the jungle\nAin't no-, no-, no-, like\nAin't no love in the jungle",
    catchphrase: "Standing by the spinning fortune wheel weight machine in Mutton Street.",
    coordinates: [72.829000, 18.960200],
    trackTitle: "Jungle",
    trackArtist: "Fred Again..",
    timecodes: "0:00-1:35 extended, 0:46-1:35 hook, 1:11 buildup, 1:20 drop",
    trackUrl: "/audio/tracks/jungle.mp3",
    imageUrl: "/assets/nodes/spot4_chor_bazaar.jpg",
  },
  {
    id: "marine_drive",
    spotNumber: 5,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 5 unlocked: Marine Drive Promenade",
    locationName: "Marine Drive Promenade",
    storyTitle: "Fred just got a sea-view tel-maalish at Marine Drive Promenade",
    levelName: "Level 5",
    discoveryQuote: "Band was last seen 15m ago on the tetrapods near Queen's Necklace.",
    clueText: "Turn on the lights\nTurn on the lights\nTurn on the lights",
    catchphrase: "Sitting on the promenade tetrapods getting head massage in the Arabian sea breeze.",
    coordinates: [72.822777, 18.943576],
    trackTitle: "Turn on the lights again..",
    trackArtist: "Fred Again.. & Swedish House Mafia",
    timecodes: "0:22-1:12 extended play, 0:51-1:14 Clue drop, 1:14 Drop",
    trackUrl: "/audio/tracks/turn_on_the_lights.mp3",
    imageUrl: "/assets/nodes/spot5_marine_drive.jpg",
  },
  {
    id: "asiatic_library",
    spotNumber: 6,
    city: "mumbai",
    cityName: "Mumbai",
    targetName: "Level 6 unlocked: Asiatic Society Library Stairs",
    locationName: "Asiatic Society Library Stairs",
    storyTitle: "Fred just romanced a girl on the Asiatic Library stairs",
    levelName: "Level 6",
    discoveryQuote: "Band was last seen 5m ago on the neoclassical white steps of Town Hall.",
    clueText: "I'll let you take a piece of me\nI hope you get the peace you need",
    catchphrase: "Under the full moon on the grand white staircase of the Asiatic Library in Fort.",
    coordinates: [72.835800, 18.932000],
    trackTitle: "Peace you need",
    trackArtist: "Fred Again..",
    timecodes: "0:48-2:25 extended, 0:50-1:22 Clue drop",
    trackUrl: "/audio/tracks/peace_you_need.mp3",
    imageUrl: "/assets/nodes/spot6_asiatic_library.jpg",
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
