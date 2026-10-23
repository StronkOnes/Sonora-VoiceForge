# SONORA VoiceForge — Audio DSP Engine Specification

## 1. Processing Chain Architecture

The audio pipeline is structured into 6 sequential DSP processing blocks:

```
[Raw Phone Audio Buffer]
         │
         ▼
[Stage 1: Acoustic Pre-Analysis & Headroom Check]
         │
         ▼
[Stage 2: 80Hz Butterworth High-Pass Rumble Filter]
         │
         ▼
[Stage 3: 5-Band Parametric Vocal Sculpting & High-Res Air EQ]
   ├─ Band 1: 320 Hz De-Mud Peaking Notch (Q=1.1, -1.0 to -4.0 dB)
   ├─ Band 2: 3200 Hz Vocal Presence Peaking Boost (Q=1.2, +1.0 to +6.0 dB)
   ├─ Band 3: 6800 Hz Sibilance De-Esser Peaking Dip (Q=2.0, -1.0 to -6.0 dB)
   ├─ Band 4: 11000 Hz Studio Air High-Shelf (+1.0 to +3.5 dB)
   └─ Band 5: 13500 Hz High-Resolution Harmonic Reconstruction Air Shelf (+0 to +4.5 dB)
         │
         ▼
[Stage 4: Adaptive Downward Noise Expander & Tail De-Reverb]
   ├─ Speech envelope tracking (15ms window, 8ms attack, 120ms release)
   ├─ Dynamic spectral gate below noise floor (-6 to -18 dB attenuation)
   └─ Transient decay tail suppression (room reflection dampening)
         │
         ▼
[Stage 5: Soft-Knee Vocal Leveling Compressor]
   ├─ Threshold: -18 to -32 dBFS
   ├─ Knee: 12 dB (transparent vocal contour)
   ├─ Ratio: 2.5:1 to 5:1
   └─ Attack: 12ms / Release: 140ms
         │
         ▼
[Stage 6: Master Output Trim & Safety Peak Limiter]
   ├─ Lookahead ceiling: -0.5 dBFS
   └─ Output Gain Trim (-12 dB to +6 dB)
         │
         ▼
[Clean Studio Master Buffer]
```

---

## 2. Mathematical Formulations

### A. True Peak & RMS Detection
- **Peak Amplitude**:
  $$\text{Peak} = \max_{n} |x[n]|$$
  $$\text{Peak}_{\text{dBFS}} = 20 \log_{10}(\text{Peak})$$
- **Root Mean Square (RMS)**:
  $$\text{RMS} = \sqrt{\frac{1}{N}\sum_{n=0}^{N-1} x[n]^2}$$
  $$\text{RMS}_{\text{dBFS}} = 20 \log_{10}(\text{RMS})$$
- **Crest Factor**:
  $$\text{Crest Factor}_{\text{dB}} = \text{Peak}_{\text{dBFS}} - \text{RMS}_{\text{dBFS}}$$

### B. Adaptive Downward Noise Gate
Let $E[n]$ be the fast-envelope follower:
$$E[n] = \max(|x[n]|, E[n-1] \cdot \lambda_{\text{decay}})$$
If $E[n] < T_{\text{noise}}$:
$$G_{\text{target}}[n] = G_{\text{min}} + \left(\frac{E[n]}{T_{\text{noise}}}\right) \cdot (1.0 - G_{\text{min}})$$
Smooth gain transition:
$$G[n] = G[n-1] + \alpha \cdot (G_{\text{target}}[n] - G[n-1])$$

---

## 3. Preservation of Original Audio

The original decoded audio buffer is stored in an immutable reference throughout the session. Processing creates a new `AudioBuffer` and never alters input samples in place.
