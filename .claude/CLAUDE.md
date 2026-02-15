# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

howaiworks.io is an interactive AI education tool for the **NVIDIA GTC 2026 Golden Ticket Competition** (deadline: February 15, 2026). Users land on the page, type text, and see it live-tokenized — experiencing how AI actually perceives language instead of reading about it.

**Submitter:** Matt Feroz (howaiworks.io)
**Narrative hook:** Matt asked on an NVIDIA Developer Livestream (04:12-05:55 in https://www.youtube.com/watch?v=nRo-tQC-mEY): "Is AI literacy a hardware problem or a software education problem?" NVIDIA said DGX Spark solves the hardware side. howaiworks.io is the software side.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Frontend dev server on :3000
npm run build            # Production build to dist/
npm run preview          # Preview production build locally
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

There are no tests or linting configured.

## Architecture

**React 19 + Vite 6 SPA.** Three routes, no SSR. Phase 1-2 (tokenizer) works fully client-side with zero backend. Phase 3 uses WebLLM (in-browser via WebGPU) or falls back to demo replay.

### Routing

`main.jsx` wraps `<App />` in `<BrowserRouter>`. `App.jsx` defines three routes with Framer Motion page transitions:
- `/` → `TokenizerPage` — the hero experience (primary)
- `/understand` → `EmbeddingsPage` — embeddings visualization (MeaningMap, WordArithmetic)
- `/run` → `CloudVsLocalPage` — chat interface with WebLLM in-browser inference

`App.jsx` initializes `useWebLLM({ autoLoad: true })` at the top level and passes it to `CloudVsLocalPage`.

### The Tokenizer Pipeline

The core technical mechanism: `useTokenizer.js` hook wraps `js-tiktoken` with lazy-loaded `cl100k_base` encoder (GPT-4's actual tokenizer). It exposes `tokenize(text)` which returns `[{ id, text, display, index }]` and `decode(ids)` for reverse lookup. The encoder is ~3MB and loaded once on first use; after that, tokenization is synchronous.

### TokenizerPhase.jsx — The Main Component (~1000 lines)

This is the largest and most complex component. It orchestrates the entire hero experience:

- **Overlay pattern**: A transparent `<textarea>` sits on top of a colored `<div>` overlay. The overlay renders tokens with the 12-color palette. This creates the "X-ray vision" effect where the user types in what looks like a normal input but sees colored tokens.
- **Dual input bars**: "Your text" (user types) and "What AI sees" (token IDs). Both use the overlay pattern. Editing IDs reverse-decodes back to text.
- **Auto-type animation**: On mount, types "How does AI work?" at 60ms/char, tokenizing on each character.
- **Progressive reveal state machine**: Tracks `userHasTyped`, number of inputs, nudges explored. Stats bar appears after first input. Nudges appear progressively. All 3 nudges explored → confetti → Go Deeper unlocks.
- **Three nudges**: "strawberry" (subword splitting), "supercalifragilisticexpialidocious" (rare word cost), "مرحبا كيف حالك" (multilingual inequity). Each has an expandable insight card.

### WebLLM — In-Browser Inference

`useWebLLM.js` hook loads `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` via `@mlc-ai/web-llm` using WebGPU. It exposes `{ status, progress, isReady, load, chat }`. The `chat()` method streams tokens via an async iterator. Falls back gracefully when WebGPU is unsupported.

### CloudVsLocalPage.jsx — Chat Interface

Receives `webllm` prop from App. Includes `CloudDemoReplay.jsx` for NVIDIA NIM cloud demos and `DemoReplay.jsx` for pre-recorded local demos when backend/WebGPU is unavailable. Also has `LatencyRace.jsx`, `NvidiaCloudCard.jsx`, `BrevDeployCard.jsx`, and `SetupGuide.jsx`.

### EmbeddingsPage.jsx — Meaning Visualization

Uses `MeaningMap.jsx` (D3-based 2D scatter plot of word embeddings) and `WordArithmetic.jsx` (vector arithmetic demos like king - man + woman = queen). Requires embedding data from backend or pre-generated via `scripts/generate_embeddings.py`.

### Backend (main.py — optional FastAPI)

Endpoints: `/api/tokenize` (POST), `/api/embed` (POST), `/api/chat` (POST, SSE streaming), `/api/gpu-info` (GET), `/api/health` (GET). Proxied from Vite dev server via `/api` → `localhost:8000` (configured in `vite.config.js`).

## Competition Context

**Judging criteria (equally weighted, scored 1-10):**
- (a) Technical innovation
- (b) Effective use of NVIDIA/partner technology (Ollama, HuggingFace)
- (c) Potential impact on developers/end users
- (d) Quality of documentation and presentation

**Key judges:**
- Nader Khalil — Co-founder Brev.dev (acquired by NVIDIA). Cares about one-click deployment.
- Sabrina Koumoin — NVIDIA engineer, self-taught coder from Ivory Coast. Cares about accessible education.
- Bryan Catanzaro — VP Applied Deep Learning Research at NVIDIA. Wants technical substance.
- Carter Abdallah — NVIDIA Developer Relations.

**Primary audience:** University CS students (intro AI/NLP courses). Secondary: high school teachers, self-taught devs, curious people.

## Design System

```
Colors:
  --bg-deep:           #0a0a0b       (page background)
  --bg-surface:        #141416       (cards, inputs)
  --bg-elevated:       #1c1c20       (elevated panels)
  --nvidia-green:      #76B900       (primary accent)
  --nvidia-green-dim:  rgba(118,185,0,0.15)
  --text-primary:      #e8e8ed
  --text-secondary:    #8a8a96
  --text-dim:          #55555f
  --border:            #2a2a30

Fonts:
  Body:  'Outfit' (300-700)
  Mono:  'IBM Plex Mono' (400-600) — used inside inputs

Token colors (12-color palette, cycled by token index):
  Defined in globals.css as --token-0 through --token-11
```

## Key Constraints

- **Judges have 60 seconds.** First interaction must produce an "aha" within 10 seconds.
- **Must work without backend.** The tokenizer page is fully client-side via js-tiktoken.
- **No flashing on re-render.** Token overlays must be stable during typing. Only genuinely new tokens should animate. This is a hard requirement.
- **Inline styles preferred.** Components are self-contained — each owns its styles and logic. No CSS modules.
- **No TypeScript.** Time constraint.
- **Framer Motion for all animations.** AnimatePresence for enter/exit, layout animations.

## Architecture Decisions

- **js-tiktoken client-side:** Phases 1-2 need zero backend. Judges open the site and interact immediately.
- **Single-page progressive reveal:** Type → discover → go deeper. No menu navigation.
- **Live tokenization (no "normal text" state):** The user never sees plain text. From the first keystroke, they see the AI's view. This is the core insight made visceral.
- **cl100k_base encoding:** GPT-4's actual tokenizer. Using the real thing matters for credibility.
- **Overlay pattern over contentEditable:** The textarea + colored div overlay avoids the cursor/selection bugs of contentEditable while still allowing colored token display.
