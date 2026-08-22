import { useEffect, useMemo, useRef, useState } from 'react';
import { GrownUpPanel } from './GrownUpPanel';
import {
  playBellTone,
  playEffect,
  playVoice,
  playVoiceSequence,
  stopNarration,
  type BellTone,
  type VoiceClipId,
} from './audio';
import {
  addBellEvent,
  addBubbleEvent,
  addMeetLumaEvent,
  buildStory,
  storyAsSpeech,
  type GameEvent,
} from './story';
import { usePwaUpdate } from './usePwaUpdate';

const SESSION_KEY = 'moonlight-zoo-session-v1';

function loadEvents(): GameEvent[] {
  try {
    const saved = window.localStorage.getItem(SESSION_KEY);
    return saved ? (JSON.parse(saved) as GameEvent[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [events, setEvents] = useState<GameEvent[]>(loadEvents);
  const [storyOpen, setStoryOpen] = useState(false);
  const [grownUpOpen, setGrownUpOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const story = useMemo(() => buildStory(events), [events]);
  const hasPower = events.length > 0;
  const bubbleCount = events.filter((event) => event.subject === 'bubbles').length;
  const hasMetLuma = events.some((event) => event.kind === 'jellyfish_met');
  const bellCount = events.filter(
    (event) => event.kind === 'jellyfish_bell_played',
  ).length;
  const pwaUpdate = usePwaUpdate();

  useEffect(() => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(events));
  }, [events]);

  const useBubblePower = () => {
    setEvents((current) => addBubbleEvent(current));
    playEffect('magic.bubble-shimmer');
    void playVoice(
      hasPower ? 'nova.power-repeat' : 'nova.power-first',
      hasPower
        ? 'More moon bubbles! Pop, pop, pop!'
        : 'Bubble power activated! You and Penguin are making the aquarium shimmer.',
    );
  };

  const meetLuma = () => {
    setEvents((current) => addMeetLumaEvent(current));
    if (!hasMetLuma) playEffect('luma.wakeup-sparkle');
    void playVoice(
      'luma.hello',
      "Oh! Bubble power tickles! I'm Luma. Gia and Penguin, tap my moon bells and make a song with me!",
    );
  };

  const playBell = (bell: BellTone) => {
    playBellTone(bell);
    setEvents((current) => addBellEvent(current, bell));
  };

  const tellStory = () => {
    setStoryOpen(true);
    const clips: VoiceClipId[] = [
      'narrator.story-opening',
      bubbleCount <= 1
        ? 'narrator.story-one-bubble'
        : 'narrator.story-many-bubbles',
    ];
    if (bellCount > 0) clips.push('narrator.story-bells');
    clips.push('narrator.story-ending');
    void playVoiceSequence(clips, storyAsSpeech(story));
  };

  const closeStory = () => {
    stopNarration();
    setStoryOpen(false);
  };

  const startGrownUpHold = () => {
    holdTimer.current = window.setTimeout(() => {
      setGrownUpOpen(true);
      holdTimer.current = null;
    }, 900);
  };

  const cancelGrownUpHold = () => {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  return (
    <main className="game-shell">
      <div className="water-glow" aria-hidden="true" />
      <div className="moon" aria-hidden="true">☾</div>
      <div className="bubbles" aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} style={{ '--bubble': index } as React.CSSProperties} />
        ))}
      </div>

      <header className="game-header">
        <div className="title-lockup">
          <span className="tiny-star" aria-hidden="true">✦</span>
          <div>
            <p>Gia and the Moonlight Zoo</p>
            <h1>Moonlight Aquarium</h1>
          </div>
        </div>

        <button
          className="story-button"
          type="button"
          onClick={tellStory}
          disabled={!hasPower}
          aria-label="Tell my story"
        >
          <span aria-hidden="true">📖</span>
          <span>My story</span>
        </button>
      </header>

      <section className="aquarium-stage" aria-label="The Moonlight Aquarium">
        <div className="fish fish-one" aria-hidden="true">◀</div>
        <div className="fish fish-two" aria-hidden="true">◀</div>
        <div className="sea-floor" aria-hidden="true">
          <span>✺</span><span>♒</span><span>✺</span>
        </div>

        {hasPower && (
          <button
            className={`luma-button ${hasMetLuma ? 'is-awake' : ''}`}
            type="button"
            onClick={meetLuma}
            aria-label={hasMetLuma ? "Hear Luma again" : "Wake Luma the moon jellyfish"}
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/characters/luma-jelly.webp`}
              alt="Luma, a glowing moon jellyfish"
            />
            <span>{hasMetLuma ? 'Luma' : 'Tap Luma!'}</span>
          </button>
        )}

        <div className={`hero-group ${hasPower ? 'has-company' : ''}`}>
          <div className={`power-orbit ${hasPower ? 'is-active' : ''}`} aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="hero-kitty" aria-label="Nova Kitty, a friendly superhero cat">
            <span className="cape" aria-hidden="true" />
            <span className="kitty" aria-hidden="true">🐱</span>
            <span className="hero-star" aria-hidden="true">★</span>
          </div>
        </div>

        <img
          className="penguin-companion"
          src={`${import.meta.env.BASE_URL}assets/characters/penguin-plush.webp`}
          alt="Penguin, Gia's stuffed best friend"
        />

        {hasPower && (
          <button
            className="bubble-repeat"
            type="button"
            onClick={useBubblePower}
            aria-label="Make more moon bubbles"
          >
            <span aria-hidden="true">◌</span>
            <span>Bubbles!</span>
          </button>
        )}

        <div className="narrator-card" aria-live="polite">
          <button
            className="speaker-icon"
            type="button"
            aria-label="Hear the character speak"
            onClick={() => {
              if (hasMetLuma) {
                void playVoice('luma.hello', "I'm Luma. Let's make a song!");
              } else {
                void playVoice(
                  hasPower ? 'nova.power-first' : 'nova.power-invite',
                  hasPower
                    ? 'You and Penguin are making the aquarium shimmer.'
                    : 'Gia, the aquarium needs two superheroes. Will you and Penguin choose bubble power?',
                );
              }
            }}
          >
            <span aria-hidden="true">🔊</span>
          </button>
          <div>
            <p className="speaker-name">{hasMetLuma ? 'Luma says:' : 'Nova Kitty says:'}</p>
            <p className="narrator-line">
              {!hasPower
                ? 'Gia, the aquarium needs two superheroes. Will you and Penguin choose bubble power?'
                : !hasMetLuma
                  ? 'Amazing! You and Penguin woke Luma the moon jellyfish!'
                  : bellCount === 0
                    ? 'Tap my three moon bells and make a song with me!'
                    : `What a sparkly song! You played ${bellCount} ${bellCount === 1 ? 'note' : 'notes'}!`}
            </p>
          </div>
        </div>

        {!hasPower && (
          <button className="power-button" type="button" onClick={useBubblePower}>
            <span className="power-icon" aria-hidden="true">◌</span>
            <span>Bubble power!</span>
            <span className="button-sparkle" aria-hidden="true">✦</span>
          </button>
        )}

        {hasMetLuma && (
          <div className="bell-board" aria-label="Luma's moon bells">
            <button type="button" className="bell blue-bell" onClick={() => playBell('blue_bell')} aria-label="Play the blue moon bell">♪</button>
            <button type="button" className="bell gold-bell" onClick={() => playBell('gold_bell')} aria-label="Play the gold moon bell">♫</button>
            <button type="button" className="bell coral-bell" onClick={() => playBell('coral_bell')} aria-label="Play the coral moon bell">♪</button>
          </div>
        )}
      </section>

      <p className="prototype-note">A first little piece of Gia’s adventure</p>

      <button
        className="grown-up-entry"
        type="button"
        onPointerDown={startGrownUpHold}
        onPointerUp={cancelGrownUpHold}
        onPointerCancel={cancelGrownUpHold}
        onPointerLeave={cancelGrownUpHold}
        aria-label="Press and hold for grown-up settings"
      >
        <span aria-hidden="true">⚙</span> Grown-ups: press and hold
      </button>

      {storyOpen && (
        <div className="story-backdrop" role="presentation">
          <section
            className="storybook"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-title"
          >
            <div className="book-stars" aria-hidden="true">✦　·　✧</div>
            <p className="book-label">The story so far</p>
            <h2 id="story-title">{story.title}</h2>
            <div className="story-copy">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="book-actions">
              <button type="button" className="hear-again" onClick={tellStory}>
                <span aria-hidden="true">🔊</span> Hear it again
              </button>
              <button type="button" className="resume-button" onClick={closeStory}>
                Back to the aquarium <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {grownUpOpen && (
        <GrownUpPanel
          onClose={() => setGrownUpOpen(false)}
          status={pwaUpdate.status}
          statusLabel={pwaUpdate.statusLabel}
          lastChecked={pwaUpdate.lastChecked}
          onCheckForUpdate={pwaUpdate.checkForUpdate}
          onInstallUpdate={pwaUpdate.installUpdate}
        />
      )}
    </main>
  );
}
