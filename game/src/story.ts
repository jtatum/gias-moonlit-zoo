export type Power = 'bubbles';
export type Bell = 'blue_bell' | 'gold_bell' | 'coral_bell';
export type Pearl = 'blue_circle' | 'gold_star' | 'coral_diamond';
export type Character = 'luma' | 'ocho';

export type GameEvent = {
  kind:
    | 'power_chosen'
    | 'power_repeated'
    | 'jellyfish_met'
    | 'jellyfish_bell_played'
    | 'octopus_met'
    | 'moon_pearl_placed'
    | 'moon_pearl_replayed'
    | 'aquarium_finale_played';
  actor: 'gia';
  subject: Power | Bell | Pearl | Character | 'moonlight_song';
  scene: 'moonlight_aquarium';
  sequence: number;
};

export type Story = {
  title: string;
  paragraphs: string[];
};

const pearlNames: Record<Pearl, string> = {
  blue_circle: 'blue circle moon pearl',
  gold_star: 'gold star moon pearl',
  coral_diamond: 'coral diamond moon pearl',
};

function appendEvent(
  events: GameEvent[],
  event: Omit<GameEvent, 'actor' | 'scene' | 'sequence'>,
): GameEvent[] {
  return [
    ...events,
    {
      ...event,
      actor: 'gia',
      scene: 'moonlight_aquarium',
      sequence: events.length + 1,
    },
  ];
}

export function addBubbleEvent(events: GameEvent[]): GameEvent[] {
  const hasChosenBubbles = events.some(
    (event) => event.kind === 'power_chosen' && event.subject === 'bubbles',
  );

  return appendEvent(events, {
    kind: hasChosenBubbles ? 'power_repeated' : 'power_chosen',
    subject: 'bubbles',
  });
}

export function addBellEvent(events: GameEvent[], bell: Bell): GameEvent[] {
  return appendEvent(events, {
    kind: 'jellyfish_bell_played',
    subject: bell,
  });
}

export function addMeetLumaEvent(events: GameEvent[]): GameEvent[] {
  if (events.some((event) => event.kind === 'jellyfish_met')) return events;

  return appendEvent(events, { kind: 'jellyfish_met', subject: 'luma' });
}

export function addMeetOchoEvent(events: GameEvent[]): GameEvent[] {
  if (events.some((event) => event.kind === 'octopus_met')) return events;

  return appendEvent(events, { kind: 'octopus_met', subject: 'ocho' });
}

export function addPearlEvent(events: GameEvent[], pearl: Pearl): GameEvent[] {
  const alreadyPlaced = events.some(
    (event) => event.kind === 'moon_pearl_placed' && event.subject === pearl,
  );

  return appendEvent(events, {
    kind: alreadyPlaced ? 'moon_pearl_replayed' : 'moon_pearl_placed',
    subject: pearl,
  });
}

export function addFinaleEvent(events: GameEvent[]): GameEvent[] {
  if (events.some((event) => event.kind === 'aquarium_finale_played')) {
    return events;
  }

  return appendEvent(events, {
    kind: 'aquarium_finale_played',
    subject: 'moonlight_song',
  });
}

export function buildStory(events: GameEvent[]): Story {
  const bubbleEvents = events.filter((event) => event.subject === 'bubbles');
  const bellEvents = events.filter(
    (event) => event.kind === 'jellyfish_bell_played',
  );
  const pearlEvents = events.filter(
    (event) =>
      event.kind === 'moon_pearl_placed' ||
      event.kind === 'moon_pearl_replayed',
  );
  const placedPearls = pearlEvents.filter(
    (event) => event.kind === 'moon_pearl_placed',
  );
  const metLuma = events.some((event) => event.kind === 'jellyfish_met');
  const metOcho = events.some((event) => event.kind === 'octopus_met');
  const playedFinale = events.some(
    (event) => event.kind === 'aquarium_finale_played',
  );
  const repeatCount = Math.max(0, bubbleEvents.length - 1);

  if (bubbleEvents.length === 0) {
    return {
      title: 'The Aquarium Is Waiting',
      paragraphs: [
        'Gia arrived at the Moonlight Aquarium with her best friend Penguin tucked safely under her arm. A brave little kitty was waiting for their help.',
      ],
    };
  }

  const repetitionLine =
    repeatCount === 0
      ? 'Gia and Penguin watched one enormous moon bubble float all the way to the twinkling water.'
      : repeatCount === 1
        ? 'Gia tried her bubble power again while Penguin bobbed beside her, and two enormous moon bubbles floated up together.'
        : `Gia used her bubble power again and again while Penguin bobbed happily beside her. ${bubbleEvents.length} enormous moon bubbles danced toward the twinkling water.`;

  const bellLine = !metLuma
    ? null
    : bellEvents.length === 0
      ? 'Then Gia and Penguin met Luma the moon jellyfish, who invited them to play his glowing bells.'
      : bellEvents.length === 1
        ? "Then Gia and Penguin met Luma the moon jellyfish. Gia rang one of his glowing bells, and Penguin listened closely."
        : `Then Gia and Penguin met Luma the moon jellyfish. Gia played ${bellEvents.length} glowing notes while Penguin danced under the bubbles.`;

  const pearlLine = !metOcho
    ? null
    : placedPearls.length === 0
      ? 'The glowing bells led Gia and Penguin to Ocho, an octopus with eight arms and a moon-pearl baton.'
      : `The glowing bells led Gia and Penguin to Ocho, an octopus with eight arms and a moon-pearl baton. Gia placed the ${placedPearls
          .map((event) => pearlNames[event.subject as Pearl])
          .join(', then the ')} while Penguin kept the beat.`;

  const pearlRepeatCount = pearlEvents.length - placedPearls.length;
  const pearlRepeatLine =
    pearlRepeatCount === 0
      ? null
      : pearlRepeatCount === 1
        ? 'Gia played one moon pearl again, and Ocho answered with an extra-curly conducting flourish.'
        : `Gia played the moon pearls ${pearlRepeatCount} extra times. Ocho conducted with more and more arms while Penguin danced faster.`;

  const endingLine = playedFinale
    ? 'Ocho lifted his baton. Luma shimmered, Nova Kitty purred, and Penguin stood proudly beside Gia as the whole aquarium played Gia’s moonlight song.'
    : 'Nova Kitty purred. “The animals knew you and Penguin would find a wonderfully bubbly way to help.”';

  return {
    title: "Gia and Penguin's Bubble-Power Adventure",
    paragraphs: [
      'One moonlit night, Gia arrived at the aquarium with Penguin tucked safely under her arm. They heard a tiny splash at the door. Nova Kitty needed two superheroes.',
      'Gia chose bubble power. Penguin held on tight as a bright blue bubble spun around them, and the sleepy aquarium began to shimmer.',
      repetitionLine,
      bellLine,
      pearlLine,
      pearlRepeatLine,
      endingLine,
    ].filter((paragraph): paragraph is string => paragraph !== null),
  };
}

export function storyAsSpeech(story: Story): string {
  return [story.title, ...story.paragraphs].join(' ');
}
