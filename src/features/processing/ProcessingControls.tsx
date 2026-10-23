/**
 * SONORA VoiceForge - Processing Controls Feature
 * 
 * Houses the prominent Studio Clean execution button with real progress bar,
 * preset selector, and the 5 core DSP parameter faders:
 * - Noise Reduction (0 - 100%)
 * - Room Echo (0 - 100%)
 * - Vocal Clarity (-6 to +8 dB)
 * - Vocal Level (0 - 100%)
 * - Output Gain (-12 to +6 dB)
 * Includes honest DSP disclosures and C++/JUCE port parameter mappings.
 */

import React from 'react';
import {
  Box,
  Button,
  Typography,
  Slider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Tooltip,
  SelectChangeEvent
} from '@mui/material';
import {
  Sparkles,
  RotateCcw,
  Sliders,
  Info,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { ProcessingProgress, ProcessingSettings } from '../../audio/types';
import { FACTORY_PRESETS } from '../../audio/presets';

interface ProcessingControlsProps {
  settings: ProcessingSettings;
  onSettingsChange: (settings: ProcessingSettings) => void;
  onApplyClean: () => void;
  onResetSettings: () => void;
  selectedPresetId: string;
  onSelectPreset: (presetId: string) => void;
  isProcessing: boolean;
  progress: ProcessingProgress | null;
  disabled: boolean;
}

export const ProcessingControls: React.FC<ProcessingControlsProps> = ({
  settings,
  onSettingsChange,
  onApplyClean,
  onResetSettings,
  selectedPresetId,
  onSelectPreset,
  isProcessing,
  progress,
  disabled
}) => {
  const handleSliderChange = (param: keyof ProcessingSettings) => (
    _: Event,
    value: number | number[]
  ) => {
    onSettingsChange({
      ...settings,
      [param]: value as number
    });
  };

  const handlePresetSelect = (e: SelectChangeEvent) => {
    onSelectPreset(e.target.value);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#121620',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        p: 2.5,
      }}
    >
      {/* Header with Preset Selector and Reset */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Sliders size={18} color="#F59E0B" />
          <Typography variant="h4" sx={{ color: '#E6E9EE' }}>
            Vocal Cleanup Parameters
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <InputLabel id="preset-select-label" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              Preset
            </InputLabel>
            <Select
              labelId="preset-select-label"
              value={selectedPresetId}
              label="Preset"
              onChange={handlePresetSelect}
              disabled={disabled || isProcessing}
              sx={{
                fontSize: '0.85rem',
                backgroundColor: '#161B26',
                color: '#E6E9EE',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.12)'
                }
              }}
            >
              {FACTORY_PRESETS.map(p => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.85rem' }}>
                  {p.name}
                </MenuItem>
              ))}
              <MenuItem value="custom" sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}>
                Custom Settings
              </MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={onResetSettings}
            disabled={disabled || isProcessing}
            startIcon={<RotateCcw size={14} />}
            sx={{ fontSize: '0.8rem', color: '#94A3B8', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            Reset
          </Button>
        </Box>
      </Box>

      {/* 5 Core DSP Parameter Sliders */}
      <Grid container spacing={3}>
        {/* 1. Noise Reduction */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  Noise Reduction
                </Typography>
                <Tooltip title="Controls adaptive downward expansion and spectral attenuation for steady room noise, computer fans, and hiss. C++ Parameter: noiseReduction">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.noiseReduction}%
              </Typography>
            </Box>
            <Slider
              value={settings.noiseReduction}
              onChange={handleSliderChange('noiseReduction')}
              disabled={disabled || isProcessing}
              min={0}
              max={100}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Downward gate & spectral hiss cut
            </Typography>
          </Box>
        </Grid>

        {/* 2. Room Echo */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  Room Echo
                </Typography>
                <Tooltip title="Controls transient-to-decay dampening. Suppresses reflective reverb tails in untreated bedrooms and kitchens. C++ Parameter: roomReduction">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.roomReduction}%
              </Typography>
            </Box>
            <Slider
              value={settings.roomReduction}
              onChange={handleSliderChange('roomReduction')}
              disabled={disabled || isProcessing}
              min={0}
              max={100}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Transient decay tail dampening
            </Typography>
          </Box>
        </Grid>

        {/* 3. Vocal Clarity */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  Vocal Clarity
                </Typography>
                <Tooltip title="Parametric tone shaping: 3.2kHz intelligibility boost, 320Hz mud cut, and 11kHz vocal air shelf. C++ Parameter: vocalClarity">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.vocalClarity > 0 ? `+${settings.vocalClarity.toFixed(1)}` : settings.vocalClarity.toFixed(1)} dB
              </Typography>
            </Box>
            <Slider
              value={settings.vocalClarity}
              onChange={handleSliderChange('vocalClarity')}
              disabled={disabled || isProcessing}
              min={-4}
              max={8}
              step={0.5}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Presence & intelligibility sculpt
            </Typography>
          </Box>
        </Grid>

        {/* 4. High-Res Air & Harmonic Resolution */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  High-Res Air & Sheen
                </Typography>
                <Tooltip title="Reconstructs upper acoustic harmonics (>12 kHz) to recover studio microphone resolution and expensive air sheen. C++ Parameter: harmonicAir">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.harmonicAir ?? 45}%
              </Typography>
            </Box>
            <Slider
              value={settings.harmonicAir ?? 45}
              onChange={handleSliderChange('harmonicAir')}
              disabled={disabled || isProcessing}
              min={0}
              max={100}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Ultra-high acoustic resolution & brilliance
            </Typography>
          </Box>
        </Grid>

        {/* 5. Vocal Level */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  Vocal Level (Dynamics)
                </Typography>
                <Tooltip title="Soft-knee leveling compressor that evens out distance shifts from smartphone microphone. C++ Parameter: vocalLevel">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.vocalLevel}%
              </Typography>
            </Box>
            <Slider
              value={settings.vocalLevel}
              onChange={handleSliderChange('vocalLevel')}
              disabled={disabled || isProcessing}
              min={0}
              max={100}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Transparent soft-knee dynamics leveling
            </Typography>
          </Box>
        </Grid>

        {/* 6. Output Level */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 1.5, border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
                  Output Gain Trim
                </Typography>
                <Tooltip title="Master output gain stage with automatic -0.5 dBFS ceiling limiter protection. C++ Parameter: outputGain">
                  <Info size={14} color="#64748B" />
                </Tooltip>
              </Box>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {settings.outputGain > 0 ? `+${settings.outputGain.toFixed(1)}` : settings.outputGain.toFixed(1)} dB
              </Typography>
            </Box>
            <Slider
              value={settings.outputGain}
              onChange={handleSliderChange('outputGain')}
              disabled={disabled || isProcessing}
              min={-12}
              max={6}
              step={0.5}
            />
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Master trim protected by safety limiter
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Prominent Studio Clean Action */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        {isProcessing && progress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                {progress.message}
              </Typography>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#94A3B8' }}>
                {progress.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress.percentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: '#252B38',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#F59E0B',
                  borderRadius: 3
                }
              }}
            />
          </Box>
        )}

        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled || isProcessing}
          onClick={onApplyClean}
          startIcon={<Sparkles size={18} />}
          sx={{
            py: 1.5,
            fontSize: '1rem',
            letterSpacing: '0.02em',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.25)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
            }
          }}
        >
          {isProcessing ? 'Rendering Studio Clean...' : 'Studio Clean'}
        </Button>
      </Box>
    </Box>
  );
};
