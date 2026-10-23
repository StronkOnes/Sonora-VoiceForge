# SONORA VoiceForge — C++/JUCE Porting & Architecture Specification

## 1. System Architecture Overview

SONORA VoiceForge is engineered with a strict decoupling between:
1. **The User Interface (`src/app/`, `src/features/`, `src/components/`, `src/theme/`)**:
   Pure presentation and control layer. Never contains raw DSP calculations or direct signal processing.
2. **The Audio Processing Interface (`src/audio/AudioProcessor.ts`, `src/audio/types.ts`)**:
   Defines the abstract contract `IAudioProcessor`, strongly typed parameter structs, progress notifications, and result data structures.
3. **The DSP Engine Implementation (`src/audio/WebAudioProcessor.ts`)**:
   The current browser implementation. In the C++/JUCE standalone and VST3 build, this is replaced by the native JUCE DSP engine via a typed C++ bridge.

---

## 2. Directory & Component Mapping

| Subsystem | Web Architecture Path | Future C++/JUCE Native Path |
| :--- | :--- | :--- |
| **Abstract Processing Interface** | `src/audio/AudioProcessor.ts` | `include/sonora/AudioProcessor.hpp` |
| **Typed Parameter Definitions** | `src/audio/types.ts` | `include/sonora/AudioParams.hpp` |
| **Acoustic Analysis & Diagnostics** | `src/audio/AudioAnalysis.ts` | `source/dsp/AudioAnalysis.cpp` |
| **DSP Signal Processing Engine** | `src/audio/WebAudioProcessor.ts` | `source/dsp/VoiceForgeEngine.cpp` |
| **WAV PCM Export Engine** | `src/audio/AudioExport.ts` | `source/io/WavAudioWriter.cpp` |
| **Factory Presets** | `src/audio/presets.ts` | `source/presets/FactoryPresets.cpp` |
| **Web UI Shell (JUCE WebView)** | `src/` (Compiled Vite React Bundle) | `juce::WebBrowserComponent` / Embedded Webview |

---

## 3. Audio Parameter Contract (1:1 JUCE Parameter Mapping)

In JUCE, audio parameters are declared using `juce::AudioProcessorValueTreeState` (APVTS) or `juce::AudioParameterFloat`. The exact parameter IDs match the TypeScript `ProcessingSettings` keys:

```cpp
// C++ JUCE Parameter Declaration (juce::AudioProcessorValueTreeState::ParameterLayout)
auto layout = std::make_unique<juce::AudioProcessorValueTreeState::ParameterLayout>();

// 1. Noise Reduction: 0% to 100%
layout->add(std::make_unique<juce::AudioParameterFloat>(
    juce::ParameterID("noiseReduction", 1),
    "Noise Reduction",
    juce::NormalisableRange<float>(0.0f, 100.0f, 1.0f),
    60.0f
));

// 2. Room Echo: 0% to 100%
layout->add(std::make_unique<juce::AudioParameterFloat>(
    juce::ParameterID("roomReduction", 1),
    "Room Echo",
    juce::NormalisableRange<float>(0.0f, 100.0f, 1.0f),
    40.0f
));

// 3. Vocal Clarity: -4.0 dB to +8.0 dB
layout->add(std::make_unique<juce::AudioParameterFloat>(
    juce::ParameterID("vocalClarity", 1),
    "Vocal Clarity",
    juce::NormalisableRange<float>(-4.0f, 8.0f, 0.5f),
    3.5f
));

// 4. Vocal Level: 0% to 100%
layout->add(std::make_unique<juce::AudioParameterFloat>(
    juce::ParameterID("vocalLevel", 1),
    "Vocal Level",
    juce::NormalisableRange<float>(0.0f, 100.0f, 1.0f),
    65.0f
));

// 5. Output Gain: -12.0 dB to +6.0 dB
layout->add(std::make_unique<juce::AudioParameterFloat>(
    juce::ParameterID("outputGain", 1),
    "Output Gain",
    juce::NormalisableRange<float>(-12.0f, 6.0f, 0.5f),
    0.0f
));
```

---

## 4. Web Audio APIs to Replace in Native C++

| Web Audio API / Browser Interface | Native C++ / JUCE Replacement |
| :--- | :--- |
| `AudioBuffer` | `juce::AudioBuffer<float>` |
| `OfflineAudioContext` | `juce::AudioProcessor::processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&)` |
| `BiquadFilterNode` (HighPass, Peaking, HighShelf) | `juce::dsp::IIR::Filter<float>` / `juce::dsp::StateVariableTPTFilter` |
| `DynamicsCompressorNode` | `juce::dsp::Compressor<float>` |
| Peak Limiting | `juce::dsp::Limiter<float>` |
| File Input (`FileReader`, `decodeAudioData`) | `juce::AudioFormatManager` (`WavAudioFormat`, `OggVorbisAudioFormat`, `FlacAudioFormat`, `MP3AudioFormat`) |
| WAV Export (`DataView` ArrayBuffer) | `juce::WavAudioFormat::createWriterFor` (16-bit / 24-bit PCM) |
| UI Event Loop | `juce::Timer` or `juce::AsyncUpdater` via Native IPC Bridge |

---

## 5. Future JUCE Bridge Communication Model

The React UI will communicate with the C++ host via a JSON-RPC / IPC bridge embedded in JUCE's `WebBrowserComponent`:

1. **Parameter Change (UI -> C++)**:
   ```javascript
   window.NativeBridge.postMessage({
     type: 'SET_PARAMETER',
     parameterId: 'noiseReduction',
     value: 75.0
   });
   ```
2. **Execute Studio Clean (UI -> C++)**:
   ```javascript
   window.NativeBridge.postMessage({
     type: 'PROCESS_AUDIO',
     settings: currentSettings
   });
   ```
3. **Progress & Results (C++ -> UI)**:
   ```javascript
   window.addEventListener('NativeEvent', (e) => {
     if (e.detail.type === 'PROGRESS') {
       onProgress(e.detail.data); // 0 to 100%
     } else if (e.detail.type === 'ANALYSIS_COMPLETE') {
       onAnalysisReady(e.detail.analysis);
     }
   });
   ```

---

## 6. Standalone Application vs. VST3 Plugin Workflow

- **Standalone Host**:
  Handles local file browsing, batch drag-and-drop, sample rate conversion, and 24-bit WAV rendering to disk.
- **VST3 DAW Plugin**:
  Receives live sample blocks in real-time from the DAW track buffer (`processBlock`). File import/export actions are disabled or bypassed; instead, the 5 core parameters are automated by the host DAW (Cubase, Pro Tools, Logic Pro, Ableton Live, FL Studio).
