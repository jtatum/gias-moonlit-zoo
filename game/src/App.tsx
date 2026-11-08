import { useEffect, useMemo, useRef, useState } from 'react';
import { GrownUpPanel } from './GrownUpPanel';
import {
  playBellTone,
  playEffect,
  playFinaleTones,
  playPearlTone,
  playVoice,
  playVoiceSequence,
  stopNarration,
  type BellTone,
  type PearlTone,
  type VoiceClipId,
} from './audio';
import {
  addBellEvent,
  addBubbleEvent,
  addFinaleEvent,
  addMeetLumaEvent,
  addMeetOchoEvent,
  addPearlEvent,
  buildStory,
  storyAsSpeech,
  type GameEvent,
  type Pearl,
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
  const finaleVoiceTimer = useRef<number | null>(null);
  const story = useMemo(() => buildStory(events), [events]);
  const hasPower = events.some(
    (event) => event.kind === 'power_chosen' || event.kind === 'power_repeated',
  );
  const bubbleCount = events.filter((event) => event.subject === 'bubbles').length;
  const hasMetLuma = events.some((event) => event.kind === 'jellyfish_met');
  const bellEvents = events.filter(
    (event) => event.kind === 'jellyfish_bell_played',
  );
  const bellCount = bellEvents.length;
  const hasMetOcho = events.some((event) => event.kind === 'octopus_met');
  const pearlEvents = events.filter(
    (event) =>
      event.kind === 'moon_pearl_placed' ||
      event.kind === 'moon_pearl_replayed',
  );
  const placedPearls = new Set(
    events
      .filter((event) => event.kind === 'moon_pearl_placed')
      .map((event) => event.subject as Pearl),
  );
  const pearlRepeatCount = pearlEvents.filter(
    (event) => event.kind === 'moon_pearl_replayed',
  ).length;
  const hasPlayedFinale = events.some(
    (event) => event.kind === 'aquarium_finale_played',
  );
  const ochoIsReady = bellCount >= 3;
  const finaleIsReady = placedPearls.size === 3;
  const pwaUpdate = usePwaUpdate();

  useEffect(() => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(
    () => () => {
      if (finaleVoiceTimer.current !== null) {
        window.clearTimeout(finaleVoiceTimer.current);
      }
    },
    [],
  );

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

  const meetOcho = () => {
    setEvents((current) => addMeetOchoEvent(current));
    void playVoice(
      'ocho.hello',
      "Hey, Gia and Penguin! I'm Ocho. Tap each moon pearl and I'll conduct the aquarium song!",
    );
  };

  const playPearl = (pearl: PearlTone) => {
    const isRepeat = placedPearls.has(pearl);
    playPearlTone(pearl);
    playEffect('ocho.moon-pearl');
    setEvents((current) => addPearlEvent(current, pearl));
    void playVoice(
      isRepeat ? 'ocho.pearl-repeat' : 'ocho.pearl-first',
      isRepeat
        ? 'Again? Absolutely! Watch all eight arms!'
        : 'Beautiful moon pearl! It found its note.',
    );
  };

  const playFinale = () => {
    const bellMelody = bellEvents.map((event) => event.subject as BellTone);
    const pearlMelody = pearlEvents.map((event) => event.subject as PearlTone);
    playEffect('aquarium.finale-flourish');
    playFinaleTones(bellMelody, pearlMelody);
    setEvents((current) => addFinaleEvent(current));
    if (finaleVoiceTimer.current !== null) {
      window.clearTimeout(finaleVoiceTimer.current);
    }
    finaleVoiceTimer.current = window.setTimeout(() => {
      void playVoice(
        'ocho.finale',
        "Gia and Penguin, that's our moonlight song! The whole aquarium is glowing!",
      );
      finaleVoiceTimer.current = null;
    }, 1700);
  };

  const tellStory = () => {
    if (finaleVoiceTimer.current !== null) {
      window.clearTimeout(finaleVoiceTimer.current);
      finaleVoiceTimer.current = null;
    }
    setStoryOpen(true);
    const clips: VoiceClipId[] = [
      'narrator.story-opening',
      bubbleCount <= 1
        ? 'narrator.story-one-bubble'
        : 'narrator.story-many-bubbles',
    ];
    if (bellCount > 0) clips.push('narrator.story-bells');
    if (hasMetOcho) clips.push('narrator.story-ocho');
    const pearlClips: Record<Pearl, VoiceClipId> = {
      blue_circle: 'narrator.story-pearl-blue',
      gold_star: 'narrator.story-pearl-gold',
      coral_diamond: 'narrator.story-pearl-coral',
    };
    for (const pearl of placedPearls) clips.push(pearlClips[pearl]);
    if (pearlRepeatCount > 0) clips.push('narrator.story-pearl-repeats');
    clips.push(
      hasPlayedFinale ? 'narrator.story-finale' : 'narrator.story-ending',
    );
    void playVoiceSequence(clips, storyAsSpeech(story));
  };

  const closeStory = () => {
    stopNarration();
    setStoryOpen(false);
  };

  const restartAdventure = () => {
    if (finaleVoiceTimer.current !== null) {
      window.clearTimeout(finaleVoiceTimer.current);
      finaleVoiceTimer.current = null;
    }
    stopNarration();
    window.localStorage.setItem(SESSION_KEY, '[]');
    setEvents([]);
    setStoryOpen(false);
    setGrownUpOpen(false);
    void playVoice(
      'nova.power-invite',
      'Gia, the aquarium needs two superheroes. Will you and Penguin choose bubble power?',
    );
  };

  const startGrownUpHold = () => {
    // A second finger landing mid-hold must not orphan the first timer:
    // the orphan can't be cancelled and would open the panel after release.
    cancelGrownUpHold();
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

  const speakerName = hasMetOcho
    ? 'Ocho says:'
    : hasMetLuma
      ? 'Luma says:'
      : 'Nova Kitty says:';

  const speakerLine = !hasPower
    ? 'Gia, the aquarium needs two superheroes. Will you and Penguin choose bubble power?'
    : !hasMetLuma
      ? 'Amazing! You and Penguin woke Luma the moon jellyfish!'
      : !hasMetOcho
        ? ochoIsReady
          ? 'You beauty! Our bells woke three moon pearls. Follow their glow to Ocho!'
          : bellCount === 0
            ? 'Tap my three moon bells and make a song with me!'
            : `What a sparkly song! You played ${bellCount} ${bellCount === 1 ? 'note' : 'notes'}!`
        : hasPlayedFinale
          ? 'That was our moonlight song! Play anything again, or hear your whole adventure.'
          : finaleIsReady
            ? 'All three moon pearls are home. Gia and Penguin, will you conduct the finale?'
            : placedPearls.size === 0
              ? 'Tap each shape-and-color moon pearl. Every one has a note!'
              : `You found ${placedPearls.size} of 3 moon-pearl notes. Beautiful!`;

  const hearCurrentSpeaker = () => {
    if (hasMetOcho) {
      void playVoice(
        hasPlayedFinale ? 'ocho.finale' : 'ocho.hello',
        hasPlayedFinale
          ? "Gia and Penguin, that's our moonlight song!"
          : "I'm Ocho. Let's find the three moon-pearl notes!",
      );
      return;
    }

    if (hasMetLuma) {
      void playVoice(
        ochoIsReady ? 'luma.ocho-clue' : 'luma.hello',
        ochoIsReady
          ? 'You beauty! Our bells woke three moon pearls. Follow their glow to Ocho!'
          : "I'm Luma. Let's make a song!",
      );
      return;
    }

    void playVoice(
      hasPower ? 'nova.power-first' : 'nova.power-invite',
      hasPower
        ? 'You and Penguin are making the aquarium shimmer.'
        : 'Gia, the aquarium needs two superheroes. Will you and Penguin choose bubble power?',
    );
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

      <section
        className={`aquarium-stage ${hasMetOcho ? 'ocho-scene' : ''} ${hasPlayedFinale ? 'finale-complete' : ''}`}
        aria-label="The Moonlight Aquarium"
      >
        <div className="fish fish-one" aria-hidden="true">◀</div>
        <div className="fish fish-two" aria-hidden="true">◀</div>
        <div className="sea-floor" aria-hidden="true">
          <span>✺</span><span>♒</span><span>✺</span>
        </div>

        {hasPower && !hasMetOcho && (
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

        {!hasMetOcho && (
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
        )}

        {hasMetOcho && (
          <button
            className="ocho-character"
            type="button"
            onClick={() => {
              void playVoice(
                hasPlayedFinale ? 'ocho.finale' : 'ocho.hello',
                hasPlayedFinale
                  ? "Gia and Penguin, that's our moonlight song!"
                  : "Hey, Gia and Penguin! I'm Ocho!",
              );
            }}
            aria-label="Hear Ocho the octopus"
          >
            <img
              src={`${import.meta.env.BASE_URL}assets/characters/ocho-octopus.webp`}
              alt="Ocho, a purple octopus conductor with eight arms"
            />
            <span>Ocho</span>
          </button>
        )}

        <img
          className="penguin-companion"
          src={`${import.meta.env.BASE_URL}assets/characters/penguin-plush-v2.webp`}
          alt="Penguin, Gia's stuffed best friend"
        />

        {hasPlayedFinale && (
          <div className="finale-stars" aria-hidden="true">
            <span>✦</span><span>♪</span><span>✧</span><span>♫</span><span>✦</span>
          </div>
        )}

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
            onClick={hearCurrentSpeaker}
          >
            <span aria-hidden="true">🔊</span>
          </button>
          <div className="narrator-copy">
            <p className="speaker-name">{speakerName}</p>
            <p className="narrator-line">{speakerLine}</p>
          </div>
          {ochoIsReady && !hasMetOcho && (
            <button className="scene-action" type="button" onClick={meetOcho}>
              Meet Ocho! <span aria-hidden="true">→</span>
            </button>
          )}
          {hasMetOcho && finaleIsReady && (
            <button className="scene-action finale-action" type="button" onClick={playFinale}>
              {hasPlayedFinale ? 'Finale again!' : 'Play the finale!'}
              <span aria-hidden="true"> ♪</span>
            </button>
          )}
        </div>

        {!hasPower && (
          <button className="power-button" type="button" onClick={useBubblePower}>
            <span className="power-icon" aria-hidden="true">◌</span>
            <span>Bubble power!</span>
            <span className="button-sparkle" aria-hidden="true">✦</span>
          </button>
        )}

        {hasMetLuma && !hasMetOcho && (
          <div className="bell-board" aria-label="Luma's moon bells">
            <button type="button" className="bell blue-bell" onClick={() => playBell('blue_bell')} aria-label="Play the blue moon bell">♪</button>
            <button type="button" className="bell gold-bell" onClick={() => playBell('gold_bell')} aria-label="Play the gold moon bell">♫</button>
            <button type="button" className="bell coral-bell" onClick={() => playBell('coral_bell')} aria-label="Play the coral moon bell">♪</button>
          </div>
        )}

        {hasMetOcho && (
          <div className="pearl-board" aria-label="Ocho's moon pearls">
            <button
              type="button"
              className={`moon-pearl blue-circle ${placedPearls.has('blue_circle') ? 'is-placed' : ''}`}
              onClick={() => playPearl('blue_circle')}
              aria-label="Play the blue circle moon pearl"
            >
              <span aria-hidden="true">●</span>
            </button>
            <button
              type="button"
              className={`moon-pearl gold-star ${placedPearls.has('gold_star') ? 'is-placed' : ''}`}
              onClick={() => playPearl('gold_star')}
              aria-label="Play the gold star moon pearl"
            >
              <span aria-hidden="true">★</span>
            </button>
            <button
              type="button"
              className={`moon-pearl coral-diamond ${placedPearls.has('coral_diamond') ? 'is-placed' : ''}`}
              onClick={() => playPearl('coral_diamond')}
              aria-label="Play the coral diamond moon pearl"
            >
              <span aria-hidden="true">◆</span>
            </button>
          </div>
        )}
      </section>

      <p className="prototype-note">
        {hasPlayedFinale ? 'Gia and Penguin restored the moonlight song' : 'A first little piece of Gia’s adventure'}
      </p>

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
            <p className="book-label">
              {hasPlayedFinale ? 'The whole aquarium adventure' : 'The story so far'}
            </p>
            <h2 id="story-title">{story.title}</h2>
            <div className="story-copy">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="book-actions">
              <button
                type="button"
                className="restart-button"
                onClick={restartAdventure}
              >
                <span aria-hidden="true">↻</span> Start again
              </button>
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
          onRestartAdventure={restartAdventure}
        />
      )}
    </main>
  );
}
