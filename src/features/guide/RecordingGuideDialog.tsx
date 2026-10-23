/**
 * SONORA VoiceForge - Producer-Ready Recording Best Practices Guide
 * 
 * Interactive studio guide for recording pristine vocals on smartphones:
 * - Eliminating plosives, mic pops, and air blasts
 * - Neutralizing room echo, flutter reverb, and boxiness
 * - Killing electrical hiss, fans, and RF cellular interference
 * - Phone microphone positioning & gain staging
 * - High-resolution capture settings
 * - Producer Handover Checklist
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
  Tabs,
  Tab,
  Card,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Mic,
  Wind,
  VolumeX,
  Radio,
  Sliders,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface RecordingGuideDialogProps {
  open: boolean;
  onClose: () => void;
}

export const RecordingGuideDialog: React.FC<RecordingGuideDialogProps> = ({
  open,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const checklistText = `PRODUCER-READY VOCAL HANDOVER CHECKLIST:
1. File Format: Uncompressed WAV (24-bit PCM or 32-bit Float, 44.1 kHz or 48 kHz).
2. Clean Stems: No reverb, delays, or heavy effects baked into the audio (send dry).
3. Room Tone: 1-2 seconds of room silence before the first vocal note.
4. Naming Convention: [SongName]_[TrackType]_[BPM]_[Key] (e.g. Skyline_LeadVocal_Dry_124BPM_Fmin.wav).
5. Headroom: Clean peaks around -6 dBFS to -3 dBFS with zero digital clipping.
6. High-Res Delivery: Delivered via Google Drive, Dropbox, or WeTransfer (never compressed via WhatsApp/Telegram).`;

  const handleCopyChecklist = () => {
    navigator.clipboard.writeText(checklistText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#121620',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex'
              }}
            >
              <Mic size={20} />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ fontSize: '1.25rem', color: '#E6E9EE', fontWeight: 700 }}>
                Producer-Ready Vocal Guide
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                How to capture studio-grade, pop-free, zero-hiss recordings on any smartphone
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <Box sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', px: 3, pt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.85rem',
              color: '#94A3B8',
              fontWeight: 500,
              textTransform: 'none',
              '&.Mui-selected': { color: '#F59E0B', fontWeight: 700 }
            },
            '& .MuiTabs-indicator': { backgroundColor: '#F59E0B', height: 2.5 }
          }}
        >
          <Tab label="1. Pop & Plosive Defense" />
          <Tab label="2. Room Reverb & Echo" />
          <Tab label="3. Background Noise & Hiss" />
          <Tab label="4. High-Res Audio Setup" />
          <Tab label="5. Producer Checklist" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Tab 1: Pops & Plosives */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert
              severity="info"
              icon={<Wind size={18} />}
              sx={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', color: '#bae6fd', border: '1px solid rgba(56, 189, 248, 0.2)' }}
            >
              <strong>The Problem:</strong> Singing hard letters like &quot;P&quot;, &quot;B&quot;, and &quot;T&quot; sends a physical jet of pressurized air straight into the phone&apos;s tiny microphone capsule. This produces heavy sub-bass thumps that digital EQ cannot fully recover.
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck size={16} /> The 45-Degree Angle Rule
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1.5 }}>
                    Never point your phone&apos;s microphone directly in front of your mouth. Instead, aim the phone slightly toward your cheek or chin at a 45° angle.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                    <strong>Why it works:</strong> Air blasts shoot straight forward, but your vocal sound waves project in all directions. You get 100% of the vocal tone with 0% of the air blast!
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShieldCheck size={16} /> The Hand-Span Distance (6–8 Inches)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1.5 }}>
                    Keep the phone roughly 15 to 20 cm (the distance between your outstretched thumb and pinky finger) from your face.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                    <strong>Too close:</strong> Muffled proximity bass boost and heavy breathing.
                    <br />
                    <strong>Too far:</strong> Room reflections overpower the voice.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Sparkles size={16} /> The Studio DIY Pop Filter Hack
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                    Fasten a clean pencil or chopstick with a rubber band vertically across the center of your phone&apos;s bottom microphone. When an air blast strikes the pencil, it splits the air vortex to both sides of the microphone port, eliminating plosives without dulling high-frequency clarity.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2: Room Reverb & Echo */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert
              severity="warning"
              icon={<VolumeX size={18} />}
              sx={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#FBBF24', border: '1px solid rgba(245, 158, 11, 0.25)' }}
            >
              <strong>Producers Say:</strong> &quot;We can easily add world-class reverb, but we cannot cleanly remove bad room reverb.&quot; Untreated rooms bake boxy flutter into your stems that interferes with pitch correction and compression.
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1 }}>
                    1. The Clothes Wardrobe Booth
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    Open your clothes closet or wardrobe. Stand directly facing into hanging coats, jackets, and sweaters.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Hanging fabric is one of the most effective broadband acoustic absorbers available. It kills reflections before they bounce back to the microphone.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1 }}>
                    2. The Duvet & Blanket Fortress
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    Hang a thick winter duvet or heavy comforter behind you on a door frame or chair backs.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Your voice reflects off the rear wall and enters the microphone from behind. Absorbing sound behind your head creates a dry, intimate vocal.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26' }}>
                  <Typography variant="h4" sx={{ color: '#EF4444', fontSize: '0.95rem', mb: 1 }}>
                    Rooms to Strictly Avoid
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                    • <strong>Bathrooms & Kitchens:</strong> Ceramic tile, porcelain, and metal appliances reflect harsh metallic flutter.<br />
                    • <strong>Empty Rooms:</strong> Bare walls act as acoustic mirrors.<br />
                    • <strong>Glass Windows:</strong> Always draw heavy curtains if recording in a bedroom with large windows.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 3: Background Noise & Hiss */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Radio size={16} /> Switch Phone to Airplane Mode
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    Cellular, Wi-Fi, and Bluetooth radios emit periodic RF radio frequency bursts that couple directly into the phone&apos;s analog preamp circuit, causing high-pitched &quot;dit-dit-dit&quot; buzzes and static.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#10B981', fontWeight: 600 }}>
                    ✓ Airplane mode guarantees silence from notifications and RF electromagnetic noise.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VolumeX size={16} /> Kill Steady Appliance Noise
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    Turn off for just 5 minutes:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    • Air conditioning & heaters<br />
                    • Standing desk fans & ceiling fans<br />
                    • Computer tower fans & laptop coolers<br />
                    • Open street windows
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1 }}>
                    Handling & Cable Rumble Prevention
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                    Never hold the phone directly in your hand while singing. Every subtle finger shift creates 20 Hz to 60 Hz mechanical friction rumble. Rest the phone on a soft book, stack of folded towels, or a simple phone tripod on a sturdy table at eye level.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 4: High-Res Audio Settings */}
        {activeTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Alert
              severity="success"
              icon={<Sparkles size={18} />}
              sx={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.25)' }}
            >
              <strong>Uncompressed High-Res Audio:</strong> Modern smartphones have remarkably clean 24-bit 48 kHz converters built in. The secret is preventing lossy compression apps from crushing them.
            </Alert>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1 }}>
                    iOS Settings (iPhone)
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    Open <strong>Settings → Voice Memos → Audio Quality</strong> and switch it from <em>Compressed</em> to <strong>Lossless (ALAC)</strong>.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    This captures full 48 kHz uncompressed audio without cutting off top-end frequencies.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26', height: '100%' }}>
                  <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '0.95rem', mb: 1 }}>
                    Recommended Free Recording Apps
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 1 }}>
                    • <strong>Dolby On (iOS/Android):</strong> Studio-grade uncompressed 24-bit WAV recording.<br />
                    • <strong>Shure MOTIV Audio:</strong> Professional 24-bit 48 kHz WAV with manual gain staging.<br />
                    • <strong>RecForge II (Android):</strong> Clean uncompressed broadcast WAV capture.
                  </Typography>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, backgroundColor: '#161B26' }}>
                  <Typography variant="h4" sx={{ color: '#EF4444', fontSize: '0.95rem', mb: 1 }}>
                    Never Send Takes via Social Media / Messaging Apps!
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                    Apps like WhatsApp, Telegram, iMessage audio messages, and Instagram DMs re-encode audio down to 32 kbps mono voice codecs. They discard all frequencies above 10 kHz and mangle dynamics. Always export uncompressed WAV files and share them via Google Drive, Dropbox, or WeTransfer.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 5: Producer Handover Checklist */}
        {activeTab === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ p: 2, backgroundColor: '#161B26', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="h4" sx={{ color: '#F59E0B', fontSize: '1rem', fontWeight: 600 }}>
                  What Your Producer Needs to Mix a Hit
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopyChecklist}
                  startIcon={copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  sx={{ color: copied ? '#10B981' : '#E6E9EE', fontSize: '0.8rem' }}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Checklist'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#E6E9EE' }}>
                    <strong>Export 24-bit or 32-bit Float WAV:</strong> Use SONORA VoiceForge to clean room echo and hiss, then export in 24-bit PCM or 32-bit Float.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#E6E9EE' }}>
                    <strong>Leave 2 Seconds of Room Silence:</strong> Record 2 seconds of pure quiet room tone before you sing. Producers use this silent noise profile to calibrate surgical spectral filters.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#E6E9EE' }}>
                    <strong>Keep Safe Headroom (-6 dBFS):</strong> Ensure the loudest notes do not hit 0 dBFS. Clean headroom allows the producer to apply analog-style tube compressors and vocal saturation.
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#E6E9EE' }}>
                    <strong>Professional File Naming:</strong> Include song title, vocal role, BPM, and key:<br />
                    <code style={{ color: '#F59E0B', backgroundColor: '#0D1017', padding: '2px 6px', borderRadius: 4 }}>
                      Moonlight_LeadVocal_Dry_120BPM_Cmin_24bit.wav
                    </code>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                  <CheckCircle2 size={16} color="#10B981" style={{ marginTop: 2, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: '#E6E9EE' }}>
                    <strong>Deliver Dry (No Baked-In Reverb/Delays):</strong> Never send tracks with phone karaoke reverb baked in. Give the producer clean, dry, upfront vocals.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', justifyContent: 'space-between' }}>
        <Typography variant="caption" sx={{ color: '#64748B' }}>
          SONORA Vocal Engineering Standards
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {activeTab < 4 ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => setActiveTab(prev => Math.min(4, prev + 1))}
              endIcon={<ArrowRight size={14} />}
            >
              Next Tip
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={onClose}
            >
              Got It, Let&apos;s Clean Audio
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
