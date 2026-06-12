# CLAUDE.md

## What This Is

howaiworks.io is an interactive AI education platform. Users experience how AI actually works through hands-on demos — typing text and watching it get tokenized, exploring word embeddings, running models locally vs. in the cloud. Learn by doing, not reading.

**Author:** Matt Feroz (howaiworks.io)

**Audience:** University CS students (intro AI/NLP), high school teachers, self-taught devs, curious people.

## Commands

```bash
bun install              # Install dependencies
bun run dev              # Frontend dev server on :3000
bun run build            # Production build to dist/
bun run preview          # Preview production build locally
```

Optional backend (for Ollama chat on /run page):
```bash
pip install fastapi uvicorn httpx tiktoken
uvicorn main:app --host 0.0.0.0 --port 8000
```

Full stack with Docker:
```bash
docker compose up        # Frontend :3000, Backend :8000, Ollama :11434
```

No tests or linting configured.

## Architecture

**React 19 + Vite 6 SPA.** No SSR. Tokenizer and embeddings pages work fully client-side with zero backend. The /run page uses WebLLM (in-browser via WebGPU) or falls back to demo replay.

### Routing

`main.jsx` wraps `<App />` in `<BrowserRouter>`. `App.jsx` defines routes with Framer Motion page transitions:
- `/` → `HomePage` — lesson timeline landing page
- `/what-is-ai` → `WhatIsAIPage` — 4-era animated AI history timeline
- `/tokenize` → `TokenizerPage` — live tokenization hero experience
- `/understand` → `EmbeddingsPage` — embeddings visualization (MeaningMap, WordArithmetic)
- `/run` → `CloudVsLocalPage` — cloud vs. local inference comparison
- `/about` → `AboutPage`
- `/resources` → `ResourcesPage`

`App.jsx` initializes `useWebLLM({ autoLoad: true })` when on `/run` and passes it to `CloudVsLocalPage`.

### The Tokenizer Pipeline

`useTokenizer.js` hook wraps `js-tiktoken` with lazy-loaded `cl100k_base` encoder (GPT-4's actual tokenizer). Exposes `tokenize(text)` returning `[{ id, text, display, index }]` and `decode(ids)`. Encoder is ~3MB, loaded once, then synchronous.

### TokenizerPhase.jsx (~1000 lines)

The largest component. Orchestrates the tokenizer experience:

- **Overlay pattern**: Transparent `<textarea>` over a colored `<div>` overlay. Tokens rendered with 12-color palette. Creates "X-ray vision" effect.
- **Dual input bars**: "Your text" (user types) and "What AI sees" (token IDs). Editing IDs reverse-decodes.
- **Auto-type animation**: Types "How does AI work?" at 60ms/char on mount.
- **Progressive reveal**: Tracks user interactions. Stats bar → nudges → confetti → Go Deeper.
- **Three nudges**: "strawberry" (subword splitting), "supercalifragilisticexpialidocious" (rare word cost), "مرحبا كيف حالك" (multilingual inequity).

### WebLLM — In-Browser Inference

`useWebLLM.js` loads `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` via `@mlc-ai/web-llm` using WebGPU. Exposes `{ status, progress, isReady, load, chat }`. `chat()` streams tokens via async iterator. Falls back when WebGPU unavailable.

### EmbeddingsPage — Meaning Visualization

`MeaningMap.jsx` (D3 2D scatter plot of word embeddings) and `WordArithmetic.jsx` (vector arithmetic: king - man + woman = queen). Uses pre-generated or backend-provided embedding data.

### CloudVsLocalPage — Chat Interface

Receives `webllm` prop. Includes `LatencyRace.jsx`, `SetupGuide.jsx`, and `TradeoffCards.jsx`. The cloud lane of the race is always simulated (via `CloudDemoReplay.jsx`); the local lane uses Ollama or WebLLM when available, falling back to a simulated stream (`DemoReplay.jsx`).

### Backend (main.py — optional FastAPI)

Endpoints: `/api/tokenize`, `/api/embed`, `/api/chat` (SSE streaming), `/api/gpu-info`, `/api/health`. Proxied via Vite dev server `/api` → `localhost:8000`.

## Design System

Aligned with matthewferoz.com (same brand orange, Poppins, dark neutrals) so the two sites read as one ecosystem.

```
Colors:
  --bg-deep:           #171719       (page background)
  --bg-surface:        #1a1b1e       (cards, inputs)
  --bg-elevated:       #25262a       (elevated panels)
  --brand:             #f85f00       (primary accent, orange)
  --brand-dark:        #c74b00
  --brand-dim:         rgba(248,95,0,0.15)
  --brand-glow:        rgba(248,95,0,0.4)
  --text-primary:      #dbdbdb
  --text-secondary:    #9aa0aa
  --text-dim:          #6b7078
  --border:            #2a2b2f

Fonts:
  Body:  'Poppins' (300-700)
  Mono:  'IBM Plex Mono' (400-600) — used in inputs

Buttons: primary CTAs are pill-shaped (borderRadius 999), matching matthewferoz.com.
Token colors: 12-color palette in globals.css (.token-color-0 through .token-color-11);
slot 0 is brand orange.
```

## Key Constraints

- **Must work without backend.** Tokenizer + embeddings pages are fully client-side.
- **No flashing on re-render.** Token overlays must be stable during typing. Only new tokens animate. Hard requirement.
- **Inline styles preferred.** Components own their styles and logic. No CSS modules.
- **No TypeScript.**
- **Framer Motion for all animations.** AnimatePresence for enter/exit, layout animations.
- **Use `bun`, not `npm`.**

## Architecture Decisions

- **js-tiktoken client-side:** Core pages need zero backend. Users interact immediately.
- **Live tokenization (no "normal text" state):** From the first keystroke, users see the AI's view.
- **cl100k_base encoding:** GPT-4's actual tokenizer for credibility.
- **Overlay pattern over contentEditable:** textarea + colored div avoids cursor/selection bugs.
- **Progressive reveal:** Type → discover → go deeper. Guided exploration, not passive reading.
