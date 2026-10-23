/**
 * SONORA VoiceForge - Abstract Audio Processor Contract
 * 
 * Defines the abstract interface that any audio processing engine (WebAudioProcessor,
 * or future Native JUCE C++ engine bridge) must implement.
 * Independent of React components.
 */

import {
  AudioAnalysisResult,
  ProcessingProgress,
  ProcessingResult,
  ProcessingSettings
} from './types';

export const DEFAULT_PROCESSING_SETTINGS: ProcessingSettings = {
  noiseReduction: 60, // 0 - 100%
  roomReduction: 40,  // 0 - 100%
  vocalClarity: 3.5,  // dB boost/sculpt
  vocalLevel: 65,     // 0 - 100% leveling
  outputGain: 0.0,    // dB trim
  highPassHz: 80,     // 80Hz rumble cut
  deEsser: 45,        // 0 - 100%
  harmonicAir: 45,    // 0 - 100% high-res air & brilliance
  highResMode: true,  // 32-bit floating point high-res pipeline
};

export type ProgressCallback = (progress: ProcessingProgress) => void;

export interface IAudioProcessor {
  /**
   * Analyse an audio buffer and return honest physical measurements and estimates.
   */
  analyse(buffer: AudioBuffer): Promise<AudioAnalysisResult>;

  /**
   * Process the audio buffer using the provided settings.
   * Reports genuine progress through progressCallback.
   */
  process(
    buffer: AudioBuffer,
    settings: ProcessingSettings,
    progressCallback?: ProgressCallback
  ): Promise<ProcessingResult>;

  /**
   * Abort in-flight processing if supported.
   */
  cancel(): void;

  /**
   * Release resources or contexts.
   */
  dispose(): void;
}
