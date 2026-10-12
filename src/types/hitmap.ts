export type TourPhase = 'PHASE_1_HUNT' | 'PHASE_2_LIVE' | 'PHASE_3_WAITING';

export interface TourNode {
  id: string;
  spotNumber: number; // 1 to 6
  city: string;
  cityName: string;
  targetName: string; // "Tour spot #X unlocked: [Landmark]"
  locationName: string; // Exact Landmark
  storyTitle: string; // e.g. "Fred just got down a moving local train."
  levelName: string; // e.g. "Tour Level: Noob Noob ANDHERI"
  discoveryQuote: string; // e.g. "Band was last seen 15m ago on the packed Andheri platforms."
  clueText: string; // Lyric Clue (shown publicly)
  catchphrase: string;
  coordinates: [number, number]; // [lng, lat]
  trackTitle: string;
  trackArtist: string;
  trackUrl: string;
  audioLoopStart?: number;
  audioLoopEnd?: number;
  timecodes: string;
  imageUrl: string; // /assets/nodes/spotX_...jpg
  videoLoopUrl?: string;
  isFinalNode?: boolean; // Spot #6
}

export interface TourScheduleResponse {
  phase: TourPhase;
  phaseTitle: string;
  activeCity: string;
  currentNodeIndex: number;
  totalNodes: number;
  currentNode: {
    id: string;
    spotNumber: number;
    city: string;
    clueText: string;
    trackTitle: string;
    trackArtist: string;
    trackUrl?: string;
    videoLoopUrl?: string;
    audioLoopStart?: number;
    audioLoopEnd?: number;
    timecodes: string;
    discoveryQuote?: string;
    targetName?: string;
    locationName?: string;
    isFinalNode?: boolean;
  };
  tourStartTime: number; // UTC ms
  nodeDurationMinutes: number;
  timeRemainingInNodeMs: number;
  nextCity: string;
  meetupCoordinates: [number, number];
  liveDropMeta?: {
    emergencyZone: string;
    meetupLocationName: string;
    activeSightingsCount: number;
    remainingPasses: number;
    totalPasses: number;
    runnersCount: number;
    funnel: {
      signedUpCount: number;
      crossedClue1: number;
      crossedClue2: number;
      closeToClue3: number;
      ticketsRemaining: number;
    };
    sightings: Array<{
      id: string;
      location: string;
      timeAgo: string;
      status: 'VERIFIED' | 'RECENT' | 'HOT';
    }>;
  };
}

export interface RadarPingResponse {
  proximity: number; // 0.0 (Cold) to 1.0 (Hot Lock-In)
  bearing: number; // degrees 0-360 pointing to target
  jitter: number; // degrees of wobble
  zone: 'COLD' | 'DETECTING' | 'WARM' | 'HOT' | 'LOCK_IN';
  verified: boolean;
  unlockToken?: string;
  nodeReward?: {
    spotNumber: number;
    targetName: string;
    locationName: string;
    storyTitle: string;
    levelName: string;
    discoveryQuote: string;
    catchphrase: string;
    clueText: string;
    trackTitle: string;
    imageUrl: string;
    videoLoopUrl?: string;
    coordinates: [number, number];
    isFinalNode?: boolean;
  };
}

export interface ColorSpectrumResult {
  hex: string;
  glow: string;
  fillRgba: string;
  pulseSpeed: number; // in seconds
  signalBars: number; // 1 to 5
}

export interface PitchSubmission {
  suggestedCity: string;
  experienceDescription: string;
  submittedBy?: string;
  createdAt?: string;
}
