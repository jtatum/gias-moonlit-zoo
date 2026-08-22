import { mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, 'content', 'voice-lines.json');
const outputDirectory = path.join(
  projectRoot,
  'public',
  'assets',
  'audio',
  'voice',
);
const publicManifestPath = path.join(outputDirectory, 'manifest.json');
const args = new Set(process.argv.slice(2));
const isDryRun = args.has('--dry-run');
const force = args.has('--force');
const onlyIndex = process.argv.indexOf('--only');
const onlyId = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;

const source = JSON.parse(await readFile(sourcePath, 'utf8'));
const selectedClips = onlyId
  ? source.clips.filter((clip) => clip.id === onlyId)
  : source.clips;

if (onlyId && selectedClips.length === 0) {
  throw new Error(`Unknown clip id: ${onlyId}`);
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

for (const clip of selectedClips) {
  const voiceId = process.env[clip.voiceEnv];
  const outputPath = path.join(outputDirectory, clip.file);
  const temporaryPath = `${outputPath}.tmp`;

  if (!voiceId) {
    throw new Error(`${clip.voiceEnv} is missing from .env.local`);
  }

  if (!force && (await fileExists(outputPath))) {
    console.log(`skip ${clip.id} (already exists)`);
    continue;
  }

  if (isDryRun) {
    console.log(`ready ${clip.id} (${clip.text.length} characters, ${clip.speaker})`);
    continue;
  }

  console.log(`generate ${clip.id} (${clip.text.length} characters, ${clip.speaker})`);
  const endpoint = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
  );
  endpoint.searchParams.set('output_format', source.outputFormat);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: clip.text,
      model_id: source.modelId,
      voice_settings: clip.voiceSettings,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 800);
    throw new Error(`ElevenLabs returned ${response.status} for ${clip.id}: ${detail}`);
  }

  const audio = Buffer.from(await response.arrayBuffer());
  await writeFile(temporaryPath, audio);
  await rename(temporaryPath, outputPath);
  console.log(
    `saved ${clip.file} (${audio.length} bytes; character cost ${response.headers.get('character-cost') ?? 'not reported'})`,
  );
}

const availableClips = {};
for (const clip of source.clips) {
  if (await fileExists(path.join(outputDirectory, clip.file))) {
    availableClips[clip.id] = {
      speaker: clip.speaker,
      src: `assets/audio/voice/${clip.file}`,
      text: clip.text,
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
        clips: availableClips,
      },
      null,
      2,
    )}\n`,
  );
}

for (const clip of source.clips) {
  const temporaryPath = path.join(outputDirectory, `${clip.file}.tmp`);
  if (await fileExists(temporaryPath)) await unlink(temporaryPath);
}

console.log(
  isDryRun
    ? `${selectedClips.length} clips validated; no API calls made.`
    : `${Object.keys(availableClips).length} voice clips are available.`,
);
