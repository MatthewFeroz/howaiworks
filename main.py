"""
howaiworks.io Backend
FastAPI server providing tokenization, embeddings, and Ollama chat.

The frontend uses js-tiktoken client-side, so this backend is optional for
basic tokenization. It provides accurate tiktoken results and powers
local inference (chat + embeddings) via Ollama on the /run page.

Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import tiktoken
import json
import httpx

app = FastAPI(title="howaiworks.io API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://howaiworks.vercel.app",  # Your Vercel domain
        "http://localhost:3000",          # Local development
        "http://localhost:5173",          # Vite default port
        "*"                               # Allow all (less secure but easier for testing)
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Load tokenizer once at startup
encoder = tiktoken.get_encoding("cl100k_base")

OLLAMA_BASE = "http://localhost:11434"


class TokenizeRequest(BaseModel):
    text: str


class EmbedRequest(BaseModel):
    texts: list[str]
    model: str = "nomic-embed-text"


class ChatRequest(BaseModel):
    messages: list[dict]
    model: str = "qwen2.5:0.5b"


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


# ── CHAT (streaming via Ollama) ──

@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Stream chat responses from Ollama as SSE."""

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream(
                    "POST",
                    f"{OLLAMA_BASE}/api/chat",
                    json={
                        "model": req.model,
                        "messages": req.messages,
                        "stream": True,
                    },
                ) as response:
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line)
                            token = data.get("message", {}).get("content", "")
                            if token:
                                yield f"data: {json.dumps({'token': token})}\n\n"
                            if data.get("done"):
                                yield "data: [DONE]\n\n"
                                break
                        except json.JSONDecodeError:
                            continue
        except httpx.ConnectError:
            yield f"data: {json.dumps({'error': 'Ollama not running'})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


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
