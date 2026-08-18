// Adzan Audio Engine with Web Audio Synthesizer Fallback & Remote Audio Streams

export type AdzanVoiceType = 'makkah' | 'madinah' | 'subuh' | 'indonesia' | 'beep';

export interface AdzanTrackInfo {
  id: AdzanVoiceType;
  name: string;
  subtitle: string;
  url: string;
  durationSeconds: number;
}

export const ADZAN_TRACKS: Record<AdzanVoiceType, AdzanTrackInfo> = {
  makkah: {
    id: 'makkah',
    name: 'Adzan Makkah Al-Mukarramah',
    subtitle: 'Kumandang Adzan Masjidil Haram (Syaikh Ali Ahmad Mulla)',
    url: 'https://cdn.islamicfinder.org/audio/athan/Athan_Makkah.mp3',
    durationSeconds: 210,
  },
  madinah: {
    id: 'madinah',
    name: 'Adzan Madinah Al-Munawwarah',
    subtitle: 'Kumandang Adzan Masjid Nabawi (Syaikh Abdul Majeed Surayhi)',
    url: 'https://cdn.islamicfinder.org/audio/athan/Athan_Madinah.mp3',
    durationSeconds: 215,
  },
  subuh: {
    id: 'subuh',
    name: 'Adzan Subuh (Ash-shalatu khairum minan-naum)',
    subtitle: 'Kumandang Khusus Sholat Subuh Merdu & Khusyuk',
    url: 'https://cdn.islamicfinder.org/audio/athan/Athan_Fajr.mp3',
    durationSeconds: 225,
  },
  indonesia: {
    id: 'indonesia',
    name: 'Adzan Standar Kemenag RI / Nusantara',
    subtitle: 'Langgam Merdu Tradisi Masjid Indonesia',
    url: 'https://cdn.islamicfinder.org/audio/athan/Athan_Mansoor_Al_Zahrani.mp3',
    durationSeconds: 180,
  },
  beep: {
    id: 'beep',
    name: 'Nada Pengingat Beep / Alarm Lembut',
    subtitle: 'Sinyal Akustik Notifikasi Singkat',
    url: '',
    durationSeconds: 10,
  }
};

let currentAudio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let synthOscillators: OscillatorNode[] = [];
let isPlayingState = false;
let onPlayStateChangeCallback: ((playing: boolean) => void) | null = null;

export function setAdzanStateChangeListener(cb: (playing: boolean) => void) {
  onPlayStateChangeCallback = cb;
}

// Play Adzan using Audio Element with Web Audio API Fallback
export function playAdzan(
  voiceType: AdzanVoiceType = 'makkah',
  volume: number = 0.9,
  onEnd?: () => void
): boolean {
  stopAdzan();

  if (voiceType === 'beep') {
    playBeepSound(volume);
    if (onPlayStateChangeCallback) onPlayStateChangeCallback(true);
    isPlayingState = true;
    setTimeout(() => {
      stopAdzan();
      if (onEnd) onEnd();
    }, 4000);
    return true;
  }

  const track = ADZAN_TRACKS[voiceType] || ADZAN_TRACKS.makkah;

  try {
    const audio = new Audio(track.url);
    audio.volume = Math.max(0, Math.min(1, volume));
    currentAudio = audio;
    isPlayingState = true;
    if (onPlayStateChangeCallback) onPlayStateChangeCallback(true);

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Playback started
        })
        .catch((err) => {
          console.warn('Network audio failed, falling back to Web Audio Synthesizer:', err);
          // Fallback to Web Audio Synthesizer
          playSynthesizedAdzan(volume, onEnd);
        });
    }

    audio.onended = () => {
      isPlayingState = false;
      if (onPlayStateChangeCallback) onPlayStateChangeCallback(false);
      currentAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      console.warn('Audio tag error, activating synthesizer fallback');
      playSynthesizedAdzan(volume, onEnd);
    };

    return true;
  } catch (e) {
    console.warn('Audio creation error, activating synthesizer fallback', e);
    playSynthesizedAdzan(volume, onEnd);
    return true;
  }
}

// Stop any active audio or synthesizer
export function stopAdzan() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    currentAudio = null;
  }

  // Stop synthetic audio
  synthOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch (e) {
      // ignore
    }
  });
  synthOscillators = [];

  if (audioContext && audioContext.state !== 'closed') {
    try {
      audioContext.close();
    } catch (e) {
      // ignore
    }
    audioContext = null;
  }

  isPlayingState = false;
  if (onPlayStateChangeCallback) onPlayStateChangeCallback(false);
}

export function isAdzanPlaying(): boolean {
  return isPlayingState;
}

// Pure Web Audio API Synthesizer (Zero Network Required, 100% Reliability)
export function playSynthesizedAdzan(volume: number = 0.8, onEnd?: () => void) {
  stopAdzan();
  isPlayingState = true;
  if (onPlayStateChangeCallback) onPlayStateChangeCallback(true);

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    audioContext = new AudioCtx();
    const ctx = audioContext;

    // Harmonic Azan melody notes in sequence (Bani P3N Islamic chime scale)
    // Allahu Akbar, Allahu Akbar melody in Hz
    const notes: Array<{ freq: number; duration: number; delay: number }> = [
      // Al-laa-hu Ak-bar (Part 1)
      { freq: 220.0, duration: 1.2, delay: 0.1 },  // A3
      { freq: 261.63, duration: 1.0, delay: 1.4 }, // C4
      { freq: 293.66, duration: 1.8, delay: 2.5 }, // D4
      { freq: 329.63, duration: 2.2, delay: 4.4 }, // E4
      // Al-laa-hu Ak-bar (Part 2)
      { freq: 293.66, duration: 1.0, delay: 7.0 }, // D4
      { freq: 329.63, duration: 1.2, delay: 8.1 }, // E4
      { freq: 392.00, duration: 2.4, delay: 9.4 }, // G4
      { freq: 329.63, duration: 2.5, delay: 12.0 }, // E4
      // Asyhadu Alla Ilaha Illallah
      { freq: 261.63, duration: 1.5, delay: 15.0 }, // C4
      { freq: 293.66, duration: 1.4, delay: 16.6 }, // D4
      { freq: 329.63, duration: 2.0, delay: 18.1 }, // E4
      { freq: 293.66, duration: 1.6, delay: 20.3 }, // D4
      { freq: 261.63, duration: 2.8, delay: 22.0 }, // C4
      { freq: 220.00, duration: 3.5, delay: 25.0 }, // A3
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Sine + Triangle warmth for gentle bell/adhan sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.delay);

      // Smooth Envelope: Attack, Sustain, Release
      const startTime = ctx.currentTime + note.delay;
      const endTime = startTime + note.duration;

      noteGain.gain.setValueAtTime(0.001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.7, startTime + 0.3);
      noteGain.gain.setValueAtTime(0.6, endTime - 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.001, endTime);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(startTime);
      osc.stop(endTime);
      synthOscillators.push(osc);
    });

    const totalDuration = 29.5;
    setTimeout(() => {
      stopAdzan();
      if (onEnd) onEnd();
    }, totalDuration * 1000);

  } catch (e) {
    console.error('Synthesizer playback error:', e);
    isPlayingState = false;
    if (onPlayStateChangeCallback) onPlayStateChangeCallback(false);
  }
}

// Gentle Beep Alarm Sound
export function playBeepSound(volume: number = 0.8) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
    gain.connect(ctx.destination);

    // 3 rhythmic chime beeps
    [0, 0.4, 0.8, 1.2].forEach((delay) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime + delay);
      
      const beepGain = ctx.createGain();
      beepGain.gain.setValueAtTime(0.001, ctx.currentTime + delay);
      beepGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + delay + 0.05);
      beepGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);

      osc.connect(beepGain);
      beepGain.connect(gain);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) {
    // ignore
  }
}

// Request Browser Notification Permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

// Show Desktop / Mobile Push Notification for Prayer Time
export function showPrayerNotification(prayerName: string, locationName: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(`🕌 Waktu Sholat ${prayerName} Telah Tiba!`, {
        body: `Kumandang Adzan untuk wilayah ${locationName}. Mari laksanakan sholat berjamaah tepat waktu.`,
        icon: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=128&auto=format&fit=crop&q=80',
        silent: false,
        requireInteraction: true,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (e) {
      console.warn('Notification display failed:', e);
    }
  }
}
