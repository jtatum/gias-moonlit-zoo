# Gia and the Moonlight Zoo

An offline-first, musical story game made for Gia. Her choices during play become a narrated story she can hear at any time.

The first playable chapter will be **Moonlight Aquarium**: Gia helps an original superpowered kitty restore a missing piece of the aquarium's nighttime song.

See [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) for the product and technical plan.

## Current status

The first playable vertical slice lives in `game/`:

- Gia can activate and repeat bubble power.
- Penguin, Gia’s stuffed best friend, joins every scene and retelling.
- Gia can wake Luma, a male moon jellyfish, and play three glowing bell notes.
- The game remembers those actions locally.
- **My story** retells the choices and repetitions with prerecorded narration.
- A press-and-hold grown-up panel shows the app version and update status.
- The production build installs as an offline PWA.
- GitHub Actions verify and deploy the static site to GitHub Pages.

## Local development

```sh
cd game
npm install
npm run dev
```

Run verification with `npm run typecheck`, `npm test`, `npm run build`, and
`npm run test:e2e`.

## Voice configuration

Copy values into the already-gitignored `game/.env.local` as voices are chosen.
The safe variable names are documented in `game/.env.example`.

API keys are reserved for local, ahead-of-release asset generation. They must
never use a `VITE_` prefix or be called from the tablet-facing game.

Generate or refresh committed offline audio with:

```sh
cd game
npm run voice:generate
npm run sfx:generate
```

Both generators skip existing files unless passed `--force`. Voice, effect,
and character source manifests live in `game/content/`. Suno remains the source
for music; ElevenLabs is used for voices and selected magical sound effects.
