/**
 * SONORA VoiceForge - Built-in Vocal Sample Generator
 * 
 * Generates realistic vocal recordings affected by typical phone artifacts:
 * - Bedroom Vocal (acoustics with background fan hiss and 60Hz electrical hum)
 * - Kitchen Podcast (tile reflection room echo and distant refrigerator hum)
 * - Rap Demo (handling sub-bass rumble, dynamic peaks, and sibilance)
 * 
 * Enables immediate out-of-the-box testing and verification.
 */

export interface SampleRecording {
  id: string;
  title: string;
  description: string;
  durationSec: number;
  condition: string;
}

export const SAMPLE_RECORDINGS: SampleRecording[] = [
  {
    id: 'bedroom-fan-vocal',
    title: 'Bedroom Vocal (Phone on Desk)',
    description: 'Vocal phrase recorded near a desk fan with noticeable steady background hiss.',
    durationSec: 5.2,
    condition: 'Continuous broadband fan hiss + minor room flutter'
  },
  {
    id: 'kitchen-podcast-echo',
    title: 'Kitchen Podcast (Reflective Walls)',
    description: 'Spoken monologue in an untreated room with hard tile reverberant reflections.',
    durationSec: 5.6,
    condition: 'Pronounced room echo tails + uneven mic distance'
  },
  {
    id: 'phone-rap-rumble',
    title: 'Phone Rap Demo (Sub Thumps & Peaks)',
    description: 'Dynamic rap vocal with hand-handling low frequency rumble and hot peaks.',
    durationSec: 4.8,
    condition: 'Heavy low-end rumble (<100Hz) + peak transients'
  }
];

export async function generateSampleAudio(
  sampleId: string,
  sampleRate: number = 44100
): Promise<AudioBuffer> {
  const sampleDef = SAMPLE_RECORDINGS.find(s => s.id === sampleId) || SAMPLE_RECORDINGS[0];
  const duration = sampleDef.durationSec;
  const numSamples = Math.floor(sampleRate * duration);

  const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  const buffer = audioCtx.createBuffer(1, numSamples, sampleRate);
  const data = buffer.getChannelData(0);

  // Synthesize realistic vocal formant sequence with pitch contour
  // Syllables sequence with pauses
  const notes = sampleId === 'phone-rap-rumble'
    ? [130, 130, 138, 130, 146, 130, 123, 130] // rap cadence
    : sampleId === 'kitchen-podcast-echo'
    ? [115, 120, 118, 110, 122, 115, 108] // speech inflection
    : [220, 246, 261, 246, 220, 196, 220]; // melodic singing phrase

  const phraseDuration = duration / (notes.length + 1);

  let phase = 0;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIdx = Math.floor(t / phraseDuration);

    let vocalVal = 0;
    if (noteIdx < notes.length) {
      const localT = (t - noteIdx * phraseDuration) / phraseDuration;
      
      // Syllable envelope: attack, sustain, decay, brief pause
      let env = 0;
      if (localT < 0.15) {
        env = localT / 0.15;
      } else if (localT < 0.75) {
        env = 1.0 - (localT - 0.15) * 0.2;
      } else if (localT < 0.90) {
        env = 0.8 * (1.0 - (localT - 0.75) / 0.15);
      } else {
        env = 0; // silence pause between words
      }

      if (env > 0) {
        const baseFreq = notes[noteIdx] + Math.sin(2 * Math.PI * 5.5 * t) * 1.5; // vibrato
        phase += (2 * Math.PI * baseFreq) / sampleRate;

        // Formant synthesis for natural voice: F1 ~ 600Hz, F2 ~ 1400Hz, F3 ~ 2600Hz
        const h1 = Math.sin(phase) * 0.7;
        const h2 = Math.sin(phase * 2) * 0.45;
        const h3 = Math.sin(phase * 3) * 0.35;
        const h4 = Math.sin(phase * 4) * 0.25;
        const h5 = Math.sin(phase * 5) * 0.18;
        const h6 = Math.sin(phase * 6) * 0.12;

        vocalVal = (h1 + h2 + h3 + h4 + h5 + h6) * env * 0.55;
      }
    }

    // Add acoustic room defects based on sample condition
    let defectVal = 0;

    if (sampleId === 'bedroom-fan-vocal') {
      // Fan hiss (pink-ish noise) + 60Hz electrical hum
      const whiteNoise = (Math.random() * 2 - 1) * 0.055;
      const hum60 = Math.sin(2 * Math.PI * 60 * t) * 0.025;
      const hum120 = Math.sin(2 * Math.PI * 120 * t) * 0.012;
      defectVal = whiteNoise + hum60 + hum120;
    } else if (sampleId === 'kitchen-podcast-echo') {
      // Tile reflection: add early reflections (delayed echo copies)
      const delay1 = Math.floor(sampleRate * 0.08); // 80ms
      const delay2 = Math.floor(sampleRate * 0.16); // 160ms
      const echo1 = i > delay1 ? data[i - delay1] * 0.35 : 0;
      const echo2 = i > delay2 ? data[i - delay2] * 0.22 : 0;
      const ambientHiss = (Math.random() * 2 - 1) * 0.025;
      defectVal = echo1 + echo2 + ambientHiss;
    } else if (sampleId === 'phone-rap-rumble') {
      // Sub-bass phone handling thumps (30Hz - 60Hz)
      const subThump = Math.sin(2 * Math.PI * 35 * t + Math.sin(t * 8)) * 0.12;
      const lightHiss = (Math.random() * 2 - 1) * 0.03;
      defectVal = subThump + lightHiss;
    }

    // Combine voice + room defects
    data[i] = vocalVal + defectVal;
  }

  // Close context to avoid leaking
  await audioCtx.close();
  return buffer;
}
