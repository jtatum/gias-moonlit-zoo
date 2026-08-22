import { describe, expect, it } from 'vitest';
import { addBubbleEvent, buildStory } from './story';

describe('Moonlight Aquarium story memory', () => {
  it('remembers Gia choosing bubble power', () => {
    const events = addBubbleEvent([]);

    expect(events[0]).toMatchObject({
      kind: 'power_chosen',
      actor: 'gia',
      subject: 'bubbles',
      sequence: 1,
    });
    expect(buildStory(events).paragraphs.join(' ')).toContain(
      'Gia chose bubble power',
    );
  });

  it('turns repetition into a story detail', () => {
    const once = addBubbleEvent([]);
    const twice = addBubbleEvent(once);
    const threeTimes = addBubbleEvent(twice);

    expect(threeTimes[1].kind).toBe('power_repeated');
    expect(buildStory(threeTimes).paragraphs.join(' ')).toContain(
      'again and again',
    );
    expect(buildStory(threeTimes).paragraphs.join(' ')).toContain('3 enormous');
  });
});
