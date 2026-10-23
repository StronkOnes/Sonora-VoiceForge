import { describe, it, expect } from 'vitest';
import { FACTORY_PRESETS, getPresetById } from '../src/audio/presets';

describe('Factory Presets', () => {
  it('contains all required factory presets', () => {
    const presetIds = FACTORY_PRESETS.map(p => p.id);
    expect(presetIds).toContain('studio-clean');
    expect(presetIds).toContain('noisy-room');
    expect(presetIds).toContain('echoey-room');
    expect(presetIds).toContain('natural-vocal');
    expect(presetIds).toContain('bright-vocal');
  });

  it('provides valid parameter ranges for all presets', () => {
    for (const preset of FACTORY_PRESETS) {
      const s = preset.settings;
      expect(s.noiseReduction).toBeGreaterThanOrEqual(0);
      expect(s.noiseReduction).toBeLessThanOrEqual(100);

      expect(s.roomReduction).toBeGreaterThanOrEqual(0);
      expect(s.roomReduction).toBeLessThanOrEqual(100);

      expect(s.vocalClarity).toBeGreaterThanOrEqual(-10);
      expect(s.vocalClarity).toBeLessThanOrEqual(10);

      expect(s.vocalLevel).toBeGreaterThanOrEqual(0);
      expect(s.vocalLevel).toBeLessThanOrEqual(100);

      expect(s.outputGain).toBeGreaterThanOrEqual(-12);
      expect(s.outputGain).toBeLessThanOrEqual(6);
    }
  });

  it('retrieves preset by ID correctly', () => {
    const clean = getPresetById('studio-clean');
    expect(clean).toBeDefined();
    expect(clean?.name).toBe('Studio Clean');

    const nonExistent = getPresetById('unknown-preset');
    expect(nonExistent).toBeUndefined();
  });
});
