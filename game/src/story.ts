export type Power = 'bubbles';
export type Bell = 'blue_bell' | 'gold_bell' | 'coral_bell';
export type Character = 'luma';

export type GameEvent = {
  kind:
    | 'power_chosen'
    | 'power_repeated'
    | 'jellyfish_met'
    | 'jellyfish_bell_played';
  actor: 'gia';
  subject: Power | Bell | Character;
  scene: 'moonlight_aquarium';
  sequence: number;
};

export type Story = {
  title: string;
  paragraphs: string[];
};

export function addBubbleEvent(events: GameEvent[]): GameEvent[] {
  const hasChosenBubbles = events.some(
    (event) => event.kind === 'power_chosen' && event.subject === 'bubbles',
  );

  return [
    ...events,
    {
      kind: hasChosenBubbles ? 'power_repeated' : 'power_chosen',
      actor: 'gia',
      subject: 'bubbles',
      scene: 'moonlight_aquarium',
      sequence: events.length + 1,
    },
  ];
}

export function addBellEvent(events: GameEvent[], bell: Bell): GameEvent[] {
  return [
    ...events,
    {
      kind: 'jellyfish_bell_played',
      actor: 'gia',
      subject: bell,
      scene: 'moonlight_aquarium',
      sequence: events.length + 1,
    },
  ];
}

export function addMeetLumaEvent(events: GameEvent[]): GameEvent[] {
  if (events.some((event) => event.kind === 'jellyfish_met')) return events;

  return [
    ...events,
    {
      kind: 'jellyfish_met',
      actor: 'gia',
      subject: 'luma',
      scene: 'moonlight_aquarium',
      sequence: events.length + 1,
    },
  ];
}

export function buildStory(events: GameEvent[]): Story {
  const bubbleEvents = events.filter((event) => event.subject === 'bubbles');
  const bellEvents = events.filter(
    (event) => event.kind === 'jellyfish_bell_played',
  );
  const metLuma = events.some((event) => event.kind === 'jellyfish_met');
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

  return {
    title: "Gia and Penguin's Bubble-Power Adventure",
    paragraphs: [
      'One moonlit night, Gia arrived at the aquarium with Penguin tucked safely under her arm. They heard a tiny splash at the door. Nova Kitty needed two superheroes.',
      'Gia chose bubble power. Penguin held on tight as a bright blue bubble spun around them, and the sleepy aquarium began to shimmer.',
      repetitionLine,
      bellLine,
      'Nova Kitty purred. “The animals knew you and Penguin would find a wonderfully bubbly way to help.”',
    ].filter((paragraph): paragraph is string => paragraph !== null),
  };
}

export function storyAsSpeech(story: Story): string {
  return [story.title, ...story.paragraphs].join(' ');
}
