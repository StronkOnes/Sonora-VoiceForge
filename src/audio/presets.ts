/**
 * SONORA VoiceForge - Factory Presets
 * 
 * Pre-calibrated processing presets targeting common phone recording environments:
 * - Studio Clean (Balanced general-purpose cleanup)
 * - Noisy Room (Aggressive noise suppression & downward gating)
 * - Echoey Room (Transient tail decay suppression & room dampening)
 * - Natural Vocal (Subtle transparent touch-up)
 * - Bright Vocal (Air, presence, and crisp sibilance control)
 */

import { Preset } from './types';

export const FACTORY_PRESETS: Preset[] = [
  {
    id: 'studio-clean',
    name: 'Studio Clean',
    description: 'Balanced, general-purpose vocal restoration for everyday smartphone recordings.',
    isFactory: true,
    recommendedFor: 'Voice notes, song ideas, rough bedroom demos with light noise.',
    settings: {
      noiseReduction: 60,
      roomReduction: 40,
      vocalClarity: 3.5,
      vocalLevel: 65,
      outputGain: 0.0,
      highPassHz: 80,
      deEsser: 40,
      harmonicAir: 45,
      highResMode: true
    }
  },
  {
    id: 'noisy-room',
    name: 'Noisy Room',
    description: 'Stronger noise suppression and downward expansion for AC, computer fans, and outdoor hiss.',
    isFactory: true,
    recommendedFor: 'Recordings with prominent background hum, air conditioning, or street traffic.',
    settings: {
      noiseReduction: 85,
      roomReduction: 45,
      vocalClarity: 4.0,
      vocalLevel: 70,
      outputGain: 0.5,
      highPassHz: 95,
      deEsser: 50,
      harmonicAir: 35,
      highResMode: true
    }
  },
  {
    id: 'echoey-room',
    name: 'Echoey Room',
    description: 'Stronger transient tail dampening and decay suppression for untreated reflective spaces.',
    isFactory: true,
    recommendedFor: 'Tile bathrooms, large empty bedrooms, kitchens, high ceilings.',
    settings: {
      noiseReduction: 50,
      roomReduction: 75,
      vocalClarity: 3.0,
      vocalLevel: 60,
      outputGain: -0.5,
      highPassHz: 85,
      deEsser: 45,
      harmonicAir: 40,
      highResMode: true
    }
  },
  {
    id: 'natural-vocal',
    name: 'Natural Vocal',
    description: 'Restrained, transparent processing preserving organic acoustic intimacy.',
    isFactory: true,
    recommendedFor: 'Acoustic vocals, intimate podcast speeches recorded close to the phone.',
    settings: {
      noiseReduction: 35,
      roomReduction: 25,
      vocalClarity: 1.5,
      vocalLevel: 40,
      outputGain: 0.0,
      highPassHz: 70,
      deEsser: 30,
      harmonicAir: 30,
      highResMode: true
    }
  },
  {
    id: 'bright-vocal',
    name: 'Bright Vocal',
    description: 'Enhanced high-end presence, articulate consonants, and modern radio sheen.',
    isFactory: true,
    recommendedFor: 'Dull or muffled recordings, rap vocals, spoken word requiring upfront projection.',
    settings: {
      noiseReduction: 60,
      roomReduction: 35,
      vocalClarity: 6.0,
      vocalLevel: 75,
      outputGain: 0.0,
      highPassHz: 85,
      deEsser: 60,
      harmonicAir: 70,
      highResMode: true
    }
  }
];

export function getPresetById(id: string): Preset | undefined {
  return FACTORY_PRESETS.find(p => p.id === id);
}
