# howaiworks.io

*Interactive AI education for the NVIDIA GTC 2026 Golden Ticket Competition*

### What Does AI Actually See?

An open-source, interactive lesson where students discover how AI really works — by typing their own words and watching what happens. No videos, no lectures — type and discover.

> *"What's the hardest part about ensuring AI literacy for future generations? Are tools like DGX Spark going to be available for schools or is this more of a software education not keeping up issue?"*
> — Matt Feroz, [NVIDIA Developer Livestream](https://www.youtube.com/watch?v=nRo-tQC-mEY) (04:12)

NVIDIA said DGX Spark would democratize AI hardware. **howaiworks.io is the open-source software side of that equation.**

---

## The Problem

Every AI education tool today is passive — videos, slides, static animations. Students watch *about* AI but never interact *with* it. Meanwhile, millions of people use ChatGPT daily without understanding what's actually happening underneath.

## The Solution

howaiworks.io is an interactive lesson with three progressive stages:

**Stage 1 — Tokenize: "Your words aren't words"** (`/tokenize`)
Type anything. Watch it shatter into tokens in real-time. Try "strawberry." Try your name. Try Arabic. Discover that AI never sees your words — only fragments mapped to numbers. Uses GPT-4's actual tokenizer (cl100k_base) running entirely in your browser.

**Stage 2 — Understand: "The Map of Meaning"** (`/understand`)
Explore a 2D map where words are plotted by their meaning. "Love" and "hate" are neighbors. "Paris" clusters with "Tokyo." Try vector arithmetic: king - man + woman = queen. See how AI represents meaning as geometry.

**Stage 3 — Run: "See AI Think"** (`/run`)
Chat with an AI model running directly in your browser via WebGPU — no server needed. Compare cloud inference (NVIDIA NIM) vs. local inference side-by-side. See latency, watch tokens stream, understand the tradeoffs.

---

## Quick Start

### Frontend only (Stages 1-2 work fully client-side)

```bash
git clone https://github.com/mattferoz/howaiworks.git
cd howaiworks
npm install
npm run dev
```

Open http://localhost:3000 and start typing.

### With backend (enables embeddings API and Ollama chat)

```bash
# Terminal 1 — Frontend
npm install
npm run dev

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

### Environment Variables

Copy `.env.example` and add your NVIDIA NIM API key for cloud inference on the `/run` page:

```
NVIDIA_NIM_KEY=nvapi-xxx
```

Get a free key (10K requests) at https://build.nvidia.com.

---

## Architecture

**React 19 + Vite 6 single-page app.** Client-side tokenization via js-tiktoken means zero backend required for the core experience. Backend is optional for embeddings and chat.

### Routes

| Path | Page | Backend Required |
|------|------|-----------------|
| `/` | Home — landing page | No |
| `/tokenize` | Tokenizer — the hero experience | No |
| `/understand` | Embeddings — MeaningMap + WordArithmetic | Pre-generated data included; API optional |
| `/run` | Chat — cloud vs. local inference | Optional (WebLLM works in-browser) |
| `/about` | About the project | No |
| `/resources` | Learning resources | No |

### Key Technical Decisions

- **js-tiktoken client-side:** GPT-4's actual tokenizer (cl100k_base, ~3MB) loads once and runs synchronously. No API calls for tokenization.
- **Overlay pattern:** A transparent `<textarea>` sits over a colored `<div>`. Users type in what feels like a normal input but see colored tokens. Avoids contentEditable cursor/selection bugs.
- **WebLLM for in-browser inference:** Loads `Qwen2.5-0.5B-Instruct` via WebGPU. Falls back to demo replay when WebGPU is unavailable.
- **Progressive reveal:** The tokenizer page uses a state machine — type, discover nudges, explore all three, unlock the next stage. Designed for a 60-second judge experience.

### Backend (main.py — FastAPI)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tokenize` | POST | Server-side tokenization |
| `/api/embed` | POST | Embeddings via Ollama |
| `/api/chat` | POST | Streaming chat via Ollama (SSE) |
| `/api/cloud-chat` | POST | Proxy to NVIDIA NIM API (SSE) |
| `/api/cloud-health` | POST | Cloud endpoint health check |
| `/api/cloud-status` | GET | Check if NIM key is configured |
| `/api/gpu-info` | GET | NVIDIA GPU detection via nvidia-smi |
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
| Cloud inference | NVIDIA NIM API |
| Local inference | Ollama |
| Embeddings | nomic-embed-text via Ollama |
| Fonts | Outfit (body), IBM Plex Mono (code) |

---

## Deployment

| Platform | What it runs | Config |
|----------|-------------|--------|
| Vercel | Frontend (static SPA) | `vercel.json` |
| Railway | Backend (FastAPI) | `railway.json` |
| Docker Compose | Full stack (frontend + backend + Ollama) | `docker-compose.yml` |

---

## For Teachers

1. Deploy howaiworks.io on any machine (DGX Spark, laptop with RTX, or cloud)
2. Students connect via browser — no installs needed
3. Stages 1-2 run entirely client-side, no GPU required
4. The lesson takes ~5 minutes and teaches tokenization, encoding, embeddings, and inference
5. One DGX Spark, 30 student browsers, a classroom that actually understands AI

---

## Built With

- [js-tiktoken](https://github.com/dqbd/tiktoken) — Client-side BPE tokenization (GPT-4's actual tokenizer)
- [WebLLM](https://github.com/mlc-ai/web-llm) — In-browser LLM inference via WebGPU
- [NVIDIA NIM](https://build.nvidia.com) — Cloud inference APIs
- [Ollama](https://ollama.com) — Local model inference
- [D3.js](https://d3js.org) — Embedding visualizations
- [Framer Motion](https://www.framer.com/motion/) — Animations
- Designed for [NVIDIA DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)

---

## License

MIT — use it, fork it, teach with it.

---

**howaiworks.io** by Matt Feroz
