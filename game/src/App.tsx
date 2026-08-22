import { useEffect, useMemo, useRef, useState } from 'react';
import { GrownUpPanel } from './GrownUpPanel';
import {
  addBubbleEvent,
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

function speak(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 1.08;
  window.speechSynthesis.speak(utterance);
}

export default function App() {
  const [events, setEvents] = useState<GameEvent[]>(loadEvents);
  const [storyOpen, setStoryOpen] = useState(false);
  const [grownUpOpen, setGrownUpOpen] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const story = useMemo(() => buildStory(events), [events]);
  const hasPower = events.length > 0;
  const pwaUpdate = usePwaUpdate();

  useEffect(() => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(events));
  }, [events]);

  const useBubblePower = () => {
    setEvents((current) => addBubbleEvent(current));
    speak(
      hasPower
        ? 'More moon bubbles! Pop, pop, pop!'
        : 'Bubble power activated! The aquarium is beginning to shimmer.',
    );
  };

  const tellStory = () => {
    setStoryOpen(true);
    speak(storyAsSpeech(story));
  };

  const closeStory = () => {
    window.speechSynthesis?.cancel();
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
        <div className="jelly" aria-hidden="true">🪼</div>
        <div className="sea-floor" aria-hidden="true">
          <span>✺</span><span>♒</span><span>✺</span>
        </div>

        <div className="hero-group">
          <div className={`power-orbit ${hasPower ? 'is-active' : ''}`} aria-hidden="true">
            <span /><span /><span />
          </div>
          <div className="hero-kitty" aria-label="Nova Kitty, a friendly superhero cat">
            <span className="cape" aria-hidden="true" />
            <span className="kitty" aria-hidden="true">🐱</span>
            <span className="hero-star" aria-hidden="true">★</span>
          </div>
        </div>

        <div className="narrator-card" aria-live="polite">
          <span className="speaker-icon" aria-hidden="true">🔊</span>
          <div>
            <p className="speaker-name">Nova Kitty says:</p>
            <p className="narrator-line">
              {hasPower
                ? 'Amazing, Gia! Your bubbles are waking up the aquarium!'
                : 'Gia, the aquarium needs a superhero. Will you choose bubble power?'}
            </p>
          </div>
        </div>

        <button className="power-button" type="button" onClick={useBubblePower}>
          <span className="power-icon" aria-hidden="true">◌</span>
          <span>{hasPower ? 'More bubbles!' : 'Bubble power!'}</span>
          <span className="button-sparkle" aria-hidden="true">✦</span>
        </button>
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
              <button type="button" className="hear-again" onClick={() => speak(storyAsSpeech(story))}>
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
