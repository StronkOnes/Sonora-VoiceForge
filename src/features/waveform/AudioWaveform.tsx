/**
 * SONORA VoiceForge - Real Audio Waveform & Transport Engine
 * 
 * Renders real decoded PCM min/max envelopes on HTML5 Canvas.
 * Supports:
 * - Glitch-free synchronized A/B playback (seamless position alignment)
 * - Play, Pause, Stop, Seek scrub, and Loop playback
 * - Time ruler (mm:ss.ms) and playhead tracking
 * - Dual-layer waveform comparison visualization
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Tooltip,
  ButtonGroup,
  Button
} from '@mui/material';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Volume2,
  VolumeX,
  Layers
} from 'lucide-react';

interface AudioWaveformProps {
  originalBuffer: AudioBuffer | null;
  processedBuffer: AudioBuffer | null;
  activeTrack: 'original' | 'processed';
  onTrackChange: (track: 'original' | 'processed') => void;
  isProcessing: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  originalBuffer,
  processedBuffer,
  activeTrack,
  onTrackChange,
  isProcessing
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);

  // Web Audio playback nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startOffsetRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Target buffer for current playback
  const currentBuffer = activeTrack === 'processed' && processedBuffer
    ? processedBuffer
    : originalBuffer;

  // Initialize AudioContext
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gain;

    return () => {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      }
      ctx.close();
    };
  }, []);

  // Update duration when buffer changes
  useEffect(() => {
    if (currentBuffer) {
      setDuration(currentBuffer.duration);
    } else {
      setDuration(0);
      setCurrentTime(0);
    }
  }, [currentBuffer]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Stop playback on unmount or when processing starts
  useEffect(() => {
    if (isProcessing && isPlaying) {
      stopPlayback();
    }
  }, [isProcessing]);

  const stopPlayback = useCallback(() => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
    startOffsetRef.current = 0;
    setCurrentTime(0);
  }, []);

  const pausePlayback = useCallback(() => {
    if (!isPlaying) return;
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (audioCtxRef.current) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      let newPos = startOffsetRef.current + elapsed;
      if (duration > 0 && newPos >= duration) {
        newPos = isLooping ? 0 : duration;
      }
      startOffsetRef.current = newPos;
      setCurrentTime(newPos);
    }
    setIsPlaying(false);
  }, [isPlaying, duration, isLooping]);

  const startPlayback = useCallback(async (seekPos?: number) => {
    if (!currentBuffer || !audioCtxRef.current || !gainNodeRef.current) return;

    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
      sourceNodeRef.current.disconnect();
    }

    const pos = typeof seekPos === 'number' ? seekPos : startOffsetRef.current;
    const boundedPos = Math.min(Math.max(0, pos), currentBuffer.duration);

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = currentBuffer;
    source.loop = isLooping;
    source.connect(gainNodeRef.current);

    source.onended = () => {
      if (!isLooping && isPlaying) {
        setIsPlaying(false);
        startOffsetRef.current = 0;
        setCurrentTime(0);
      }
    };

    source.start(0, boundedPos);
    sourceNodeRef.current = source;
    startTimeRef.current = audioCtxRef.current.currentTime;
    startOffsetRef.current = boundedPos;
    setIsPlaying(true);

    const updateLoop = () => {
      if (!audioCtxRef.current) return;
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      let cur = startOffsetRef.current + elapsed;
      if (currentBuffer.duration > 0) {
        if (isLooping) {
          cur = cur % currentBuffer.duration;
        } else if (cur >= currentBuffer.duration) {
          cur = currentBuffer.duration;
        }
      }
      setCurrentTime(cur);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(updateLoop);
  }, [currentBuffer, isLooping, isPlaying]);

  // Seamless Track Switching (A/B hot swap preserving playback position)
  const handleTrackSwitch = (newTrack: 'original' | 'processed') => {
    if (newTrack === activeTrack) return;
    onTrackChange(newTrack);

    // If currently playing, instantly swap the active buffer without position glitch
    if (isPlaying && audioCtxRef.current) {
      const elapsed = audioCtxRef.current.currentTime - startTimeRef.current;
      const currentPos = startOffsetRef.current + elapsed;

      const targetBuffer = newTrack === 'processed' && processedBuffer ? processedBuffer : originalBuffer;
      if (!targetBuffer) return;

      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch { /* ignore */ }
        sourceNodeRef.current.disconnect();
      }

      const source = audioCtxRef.current.createBufferSource();
      source.buffer = targetBuffer;
      source.loop = isLooping;
      source.connect(gainNodeRef.current!);
      source.start(0, currentPos % targetBuffer.duration);

      sourceNodeRef.current = source;
      startTimeRef.current = audioCtxRef.current.currentTime;
      startOffsetRef.current = currentPos % targetBuffer.duration;
    }
  };

  // Waveform Canvas Rendering
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentBuffer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0E1118';
    ctx.fillRect(0, 0, width, height);

    // Center baseline
    const midY = height / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(width, midY);
    ctx.stroke();

    // Secondary layer: if showOverlay and processedBuffer exists, render original in muted gray/cyan
    if (showOverlay && processedBuffer && originalBuffer) {
      drawBufferPeaks(ctx, originalBuffer, width, height, 'rgba(100, 116, 139, 0.45)');
    }

    // Primary layer: Active track waveform
    const primaryColor = activeTrack === 'processed'
      ? '#F59E0B' // Studio Amber
      : '#38BDF8'; // Muted Original Cyan

    drawBufferPeaks(ctx, currentBuffer, width, height, primaryColor);

    // Draw Playhead
    if (duration > 0) {
      const playheadX = (currentTime / duration) * width;

      // Playhead vertical line
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead handle
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(playheadX - 5, 0);
      ctx.lineTo(playheadX + 5, 0);
      ctx.lineTo(playheadX, 8);
      ctx.closePath();
      ctx.fill();
    }
  }, [currentBuffer, originalBuffer, processedBuffer, activeTrack, showOverlay, currentTime, duration]);

  // Helper to extract and draw peak min/max bars
  const drawBufferPeaks = (
    ctx: CanvasRenderingContext2D,
    buffer: AudioBuffer,
    width: number,
    height: number,
    color: string
  ) => {
    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const midY = height / 2;
    const ampScale = (height / 2) * 0.92;

    ctx.fillStyle = color;

    for (let x = 0; x < width; x++) {
      let min = 1.0;
      let max = -1.0;

      const start = x * step;
      const end = Math.min(start + step, data.length);

      for (let j = start; j < end; j++) {
        const val = data[j];
        if (val < min) min = val;
        if (val > max) max = val;
      }

      if (max < min) {
        min = 0;
        max = 0;
      }

      const yTop = midY - max * ampScale;
      const yBottom = midY - min * ampScale;
      const barHeight = Math.max(1.5, yBottom - yTop);

      ctx.fillRect(x, yTop, 1, barHeight);
    }
  };

  // Render on updates and canvas resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = 140 * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `140px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      drawWaveform();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Waveform Click / Drag Scrubbing
  const handleCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!duration || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const targetSec = Math.max(0, Math.min(duration, (clickX / rect.width) * duration));

    setCurrentTime(targetSec);
    startOffsetRef.current = targetSec;

    if (isPlaying) {
      startPlayback(targetSec);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        backgroundColor: '#121620',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        p: 2.5,
      }}
    >
      {/* Top Bar: A/B Mode Selector and Overlay Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#E6E9EE' }}>
            Monitor Source:
          </Typography>

          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => handleTrackSwitch('original')}
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                backgroundColor: activeTrack === 'original' ? '#38BDF8' : 'transparent',
                color: activeTrack === 'original' ? '#0A0C10' : '#38BDF8',
                borderColor: '#38BDF8',
                '&:hover': {
                  backgroundColor: activeTrack === 'original' ? '#0284C7' : 'rgba(56, 189, 248, 0.1)',
                  borderColor: '#38BDF8'
                }
              }}
            >
              A: Original
            </Button>
            <Button
              onClick={() => handleTrackSwitch('processed')}
              disabled={!processedBuffer}
              sx={{
                fontWeight: 600,
                fontSize: '0.8rem',
                backgroundColor: activeTrack === 'processed' ? '#F59E0B' : 'transparent',
                color: activeTrack === 'processed' ? '#0A0C10' : processedBuffer ? '#F59E0B' : '#475569',
                borderColor: processedBuffer ? '#F59E0B' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: activeTrack === 'processed' ? '#D97706' : 'rgba(245, 158, 11, 0.1)',
                  borderColor: '#F59E0B'
                }
              }}
            >
              B: Processed {processedBuffer ? '✓' : '(Run Clean First)'}
            </Button>
          </ButtonGroup>
        </Box>

        {processedBuffer && (
          <Button
            size="small"
            variant="text"
            onClick={() => setShowOverlay(!showOverlay)}
            startIcon={<Layers size={15} />}
            sx={{
              color: showOverlay ? '#F59E0B' : '#94A3B8',
              fontSize: '0.78rem'
            }}
          >
            {showOverlay ? 'Hide Ghost Overlay' : 'Compare Waveforms'}
          </Button>
        )}
      </Box>

      {/* Interactive Waveform Canvas */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 140,
          borderRadius: 1.5,
          overflow: 'hidden',
          cursor: 'crosshair',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}
        onClick={handleCanvasClick}
      >
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Box>

      {/* Time & Ruler Display */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 0.5 }}>
        <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontWeight: 600 }}>
          {formatTime(currentTime)}
        </Typography>
        <Typography variant="caption" className="tabular-nums" sx={{ color: '#94A3B8' }}>
          {formatTime(duration)}
        </Typography>
      </Box>

      {/* Transport Controls Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          pt: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Play / Pause */}
          <IconButton
            onClick={() => (isPlaying ? pausePlayback() : startPlayback())}
            sx={{
              backgroundColor: '#F59E0B',
              color: '#0A0C10',
              '&:hover': { backgroundColor: '#D97706' },
              width: 40,
              height: 40
            }}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </IconButton>

          {/* Stop */}
          <IconButton
            onClick={stopPlayback}
            sx={{
              color: '#94A3B8',
              '&:hover': { color: '#E6E9EE', backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
          >
            <Square size={17} />
          </IconButton>

          {/* Loop */}
          <Tooltip title={isLooping ? 'Loop Enabled' : 'Loop Disabled'}>
            <IconButton
              onClick={() => setIsLooping(!isLooping)}
              sx={{
                color: isLooping ? '#F59E0B' : '#64748B',
                '&:hover': { color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' }
              }}
            >
              <Repeat size={17} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Volume Monitor Slider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 200 } }}>
          <IconButton
            size="small"
            onClick={() => setIsMuted(!isMuted)}
            sx={{ color: isMuted ? '#EF4444' : '#94A3B8' }}
          >
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </IconButton>

          <Slider
            size="small"
            value={isMuted ? 0 : volume * 100}
            onChange={(_, val) => {
              setIsMuted(false);
              setVolume((val as number) / 100);
            }}
            min={0}
            max={100}
            sx={{ flex: 1 }}
          />
        </Box>
      </Box>
    </Box>
  );
};
