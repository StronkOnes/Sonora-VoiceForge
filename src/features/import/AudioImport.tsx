/**
 * SONORA VoiceForge - Audio Import Feature
 * 
 * Supports drag-and-drop, standard file input for common audio formats (WAV, MP3, M4A, FLAC, OGG),
 * and built-in studio demo voice recordings with typical phone acoustic defects.
 */

import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { Upload, Music, AlertCircle, FileAudio, Play } from 'lucide-react';
import { AudioMetadata, AudioSourceData } from '../../audio/types';
import { analyseAudioBuffer } from '../../audio/AudioAnalysis';
import { SAMPLE_RECORDINGS, generateSampleAudio } from '../../audio/sampleAudio';

interface AudioImportProps {
  onAudioLoaded: (data: AudioSourceData) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const AudioImport: React.FC<AudioImportProps> = ({
  onAudioLoaded,
  isLoading,
  setIsLoading
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string>('bedroom-fan-vocal');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check maximum sensible size for in-memory Web Audio processing (~150MB)
      if (file.size > 150 * 1024 * 1024) {
        throw new Error('File exceeds 150MB limit. For web browser memory safety, please import recordings under 150MB.');
      }

      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      let decodedBuffer: AudioBuffer;
      try {
        decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      } catch {
        throw new Error(
          `Unable to decode "${file.name}". The browser could not decode this audio format. Supported formats include WAV, MP3, M4A, OGG, and WebM.`
        );
      } finally {
        await audioCtx.close();
      }

      const metadata: AudioMetadata = {
        fileName: file.name,
        fileSize: file.size,
        duration: decodedBuffer.duration,
        sampleRate: decodedBuffer.sampleRate,
        numberOfChannels: decodedBuffer.numberOfChannels,
        format: file.type || 'audio/wav'
      };

      const analysis = analyseAudioBuffer(decodedBuffer);

      onAudioLoaded({
        buffer: decodedBuffer,
        metadata,
        analysis
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import and decode audio file.';
      setError(msg);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSample = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sampleDef = SAMPLE_RECORDINGS.find(s => s.id === selectedSampleId) || SAMPLE_RECORDINGS[0];
      const buffer = await generateSampleAudio(sampleDef.id);

      const metadata: AudioMetadata = {
        fileName: `${sampleDef.title}.wav`,
        fileSize: buffer.length * buffer.numberOfChannels * 2,
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        numberOfChannels: buffer.numberOfChannels,
        format: 'audio/wav'
      };

      const analysis = analyseAudioBuffer(buffer);

      onAudioLoaded({
        buffer,
        metadata,
        analysis
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate test recording.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          icon={<AlertCircle size={18} />}
          sx={{ mb: 2.5, backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.25)' }}
        >
          {error}
        </Alert>
      )}

      {/* Drop Zone */}
      <Box
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          border: '1.5px dashed',
          borderColor: dragActive ? '#F59E0B' : 'rgba(255, 255, 255, 0.14)',
          backgroundColor: dragActive ? 'rgba(245, 158, 11, 0.04)' : '#121620',
          borderRadius: 2,
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          transition: 'all 200ms ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'rgba(245, 158, 11, 0.6)',
            backgroundColor: 'rgba(245, 158, 11, 0.02)'
          }
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.ogg,.webm"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', mb: 2 }}>
          {isLoading ? (
            <CircularProgress size={32} sx={{ color: '#F59E0B' }} />
          ) : (
            <Upload size={32} />
          )}
        </Box>

        <Typography variant="h3" sx={{ mb: 1, fontSize: '1.15rem', color: '#E6E9EE' }}>
          {isLoading ? 'Decoding Audio Recording...' : 'Drop phone recording here or browse'}
        </Typography>

        <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2.5, maxWidth: 520, mx: 'auto' }}>
          Supports WAV, MP3, M4A, FLAC, AAC, and OGG up to 150MB. Original audio is processed locally and never uploaded to any cloud server.
        </Typography>

        <Button
          variant="contained"
          disabled={isLoading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          startIcon={<FileAudio size={18} />}
          sx={{ px: 3, py: 1 }}
        >
          Choose Audio File
        </Button>
      </Box>

      {/* Built-in Test Recordings Bar */}
      <Box
        sx={{
          mt: 2.5,
          p: 2,
          backgroundColor: '#161B26',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Music size={18} color="#F59E0B" />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
              No recording file on hand?
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              Load a calibrated test recording with authentic phone defects.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 230 }}>
            <InputLabel id="sample-select-label" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              Sample Condition
            </InputLabel>
            <Select
              labelId="sample-select-label"
              value={selectedSampleId}
              label="Sample Condition"
              onChange={(e: SelectChangeEvent) => setSelectedSampleId(e.target.value)}
              sx={{
                fontSize: '0.85rem',
                backgroundColor: '#121620',
                color: '#E6E9EE',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.12)'
                }
              }}
            >
              {SAMPLE_RECORDINGS.map(sample => (
                <MenuItem key={sample.id} value={sample.id} sx={{ fontSize: '0.85rem' }}>
                  {sample.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            disabled={isLoading}
            onClick={handleLoadSample}
            startIcon={<Play size={15} />}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Load Sample
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
