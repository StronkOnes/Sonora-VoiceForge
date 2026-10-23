/**
 * SONORA VoiceForge - Audio Processing Type Definitions
 * 
 * Strict typed contracts for audio inputs, DSP parameters, analysis metrics,
 * processing results, presets, and export specifications.
 * Designed for 1:1 porting to C++/JUCE audio parameter structures.
 */

export interface AudioMetadata {
  fileName: string;
  fileSize: number;
  duration: number; // in seconds
  sampleRate: number; // in Hz (e.g. 44100, 48000)
  numberOfChannels: number; // 1 = mono, 2 = stereo
  format: string; // e.g. "audio/wav", "audio/mp3", "audio/m4a"
}

export interface AudioAnalysisResult {
  duration: number;
  sampleRate: number;
  numberOfChannels: number;
  peakDb: number; // Maximum peak in dBFS (-Infinity to 0 dBFS or >0 if clipping)
  peakLinear: number; // 0.0 to 1.0+
  rmsDb: number; // Root Mean Square in dBFS
  crestFactorDb: number; // Peak - RMS in dB
  isClipping: boolean;
  clippedSampleCount: number;
  clippingPercentage: number;
  estimatedNoiseFloorDb: number; // Estimated steady-state background noise floor in dBFS
  vocalPresenceRatio: number; // Ratio of 1kHz - 4kHz energy relative to total energy
  lowRumblePresenceDb: number; // Energy below 100Hz in dBFS
  highHissPresenceDb: number; // Energy above 7kHz in dBFS
  isSilent: boolean;
  notes: string[];
}

export interface ProcessingSettings {
  /**
   * Noise Reduction strength (0 - 100%).
   * Controls multi-band spectral suppression and downward expansion for steady noise.
   */
  noiseReduction: number;

  /**
   * Room Echo dampening (0 - 100%).
   * Suppresses diffuse reverberant decay tails between voice syllables.
   */
  roomReduction: number;

  /**
   * Vocal Clarity tonal shaping (-10 to +10 dB, default 3.0 dB).
   * Applies presence boost (3.2 kHz), low-mid warmth de-mud (320 Hz), and high air (11 kHz).
   */
  vocalClarity: number;

  /**
   * Vocal Leveling dynamics (0 - 100%).
   * Smooth leveling compressor with peak limiter to even out smartphone distance fluctuations.
   */
  vocalLevel: number;

  /**
   * Output Gain trim in dB (-12.0 dB to +6.0 dB, default 0 dB).
   */
  outputGain: number;

  /**
   * High-pass Rumble Filter cutoff in Hz (e.g. 75Hz or 0 for bypassed).
   */
  highPassHz: number;

  /**
   * De-esser sibilance suppression (0 - 100%).
   */
  deEsser: number;

  /**
   * High-Resolution Harmonic Air & Exciter (0 - 100%).
   * Reconstructs upper acoustic harmonics (>10 kHz) to restore lost studio air and microphone resolution.
   */
  harmonicAir: number;

  /**
   * High-Resolution Studio Mode (32-bit floating point DSP pipeline).
   */
  highResMode: boolean;
}

export interface ProcessingProgress {
  stage: 'analyzing' | 'filtering' | 'denoising' | 'shaping' | 'leveling' | 'rendering' | 'complete';
  percentage: number; // 0 - 100
  message: string;
}

export interface ProcessingResult {
  processedBuffer: AudioBuffer;
  analysisBefore: AudioAnalysisResult;
  analysisAfter: AudioAnalysisResult;
  processingTimeMs: number;
  settingsUsed: ProcessingSettings;
  warnings: string[];
}

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

export interface Preset {
  id: string;
  name: string;
  description: string;
  isFactory: boolean;
  settings: ProcessingSettings;
  recommendedFor: string;
}

export type ExportFormat = 'wav-32f' | 'wav-24' | 'wav-16';

export interface ExportSettings {
  format: ExportFormat;
  sampleRate: 44100 | 48000 | 96000;
  fileName: string;
  normalizePeaks: boolean;
  targetPeakDb: number; // e.g. -0.5 dBFS
}

export interface AudioSourceData {
  buffer: AudioBuffer;
  metadata: AudioMetadata;
  analysis: AudioAnalysisResult;
}
