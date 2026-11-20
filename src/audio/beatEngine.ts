import { BeatConfig, BeatStyle } from '../types/game';

class BeatAudioEngine {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private currentStep = 0;
  private isPlaying = false;
  private muted = false;
  private config: BeatConfig | null = null;
  private onStepCallback: ((step: number) => void) | null = null;
  private playbackListener: ((playing: boolean) => void) | null = null;

  public setPlaybackListener(cb: ((playing: boolean) => void) | null) {
    this.playbackListener = cb;
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stop();
  }

  public getMuted() {
    return this.muted;
  }

  public getIsPlaying() {
    return this.isPlaying;
  }

  public updateConfig(cfg: BeatConfig) {
    const bpmChanged = this.config?.bpm !== cfg.bpm;
    this.config = cfg;
    if (this.isPlaying && bpmChanged) {
      this.restartTimer();
    }
  }

  public start(cfg: BeatConfig, onStep?: (step: number) => void) {
    if (this.muted) return;
    const wasPlaying = this.isPlaying;
    this.ensureContext();
    this.config = cfg;
    this.onStepCallback = onStep || null;
    this.isPlaying = true;
    this.currentStep = 0;
    if (!wasPlaying) {
      this.playbackListener?.(true);
    }
    this.restartTimer();
  }

  private restartTimer() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (!this.config) return;
    const stepMs = (60 / this.config.bpm / 4) * 1000;
    this.tick();
    this.intervalId = window.setInterval(() => this.tick(), stepMs);
  }

  public stop() {
    const wasPlaying = this.isPlaying;
    this.isPlaying = false;
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.onStepCallback) {
      this.onStepCallback(-1);
    }
    if (wasPlaying) {
      this.playbackListener?.(false);
    }
  }

  private tick() {
    if (!this.isPlaying || !this.config || this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const step = this.currentStep;
    const now = ctx.currentTime;
    const { steps, style } = this.config;

    if (steps.kick[step]) this.triggerKick(ctx, now, style);
    if (steps.snare[step]) this.triggerSnare(ctx, now, style);
    if (steps.hat[step]) this.triggerHat(ctx, now, style, step);
    if (steps.chord[step]) this.triggerChord(ctx, now, style, step);

    if (this.onStepCallback) this.onStepCallback(step);
    this.currentStep = (step + 1) % 16;
  }

  private triggerKick(ctx: AudioContext, time: number, style: BeatStyle) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = style === 'mpc_boombap' ? 'triangle' : 'sine';

    const startFreq = style === 'uk_drill' ? 130 : style === '808_trap' ? 150 : 120;
    const endFreq = style === '808_trap' || style === 'uk_drill' ? 38 : 48;
    const decay = style === '808_trap' ? 0.34 : style === 'uk_drill' ? 0.38 : 0.18;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.08);
    if (style === 'uk_drill') {
      // subtle drill 808 slide
      osc.frequency.exponentialRampToValueAtTime(52, time + 0.25);
    }

    gain.gain.setValueAtTime(0.45, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + decay + 0.02);
  }

  private triggerSnare(ctx: AudioContext, time: number, style: BeatStyle) {
    // Filtered noise
    const bufferSize = Math.floor(ctx.sampleRate * 0.14);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(style === 'mpc_boombap' ? 950 : 1600, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.24, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);

    // Snare body tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(style === 'uk_drill' ? 230 : 185, time);
    osc.frequency.exponentialRampToValueAtTime(95, time + 0.06);
    oscGain.gain.setValueAtTime(0.18, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private triggerHat(ctx: AudioContext, time: number, style: BeatStyle, step: number) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(style === 'mpc_boombap' ? 5200 : 7500, time);

    const gain = ctx.createGain();
    const accent = step % 4 === 0 ? 0.12 : 0.07;
    gain.gain.setValueAtTime(accent, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(time);
  }

  private triggerChord(ctx: AudioContext, time: number, style: BeatStyle, step: number) {
    // Minor dark hip-hop chords (D minor / C minor / F minor feel)
    const chordsByStyle: Record<BeatStyle, number[][]> = {
      '808_trap': [
        [220, 261.63, 329.63],
        [196, 233.08, 293.66],
      ],
      mpc_boombap: [
        [261.63, 311.13, 392, 466.16],
        [233.08, 293.66, 349.23, 440],
      ],
      uk_drill: [
        [185, 220, 277.18],
        [174.61, 207.65, 261.63],
      ],
      dark_synth: [
        [246.94, 293.66, 369.99],
        [220, 261.63, 329.63],
      ],
    };

    const bank = chordsByStyle[style];
    const notes = bank[step >= 8 ? 1 : 0];
    const oscType: OscillatorType = style === 'dark_synth' ? 'sawtooth' : style === 'mpc_boombap' ? 'sine' : 'triangle';

    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = oscType;
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'dark_synth' ? 1100 : 820, time);

      gain.gain.setValueAtTime(0.045, time);
      gain.gain.exponentialRampToValueAtTime(0.0008, time + 0.42);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.44);
    });
  }

  public playFx(kind: 'cash' | 'award' | 'win' | 'tap') {
    if (this.muted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const playTone = (freq: number, start: number, dur: number, vol = 0.08, type: OscillatorType = 'triangle') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(vol, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };

    if (kind === 'tap') {
      playTone(480, now, 0.05, 0.04, 'sine');
    } else if (kind === 'cash') {
      playTone(660, now, 0.08, 0.07);
      playTone(990, now + 0.07, 0.14, 0.07);
    } else if (kind === 'win') {
      playTone(392, now, 0.1, 0.08);
      playTone(493.88, now + 0.09, 0.1, 0.08);
      playTone(587.33, now + 0.18, 0.22, 0.09);
    } else if (kind === 'award') {
      playTone(440, now, 0.14, 0.07);
      playTone(554.37, now + 0.1, 0.14, 0.07);
      playTone(659.25, now + 0.2, 0.16, 0.08);
      playTone(880, now + 0.3, 0.35, 0.09);
    }
  }
}

export const beatEngine = new BeatAudioEngine();
