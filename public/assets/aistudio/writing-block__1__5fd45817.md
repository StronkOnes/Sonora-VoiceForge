# SONORA VoiceForge — Web App Build Specification

## 1. Your mission

Build **SONORA VoiceForge**, a polished, functional web application that cleans up vocal recordings made on phones and makes them sound clearer, closer and more professional.

The user should be able to upload a recording, reduce background noise and room echo, improve the vocal tone, compare the original with the processed version, and export a high-quality audio file.

This project will later be ported to a **C++/JUCE standalone application and VST3 plugin**.

Therefore, build the web app with a clean separation between the interface and the audio-processing engine. The interface must be reusable without redesign when we port the application.

Do not build a complicated system. Start with a working product and expand it carefully.

## 2. Product goal

The core promise is:

**Record anywhere. Clean your voice. Get studio-ready audio.**

The intended users include singers, songwriters, rappers, podcasters and people recording vocal ideas on ordinary smartphones.

The app should help improve recordings affected by:

- Background hiss.
- Fans and air-conditioning.
- Traffic and household noise.
- Room echo and reverberation.
- Muddy or dull vocal tone.
- Uneven vocal levels.
- Excessive peaks.

Do not promise that every bad recording can be transformed perfectly. Avoid making damaged recordings sound artificial through excessive processing.

## 3. Technology

Use:

- React.
- TypeScript.
- Vite.
- Material UI (MUI).
- Web Audio API for supported browser audio operations and playback.
- A small, modular audio-processing layer.
- Vitest for unit tests where appropriate.

Do not use Tailwind CSS.

Use TypeScript types for all important audio-processing inputs, outputs, settings and results.

Avoid unnecessary dependencies, cloud services and paid APIs.

The first version should run locally during development and should not require a user account.

## 4. The most important architecture rule

Keep these parts separate:

### A. User interface

Responsible for:

- Layout.
- Buttons and controls.
- Waveform display.
- Playback.
- Before-and-after comparison.
- Progress and errors.
- Export settings.
- Presets.

### B. Audio processing interface

Responsible for passing audio and processing settings to an implementation that cleans the recording.

### C. Processing implementation

The initial web app can use supported browser-based processing, but it must not pretend to perform advanced AI restoration if that capability does not exist.

Later, we will replace or extend this implementation with a C++/JUCE audio engine.

**Do not put audio-processing algorithms directly inside React components.**

The interface must call a defined processing interface. This is essential for the future C++ port.

## 5. Create a simple processing interface

Create a dedicated module, for example:

`src/audio/AudioProcessor.ts`

Define clear TypeScript types for:

- Audio input.
- Processing settings.
- Processing progress.
- Processing result.
- Processing errors.
- Export settings.

The interface should expose operations equivalent to:

- Load or receive decoded audio.
- Analyse the recording.
- Process the recording with selected settings.
- Cancel processing when supported.
- Return the processed audio.
- Report progress and warnings.

Keep the interface independent of React.

Create a separate implementation module, such as:

`src/audio/WebAudioProcessor.ts`

This will provide the browser-compatible processing implementation.

Later, the C++ version will implement the same processing contract through a native bridge. Do not assume TypeScript can call C++ directly in a VST3 plugin without that bridge.

Use a simple, documented boundary between UI and processing. Do not build a complex plugin framework in the first version.

## 6. Design and branding

Use the SONORA brand.

Visual direction:

- Near-black or charcoal background.
- Silver and light-grey typography.
- Restrained warm amber accents.
- Clean spacing.
- Premium, professional appearance.
- Subtle animation.
- Clear visual hierarchy.
- Excellent readability.

Use the approved SONORA wordmark asset if one is available in the repository. Do not invent a replacement logo.

Avoid:

- Generic dashboard design.
- Excessive neon colours.
- Cluttered panels.
- Unnecessary gradients.
- Tiny labels.
- Decorative visualisers that do not represent real audio data.

The app should feel like a premium music-production tool, not a generic online audio converter.

## 7. Main user workflow

Build this complete workflow first.

### Step 1: Import audio

Allow the user to:

- Select an audio file.
- Drag and drop a file.
- See the filename, duration, sample rate and channel count when available.
- See a clear error if the format cannot be decoded.

Support common browser-decodable formats such as WAV, MP3 and M4A where the browser supports them.

Do not assume every browser can decode every format. Explain unsupported files clearly.

Keep the original file unchanged.

### Step 2: Display the recording

Show a useful waveform based on the actual decoded audio.

Provide:

- Play.
- Pause.
- Stop.
- Playback position.
- Duration.
- Seek.
- Loop playback where practical.

The waveform must reflect the actual recording, not a generated placeholder.

### Step 3: Analyse the recording

Provide a real analysis step.

Initially, this may include:

- Peak level.
- RMS level.
- Clipping detection.
- Silence detection.
- Basic noise or low-level activity estimates where technically justified.
- Duration and channel information.

Clearly distinguish measurements from estimates.

Do not claim to identify room reverberation or remove speech from background noise unless the implemented processing actually supports it.

### Step 4: Studio Clean

Add one prominent button:

**Studio Clean**

This applies the current processing preset through the audio-processing interface.

The app must show genuine progress and report errors.

The initial browser implementation can use real, modest processing such as carefully controlled filtering, gain adjustment and dynamics processing. More advanced noise suppression and de-reverberation should be implemented only when a suitable algorithm is available and verified.

Do not use a fake delay or fabricated progress indicator to simulate processing.

### Step 5: Manual controls

Provide simple controls for:

- **Noise Reduction:** controls supported noise-suppression strength.
- **Room Echo:** controls supported reverberation reduction.
- **Vocal Clarity:** adjusts supported tonal shaping.
- **Vocal Level:** adjusts output level and supported dynamics.
- **Output Level:** controls the final gain.

If the initial processing engine cannot provide a particular function properly, mark it as unavailable or experimental. Do not make an inactive slider appear functional.

### Step 6: Compare original and processed audio

Provide a clear A/B comparison.

The user must be able to switch between:

- Original.
- Processed.

Also provide a bypass option where practical.

Keep playback position aligned during comparison when possible.

The original audio must remain untouched throughout processing.

### Step 7: Export

Allow the user to export the processed audio as:

- WAV, preferably 24-bit PCM.
- WAV at 16-bit PCM when requested.
- FLAC if a suitable encoder is available.
- MP3 if a suitable encoder is available.

Initially, prioritise correct WAV export.

Do not label a file as 24-bit WAV unless it has actually been encoded as 24-bit PCM.

Offer clear sample-rate options such as 44.1 kHz and 48 kHz, using correct resampling when necessary.

Provide a filename field and a clear download action.

Keep export independent of the user interface so it can later be implemented by the native engine.

## 8. Audio quality and safety

Preserve the original recording.

Avoid:

- Accidental clipping.
- Excessive noise gating.
- Harsh high-frequency enhancement.
- Artificial-sounding dynamics.
- Abrupt truncation of vocal tails.
- Unintended changes to pitch or timing.

Use appropriate headroom during processing.

If the recording is already clipping, warn the user that clipped audio cannot always be repaired.

Do not claim that simply exporting a recording at 24-bit restores missing detail or guarantees studio quality.

A higher-quality export format is useful, but it cannot recover information that was never captured.

## 9. Presets

Provide a few simple presets:

- **Studio Clean:** balanced general-purpose cleanup.
- **Noisy Room:** stronger supported noise suppression.
- **Echoey Room:** stronger supported room treatment.
- **Natural Vocal:** restrained processing.
- **Bright Vocal:** modest clarity enhancement.

Presets must configure real processing parameters.

If a preset requires an unavailable algorithm, indicate this rather than pretending it is active.

Allow users to reset the settings.

## 10. Keep the project easy to port to C++

Follow these rules throughout development.

1. Keep processing logic outside React components.
2. Use typed settings objects instead of scattered individual values.
3. Keep the processing interface independent of browser-specific APIs.
4. Keep UI state separate from processing state.
5. Keep export settings independent from the UI.
6. Avoid browser-specific assumptions in the project model.
7. Keep algorithms and parameter ranges documented.
8. Do not build the app around a third-party cloud processing API.
9. Do not embed the processing implementation inside visual components.
10. Do not change the visual design when replacing the processing backend.

Create a short document at:

`docs/CPP_PORTING.md`

Explain:

- Where the UI lives.
- Where the audio-processing interface lives.
- How the browser implementation works.
- Which functions will need native C++ equivalents.
- Which controls map to audio parameters.
- Which browser APIs must be replaced.
- How the future JUCE bridge should communicate with the UI.

The future C++ implementation should receive audio buffers and typed parameter values, process the audio, and return results or status through an explicitly designed bridge.

Do not assume that a VST3 plugin can import arbitrary files or export them in the same way as a standalone application. Those workflows may need separate native application functionality.

## 11. Future VST3 compatibility

Do not build the VST3 plugin now.

Prepare the web app so it can be embedded in a native shell later.

The future architecture will have:

- A shared C++ audio engine.
- A standalone application for importing and exporting recordings.
- A VST3 effect for processing audio inside a DAW.
- A reusable web interface wherever the chosen native host supports it.

The UI will communicate with the C++ engine through a documented bridge.

Use named parameters with stable identifiers, for example:

- `noiseReduction`
- `roomReduction`
- `vocalClarity`
- `vocalLevel`
- `outputGain`

These names are initial interface conventions, not proof that the corresponding algorithms have already been implemented.

Do not create the native bridge prematurely. Document the contract so it can be built later.

## 12. Suggested project structure

Use this structure as a guide, adapting it to the existing repository when appropriate.

`src/`
- `app/` — application entry point and global layout.
- `components/` — reusable UI components.
- `features/import/` — file import and validation.
- `features/waveform/` — waveform display and navigation.
- `features/processing/` — processing controls and progress.
- `features/comparison/` — original/processed playback.
- `features/export/` — export settings and file creation.
- `audio/` — audio-processing interface and browser implementation.
- `audio/types.ts` — audio and processing types.
- `audio/AudioProcessor.ts` — processing contract.
- `audio/WebAudioProcessor.ts` — browser implementation.
- `audio/AudioAnalysis.ts` — audio measurements.
- `audio/AudioExport.ts` — export implementation.
- `theme/` — MUI theme.
- `utils/` — small shared utilities.

`docs/`
- `CPP_PORTING.md`
- `AUDIO_ENGINE.md`
- `TESTING.md`

Do not create empty modules for every possible future feature. Only add files when they serve a real purpose.

## 13. Error handling

Handle errors gracefully.

Examples:

- Unsupported audio format.
- File too large for available memory.
- Audio decoding failure.
- Processing failure.
- Unsupported processing option.
- Export failure.
- Invalid output settings.
- Browser audio playback unavailable.

Show helpful messages in the interface.

Do not silently discard the original file or return an empty file after a processing error.

## 14. Testing

Write tests for:

- File validation.
- Audio measurements.
- Processing parameter validation.
- Processing output length.
- Handling silence.
- Handling short recordings.
- Handling stereo and mono recordings.
- Clipping detection.
- Export format correctness.
- Correct original/processed separation.
- Error reporting.
- Preset parameter application.

Where practical, verify that a supported processing operation changes the intended audio property without introducing invalid values.

Use test audio generated for development. Do not depend on copyrighted commercial recordings.

## 15. Acceptance criteria

The first usable version must allow a user to:

1. Open the app.
2. Import a supported phone recording.
3. See its actual waveform.
4. Play the original audio.
5. Inspect basic audio measurements.
6. Apply the processing that is genuinely implemented.
7. Adjust supported processing controls.
8. Compare original and processed audio.
9. Export a valid WAV file.
10. Reopen the exported file in another audio application.
11. Receive honest warnings when a requested restoration feature is not implemented.
12. Use the app without an account or paid cloud API.
13. Keep the original recording unchanged.

The UI must be polished, but a working audio workflow is more important than decorative effects.

## 16. Required working method

First inspect the repository and explain the existing setup briefly.

Then:

1. Scaffold the application.
2. Implement the layout and theme.
3. Implement audio import and actual waveform display.
4. Implement playback and basic analysis.
5. Create the processing interface.
6. Implement and test the initial browser processing.
7. Add A/B comparison.
8. Implement correct WAV export.
9. Add presets and error handling.
10. Write the porting documentation.
11. Run the build and tests.
12. Fix errors before finishing.

Build incrementally. Do not generate the entire application in one untested step.

Do not report features as completed unless they work.

## 17. Final instruction

Build SONORA VoiceForge as a simple, premium, functional web application that can later share its interface with a JUCE/C++ implementation.

Prioritise a clean vocal workflow, reliable file handling, honest audio processing, correct export, and an architecture that makes the future port straightforward.

**Start by inspecting the repository, then scaffold and implement the working web app.**