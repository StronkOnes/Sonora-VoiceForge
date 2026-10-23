# SONORA VoiceForge — Testing & Verification Guide

## 1. Automated Test Suite

The project includes unit tests executing under Vitest covering:

- **Audio Analysis (`tests/audio-analysis.test.ts`)**:
  - Exact Peak and RMS level calculation.
  - Crest Factor computation.
  - Clipping sample detection and percentage.
  - Silence handling.
  - Heuristic noise floor estimation.

- **Audio Export Engine (`tests/audio-export.test.ts`)**:
  - RIFF WAVE header compliance (ASCII byte checks for 'RIFF', 'WAVE', 'fmt ', 'data').
  - True 24-bit PCM sample packing (3 bytes per sample, 24 bitsPerSample header validation).
  - True 16-bit PCM sample packing (2 bytes per sample, 16 bitsPerSample header validation).
  - Channel count and block alignment math.

- **Presets & Parameters (`tests/presets.test.ts`)**:
  - Parameter range boundaries (clamped within physical limits).
  - Preset retrieval and default state validation.

---

## 2. Running Automated Tests

Run the Vitest test suite in the terminal:
```bash
npm run test
```

Or run directly with coverage:
```bash
npx vitest run
```
