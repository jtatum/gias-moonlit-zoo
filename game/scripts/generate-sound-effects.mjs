import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, 'content', 'sound-effects.json');
const outputDirectory = path.join(
  projectRoot,
  'public',
  'assets',
  'audio',
  'effects',
);
const publicManifestPath = path.join(outputDirectory, 'manifest.json');
const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const force = args.has('--force');
const onlyIndex = process.argv.indexOf('--only');
const onlyId = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const selectedEffects = onlyId
  ? source.effects.filter((effect) => effect.id === onlyId)
  : source.effects;

if (onlyId && selectedEffects.length === 0) {
  throw new Error(`Unknown sound effect id: ${onlyId}`);
}

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!isDryRun && !apiKey) {
  throw new Error('ELEVENLABS_API_KEY is missing from .env.local');
}

await mkdir(outputDirectory, { recursive: true });

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

for (const effect of selectedEffects) {
  const outputPath = path.join(outputDirectory, effect.file);
  const temporaryPath = `${outputPath}.tmp`;

  if (!force && (await fileExists(outputPath))) {
    console.log(`skip ${effect.id} (already exists)`);
    continue;
  }

  if (isDryRun) {
    console.log(
      `ready ${effect.id} (${effect.durationSeconds} seconds, ${effect.prompt.length} prompt characters)`,
    );
    continue;
  }

  console.log(`generate ${effect.id} (${effect.durationSeconds} seconds)`);
  const endpoint = new URL('https://api.elevenlabs.io/v1/sound-generation');
  endpoint.searchParams.set('output_format', source.outputFormat);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: effect.prompt,
      duration_seconds: effect.durationSeconds,
      prompt_influence: effect.promptInfluence,
      loop: false,
      model_id: source.modelId,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new Error(
      `ElevenLabs returned ${response.status} for ${effect.id}: ${detail}`,
    );
  }

  const audio = Buffer.from(await response.arrayBuffer());
  await writeFile(temporaryPath, audio);
  await rename(temporaryPath, outputPath);
  console.log(
    `saved ${effect.file} (${audio.length} bytes; character cost ${response.headers.get('character-cost') ?? 'not reported'})`,
  );
}

const availableEffects = {};
for (const effect of source.effects) {
  if (await fileExists(path.join(outputDirectory, effect.file))) {
    availableEffects[effect.id] = {
      src: `assets/audio/effects/${effect.file}`,
      prompt: effect.prompt,
    };
  }
}

if (!isDryRun) {
  await writeFile(
    publicManifestPath,
    `${JSON.stringify(
      {
        version: source.version,
        modelId: source.modelId,
        effects: availableEffects,
      },
      null,
      2,
    )}\n`,
  );
}

for (const effect of source.effects) {
  const temporaryPath = path.join(outputDirectory, `${effect.file}.tmp`);
  if (await fileExists(temporaryPath)) await unlink(temporaryPath);
}

console.log(
  isDryRun
    ? `${selectedEffects.length} effects validated; no API calls made.`
    : `${Object.keys(availableEffects).length} sound effects are available.`,
);
