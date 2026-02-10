# CLAUDE.md — howaiworks.io

## What This Is

howaiworks.io is an interactive AI education tool being submitted to the **NVIDIA GTC 2026 Golden Ticket Competition** (deadline: February 15, 2026). It teaches how AI processes text through three progressive reveals: tokenization → token IDs → embeddings. The student types their own words and watches what happens — no lectures, no videos.

**Submitter:** Matt Feroz (howaiworks.io)
**Narrative hook:** Matt asked on an NVIDIA Developer Livestream (04:12-05:55 in https://www.youtube.com/watch?v=nRo-tQC-mEY): "Is AI literacy a hardware problem or a software education problem?" NVIDIA said DGX Spark solves the hardware side. howaiworks.io is the software side.

## Competition Context

**Judging criteria (equally weighted, scored 1-10):**
- (a) Technical innovation
- (b) Effective use of NVIDIA/partner technology (Ollama, HuggingFace)
- (c) Potential impact on developers/end users
- (d) Quality of documentation and presentation

**Key judges:**
- Nader Khalil — Co-founder Brev.dev (acquired by NVIDIA). Cares about one-click deployment. Make this a Brev Launchable.
- Sabrina Koumoin — NVIDIA engineer, self-taught coder from Ivory Coast, founder Brina's Code. Cares about accessible education.
- Bryan Catanzaro — VP Applied Deep Learning Research at NVIDIA. Wants technical substance.
- Carter Abdallah — NVIDIA Developer Relations.

**Primary audience:** University CS students (intro AI/NLP courses). Secondary: high school teachers, self-taught devs, curious people. Content must be accessible on the surface but have university-level depth in the "Go Deeper" panels.

## Tech Stack

- **Frontend:** React 19 + Vite 6
- **Tokenizer:** js-tiktoken (cl100k_base, GPT-4's tokenizer) — runs client-side, no backend needed for Phase 1-2
- **Animations:** Framer Motion
- **Visualizations:** D3.js (for Phase 3 embedding map)
- **Backend:** FastAPI (Python) — provides tiktoken accuracy + Ollama embedding proxy
- **Embeddings:** Ollama + nomic-embed-text (Phase 3)
- **Deployment:** Docker Compose (frontend + backend + Ollama with GPU passthrough)
- **Design:** Dark theme, NVIDIA green (#76B900) accents, IBM Plex Mono + Outfit fonts

## Project Structure

```
howaiworks-io/
├── CLAUDE.md                      # This file
├── README.md                      # Competition-ready with livestream story
├── LICENSE                        # MIT
├── package.json                   # React, js-tiktoken, framer-motion, d3
├── vite.config.js                 # Vite + proxy to FastAPI backend on :8000
├── index.html                     # Entry point, loads Google Fonts
├── docker-compose.yml             # Full stack: frontend + backend + ollama (GPU)
├── .gitignore
├── src/
│   ├── main.jsx                   # React root
│   ├── App.jsx                    # Orchestrates phases, manages state, progressive reveals
│   ├── hooks/
│   │   └── useTokenizer.js        # js-tiktoken hook — lazy loads encoder, debounced tokenization
│   ├── components/
│   │   ├── Hero.jsx               # Landing section with title + description
│   │   ├── TokenizerPhase.jsx     # Phase 1: input → animated tokens, nudges, insight, DepthPanel
│   │   ├── NumbersPhase.jsx       # Phase 2: token ID toggle, human-vs-AI comparison, DepthPanel
│   │   ├── EmbeddingTeaser.jsx    # Phase 3: placeholder (TODO — build with Ollama)
│   │   ├── TokenBlock.jsx         # Single animated token with color and optional ID
│   │   ├── Nudge.jsx              # Clickable suggestion prompt (e.g. "Try strawberry")
│   │   ├── Insight.jsx            # Educational callout card
│   │   ├── DepthPanel.jsx         # Expandable "Go Deeper" with CS concept, code, challenge, real-world
│   │   └── Footer.jsx             # GPU badge + credits
│   └── styles/
│       └── globals.css            # CSS variables, dark theme, token colors, grid background
└── backend/
    ├── main.py                    # FastAPI: /api/tokenize, /api/embed, /api/gpu-info, /api/health
    └── requirements.txt           # fastapi, uvicorn, tiktoken, httpx
```

## Current Status

### ✅ Done (Phase 1 + 2)
- React + Vite project scaffolded with all dependencies defined
- Client-side tokenization via js-tiktoken (real BPE, cl100k_base encoding)
- Animated token blocks with 12-color palette and staggered entrance
- Guided nudges: strawberry, your name, I love New York City, こんにちは世界, Schwarzenegger, quick brown fox
- Progressive reveal: nudges appear after 1st input, insight after 3rd, depth panel after 4th, Phase 2 after 2nd
- Phase 2: toggle to reveal token IDs, "what you see vs what AI sees" comparison panel
- DepthPanel component with four layers: CS concept, code snippet, challenge, real-world connection
- Phase 1 depth: BPE explanation, tiktoken code, multilingual challenge, tokenization-as-bias-origin
- Phase 2 depth: embedding matrices, parameter math, API cost real-world connection
- Stats bar with token count, char count, chars/token ratio, and estimated API cost
- FastAPI backend with /api/tokenize (tiktoken), /api/embed (Ollama proxy), /api/gpu-info, /api/health
- Docker Compose for full stack deployment with NVIDIA GPU passthrough
- README with livestream story and competition narrative

### 🔨 TODO (Priority Order)

**Phase 3 — Embedding Map (Day 2, ~4 hours):**
- Build EmbeddingMap component replacing EmbeddingTeaser placeholder
- Pre-compute UMAP projections for ~200 base words across semantic categories (emotions, animals, colors, countries, programming terms, etc.)
- Store pre-computed embeddings in `backend/data/base_embeddings.json`
- D3.js scatter plot: zoom, pan, hover to see word, click to highlight cluster
- Live embedding: user types a word → Ollama generates embedding → projected into existing UMAP space → animates onto the map
- Semantic search demo: "find words closest to X" using cosine similarity
- DepthPanel for Phase 3: cosine similarity, curse of dimensionality, how RAG works, bias in embedding space
- Connect to Ollama via backend `/api/embed` endpoint (already built)
- Model: nomic-embed-text or all-minilm via Ollama on RTX 2060 (6GB VRAM — plenty)
- CPU fallback: if no GPU/Ollama, show only pre-computed map without live embedding

**Visual Polish (Day 3, ~4 hours):**
- Review and tighten animations — make token appearance feel snappy
- Add GPU status indicator in footer (green dot if NVIDIA GPU detected, gray if CPU-only)
- Mobile responsiveness pass
- Add subtle particle or connection-line effects to embedding map
- Screenshot/GIF capture for README and social post
- Ensure the whole experience is smooth end-to-end in 60 seconds (judge attention span)

**Deployment + Documentation (Day 4, ~4 hours):**
- Dockerfile for frontend (multi-stage: npm build → nginx serve)
- Dockerfile for backend
- Test full Docker Compose flow on RTX 2060 laptop
- Brev Launchable configuration (one-click deploy for Nader Khalil)
- Add "For Teachers" section to README with deployment guide
- Add architecture diagram to README
- Add livestream screenshot (timestamp 04:12-05:55)

**Submission (Day 5, ~4 hours):**
- Record 60-second demo video (screen capture + voiceover)
- Write social media post (template exists in planning docs)
- Tag judges: @NaderLikeLadder @Baxate @brinascode @ctnzr
- Final README review
- Submit before February 15 deadline

## Architecture Decisions

- **js-tiktoken client-side over backend-only tokenization:** Phases 1-2 work with zero backend. This means judges can open index.html and immediately interact. Backend is only needed for Phase 3 embeddings.
- **Single-page progressive reveal over multi-page navigation:** Keeps the student in flow. No clicking through menus. Type → discover → go deeper. The experience is a scroll, not a site.
- **DepthPanel as collapsible:** Surface experience works for anyone. CS depth is opt-in. A 12-year-old and a PhD student use the same tool — they just see different layers.
- **Framer Motion over CSS animations:** Gives us AnimatePresence for enter/exit, layout animations, and gesture support. Worth the bundle size for the polish it adds.
- **cl100k_base encoding:** This is GPT-4's actual tokenizer. Using the real thing matters for credibility with judges who know AI.

## Design System

```
Colors:
  --bg-deep:           #0a0a0b      (page background)
  --bg-surface:        #141416      (cards, inputs)
  --bg-elevated:       #1c1c20      (depth panels, elevated surfaces)
  --nvidia-green:      #76B900      (primary accent, all interactive elements)
  --nvidia-green-dim:  rgba(118,185,0,0.15)  (subtle backgrounds)
  --text-primary:      #e8e8ed      (headings, important text)
  --text-secondary:    #8a8a96      (body text, descriptions)
  --text-dim:          #55555f      (tertiary, metadata)
  --border:            #2a2a30      (subtle borders)

Fonts:
  Body:  'Outfit' (weights: 300-700)
  Mono:  'IBM Plex Mono' (weights: 400-600)

Token colors: 12-color palette defined as .token-color-0 through .token-color-11 in globals.css
```

## Commands

```bash
# Development
npm install
npm run dev              # Frontend on :3000

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Ollama (separate terminal, for Phase 3)
ollama serve
ollama pull nomic-embed-text

# Production
docker compose up        # Full stack with GPU
```

## Key Constraints

- **5-day deadline** (Feb 10-15, ~20 hours total). Ship quality over quantity. Phase 1+2 polished beats Phase 1+2+3 rough.
- **Judges have 60 seconds of attention.** The first interaction must produce an aha moment instantly.
- **Must work without backend.** Phase 1+2 must be fully functional client-side. Phase 3 gracefully degrades if Ollama isn't running.
- **RTX 2060 (6GB VRAM)** is the target GPU for development. nomic-embed-text and all-minilm both fit comfortably.
- **No network in CI/build environments.** All npm/pip dependencies are defined but must be installed locally.

## Code Style

- React functional components with hooks
- Inline styles preferred over CSS modules (keeps components self-contained, makes the single-file story cleaner)
- Framer Motion for all animations
- No TypeScript (time constraint — plain JSX)
- Component files are self-contained: each component owns its styles and logic
