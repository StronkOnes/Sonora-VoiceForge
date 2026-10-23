/**
 * SONORA VoiceForge - Acoustic Analysis Panel
 * 
 * Displays rigorous physical measurements (Peak dBFS, RMS dBFS, Clipping, Crest Factor)
 * and clear technical estimates (Estimated Noise Floor, Spectral Balance).
 * Distinctly separates measured facts from acoustic estimates.
 */

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  Volume2
} from 'lucide-react';
import { AudioAnalysisResult, AudioMetadata } from '../../audio/types';

interface AudioAnalysisPanelProps {
  metadata: AudioMetadata;
  analysis: AudioAnalysisResult;
  processedAnalysis: AudioAnalysisResult | null;
}

export const AudioAnalysisPanel: React.FC<AudioAnalysisPanelProps> = ({
  metadata,
  analysis,
  processedAnalysis
}) => {
  return (
    <Box
      sx={{
        backgroundColor: '#121620',
        borderRadius: 2,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        p: 2.5,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity size={18} color="#F59E0B" />
          <Typography variant="h4" sx={{ color: '#E6E9EE' }}>
            Acoustic Analysis & Diagnostics
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
          {metadata.numberOfChannels === 1 ? 'Mono' : 'Stereo'} · {metadata.sampleRate} Hz · {metadata.duration.toFixed(1)}s
        </Typography>
      </Box>

      {/* Warnings & Notes */}
      {analysis.isClipping && (
        <Alert
          severity="warning"
          icon={<AlertTriangle size={18} />}
          sx={{
            mb: 2,
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            color: '#FBBF24',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '0.825rem'
          }}
        >
          <strong>Clipping Warning:</strong> {analysis.clippedSampleCount} clipped samples detected ({analysis.clippingPercentage}%). Peak audio exceeds 0 dBFS ceiling on recording device.
        </Alert>
      )}

      {/* Metric Cards Grid */}
      <Grid container spacing={2}>
        {/* 1. Peak Level */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.75,
              backgroundColor: '#161B26',
              borderRadius: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                TRUE PEAK
              </Typography>
              <Tooltip title="Physical measurement: Maximum instantaneous amplitude in dBFS. Values at or near 0 dBFS indicate risk of digital clipping.">
                <HelpCircle size={13} color="#64748B" />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography
                variant="h3"
                className="tabular-nums"
                sx={{
                  color: analysis.isClipping ? '#EF4444' : '#E6E9EE',
                  fontSize: '1.25rem'
                }}
              >
                {analysis.peakDb.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>dBFS</Typography>
            </Box>

            {processedAnalysis && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography variant="caption" className="tabular-nums" sx={{ color: '#10B981', fontSize: '0.75rem' }}>
                  → {processedAnalysis.peakDb.toFixed(1)} dBFS
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 2. RMS Level */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.75,
              backgroundColor: '#161B26',
              borderRadius: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                RMS ENERGY
              </Typography>
              <Tooltip title="Physical measurement: Root Mean Square average energy. Reflects perceived vocal loudness.">
                <HelpCircle size={13} color="#64748B" />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h3" className="tabular-nums" sx={{ color: '#E6E9EE', fontSize: '1.25rem' }}>
                {analysis.rmsDb.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>dBFS</Typography>
            </Box>

            {processedAnalysis && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography variant="caption" className="tabular-nums" sx={{ color: '#F59E0B', fontSize: '0.75rem' }}>
                  → {processedAnalysis.rmsDb.toFixed(1)} dBFS
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 3. Dynamic Crest Factor */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.75,
              backgroundColor: '#161B26',
              borderRadius: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                CREST FACTOR
              </Typography>
              <Tooltip title="Physical measurement: Peak minus RMS ratio. High crest factors (>18 dB) indicate uneven distance from phone mic.">
                <HelpCircle size={13} color="#64748B" />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h3" className="tabular-nums" sx={{ color: '#E6E9EE', fontSize: '1.25rem' }}>
                {analysis.crestFactorDb.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>dB</Typography>
            </Box>

            {processedAnalysis && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography variant="caption" className="tabular-nums" sx={{ color: '#10B981', fontSize: '0.75rem' }}>
                  → {processedAnalysis.crestFactorDb.toFixed(1)} dB
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* 4. Estimated Noise Floor */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <Box
            sx={{
              p: 1.75,
              backgroundColor: '#161B26',
              borderRadius: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                EST. NOISE FLOOR
              </Typography>
              <Tooltip title="Technical estimate: RMS energy calculated across quietest 10% interval windows (pauses between words).">
                <HelpCircle size={13} color="#64748B" />
              </Tooltip>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h3" className="tabular-nums" sx={{ color: '#E6E9EE', fontSize: '1.25rem' }}>
                {analysis.estimatedNoiseFloorDb.toFixed(1)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>dBFS</Typography>
            </Box>

            {processedAnalysis && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <TrendingDown size={12} color="#10B981" />
                <Typography variant="caption" className="tabular-nums" sx={{ color: '#10B981', fontSize: '0.75rem' }}>
                  → {processedAnalysis.estimatedNoiseFloorDb.toFixed(1)} dBFS
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* Honest Technical Notes */}
      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.75 }}>
          DIAGNOSTIC OBSERVATIONS (MEASUREMENTS VS. ESTIMATES)
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {analysis.notes.map((note, idx) => (
            <Typography key={idx} variant="body2" sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              • {note}
            </Typography>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
