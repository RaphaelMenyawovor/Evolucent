# Khaya AI (GhanaNLP)

Evolucent uses **Khaya** via [GhanaNLP](https://ghananlp.org/) for **English → Ghanaian language translation** and **text-to-speech** on project pages.

## What runs where

- **Translation** is done server-side through `POST /api/translate-project`, which calls GhanaNLP’s translate API (`https://translation-api.ghananlp.org/v1/translate`) with `Ocp-Apim-Subscription-Key`. Source text is treated as English (`in: "en"`); target languages map to codes: Twi `tw`, Ewe `ee`, Ga `gaa`, Dagbani `dag`, Fante `fat`. Choosing **English** skips the API and returns the source text unchanged.
- **TTS** is requested through `POST /api/tts`, which proxies to GhanaNLP’s TTS endpoint (`https://translation-api.ghananlp.org/tts/v1/tts`) and returns WAV audio. Only those same language codes are supported for Khaya voices.
- **English playback** does not use Khaya TTS: the client uses the browser’s `speechSynthesis` API (e.g. in `ProjectLanguageReader`).

## UI

- **`ProjectLanguageReader`** — “Listen to this project”: builds text from project fields, translates, then plays Khaya audio or browser speech for English.
- **`KhayaAIPlayer`** — compact player for a single `text` string (e.g. project description): translate then TTS for the selected Ghanaian language.

## Configuration

Set **`GHANANLP_API_KEY`** in `.env` (see `.env.example`). A second key placeholder exists in `.env.example` for possible future fallback; only the primary key is used by the app today.

Without a valid key, translation/TTS routes return **503** and the UI surfaces configuration or network errors.
