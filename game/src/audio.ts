export type VoiceClipId =
  | 'nova.power-invite'
  | 'nova.power-first'
  | 'nova.power-repeat'
  | 'luma.hello'
  | 'narrator.story-opening'
  | 'narrator.story-one-bubble'
  | 'narrator.story-many-bubbles'
  | 'narrator.story-bells'
  | 'narrator.story-ending';

export type EffectId = 'magic.bubble-shimmer' | 'luma.wakeup-sparkle';
export type BellTone = 'blue_bell' | 'gold_bell' | 'coral_bell';

const voiceFiles: Record<VoiceClipId, string> = {
  'nova.power-invite': 'nova-power-invite.mp3',
  'nova.power-first': 'nova-power-first.mp3',
  'nova.power-repeat': 'nova-power-repeat.mp3',
  'luma.hello': 'luma-hello.mp3',
  'narrator.story-opening': 'narrator-story-opening.mp3',
  'narrator.story-one-bubble': 'narrator-story-one-bubble.mp3',
  'narrator.story-many-bubbles': 'narrator-story-many-bubbles.mp3',
  'narrator.story-bells': 'narrator-story-bells.mp3',
  'narrator.story-ending': 'narrator-story-ending.mp3',
};

const effectFiles: Record<EffectId, string> = {
  'magic.bubble-shimmer': 'bubble-power-shimmer.mp3',
  'luma.wakeup-sparkle': 'luma-wakeup-sparkle.mp3',
};

const bellFrequencies: Record<BellTone, number> = {
  blue_bell: 523.25,
  gold_bell: 659.25,
  coral_bell: 783.99,
};

let narrationToken = 0;
let activeNarration: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;

function assetUrl(folder: string, file: string) {
  return `${import.meta.env.BASE_URL}assets/audio/${folder}/${file}`;
}

function speakFallback(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.04;
  window.speechSynthesis.speak(utterance);
}

function playAudio(audio: HTMLAudioElement) {
  return new Promise<void>((resolve, reject) => {
    audio.addEventListener('ended', () => resolve(), { once: true });
    audio.addEventListener('error', () => reject(new Error('Audio failed')), {
      once: true,
    });
    audio.play().catch(reject);
  });
}

export function stopNarration() {
  narrationToken += 1;
  if (activeNarration) {
    activeNarration.pause();
    activeNarration.currentTime = 0;
    activeNarration = null;
  }
  window.speechSynthesis?.cancel();
}

export async function playVoice(
  clipId: VoiceClipId,
  fallbackText: string,
) {
  await playVoiceSequence([clipId], fallbackText);
}

export async function playVoiceSequence(
  clipIds: VoiceClipId[],
  fallbackText: string,
) {
  stopNarration();
  const token = narrationToken;

  try {
    for (const clipId of clipIds) {
      if (token !== narrationToken) return;
      const audio = new Audio(assetUrl('voice', voiceFiles[clipId]));
      audio.preload = 'auto';
      activeNarration = audio;
      await playAudio(audio);
    }
    activeNarration = null;
  } catch {
    if (token === narrationToken) speakFallback(fallbackText);
  }
}

export function playEffect(effectId: EffectId) {
  const audio = new Audio(assetUrl('effects', effectFiles[effectId]));
  audio.volume = 0.7;
  void audio.play().catch(() => undefined);
}

export function playBellTone(tone: BellTone) {
  audioContext ??= new AudioContext();
  const now = audioContext.currentTime;
  const fundamental = audioContext.createOscillator();
  const harmonic = audioContext.createOscillator();
  const gain = audioContext.createGain();

  fundamental.type = 'sine';
  fundamental.frequency.value = bellFrequencies[tone];
  harmonic.type = 'sine';
  harmonic.frequency.value = bellFrequencies[tone] * 2.01;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15);

  fundamental.connect(gain);
  harmonic.connect(gain);
  gain.connect(audioContext.destination);
  fundamental.start(now);
  harmonic.start(now);
  fundamental.stop(now + 1.18);
  harmonic.stop(now + 1.18);
}
