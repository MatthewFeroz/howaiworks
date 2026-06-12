# howaiworks.io

*Learn how AI works — interactively, in your browser*

### What Does AI Actually See?

An open-source, interactive learning platform where you discover how AI really works — by typing your own words and watching what happens. No videos, no lectures — type and discover.

> *"Most people use AI every day — almost nobody knows what's actually happening inside."*

howaiworks.io is the open-source fix for that.

---

## The Problem

Every AI education tool today is passive — videos, slides, static animations. Students watch *about* AI but never interact *with* it. Meanwhile, millions of people use ChatGPT daily without understanding what's actually happening underneath.

## The Lessons

**What is AI? — Four eras in four minutes** (`/what-is-ai`)
An animated tour from Turing's 1950 question to today's generative models — symbolic rules, machine learning, deep learning, and transformers, with the landmark paper from each era.

**Tokenize — "Your words aren't words"** (`/tokenize`)
Type anything. Watch it shatter into tokens in real-time. Try "strawberry." Try your name. Try Arabic. Discover that AI never sees your words — only fragments mapped to numbers. Uses GPT-4's actual tokenizer (cl100k_base) running entirely in your browser.

**Understand — "The Map of Meaning"** (`/understand`)
Explore a 2D map where words are plotted by their meaning. "Love" and "hate" are neighbors. "Paris" clusters with "Tokyo." Try vector arithmetic: king - man + woman = queen. See how AI represents meaning as geometry.

**Attention — "How AI knows what 'it' means"** (`/attention`)
In "The animal didn't cross the street because it was tired," what does "it" refer to? Watch self-attention figure it out, then go deeper into heads, layers, and the transformer architecture.

**Run — "See AI Think"** (`/run`)
Chat with an AI model running directly in your browser via WebGPU — no server needed. Race cloud vs. local inference side-by-side. See latency, watch tokens stream, understand the tradeoffs.

---

## Quick Start

### Frontend only (core lessons work fully client-side)

```bash
git clone https://github.com/MatthewFeroz/howaiworks.git
cd howaiworks
bun install
bun run dev
```

Open http://localhost:3000 and start typing.

### With backend (enables embeddings API and Ollama chat)

```bash
# Terminal 1 — Frontend
bun install
bun run dev

# Terminal 2 — Backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 3 — Ollama (optional, for local embeddings/chat)
ollama serve
ollama pull nomic-embed-text
```

### Docker (full stack, one command)

```bash
docker compose up
```

Starts frontend (:3000), backend (:8000), and Ollama (:11434) with GPU passthrough.

---

## Architecture

**React 19 + Vite 6 single-page app with per-route static prerendering for SEO.** Client-side tokenization via js-tiktoken means zero backend required for the core experience. Backend is optional for embeddings and chat.

### Routes

| Path | Page | Backend Required |
|------|------|-----------------|
| `/` | Home — landing page | No |
| `/what-is-ai` | Four-era animated AI history | No |
| `/tokenize` | Tokenizer — the hero experience | No |
| `/understand` | Embeddings — MeaningMap + WordArithmetic | Pre-generated data included; API optional |
| `/attention` | Self-attention, interactively | No |
| `/run` | Cloud vs. local inference race | Optional (WebLLM works in-browser) |
| `/about` | About the project | No |
| `/resources` | Learning resources | No |

### Key Technical Decisions

- **js-tiktoken client-side:** GPT-4's actual tokenizer (cl100k_base, ~3MB) loads once and runs synchronously. No API calls for tokenization.
- **Overlay pattern:** A transparent `<textarea>` sits over a colored `<div>`. Users type in what feels like a normal input but see colored tokens. Avoids contentEditable cursor/selection bugs.
- **WebLLM for in-browser inference:** Loads `Qwen2.5-0.5B-Instruct` via WebGPU. Falls back to a simulated replay when WebGPU is unavailable.
- **Simulated cloud lane:** The /run race replays typical data-center timing (longer time-to-first-token, faster streaming) so the latency lesson works with zero setup or API keys.
- **Prerendered SEO:** `scripts/prerender.mjs` runs after each build and emits per-route static HTML with unique meta tags, JSON-LD, and crawlable lesson prose, plus `sitemap.xml`.

### Backend (main.py — FastAPI)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tokenize` | POST | Server-side tokenization |
| `/api/embed` | POST | Embeddings via Ollama |
| `/api/chat` | POST | Streaming chat via Ollama (SSE) |
| `/api/health` | GET | Server + Ollama health check |

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite 6 |
| Tokenizer | js-tiktoken (client-side BPE, cl100k_base) |
| In-browser LLM | @mlc-ai/web-llm (WebGPU) |
| Animations | Framer Motion 12 |
| Visualizations | D3.js 7 |
| Backend | FastAPI (Python) |
| Local inference | Ollama |
| Embeddings | nomic-embed-text via Ollama |
| Fonts | Poppins (body), IBM Plex Mono (code) |

---

## Deployment

| Platform | What it runs | Config |
|----------|-------------|--------|
| Vercel | Frontend (static SPA + prerendered routes) | `vercel.json` |
| Railway | Backend (FastAPI) | `railway.json` |
| Docker Compose | Full stack (frontend + backend + Ollama) | `docker-compose.yml` |

---

## For Teachers

1. Deploy howaiworks.io on any machine (a laptop or the cloud) — or just use the live site
2. Students connect via browser — no installs needed
3. The core lessons run entirely client-side, no GPU required
4. Each lesson takes ~5 minutes and teaches tokenization, embeddings, attention, and inference
5. One deployment, 30 student browsers, a classroom that actually understands AI

---

## Built With

- [js-tiktoken](https://github.com/dqbd/tiktoken) — Client-side BPE tokenization (GPT-4's actual tokenizer)
- [WebLLM](https://github.com/mlc-ai/web-llm) — In-browser LLM inference via WebGPU
- [Ollama](https://ollama.com) — Local model inference
- [D3.js](https://d3js.org) — Embedding visualizations
- [Framer Motion](https://www.framer.com/motion/) — Animations

---

## License

MIT — use it, fork it, teach with it.

---

**howaiworks.io** by [Matt Feroz](https://matthewferoz.com)
