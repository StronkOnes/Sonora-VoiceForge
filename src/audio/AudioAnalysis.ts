/**
 * SONORA VoiceForge - Real Audio Analysis Engine
 * 
 * Computes exact physical measurements (Peak, RMS, Clipping count, Crest Factor)
 * and technical estimates (Noise floor, Spectral energy distribution) from PCM data.
 * Distinguishes between verified physical measurements and heuristic estimates.
 */

import { AudioAnalysisResult } from './types';

export function linearToDb(linear: number, minDb: number = -120): number {
  if (linear <= 0) return minDb;
  const db = 20 * Math.log10(linear);
  return Math.max(db, minDb);
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Analyse an AudioBuffer directly from its channel PCM Float32 data.
 */
export function analyseAudioBuffer(buffer: AudioBuffer): AudioAnalysisResult {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const sampleRate = buffer.sampleRate;
  const duration = buffer.duration;

  if (length === 0) {
    return {
      duration: 0,
      sampleRate,
      numberOfChannels: numChannels,
      peakDb: -120,
      peakLinear: 0,
      rmsDb: -120,
      crestFactorDb: 0,
      isClipping: false,
      clippedSampleCount: 0,
      clippingPercentage: 0,
      estimatedNoiseFloorDb: -120,
      vocalPresenceRatio: 0,
      lowRumblePresenceDb: -120,
      highHissPresenceDb: -120,
      isSilent: true,
      notes: ['Recording buffer is empty.']
    };
  }

  let globalPeak = 0;
  let totalSumOfSquares = 0;
  let clippedSamples = 0;
  const clipThreshold = 0.9995;

  // We analyze across all channels
  for (let c = 0; c < numChannels; c++) {
    const data = buffer.getChannelData(c);
    let channelSumOfSquares = 0;

    for (let i = 0; i < length; i++) {
      const sample = data[i];
      const absSample = Math.abs(sample);

      if (absSample > globalPeak) {
        globalPeak = absSample;
      }

      if (absSample >= clipThreshold) {
        clippedSamples++;
      }

      channelSumOfSquares += sample * sample;
    }
    totalSumOfSquares += channelSumOfSquares;
  }

  const totalSamples = length * numChannels;
  const meanSquare = totalSumOfSquares / totalSamples;
  const rmsLinear = Math.sqrt(meanSquare);

  const peakDb = linearToDb(globalPeak);
  const rmsDb = linearToDb(rmsLinear);
  const crestFactorDb = Math.max(0, peakDb - rmsDb);
  const clippingPercentage = (clippedSamples / totalSamples) * 100;
  const isClipping = clippedSamples > 0;
  const isSilent = globalPeak < 0.001 || rmsDb < -80;

  // Calculate noise floor estimation using frame-by-frame RMS (50ms frames)
  const frameSize = Math.max(256, Math.floor(sampleRate * 0.05)); // ~50ms
  const numFrames = Math.floor(length / frameSize);
  const frameRmsList: number[] = [];

  const primaryData = buffer.getChannelData(0);

  for (let f = 0; f < numFrames; f++) {
    const start = f * frameSize;
    let sumSq = 0;
    for (let i = 0; i < frameSize; i++) {
      const val = primaryData[start + i];
      sumSq += val * val;
    }
    const fRms = Math.sqrt(sumSq / frameSize);
    frameRmsList.push(fRms);
  }

  let estimatedNoiseFloorDb = -120;
  if (frameRmsList.length > 5) {
    // Sort ascending to inspect quietest intervals (excluding pure digital zero)
    frameRmsList.sort((a, b) => a - b);
    const nonZeroFrames = frameRmsList.filter(r => r > 1e-6);
    if (nonZeroFrames.length > 0) {
      // Average the 10th-percentile quietest frames to estimate steady room noise/hiss
      const sampleIdx = Math.min(
        nonZeroFrames.length - 1,
        Math.floor(nonZeroFrames.length * 0.1)
      );
      const noiseRms = nonZeroFrames[sampleIdx];
      estimatedNoiseFloorDb = linearToDb(noiseRms);
    } else {
      estimatedNoiseFloorDb = -120;
    }
  } else {
    estimatedNoiseFloorDb = rmsDb - 15;
  }

  // Basic spectral energy estimations using simple digital biquad filter sweeps
  const { lowRumbleDb, vocalRatio, highHissDb } = estimateSpectralBands(primaryData, sampleRate);

  // Generate honest notes and technical feedback
  const notes: string[] = [];
  if (isClipping) {
    notes.push(
      `Warning: Detected ${clippedSamples} clipped samples (${clippingPercentage.toFixed(2)}%). Clipped peaks produce harmonic distortion and cannot be fully restored by filtering.`
    );
  }
  if (estimatedNoiseFloorDb > -42) {
    notes.push(
      `High ambient noise floor (~${estimatedNoiseFloorDb.toFixed(1)} dBFS). Noticeable room noise, fans, or air-conditioning present.`
    );
  } else if (estimatedNoiseFloorDb > -58) {
    notes.push(
      `Moderate room noise (~${estimatedNoiseFloorDb.toFixed(1)} dBFS). Suitable for gentle downward noise suppression.`
    );
  } else {
    notes.push(
      `Clean acoustic floor (~${estimatedNoiseFloorDb.toFixed(1)} dBFS). Minimal background hiss detected.`
    );
  }

  if (lowRumbleDb > -35) {
    notes.push('Significant sub-bass rumble detected (<100Hz). 80Hz high-pass filter strongly recommended.');
  }

  if (crestFactorDb > 18) {
    notes.push('High dynamic range (>18 dB). Vocal distance from phone microphone varies significantly; leveling will improve consistency.');
  }

  return {
    duration,
    sampleRate,
    numberOfChannels: numChannels,
    peakDb: Number(peakDb.toFixed(2)),
    peakLinear: Number(globalPeak.toFixed(4)),
    rmsDb: Number(rmsDb.toFixed(2)),
    crestFactorDb: Number(crestFactorDb.toFixed(2)),
    isClipping,
    clippedSampleCount: clippedSamples,
    clippingPercentage: Number(clippingPercentage.toFixed(3)),
    estimatedNoiseFloorDb: Number(estimatedNoiseFloorDb.toFixed(1)),
    vocalPresenceRatio: Number(vocalRatio.toFixed(3)),
    lowRumblePresenceDb: Number(lowRumbleDb.toFixed(1)),
    highHissPresenceDb: Number(highHissDb.toFixed(1)),
    isSilent,
    notes
  };
}

/**
 * Approximate spectral distribution using direct IIR low-pass and high-pass filters
 * on a downsampled slice to keep analysis fast and strictly deterministic.
 */
function estimateSpectralBands(data: Float32Array, sampleRate: number): {
  lowRumbleDb: number;
  vocalRatio: number;
  highHissDb: number;
} {
  const step = Math.max(1, Math.floor(sampleRate / 24000));
  const analyzedLen = Math.min(data.length, sampleRate * 10); // up to 10 seconds sample

  let totalEnergy = 0;
  let rumbleEnergy = 0;
  let hissEnergy = 0;
  let vocalBandEnergy = 0;

  // Simple 1st-order IIR filters for frequency decomposition
  // Low-pass at ~100 Hz
  const dt = step / sampleRate;
  const rcLow = 1 / (2 * Math.PI * 100);
  const alphaLow = dt / (rcLow + dt);
  let lowFiltered = 0;

  // High-pass at ~7000 Hz
  const rcHigh = 1 / (2 * Math.PI * 7000);
  const alphaHigh = rcHigh / (rcHigh + dt);
  let highFiltered = 0;
  let prevSample = 0;

  for (let i = 0; i < analyzedLen; i += step) {
    const x = data[i];
    const absX = Math.abs(x);
    totalEnergy += absX * absX;

    // Rumble LP filter
    lowFiltered += alphaLow * (x - lowFiltered);
    rumbleEnergy += lowFiltered * lowFiltered;

    // Hiss HP filter
    highFiltered = alphaHigh * (highFiltered + x - prevSample);
    prevSample = x;
    hissEnergy += highFiltered * highFiltered;

    // Vocal presence estimate
    const midApprox = x - lowFiltered - highFiltered;
    vocalBandEnergy += midApprox * midApprox;
  }

  const count = Math.ceil(analyzedLen / step);
  const lowRms = Math.sqrt(rumbleEnergy / count);
  const hissRms = Math.sqrt(hissEnergy / count);
  const vocalRatio = totalEnergy > 0 ? Math.min(1, vocalBandEnergy / totalEnergy) : 0;

  return {
    lowRumbleDb: linearToDb(lowRms),
    vocalRatio,
    highHissDb: linearToDb(hissRms)
  };
}
