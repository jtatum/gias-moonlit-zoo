export type Power = 'bubbles';

export type GameEvent = {
  kind: 'power_chosen' | 'power_repeated';
  actor: 'gia';
  subject: Power;
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

export function buildStory(events: GameEvent[]): Story {
  const bubbleEvents = events.filter((event) => event.subject === 'bubbles');
  const repeatCount = Math.max(0, bubbleEvents.length - 1);

  if (bubbleEvents.length === 0) {
    return {
      title: 'The Aquarium Is Waiting',
      paragraphs: [
        'Gia arrived at the Moonlight Aquarium, where a brave little kitty was waiting for her help.',
      ],
    };
  }

  const repetitionLine =
    repeatCount === 0
      ? 'One enormous moon bubble floated all the way to the twinkling water.'
      : repeatCount === 1
        ? 'Gia tried her bubble power again, and two enormous moon bubbles floated up together.'
        : `Gia used her bubble power again and again. ${bubbleEvents.length} enormous moon bubbles danced toward the twinkling water.`;

  return {
    title: "Gia's Bubble-Power Adventure",
    paragraphs: [
      'One moonlit night, Gia heard a tiny splash at the aquarium door. Nova Kitty needed a superhero.',
      'Gia chose bubble power. A bright blue bubble spun around her hands, and the sleepy aquarium began to shimmer.',
      repetitionLine,
      'Nova Kitty purred. “The animals knew you would find a wonderfully bubbly way to help.”',
    ],
  };
}

export function storyAsSpeech(story: Story): string {
  return [story.title, ...story.paragraphs].join(' ');
}
