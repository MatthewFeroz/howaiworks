"""
howaiworks.io Backend
FastAPI server providing tokenization, embeddings, and GPU info.

For Phase 1+2: The frontend uses js-tiktoken client-side, so this backend
is optional for basic tokenization. But it provides accurate tiktoken
results and will be essential for Phase 3 (embeddings via Ollama).

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tiktoken
import subprocess
import json
import httpx

app = FastAPI(title="howaiworks.io API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load tokenizer once at startup
encoder = tiktoken.get_encoding("cl100k_base")

OLLAMA_BASE = "http://localhost:11434"


class TokenizeRequest(BaseModel):
    text: str


class EmbedRequest(BaseModel):
    texts: list[str]
    model: str = "nomic-embed-text"


# ── TOKENIZATION ──

@app.post("/api/tokenize")
async def tokenize(req: TokenizeRequest):
    """Tokenize text and return tokens with IDs and text representations."""
    if not req.text:
        return {"tokens": []}

    ids = encoder.encode(req.text)

    tokens = []
    for token_id in ids:
        decoded = encoder.decode([token_id])
        display = ("⎵" + decoded[1:]) if decoded.startswith(" ") else decoded
        tokens.append({
            "id": token_id,
            "text": decoded,
            "display": display,
        })

    return {
        "tokens": tokens,
        "total": len(tokens),
        "characters": len(req.text),
    }


# ── EMBEDDINGS (Phase 3 — requires Ollama) ──

@app.post("/api/embed")
async def embed(req: EmbedRequest):
    """Get embeddings for a list of texts via Ollama."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_BASE}/api/embed",
                json={
                    "model": req.model,
                    "input": req.texts,
                },
            )
            response.raise_for_status()
            data = response.json()
            return {
                "embeddings": data.get("embeddings", []),
                "model": req.model,
            }
    except httpx.ConnectError:
        return {
            "error": "Ollama not running. Start with: ollama serve",
            "embeddings": [],
        }
    except Exception as e:
        return {"error": str(e), "embeddings": []}


# ── GPU INFO ──

@app.get("/api/gpu-info")
async def gpu_info():
    """Detect NVIDIA GPU via nvidia-smi."""
    try:
        result = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,memory.total,driver_version",
             "--format=csv,noheader,nounits"],
            capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            parts = result.stdout.strip().split(", ")
            return {
                "available": True,
                "name": parts[0] if len(parts) > 0 else "Unknown",
                "memory_mb": int(parts[1]) if len(parts) > 1 else 0,
                "driver": parts[2] if len(parts) > 2 else "Unknown",
            }
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return {"available": False, "name": None, "memory_mb": 0, "driver": None}


# ── HEALTH ──

@app.get("/api/health")
async def health():
    """Health check — also reports Ollama status."""
    ollama_ok = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{OLLAMA_BASE}/api/tags")
            ollama_ok = r.status_code == 200
    except Exception:
        pass

    return {
        "status": "ok",
        "ollama": ollama_ok,
    }
