# ⚡ howaiworks.io

*Open source education on how AI works (NVIDIA GTC 2026 submission)*

### What Does AI Actually See?

An open-source, interactive lesson where students discover how AI really works — by typing their own words and watching what happens.

> *"What's the hardest part about ensuring AI literacy for future generations? Are tools like DGX Spark going to be available for schools or is this more of a software education not keeping up issue?"*
> — Matt Feroz, [NVIDIA Developer Livestream](https://www.youtube.com/watch?v=nRo-tQC-mEY) (04:12)

NVIDIA said DGX Spark would democratize AI education. **howaiworks.io is the open-source software that makes that promise real.**

---

## 🎯 The Problem

Every AI education tool today is passive — videos, slides, static animations. Students watch *about* AI but never interact *with* it. Meanwhile, millions of people use ChatGPT daily without understanding what's actually happening underneath.

## 💡 The Solution

howaiworks.io is a single interactive lesson with three progressive reveals:

**Phase 1 — "Your words aren't words"**
Type anything. Watch it shatter into tokens. Try your name. Try "strawberry." Discover that AI never sees your words — only fragments.

**Phase 2 — "It's all just numbers"**
Toggle to reveal the numeric IDs underneath each token. See the "human view" vs "AI view" of the same text. Realize the model only ever receives a sequence of integers.

**Phase 3 — "The Map of Meaning"**
Explore a 2D map where words are plotted by their meaning. "Love" and "hate" are neighbors. "Paris" clusters with "Tokyo." Type new words and watch them appear on the map. *(Powered by Ollama on NVIDIA GPU)*

No videos. No lectures. **Type and discover.**

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/howaiworks-io.git
cd howaiworks-io

# Frontend
npm install
npm run dev

# Backend (new terminal)
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Optional: Start Ollama for Phase 3
ollama serve
ollama pull nomic-embed-text


Open http://localhost:3000 and start typing.

### Docker (one command)

```bash
docker compose up
```

---

## 🏫 For Teachers

One DGX Spark. 30 student browsers. A classroom that actually understands AI.

1. Deploy howaiworks.io on any machine with a GPU (DGX Spark, laptop with RTX, or cloud)
2. Students connect via browser — no installs needed
3. The lesson takes ~5 minutes and teaches tokenization, encoding, and embeddings
4. Works without a GPU too (Phase 1 & 2 run entirely client-side)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React + Vite |
| Tokenizer | js-tiktoken (client-side BPE) |
| Animations | Framer Motion |
| Visualizations | D3.js |
| Backend | FastAPI (Python) |
| Embeddings | Ollama + nomic-embed-text |
| GPU Detection | nvidia-smi / pynvml |

---

## 🏗️ Built With

- [Ollama](https://ollama.com) — Local model inference
- [NVIDIA CUDA](https://developer.nvidia.com/cuda-toolkit) — GPU acceleration
- [js-tiktoken](https://github.com/dqbd/tiktoken) — Client-side BPE tokenization
- Designed for [NVIDIA DGX Spark](https://www.nvidia.com/en-us/products/workstations/dgx-spark/)

---

## 📄 License

MIT — use it, fork it, teach with it.

---

**howaiworks.io** by [Matthew Feroz](https://github.com/YOUR_USERNAME)
