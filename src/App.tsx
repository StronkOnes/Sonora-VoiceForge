/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Download,
  FolderOpen,
  Volume2,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  BookOpen
} from 'lucide-react';

import { sonoraTheme } from './theme/theme';
import { AudioSourceData, ProcessingProgress, ProcessingResult, ProcessingSettings } from './audio/types';
import { DEFAULT_PROCESSING_SETTINGS } from './audio/AudioProcessor';
import { WebAudioProcessor } from './audio/WebAudioProcessor';
import { FACTORY_PRESETS, getPresetById } from './audio/presets';

import { AudioImport } from './features/import/AudioImport';
import { AudioWaveform } from './features/waveform/AudioWaveform';
import { AudioAnalysisPanel } from './features/analysis/AudioAnalysisPanel';
import { ProcessingControls } from './features/processing/ProcessingControls';
import { AudioExportDialog } from './features/export/AudioExportDialog';
import { RecordingGuideDialog } from './features/guide/RecordingGuideDialog';

export default function App() {
  // Audio state
  const [sourceData, setSourceData] = useState<AudioSourceData | null>(null);
  const [processedResult, setProcessedResult] = useState<ProcessingResult | null>(null);
  const [activeTrack, setActiveTrack] = useState<'original' | 'processed'>('original');
  const [isImportLoading, setIsImportLoading] = useState(false);

  // Recording guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Processing settings & presets
  const [settings, setSettings] = useState<ProcessingSettings>(DEFAULT_PROCESSING_SETTINGS);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('studio-clean');

  // Processing execution & progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  // Export modal state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  // Singleton instance of audio processor
  const processor = useMemo(() => new WebAudioProcessor(), []);

  // Handle new audio load
  const handleAudioLoaded = useCallback((data: AudioSourceData) => {
    setSourceData(data);
    setProcessedResult(null);
    setActiveTrack('original');
    setProcessingError(null);
    setSnackbarMsg(`Decoded "${data.metadata.fileName}" (${data.metadata.duration.toFixed(1)}s) successfully.`);
  }, []);

  // Handle Preset Selection
  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId !== 'custom') {
      const preset = getPresetById(presetId);
      if (preset) {
        setSettings({ ...preset.settings });
      }
    }
  }, []);

  // Handle Parameter Slider Change
  const handleSettingsChange = useCallback((newSettings: ProcessingSettings) => {
    setSettings(newSettings);
    setSelectedPresetId('custom');
  }, []);

  // Reset to default preset settings
  const handleResetSettings = useCallback(() => {
    const defaultPreset = FACTORY_PRESETS[0];
    setSelectedPresetId(defaultPreset.id);
    setSettings({ ...defaultPreset.settings });
    setSnackbarMsg('Settings reset to Studio Clean defaults.');
  }, []);

  // Execute Studio Clean
  const handleApplyClean = useCallback(async () => {
    if (!sourceData) return;
    setIsProcessing(true);
    setProcessingError(null);
    setProgress({ stage: 'analyzing', percentage: 5, message: 'Initiating processing engine...' });

    try {
      const result = await processor.process(sourceData.buffer, settings, (p) => {
        setProgress(p);
      });

      setProcessedResult(result);
      setActiveTrack('processed');
      setSnackbarMsg(`Studio Clean completed in ${result.processingTimeMs}ms.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Processing failed.';
      setProcessingError(msg);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [sourceData, settings, processor]);

  return (
    <ThemeProvider theme={sonoraTheme}>
      <CssBaseline />

      {/* Main Container */}
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0A0C10' }}>
        {/* Top Bar Contract: Brand Title - Nav Links - 1 Primary Action */}
        <Box
          component="header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2.5, md: 5 },
            py: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0D1017',
          }}
        >
          {/* Zone 1: Single element brand wordmark */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                backgroundColor: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0C10',
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '-0.05em'
              }}
            >
              S
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#E6E9EE',
                whiteSpace: 'nowrap'
              }}
            >
              SONORA <span style={{ color: '#F59E0B', fontWeight: 600 }}>VoiceForge</span>
            </Typography>
          </Box>

          {/* Zone 2: Informational specs */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 3,
              fontSize: '0.8rem',
              color: '#94A3B8'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Cpu size={14} color="#F59E0B" />
              <span>WebAudio DSP · JUCE/C++ Bridge Ready</span>
            </Box>
            <span style={{ color: '#475569' }}>·</span>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Layers size={14} color="#38BDF8" />
              <span>24-bit PCM Master Export</span>
            </Box>
          </Box>

          {/* Zone 3: 1 Primary Action + Guide */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="text"
              size="small"
              onClick={() => setIsGuideOpen(true)}
              startIcon={<BookOpen size={15} color="#F59E0B" />}
              sx={{ color: '#E6E9EE', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
            >
              Recording Guide
            </Button>

            {sourceData && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setSourceData(null);
                  setProcessedResult(null);
                }}
                startIcon={<FolderOpen size={15} />}
                sx={{ fontSize: '0.8rem', color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                Change File
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              disabled={!processedResult}
              onClick={() => setIsExportOpen(true)}
              startIcon={<Download size={16} />}
              sx={{ whiteSpace: 'nowrap', px: 2 }}
            >
              Export Master
            </Button>
          </Box>
        </Box>

        {/* Content Body */}
        <Container maxWidth="xl" sx={{ flex: 1, py: { xs: 2.5, md: 4 } }}>
          {/* Processing Error Banner */}
          {processingError && (
            <Alert
              severity="error"
              sx={{ mb: 3, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.25)' }}
              onClose={() => setProcessingError(null)}
            >
              {processingError}
            </Alert>
          )}

          {!sourceData ? (
            /* Step 1: Initial Import View */
            <Box sx={{ maxWidth: 880, mx: 'auto', mt: { xs: 2, md: 4 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h1" sx={{ mb: 1.5, fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
                  Record anywhere. Clean your voice.
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', maxWidth: 640, mx: 'auto' }}>
                  Professional vocal restoration for phone recordings. Neutralize room echo, computer fans, background hiss, and muddy acoustics with studio-grade dynamics and clarity.
                </Typography>
              </Box>

              <AudioImport
                onAudioLoaded={handleAudioLoaded}
                isLoading={isImportLoading}
                setIsLoading={setIsImportLoading}
              />

              {/* Producer-Ready Guide Promo Banner */}
              <Box
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: '#121620',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', display: 'flex' }}>
                    <BookOpen size={24} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                      Producer-Ready Vocal Guide
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Best practices to eliminate mic pops, room reflections, and electrical hisses on any phone before tracking.
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setIsGuideOpen(true)}
                  sx={{ color: '#F59E0B', borderColor: 'rgba(245, 158, 11, 0.4)', whiteSpace: 'nowrap' }}
                >
                  Open Studio Guide
                </Button>
              </Box>
            </Box>
          ) : (
            /* Loaded Audio Active Workspace */
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* File Summary Bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1.75,
                  backgroundColor: '#121620',
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  flexWrap: 'wrap',
                  gap: 1.5
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Volume2 size={18} color="#F59E0B" />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                    {sourceData.metadata.fileName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    ({(sourceData.metadata.fileSize / (1024 * 1024)).toFixed(2)} MB)
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.8rem', color: '#94A3B8' }}>
                  <span>{sourceData.metadata.duration.toFixed(2)}s</span>
                  <span style={{ color: '#475569' }}>·</span>
                  <span>{sourceData.metadata.sampleRate} Hz</span>
                  <span style={{ color: '#475569' }}>·</span>
                  <span>{sourceData.metadata.numberOfChannels === 1 ? 'Mono' : 'Stereo'}</span>
                  <span style={{ color: '#475569' }}>·</span>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setIsGuideOpen(true)}
                    startIcon={<BookOpen size={14} color="#F59E0B" />}
                    sx={{ color: '#F59E0B', fontSize: '0.78rem', p: 0.5, minWidth: 'auto' }}
                  >
                    Producer Tips
                  </Button>
                </Box>
              </Box>

              {/* Step 2 & 6: Interactive Waveform & Synchronized A/B Playback */}
              <AudioWaveform
                originalBuffer={sourceData.buffer}
                processedBuffer={processedResult?.processedBuffer || null}
                activeTrack={activeTrack}
                onTrackChange={setActiveTrack}
                isProcessing={isProcessing}
              />

              {/* Step 3: Acoustic Analysis & Diagnostics Panel */}
              <AudioAnalysisPanel
                metadata={sourceData.metadata}
                analysis={sourceData.analysis}
                processedAnalysis={processedResult?.analysisAfter || null}
              />

              {/* Step 4 & 5: Processing Controls & Studio Clean Trigger */}
              <ProcessingControls
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onApplyClean={handleApplyClean}
                onResetSettings={handleResetSettings}
                selectedPresetId={selectedPresetId}
                onSelectPreset={handleSelectPreset}
                isProcessing={isProcessing}
                progress={progress}
                disabled={isImportLoading}
              />
            </Box>
          )}
        </Container>

        {/* Footer with Porting Architecture Notes */}
        <Box
          component="footer"
          sx={{
            py: 2.5,
            px: { xs: 2.5, md: 5 },
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#0A0C10',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            fontSize: '0.78rem',
            color: '#64748B'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span>SONORA Audio Technologies</span>
            <span>·</span>
            <span>Standalone Web & C++/JUCE Engine Ready</span>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span>Strict UI / DSP Engine Decoupling</span>
            <span>·</span>
            <span>Non-destructive Audio Pipeline</span>
          </Box>
        </Box>

        {/* Export Modal Dialog */}
        <AudioExportDialog
          open={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          processedBuffer={processedResult?.processedBuffer || null}
          defaultFileName={sourceData?.metadata.fileName || 'Sonora_Vocal_Clean'}
        />

        {/* Producer-Ready Recording Best Practices Guide Modal */}
        <RecordingGuideDialog
          open={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />

        {/* Action Feedback Snackbar */}
        <Snackbar
          open={Boolean(snackbarMsg)}
          autoHideDuration={4000}
          onClose={() => setSnackbarMsg(null)}
          message={snackbarMsg}
        />
      </Box>
    </ThemeProvider>
  );
}
