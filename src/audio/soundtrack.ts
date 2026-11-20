import { beatEngine } from './beatEngine';

export interface SoundtrackTrack {
  id: number;
  title: string;
  vibe: string;
  src: string;
}

export const SOUNDTRACK_TRACKS: SoundtrackTrack[] = [
  {
    id: 1,
    title: 'Złote Sample',
    vibe: 'Classic Boom-Bap',
    src: '/assets/aistudio/Utwor_01_69a0ef40.mp3',
  },
  {
    id: 2,
    title: 'Nocny Jazz & Brass',
    vibe: 'Golden Era',
    src: '/assets/aistudio/Utwor_02_448d05ab.mp3',
  },
  {
    id: 3,
    title: 'G-Funk Rejs Nocą',
    vibe: 'West Coast',
    src: '/assets/aistudio/Utwor_03_700214b2.mp3',
  },
  {
    id: 4,
    title: 'Podziemne Smyczki',
    vibe: 'Dark Boom-Bap',
    src: '/assets/aistudio/Utwor_04_8a45f791.mp3',
  },
  {
    id: 5,
    title: 'Platynowa Gala',
    vibe: 'Triumphal Anthem',
    src: '/assets/aistudio/Utwor_05_78e81cdd.mp3',
  },
  {
    id: 6,
    title: 'Hymn na Szczyt',
    vibe: 'Epic Piano',
    src: '/assets/aistudio/Utwor_06_fce614c8.mp3',
  },
  {
    id: 7,
    title: 'Późna Sesja',
    vibe: 'Soul Chill',
    src: '/assets/aistudio/Utwor_07_eae21956.mp3',
  },
];

export interface SoundtrackSnapshot {
  trackIndex: number;
  track: SoundtrackTrack;
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  shuffle: boolean;
  duckedByBeatmaker: boolean;
  userPaused: boolean;
}

const AUDIO_PREFS_KEY = 'rap_empire_94_audio_v2';

interface StoredAudioPrefs {
  muted?: boolean;
  volume?: number;
  trackIndex?: number;
  shuffle?: boolean;
  userPaused?: boolean;
}

class SoundtrackPlayer {
  private audio: HTMLAudioElement | null = null;
  private trackIndex = 0;
  private volume = 0.22;
  private muted = false;
  private shuffle = false;
  private userPaused = false;
  private isPlaying = false;
  private duckedByBeatmaker = false;
  private wasPlayingBeforeDuck = false;
  private fadeTimer: number | null = null;
  private listeners = new Set<() => void>();
  private snapshot: SoundtrackSnapshot;

  constructor() {
    this.loadPrefs();
    beatEngine.setMuted(this.muted);
    beatEngine.setPlaybackListener((active) => this.setBeatmakerActive(active));
    this.snapshot = this.buildSnapshot();
  }

  private loadPrefs() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(AUDIO_PREFS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredAudioPrefs;
      if (typeof parsed.muted === 'boolean') this.muted = parsed.muted;
      if (typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1) {
        this.volume = parsed.volume;
      }
      if (
        typeof parsed.trackIndex === 'number' &&
        Number.isInteger(parsed.trackIndex) &&
        parsed.trackIndex >= 0 &&
        parsed.trackIndex < SOUNDTRACK_TRACKS.length
      ) {
        this.trackIndex = parsed.trackIndex;
      }
      if (typeof parsed.shuffle === 'boolean') this.shuffle = parsed.shuffle;
      if (typeof parsed.userPaused === 'boolean') this.userPaused = parsed.userPaused;
    } catch {
      // Ignore storage errors
    }
  }

  private savePrefs() {
    if (typeof window === 'undefined') return;
    try {
      const payload: StoredAudioPrefs = {
        muted: this.muted,
        volume: this.volume,
        trackIndex: this.trackIndex,
        shuffle: this.shuffle,
        userPaused: this.userPaused,
      };
      localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }

  private ensureAudio(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.audio) {
      const el = new Audio(SOUNDTRACK_TRACKS[this.trackIndex].src);
      el.preload = 'metadata';
      el.volume = this.volume;
      el.muted = this.muted;
      el.addEventListener('ended', () => {
        this.next(true);
      });
      el.addEventListener('play', () => {
        this.isPlaying = true;
        this.emit();
      });
      el.addEventListener('pause', () => {
        this.isPlaying = false;
        this.emit();
      });
      this.audio = el;
    }
    return this.audio;
  }

  private buildSnapshot(): SoundtrackSnapshot {
    return {
      trackIndex: this.trackIndex,
      track: SOUNDTRACK_TRACKS[this.trackIndex],
      isPlaying: this.isPlaying,
      muted: this.muted,
      volume: this.volume,
      shuffle: this.shuffle,
      duckedByBeatmaker: this.duckedByBeatmaker,
      userPaused: this.userPaused,
    };
  }

  private emit() {
    this.snapshot = this.buildSnapshot();
    this.listeners.forEach((cb) => cb());
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): SoundtrackSnapshot => {
    return this.snapshot;
  };

  private clearFade() {
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }

  private playAudioElement(fadeIn = false) {
    const el = this.ensureAudio();
    if (!el || this.muted || this.duckedByBeatmaker) return;
    this.clearFade();
    el.muted = false;
    const targetVol = this.volume;

    if (fadeIn && targetVol > 0.02) {
      el.volume = 0.01;
    } else {
      el.volume = targetVol;
    }

    const promise = el.play();
    const startFade = () => {
      if (!fadeIn || targetVol <= 0.02) return;
      const steps = 18;
      let step = 0;
      this.fadeTimer = window.setInterval(() => {
        step += 1;
        if (!this.audio || this.muted || !this.isPlaying || step >= steps) {
          if (this.audio && !this.muted) this.audio.volume = this.volume;
          this.clearFade();
          return;
        }
        this.audio.volume = Math.min(this.volume, (this.volume * step) / steps);
      }, 65);
    };

    if (promise && typeof promise.then === 'function') {
      promise
        .then(() => {
          startFade();
        })
        .catch(() => {
          // Autoplay policy blocked before user gesture
          this.clearFade();
          this.isPlaying = false;
          this.emit();
        });
    } else {
      startFade();
    }
  }

  public initAutoStart(): () => void {
    if (typeof window === 'undefined') return () => {};
    // Attempt immediate gentle start (works directly in APK WebView & permissive browsers)
    if (!this.muted && !this.userPaused && !this.duckedByBeatmaker && !this.isPlaying) {
      this.playAudioElement(true);
    }

    // Fallback unlock on very first user gesture if browser blocked initial autoplay
    const handleFirstGesture = () => {
      if (!this.muted && !this.userPaused && !this.duckedByBeatmaker && !this.isPlaying) {
        this.playAudioElement(true);
      }
      if (this.isPlaying || this.muted || this.userPaused) {
        cleanup();
      }
    };

    const cleanup = () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { passive: true });
    return cleanup;
  }

  public startOnInteraction() {
    if (this.muted || this.userPaused || this.duckedByBeatmaker || this.isPlaying) return;
    this.playAudioElement(true);
  }

  public play() {
    this.userPaused = false;
    if (this.muted) {
      this.muted = false;
      beatEngine.setMuted(false);
    }
    this.savePrefs();
    if (this.duckedByBeatmaker) {
      this.wasPlayingBeforeDuck = true;
      this.emit();
      return;
    }
    this.playAudioElement(false);
    this.emit();
  }

  public pause() {
    this.clearFade();
    this.userPaused = true;
    this.wasPlayingBeforeDuck = false;
    this.savePrefs();
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.emit();
  }

  public stopForReset() {
    this.clearFade();
    this.wasPlayingBeforeDuck = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.emit();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setMuted(nextMuted: boolean) {
    this.clearFade();
    this.muted = nextMuted;
    beatEngine.setMuted(nextMuted);
    this.savePrefs();
    if (nextMuted) {
      if (this.audio) {
        this.audio.muted = true;
        this.audio.pause();
      }
      this.isPlaying = false;
    } else {
      if (this.audio) {
        this.audio.muted = false;
      }
      if (!this.userPaused && !this.duckedByBeatmaker) {
        this.playAudioElement(true);
      }
    }
    this.emit();
  }

  public toggleMute() {
    this.setMuted(!this.muted);
  }

  public setVolume(v: number) {
    this.clearFade();
    const clamped = Math.max(0, Math.min(1, v));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
    }
    if (clamped > 0 && this.muted) {
      this.muted = false;
      beatEngine.setMuted(false);
      if (this.audio) this.audio.muted = false;
    }
    this.savePrefs();
    this.emit();
  }

  public toggleShuffle() {
    this.shuffle = !this.shuffle;
    this.savePrefs();
    this.emit();
  }

  public selectTrack(index: number, autoPlay = true) {
    const safeIdx = ((index % SOUNDTRACK_TRACKS.length) + SOUNDTRACK_TRACKS.length) % SOUNDTRACK_TRACKS.length;
    this.trackIndex = safeIdx;
    const el = this.ensureAudio();
    if (el) {
      el.src = SOUNDTRACK_TRACKS[safeIdx].src;
      el.currentTime = 0;
    }
    if (autoPlay) {
      this.userPaused = false;
      if (this.muted) {
        this.muted = false;
        beatEngine.setMuted(false);
      }
      if (!this.duckedByBeatmaker) {
        this.playAudioElement();
      } else {
        this.wasPlayingBeforeDuck = true;
      }
    }
    this.savePrefs();
    this.emit();
  }

  public next(fromEnded = false) {
    let nextIndex: number;
    if (this.shuffle && SOUNDTRACK_TRACKS.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * SOUNDTRACK_TRACKS.length);
      } while (nextIndex === this.trackIndex);
    } else {
      nextIndex = (this.trackIndex + 1) % SOUNDTRACK_TRACKS.length;
    }
    const shouldPlay = fromEnded ? !this.muted && !this.userPaused && !this.duckedByBeatmaker : true;
    this.selectTrack(nextIndex, shouldPlay);
  }

  public prev() {
    if (this.audio && this.audio.currentTime > 4) {
      this.audio.currentTime = 0;
      if (!this.isPlaying && !this.muted && !this.duckedByBeatmaker) {
        this.playAudioElement();
      }
      return;
    }
    const prevIndex = (this.trackIndex - 1 + SOUNDTRACK_TRACKS.length) % SOUNDTRACK_TRACKS.length;
    this.selectTrack(prevIndex, true);
  }

  public setBeatmakerActive(active: boolean) {
    if (active) {
      this.duckedByBeatmaker = true;
      if (this.isPlaying) {
        this.wasPlayingBeforeDuck = true;
        this.audio?.pause();
      }
      this.emit();
    } else {
      if (!this.duckedByBeatmaker) return;
      this.duckedByBeatmaker = false;
      const shouldResume = this.wasPlayingBeforeDuck && !this.muted && !this.userPaused;
      this.wasPlayingBeforeDuck = false;
      if (shouldResume) {
        this.playAudioElement();
      }
      this.emit();
    }
  }
}

export const soundtrack = new SoundtrackPlayer();
