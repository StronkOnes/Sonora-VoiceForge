import { describe, it, expect } from 'vitest';
import { linearToDb, dbToLinear, analyseAudioBuffer } from '../src/audio/AudioAnalysis';

// Mock simple AudioBuffer for node/vitest environment
class MockAudioBuffer {
  numberOfChannels: number;
  length: number;
  sampleRate: number;
  duration: number;
  private channels: Float32Array[];

  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.numberOfChannels = options.numberOfChannels;
    this.length = options.length;
    this.sampleRate = options.sampleRate;
    this.duration = options.length / options.sampleRate;
    this.channels = [];
    for (let i = 0; i < options.numberOfChannels; i++) {
      this.channels.push(new Float32Array(options.length));
    }
  }

  getChannelData(channel: number): Float32Array {
    return this.channels[channel];
  }
}

describe('Audio Analysis Engine', () => {
  it('converts linear amplitude to dB correctly', () => {
    expect(linearToDb(1.0)).toBeCloseTo(0.0, 1);
    expect(linearToDb(0.5)).toBeCloseTo(-6.02, 1);
    expect(linearToDb(0.1)).toBeCloseTo(-20.0, 1);
    expect(linearToDb(0.0)).toBe(-120);
  });

  it('converts dB to linear amplitude correctly', () => {
    expect(dbToLinear(0.0)).toBeCloseTo(1.0, 2);
    expect(dbToLinear(-6.02)).toBeCloseTo(0.5, 2);
    expect(dbToLinear(-20.0)).toBeCloseTo(0.1, 2);
  });

  it('detects silence in a zero buffer', () => {
    const buffer = new MockAudioBuffer({
      numberOfChannels: 1,
      length: 44100,
      sampleRate: 44100
    }) as unknown as AudioBuffer;

    const result = analyseAudioBuffer(buffer);
    expect(result.isSilent).toBe(true);
    expect(result.peakDb).toBe(-120);
    expect(result.rmsDb).toBe(-120);
    expect(result.isClipping).toBe(false);
  });

  it('calculates true peak and RMS of a pure sine wave', () => {
    const sampleRate = 44100;
    const length = 44100;
    const buffer = new MockAudioBuffer({
      numberOfChannels: 1,
      length,
      sampleRate
    }) as unknown as AudioBuffer;

    const channelData = buffer.getChannelData(0);
    const amplitude = 0.5; // -6.02 dBFS
    for (let i = 0; i < length; i++) {
      channelData[i] = amplitude * Math.sin((2 * Math.PI * 440 * i) / sampleRate);
    }

    const result = analyseAudioBuffer(buffer);
    expect(result.peakLinear).toBeCloseTo(0.5, 2);
    expect(result.peakDb).toBeCloseTo(-6.02, 1);
    // Sine wave RMS is Peak / sqrt(2) = -6.02 - 3.01 = -9.03 dBFS
    expect(result.rmsDb).toBeCloseTo(-9.03, 1);
    expect(result.crestFactorDb).toBeCloseTo(3.01, 1);
    expect(result.isClipping).toBe(false);
  });

  it('detects digital clipping when samples reach 1.0', () => {
    const buffer = new MockAudioBuffer({
      numberOfChannels: 1,
      length: 1000,
      sampleRate: 44100
    }) as unknown as AudioBuffer;

    const data = buffer.getChannelData(0);
    data[10] = 1.0;
    data[11] = 1.0;
    data[12] = 1.0;

    const result = analyseAudioBuffer(buffer);
    expect(result.isClipping).toBe(true);
    expect(result.clippedSampleCount).toBe(3);
    expect(result.clippingPercentage).toBeCloseTo(0.3, 1);
  });
});
