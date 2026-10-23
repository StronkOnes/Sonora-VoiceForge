/**
 * SONORA VoiceForge - Audio Export Modal / Dialog
 * 
 * Supports genuine 24-bit PCM and 16-bit PCM WAV export,
 * sample-rate conversion (44.1 kHz / 48 kHz), peak normalization,
 * and direct file download.
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { Download, FileAudio, Check, AlertCircle } from 'lucide-react';
import { ExportFormat, ExportSettings } from '../../audio/types';
import { exportAudioBuffer, triggerBlobDownload } from '../../audio/AudioExport';

interface AudioExportDialogProps {
  open: boolean;
  onClose: () => void;
  processedBuffer: AudioBuffer | null;
  defaultFileName: string;
}

export const AudioExportDialog: React.FC<AudioExportDialogProps> = ({
  open,
  onClose,
  processedBuffer,
  defaultFileName
}) => {
  const [format, setFormat] = useState<ExportFormat>('wav-32f');
  const [sampleRate, setSampleRate] = useState<44100 | 48000 | 96000>(48000);
  const [fileName, setFileName] = useState(
    defaultFileName.replace(/\.[^/.]+$/, '') + '_SonoraClean'
  );
  const [normalizePeaks, setNormalizePeaks] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!processedBuffer) return;
    setIsExporting(true);
    setError(null);

    try {
      const settings: ExportSettings = {
        format,
        sampleRate,
        fileName: fileName.trim() ? fileName.trim() : 'SonoraClean_Vocal',
        normalizePeaks,
        targetPeakDb: -0.5
      };

      const blob = await exportAudioBuffer(processedBuffer, settings, (p) => {
        setExportProgress(p.percentage);
        setProgressMsg(p.message);
      });

      const fullFileName = `${settings.fileName}.${format === 'wav-32f' || format === 'wav-24' || format === 'wav-16' ? 'wav' : 'wav'}`;
      triggerBlobDownload(blob, fullFileName);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Export failed.';
      setError(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const bytesPerSample = format === 'wav-32f' ? 4 : format === 'wav-24' ? 3 : 2;
  const estimatedSizeBytes = processedBuffer
    ? Math.round(
        processedBuffer.duration *
          sampleRate *
          processedBuffer.numberOfChannels *
          bytesPerSample +
          44
      )
    : 0;

  const estimatedSizeMb = (estimatedSizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={isExporting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2
          }
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileAudio size={20} color="#F59E0B" />
          <Typography variant="h3" sx={{ fontSize: '1.2rem', color: '#E6E9EE' }}>
            Export Studio Master
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2.5 }}>
        {error && (
          <Alert severity="error" icon={<AlertCircle size={18} />} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filename Field */}
        <TextField
          label="File Name"
          fullWidth
          size="small"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          disabled={isExporting}
          sx={{
            mb: 2.5,
            '& .MuiInputBase-input': { color: '#E6E9EE' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.14)' }
          }}
        />

        {/* Format Selector */}
        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <InputLabel id="export-format-label" sx={{ color: '#94A3B8' }}>
            Export Format & Bit Depth
          </InputLabel>
          <Select
            labelId="export-format-label"
            value={format}
            label="Export Format & Bit Depth"
            onChange={(e: SelectChangeEvent) => setFormat(e.target.value as ExportFormat)}
            disabled={isExporting}
            sx={{
              color: '#E6E9EE',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.14)' }
            }}
          >
            <MenuItem value="wav-32f">
              WAV · 32-bit Float (Ultimate High-Res, Zero Distortion, Unlimited Headroom)
            </MenuItem>
            <MenuItem value="wav-24">
              WAV · 24-bit PCM (Studio Standard, Maximum Dynamic Precision)
            </MenuItem>
            <MenuItem value="wav-16">
              WAV · 16-bit PCM (CD Standard with TPDF Dither)
            </MenuItem>
          </Select>
        </FormControl>

        {/* Sample Rate Selector */}
        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <InputLabel id="export-sample-rate-label" sx={{ color: '#94A3B8' }}>
            Sample Rate
          </InputLabel>
          <Select
            labelId="export-sample-rate-label"
            value={sampleRate.toString()}
            label="Sample Rate"
            onChange={(e: SelectChangeEvent) => setSampleRate(Number(e.target.value) as 44100 | 48000 | 96000)}
            disabled={isExporting}
            sx={{
              color: '#E6E9EE',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.14)' }
            }}
          >
            <MenuItem value="96000">96,000 Hz (96 kHz - High-Resolution Studio Master)</MenuItem>
            <MenuItem value="48000">48,000 Hz (48 kHz - Video & Modern DAW Standard)</MenuItem>
            <MenuItem value="44100">44,100 Hz (44.1 kHz - Music & Streaming Standard)</MenuItem>
          </Select>
        </FormControl>

        {/* Normalization Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={normalizePeaks}
              onChange={(e) => setNormalizePeaks(e.target.checked)}
              disabled={isExporting}
              sx={{ color: '#F59E0B', '&.Mui-checked': { color: '#F59E0B' } }}
            />
          }
          label={
            <Box>
              <Typography variant="body2" sx={{ color: '#E6E9EE', fontWeight: 500 }}>
                Normalize True Peak to -0.5 dBFS
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Maximizes clean headroom without digital overs or inter-sample clipping.
              </Typography>
            </Box>
          }
          sx={{ mb: 2, alignItems: 'flex-start' }}
        />

        {/* Export Details Bar */}
        <Box
          sx={{
            p: 1.5,
            backgroundColor: '#161B26',
            borderRadius: 1.5,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            Estimated File Size:
          </Typography>
          <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
            ~{estimatedSizeMb} MB
          </Typography>
        </Box>

        {/* Progress bar during export */}
        {isExporting && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#F59E0B' }}>
                {progressMsg}
              </Typography>
              <Typography variant="caption" className="tabular-nums" sx={{ color: '#94A3B8' }}>
                {exportProgress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={exportProgress}
              sx={{
                height: 5,
                borderRadius: 2.5,
                backgroundColor: '#252B38',
                '& .MuiLinearProgress-bar': { backgroundColor: '#F59E0B' }
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Button onClick={onClose} disabled={isExporting} sx={{ color: '#94A3B8' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={isExporting || !processedBuffer}
          startIcon={<Download size={16} />}
        >
          {isExporting ? 'Encoding PCM...' : 'Download WAV'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
