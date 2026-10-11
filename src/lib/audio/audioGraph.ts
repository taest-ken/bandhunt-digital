// Web Audio API DSP Graph for "Fred's India Tour Before The India Tour: The HITMAP"

class HitmapAudioEngine {
  private ctx: AudioContext | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private proximityGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  
  // Dual-deck crossfading gain nodes
  private deckAGain: GainNode | null = null;
  private deckBGain: GainNode | null = null;

  // Track sources / procedural loops
  private activeDeck: 'A' | 'B' = 'A';
  private synthLoopActive = false;
  private synthTimer: number | null = null;

  // Phase 2 Pirate Radio Noise Node
  private radioNoiseNode: AudioBufferSourceNode | null = null;
  private radioGainNode: GainNode | null = null;

  private isMuted = false;
  private unlocked = false;

  public async unlockAudio(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }

      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }

      // Play 1-sample silent buffer to unlock iOS Safari WebKit audio
      const silentBuffer = this.ctx.createBuffer(1, 1, 22050);
      const source = this.ctx.createBufferSource();
      source.buffer = silentBuffer;
      source.connect(this.ctx.destination);
      source.start();

      this.initGraph();
      this.unlocked = true;
      this.startProceduralBeatLoop(); // Start high-energy beat loop immediately
      return true;
    } catch (e) {
      console.error("Audio unlock error:", e);
      return false;
    }
  }

  private initGraph() {
    if (!this.ctx) return;

    // 1. Filter Node (Low-pass 24dB/oct)
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.setValueAtTime(240, this.ctx.currentTime); // Start muffled
    this.filterNode.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // 2. Proximity Gain Node (Muffled 15% to crystal-clear 100%)
    this.proximityGainNode = this.ctx.createGain();
    this.proximityGainNode.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // 3. Master Dynamics Compressor (Eliminates clipping during rapid filter sweeps)
    this.compressorNode = this.ctx.createDynamicsCompressor();
    this.compressorNode.threshold.setValueAtTime(-18, this.ctx.currentTime);
    this.compressorNode.knee.setValueAtTime(12, this.ctx.currentTime);
    this.compressorNode.ratio.setValueAtTime(4, this.ctx.currentTime);
    this.compressorNode.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressorNode.release.setValueAtTime(0.15, this.ctx.currentTime);

    // 4. Master Gain
    this.masterGainNode = this.ctx.createGain();
    this.masterGainNode.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // 5. Deck Gains
    this.deckAGain = this.ctx.createGain();
    this.deckBGain = this.ctx.createGain();
    this.deckAGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.deckBGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    // Route: [Decks A & B] -> filterNode -> proximityGain -> compressor -> masterGain -> destination
    this.deckAGain.connect(this.filterNode);
    this.deckBGain.connect(this.filterNode);
    this.filterNode.connect(this.proximityGainNode);
    this.proximityGainNode.connect(this.compressorNode);
    this.compressorNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.ctx.destination);
  }

  // Real-time DSP update based on proximity scalar p in [0.0, 1.0]
  public updateProximity(proximity: number) {
    if (!this.ctx || !this.filterNode || !this.proximityGainNode) return;

    const p = Math.max(0, Math.min(1, proximity));
    const now = this.ctx.currentTime;
    const smoothTime = 0.05; // 50ms exponential ramp prevents clicks/zipper noise

    // Exponential Cutoff: 220Hz (muffled alleyway club) -> 20,000Hz (studio master)
    const minFreq = 220;
    const maxFreq = 20000;
    const targetFreq = Math.min(20000, Math.max(20, minFreq * Math.pow(maxFreq / minFreq, Math.pow(p, 1.7))));
    this.filterNode.frequency.setTargetAtTime(targetFreq, now, smoothTime);

    // Resonance Q factor: builds to an ecstatic club sweep peak at target lock-in
    const targetQ = 1.2 + p * 3.5;
    this.filterNode.Q.setTargetAtTime(targetQ, now, smoothTime);

    // Proximity Gain: 0.15 -> 1.0
    const minGain = 0.15;
    const maxGain = 1.0;
    const targetGain = minGain + (maxGain - minGain) * Math.pow(p, 1.2);
    this.proximityGainNode.gain.setTargetAtTime(targetGain, now, smoothTime);
  }

  // Crossfade to new track deck when global node rotates
  public crossfadeToDeck(newDeck: 'A' | 'B', durationSec = 2.5) {
    if (!this.ctx || !this.deckAGain || !this.deckBGain) return;

    const now = this.ctx.currentTime;
    this.activeDeck = newDeck;

    if (newDeck === 'B') {
      this.deckAGain.gain.setTargetAtTime(0.001, now, durationSec / 3);
      this.deckBGain.gain.setTargetAtTime(1.0, now, durationSec / 3);
    } else {
      this.deckBGain.gain.setTargetAtTime(0.001, now, durationSec / 3);
      this.deckAGain.gain.setTargetAtTime(1.0, now, durationSec / 3);
    }
  }

  // Toggle Phase 2 Pirate Radio Intercept Soundscape
  public setRadioInterceptMode(active: boolean) {
    if (!this.ctx) return;

    if (active) {
      if (!this.radioNoiseNode) {
        // Create 2-second white noise buffer with walkie-talkie squelch
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        this.radioNoiseNode = this.ctx.createBufferSource();
        this.radioNoiseNode.buffer = noiseBuffer;
        this.radioNoiseNode.loop = true;

        // Bandpass filter for walkie-talkie telephone EQ
        const radioFilter = this.ctx.createBiquadFilter();
        radioFilter.type = "bandpass";
        radioFilter.frequency.setValueAtTime(1800, this.ctx.currentTime);
        radioFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

        this.radioGainNode = this.ctx.createGain();
        this.radioGainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);

        this.radioNoiseNode.connect(radioFilter);
        radioFilter.connect(this.radioGainNode);
        this.radioGainNode.connect(this.masterGainNode!);

        this.radioNoiseNode.start();
      }
    } else {
      if (this.radioNoiseNode) {
        try {
          this.radioNoiseNode.stop();
          this.radioNoiseNode.disconnect();
        } catch {}
        this.radioNoiseNode = null;
        this.radioGainNode = null;
      }
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGainNode && this.ctx) {
      this.masterGainNode.gain.setTargetAtTime(muted ? 0.0 : 0.85, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public isAudioUnlocked(): boolean {
    return this.unlocked;
  }

  // Self-contained procedural Fred Again style 4-on-the-floor beat loop (kick, bass, emotional chords)
  // Ensures immediate, zero-latency playback even before external MP3 assets are placed
  private startProceduralBeatLoop() {
    if (this.synthLoopActive || !this.ctx) return;
    this.synthLoopActive = true;

    const tempo = 130; // 130 BPM energetic UK garage / house tempo
    const stepTime = (60 / tempo) / 4; // 16th note in seconds
    let step = 0;

    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66], // G major
    ];

    const playStep = () => {
      if (!this.ctx || !this.synthLoopActive) return;
      const now = this.ctx.currentTime;

      // 4-on-the-floor Kick on every 4th 16th-note (beats 0, 4, 8, 12)
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(38, now + 0.08);

        kickGain.gain.setValueAtTime(1.0, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(kickGain);
        kickGain.connect(this.deckAGain!);
        osc.start(now);
        osc.stop(now + 0.3);
      }

      // Shuffling Hi-Hat on off-beats (steps 2, 6, 10, 14)
      if (step % 2 === 0 && step % 4 !== 0) {
        const osc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        osc.type = "highpass" as unknown as OscillatorType;
        osc.frequency.setValueAtTime(8000, now);

        hatGain.gain.setValueAtTime(0.25, now);
        hatGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(hatGain);
        hatGain.connect(this.deckAGain!);
        osc.start(now);
        osc.stop(now + 0.06);
      }

      // Emotional Synth Chord Stabs on beats 0, 3, 6, 10
      if (step === 0 || step === 3 || step === 6 || step === 10) {
        const chordIndex = Math.floor((step / 16) * chords.length) % chords.length;
        const currentChord = chords[chordIndex];

        currentChord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const chordGain = this.ctx!.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, now);

          chordGain.gain.setValueAtTime(0.18, now);
          chordGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          osc.connect(chordGain);
          chordGain.connect(this.deckAGain!);
          osc.start(now);
          osc.stop(now + 0.42);
        });
      }

      step = (step + 1) % 64;
      this.synthTimer = window.setTimeout(playStep, stepTime * 1000);
    };

    playStep();
  }

  public destroy() {
    this.synthLoopActive = false;
    if (this.synthTimer) clearTimeout(this.synthTimer);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Global Singleton Instance
let audioEngineInstance: HitmapAudioEngine | null = null;

export function getHitmapAudioEngine(): HitmapAudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new HitmapAudioEngine();
  }
  return audioEngineInstance;
}
