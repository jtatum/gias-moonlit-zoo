import { describe, expect, it } from 'vitest';
import {
  addBellEvent,
  addBubbleEvent,
  addFinaleEvent,
  addMeetLumaEvent,
  addMeetOchoEvent,
  addPearlEvent,
  buildStory,
} from './story';

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
    expect(buildStory(events).paragraphs.join(' ')).toContain('Penguin');
  });

  it('includes the jellyfish music Gia played with Penguin', () => {
    const powered = addBubbleEvent([]);
    const metLuma = addMeetLumaEvent(powered);
    const firstNote = addBellEvent(metLuma, 'blue_bell');
    const secondNote = addBellEvent(firstNote, 'gold_bell');

    expect(buildStory(secondNote).paragraphs.join(' ')).toContain(
      'Gia played 2 glowing notes',
    );
    expect(buildStory(secondNote).paragraphs.join(' ')).toContain(
      'Penguin danced',
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

  it('remembers Ocho, the moon-pearl order, repetitions, and the finale', () => {
    let events = addBubbleEvent([]);
    events = addMeetLumaEvent(events);
    events = addBellEvent(events, 'blue_bell');
    events = addBellEvent(events, 'gold_bell');
    events = addBellEvent(events, 'coral_bell');
    events = addMeetOchoEvent(events);
    events = addPearlEvent(events, 'gold_star');
    events = addPearlEvent(events, 'blue_circle');
    events = addPearlEvent(events, 'gold_star');
    events = addPearlEvent(events, 'coral_diamond');
    events = addFinaleEvent(events);

    const story = buildStory(events).paragraphs.join(' ');
    expect(story).toContain('Ocho, an octopus with eight arms');
    expect(story).toContain(
      'gold star moon pearl, then the blue circle moon pearl, then the coral diamond moon pearl',
    );
    expect(story).toContain('one moon pearl again');
    expect(story).toContain('whole aquarium played Gia’s moonlight song');
    expect(story).toContain('Penguin stood proudly beside Gia');
  });
});
