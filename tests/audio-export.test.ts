import { describe, it, expect } from 'vitest';
import { encodeWav32BitFloat, encodeWav24Bit, encodeWav16Bit } from '../src/audio/AudioExport';

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

describe('Audio Export Engine', () => {
  it('encodes genuine 24-bit PCM WAV with correct RIFF headers and byte size', async () => {
    const numChannels = 1;
    const sampleRate = 48000;
    const length = 1000;

    const buffer = new MockAudioBuffer({
      numberOfChannels: numChannels,
      length,
      sampleRate
    }) as unknown as AudioBuffer;

    const blob = encodeWav24Bit(buffer);
    expect(blob.type).toBe('audio/wav');

    // Expected size: 44 bytes header + (length * numChannels * 3 bytes per sample)
    const expectedSize = 44 + (1000 * 1 * 3);
    expect(blob.size).toBe(expectedSize);

    const arrayBuf = await blob.arrayBuffer();
    const view = new DataView(arrayBuf);

    // Check RIFF header magic
    const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
    expect(riff).toBe('RIFF');

    const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
    expect(wave).toBe('WAVE');

    // Bits per sample at offset 34
    const bitsPerSample = view.getUint16(34, true);
    expect(bitsPerSample).toBe(24);

    // Audio format code (1 = PCM)
    const audioFormat = view.getUint16(20, true);
    expect(audioFormat).toBe(1);

    // Sample rate at offset 24
    const headerSampleRate = view.getUint32(24, true);
    expect(headerSampleRate).toBe(48000);
  });

  it('encodes valid 16-bit PCM WAV with correct header and byte size', async () => {
    const numChannels = 2; // Stereo
    const sampleRate = 44100;
    const length = 500;

    const buffer = new MockAudioBuffer({
      numberOfChannels: numChannels,
      length,
      sampleRate
    }) as unknown as AudioBuffer;

    const blob = encodeWav16Bit(buffer);
    expect(blob.type).toBe('audio/wav');

    // Expected size: 44 bytes header + (500 * 2 channels * 2 bytes)
    const expectedSize = 44 + (500 * 2 * 2);
    expect(blob.size).toBe(expectedSize);

    const arrayBuf = await blob.arrayBuffer();
    const view = new DataView(arrayBuf);

    const bitsPerSample = view.getUint16(34, true);
    expect(bitsPerSample).toBe(16);

    const channels = view.getUint16(22, true);
    expect(channels).toBe(2);
  });

  it('encodes genuine 32-bit IEEE Float WAV with 96 kHz high-res header', async () => {
    const numChannels = 1;
    const sampleRate = 96000;
    const length = 500;

    const buffer = new MockAudioBuffer({
      numberOfChannels: numChannels,
      length,
      sampleRate
    }) as unknown as AudioBuffer;

    const blob = encodeWav32BitFloat(buffer);
    expect(blob.type).toBe('audio/wav');

    // Expected size: 44 bytes header + (500 * 1 * 4 bytes per sample)
    const expectedSize = 44 + (500 * 1 * 4);
    expect(blob.size).toBe(expectedSize);

    const arrayBuf = await blob.arrayBuffer();
    const view = new DataView(arrayBuf);

    // Audio format code 3 = IEEE Float
    const audioFormat = view.getUint16(20, true);
    expect(audioFormat).toBe(3);

    // 32 bits per sample
    const bitsPerSample = view.getUint16(34, true);
    expect(bitsPerSample).toBe(32);

    // Sample rate 96000
    const headerSampleRate = view.getUint32(24, true);
    expect(headerSampleRate).toBe(96000);
  });
});
