# Project plan: Gia and the Moonlight Zoo

## The promise

Gia and her beloved stuffed best friend Penguin explore a magical animal world. Gia makes meaningful choices and can press **Tell My Story** whenever she wants. The game turns what she actually did—including favorite repetitions—into an illustrated, musical story about their adventure.

This is a toy and a storybook, not a test. There are no timers, scores, failure states, streaks, advertisements, or required reading.

## Product principles

1. **Gia causes the story.** The recap must mention her real choices instead of playing a generic ending.
2. **Penguin is always with her.** Penguin appears in every adventure and every retelling, never as an optional unlock.
3. **Repetition is part of the fun.** Repeated taps receive warm variations and may become funny story details.
4. **Predictable shape, surprising details.** Chapters keep a familiar rhythm while animals, powers, music, and reactions vary.
5. **Facts and fantasy are clearly compatible.** Real animal facts remain true; explicitly magical events can be wonderfully impossible.
6. **Audio is first-class.** All essential instructions are spoken and shown visually. Reading is optional.
7. **Calm by default.** Large targets, gentle transitions, controllable sound layers, no accidental exits, and no sudden sensory escalation.
8. **Private and offline.** Play history and generated storybooks stay on the device. The core chapter works without a connection.

## First playable slice: Moonlight Aquarium

The first slice should take roughly three to five minutes and answer one question: does it feel magical when the game tells Gia the story she just created?

### Loop

1. A friendly narrator welcomes Gia to a moonlit harbor aquarium.
2. An original hero kitty asks for help restoring the aquarium's nighttime song.
3. Gia chooses one of three superpowers: bubbles, glow, or super-speed.
4. She helps two animals through simple touch activities:
   - make a jellyfish bell melody;
   - help an octopus return moon-pearl notes to their places.
5. A persistent storybook button offers **Tell My Story** after the first meaningful choice and at every calm transition.
6. The animals perform a short finale assembled from the sounds Gia activated.
7. The closing book retells her particular adventure and can be replayed page by page.

Temporary recorded or synthetic audio is acceptable for this milestone. Final Suno music and ElevenLabs performances should come after timing, line structure, and interaction pacing work.

## The story-memory system

Gameplay records small, structured events rather than prose. For example:

```ts
{
  kind: "power_chosen",
  actor: "gia",
  subject: "bubble_power",
  scene: "moonlight_aquarium",
  sequence: 4
}
```

Other events include entering a habitat, meeting an animal, completing an action, replaying a sound, asking for a story, and repeating an activity. Events contain no account information and remain in local browser storage.

A deterministic story director converts those events into story beats. It selects recorded lines from a versioned narration manifest and avoids awkward combinations. The same event history always remains tellable, including while offline.

### Story modes

- **Story so far:** a short recap available during a calm point in play.
- **Chapter ending:** a longer illustrated retelling with the musical finale.
- **Again, but different:** the same facts told with alternate recorded phrasing.
- **My story shelf (later):** locally saved illustrated recaps, controlled from the grown-up area.

## Voices and music

Use a consistent warm narrator as the emotional anchor. Characters have distinct voices, but the cast stays small enough to remain recognizable.

- Narrator: clear, friendly, unhurried, and never babyish.
- Hero kitty: energetic and confident, with calmer delivery for instructions.
- Animals: one or two short expressive styles per chapter; avoid noisy overlapping dialogue.
- Gia: the narrator describes Gia in second person during play and third person in storybook mode.

ElevenLabs audio is produced ahead of release, not requested from Gia's tablet. Lines are exported as versioned assets with transcripts, speaker, emotional direction, and timing metadata. Common names, powers, animals, numbers, transitions, and reactions are designed as cleanly joinable clips; important dramatic sentences are recorded whole.

Suno tracks are prepared as loops and stems where practical: ambience, rhythm, animal motif, success flourish, and finale. Narration automatically ducks the music without silencing gentle ambience. The grown-up area provides independent narration, music, and effects controls.

Before publishing generated audio, confirm that the chosen service plan and source material permit the intended use and distribution.

## Technical shape

The proposed implementation is a static TypeScript web app built with Vite and React. Interactive scenes use normal web elements and layered raster artwork first; Canvas/WebGL is added only if animation needs it. This keeps large touch controls, focus behavior, subtitles, and testing straightforward.

Likely project pieces:

- TypeScript + React + Vite
- a service worker generated through a maintained PWA integration
- IndexedDB for local story events, settings, and content metadata
- Web Audio for music layers, fades, and narration ducking
- Vitest for story-director and state tests
- Playwright for the essential touch journey and update UI
- GitHub Pages for static hosting
- GitHub Actions for verification and deployment

The site must work under a GitHub Pages repository subpath, not only at `/`.

## Updates and the grown-up page

The grown-up page is reached by a deliberate press-and-hold gesture. It shows:

- app version and build identifier;
- installed chapter/content versions;
- **Offline ready**, **Checking**, **Downloading**, **Update ready**, or **Update failed** state;
- download progress when the browser exposes meaningful progress;
- last successful update check;
- a **Check for updates** button;
- an explicit **Install update** button that activates only at a safe transition;
- storage use and a guarded way to remove optional content;
- narration, music, effects, motion, and subtitle preferences.

The service worker treats application code and content packs differently:

- hashed app files are immutable and replaced atomically;
- the small version catalog checks online when possible;
- the currently playable version remains available until its replacement is complete;
- an interrupted update never breaks the installed chapter;
- active gameplay is never reloaded automatically;
- local saves are versioned and migrated rather than discarded.

An update can only be discovered when the tablet is online. Launching while offline immediately uses the last complete version.

## GitHub Actions

### Pull requests and pushes

1. Install from the lockfile.
2. Type-check.
3. Run unit tests.
4. Build with the GitHub Pages base path.
5. Run a small set of browser tests against the built site.
6. Verify that the web manifest, icons, service worker, and offline entry point exist.

### Deployment from `main`

1. Repeat the verification job.
2. Build a production artifact containing a visible version derived from the release version and commit.
3. Upload it with the official GitHub Pages artifact action.
4. Deploy it with the official GitHub Pages deployment action.

Deployment and verification are separate jobs so a broken build cannot replace the working game.

## Accessibility and child-safety acceptance checks

- Essential targets are at least 64 CSS pixels and separated from one another.
- Gameplay never depends on reading, color alone, a precise drag, or rapid timing.
- Every spoken instruction has a visual counterpart and optional subtitle.
- Accidental taps cannot leave the game or erase a story.
- Motion, narration, music, and effects can be adjusted independently.
- Sound begins only after Gia or a grown-up interacts with the page, as required by tablet browsers.
- The game has no third-party requests during play, analytics, accounts, chat, advertisements, or external links in the child-facing area.
- Airplane-mode tests cover first launch after installation, a complete chapter, a story-so-far, and the finale.

## Delivery phases

### Phase 1 — Prove the magic

- Scaffold the app and test/deploy workflows.
- Build the aquarium loop with placeholder illustration and audio.
- Implement structured event memory.
- Implement story-so-far and the ending recap.
- Install and run entirely offline on an Android-class tablet.
- Add the grown-up version/update screen.

**Exit test:** Gia can make choices, request her story, recognize those choices in the narration, finish the chapter, close the app, reopen offline, and play again.

### Phase 2 — Establish the production pipeline

- Finalize original character and visual direction.
- Define audio naming, manifests, loudness targets, subtitles, and licensing records.
- Integrate the narrator, character voices, and musical stems.
- Add alternate narration phrasing and repetition-aware reactions.
- Test download size, memory use, startup speed, and inexpensive Android hardware.

### Phase 3 — Grow the zoo

- Add two contrasting habitats and new animal mechanics.
- Add the magical nursery with clearly framed real facts and fantasy play.
- Add recent-life prompts in the grown-up area using curated, pre-recorded choices.
- Add a local story shelf if it remains simple and enjoyable.

### Phase 4 — Polish and release

- Observe play with an adult present and adjust confusing or overstimulating moments.
- Complete accessibility, offline, update-interruption, and save-migration tests.
- Optimize audio and artwork packs.
- Prepare install instructions for Gia's tablet and a recovery path for the grown-up.

## What comes first

Create the Phase 1 app shell and implement the story event model before producing final media. Then build one aquarium interaction all the way through **choice → remembered event → Tell My Story narration → resume play**. This thin path validates the heart of the game and gives music, voice, illustration, and interaction work a stable format to build upon.
