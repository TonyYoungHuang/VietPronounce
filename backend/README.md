# Vietnamese Pronunciation Coach Backend

This Node service powers the mini program content, account state, redeem codes, progress, weakness aggregation, and pronunciation scoring proxy.

## Start

```bash
cd backend
npm install
npm start
```

Default local address:

- `http://127.0.0.1:4100`

## Production Mini Program API

The mini program now resolves API hosts from `config/index.js`.

- Development build: `http://127.0.0.1:4100`
- Trial build: `https://viet-api.pindoupicture.cn`
- Release build: `https://viet-api.pindoupicture.cn`

Both app APIs and pronunciation scoring uploads use the backend domain. The mini program should not call Azure directly.

Before upload/release in WeChat, add the production domain to legal domains:

- request domain: `https://viet-api.pindoupicture.cn`
- uploadFile domain: `https://viet-api.pindoupicture.cn`

Runtime override for emergency testing is still available through the `vi_coach_runtime_config_v1` storage key or `globalThis.__VI_COACH_CONFIG__`.

## Main Endpoints

- `GET /health`
- `GET /api/config/public`
- `GET /api/catalog`
- `GET /api/trial?dialect=north`
- `POST /api/auth/anonymous`
- `POST /api/redeem`
- `GET /api/user/state?userId=...`
- `POST /api/user/dialect`
- `GET /api/levels?userId=...&dialect=north`
- `GET /api/lessons?userId=...&dialect=north&levelId=beginner`
- `POST /api/progress/score`
- `POST /api/pronunciation/score`
- `GET /api/audio/demo?text=xin&dialect=north&mode=normal`
- `GET /api/weakness?userId=...&dialect=north`
- `GET /api/admin/redeem-codes`
- `POST /api/admin/redeem-codes`
- `GET /api/admin/catalog`

Storage files are created under `backend/storage/` on first start.

## Azure Pronunciation Assessment

Create `backend/.env.local` from `backend/.env.example` and fill the Azure Speech values. Do not commit `.env.local`.

```bash
PORT=4100
NODE_ENV=production
AZURE_SPEECH_KEY=replace-with-key-1
AZURE_SPEECH_ENDPOINT=https://eastasia.api.cognitive.microsoft.com
AZURE_SPEECH_REGION=eastasia
SCORE_PROVIDER_NAME=azure-pronunciation
SCORE_ALLOW_BASELINE_FALLBACK=false
```

The backend now prefers `AZURE_SPEECH_ENDPOINT` when present. `AZURE_SPEECH_REGION` remains as a fallback for older deployments.
For Pronunciation Assessment, if `AZURE_SPEECH_ENDPOINT` is the Azure Cognitive Services endpoint, the backend derives the correct STT host from `AZURE_SPEECH_REGION`. Use `AZURE_SPEECH_STT_ENDPOINT` only when you need to override that host explicitly.

Demo audio playback can also use Azure Speech TTS through `GET /api/audio/demo`. This is a temporary production bridge before all human-recorded assets are ready. Set `AZURE_SPEECH_TTS_ENDPOINT` only if you need to override the region TTS endpoint.

The scoring flow is:

1. Mini program uploads the recording to `POST /api/pronunciation/score`.
2. Backend checks recording quality.
3. Backend converts audio to 16 kHz mono WAV.
4. Backend sends the file to Azure Pronunciation Assessment.
5. Backend returns normalized total score, accuracy, completeness, fluency, issue indices, and Vietnamese correction dimensions.

For local smoke checks only, set `SCORE_ALLOW_BASELINE_FALLBACK=true` or `AZURE_SPEECH_DISABLED=true`. Production should keep fallback disabled.

## Audio Production Pack

There are currently 180 expected demo audio files in the release content set. If no local human recordings exist yet, use the generated production pack as a handoff file for Azure TTS, another Vietnamese TTS vendor, or a recording team.

Generate the latest audit and audio pack:

```bash
cd backend
npm run check
npm run audio:pack
```

Generated files:

- `backend/reports/missing-audio-manifest.json`: every missing expected audio path.
- `backend/reports/audio-upload-manifest.json`: JSON handoff with text, dialect, speed, target path, and SSML.
- `backend/reports/audio-tts-script.csv`: spreadsheet-friendly script for external production.

Optional Azure TTS generation:

```bash
cd backend
$env:AZURE_TTS_CONFIRM='true'
npm run audio:tts
```

This writes generated MP3 files into `backend/audio-staging`. It is deliberately opt-in because it consumes Azure Speech quota. For a small test batch, set `AUDIO_TTS_LIMIT=5`.

The expected staging layout is:

```text
backend/audio-staging/
  north/normal/north-beginner-1.mp3
  north/slow/north-beginner-1.mp3
  south/normal/south-beginner-1.mp3
  south/slow/south-beginner-1.mp3
```

After the audio files are produced and placed in `backend/audio-staging`, import them into the mini program asset tree:

```bash
cd backend
npm run audio:import
npm run check
```

The import script writes `backend/reports/audio-import-report.json` and copies valid files into `assets/audio/...`.

Important: Azure TTS voice suggestions in the manifest are placeholders for production speed. Verify the dialect quality before release, especially the North/South contrast.

## Release Checks

```bash
cd backend
npm run check
```

The check verifies:

- local domain logic
- score adapter shape
- release content filtering
- North/South mirror consistency
- minimum practice item count per lesson
- expected audio path standards
- missing audio report generation
