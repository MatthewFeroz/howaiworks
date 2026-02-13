"""
generate_embeddings.py — One-time script to produce embeddingMap.json

Requires: pip install httpx numpy
Requires: Ollama running with nomic-embed-text pulled

Usage:
    python scripts/generate_embeddings.py

Output:
    src/data/embeddingMap.json
"""

import json
import httpx
import numpy as np
from pathlib import Path

OLLAMA_BASE = "http://localhost:11434"
MODEL = "nomic-embed-text"
OUTPUT = Path(__file__).parent.parent / "src" / "data" / "embeddingMap.json"

# Words grouped by category — ~200 total
WORD_LISTS = {
    "animal": [
        "cat", "dog", "fish", "bird", "horse", "whale", "elephant", "mouse",
        "lion", "tiger", "bear", "rabbit", "snake", "eagle", "dolphin", "shark",
        "wolf", "deer", "frog", "butterfly", "penguin", "monkey", "kitten", "puppy",
    ],
    "emotion": [
        "happy", "sad", "angry", "love", "fear", "joy", "hope", "grief",
        "pride", "shame", "trust", "envy", "calm", "anxious", "grateful", "lonely",
        "excited", "bored", "confused", "surprised", "jealous", "content",
    ],
    "technology": [
        "computer", "code", "internet", "AI", "GPU", "software", "robot", "data",
        "algorithm", "network", "server", "cloud", "chip", "neural", "digital",
        "python", "javascript", "database", "API", "machine", "processor", "memory",
    ],
    "food": [
        "pizza", "apple", "rice", "bread", "coffee", "chocolate", "pasta", "cheese",
        "banana", "chicken", "salad", "soup", "cake", "sushi", "burger", "tea",
        "orange", "steak", "cookie", "milk", "egg", "tomato",
    ],
    "place": [
        "Paris", "ocean", "mountain", "school", "hospital", "Tokyo", "beach",
        "forest", "city", "village", "desert", "river", "London", "garden",
        "library", "stadium", "airport", "museum", "bridge", "island",
        "New York", "Berlin",
    ],
    "person": [
        "doctor", "teacher", "mother", "king", "artist", "queen", "father",
        "scientist", "engineer", "musician", "chef", "pilot", "nurse", "student",
        "writer", "athlete", "soldier", "farmer", "judge", "poet",
    ],
}

# Pre-defined arithmetic examples
ARITHMETIC = [
    {
        "key": "king_man_woman",
        "positive": ["king", "woman"],
        "negative": ["man"],
        "expected": "queen",
    },
    {
        "key": "paris_france_japan",
        "positive": ["Paris", "Japan"],
        "negative": ["France"],
        "expected": "Tokyo",
    },
]


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Get embeddings from Ollama for a list of texts."""
    resp = httpx.post(
        f"{OLLAMA_BASE}/api/embed",
        json={"model": MODEL, "input": texts},
        timeout=60.0,
    )
    resp.raise_for_status()
    return resp.json()["embeddings"]


def pca_2d(embeddings: np.ndarray):
    """Compute PCA and project to 2D. Returns (positions, mean, pc1, pc2)."""
    mean = embeddings.mean(axis=0)
    centered = embeddings - mean

    # SVD for PCA
    U, S, Vt = np.linalg.svd(centered, full_matrices=False)
    pc1 = Vt[0]
    pc2 = Vt[1]

    # Project
    x = centered @ pc1
    y = centered @ pc2

    # Normalize to roughly [-1, 1] range
    x = x / (np.abs(x).max() + 1e-8)
    y = y / (np.abs(y).max() + 1e-8)

    return x, y, mean, pc1, pc2


def main():
    # Gather all words
    all_words = []
    categories = []
    for cat, words in WORD_LISTS.items():
        for w in words:
            all_words.append(w)
            categories.append(cat)

    print(f"Embedding {len(all_words)} words...")
    embeddings_raw = get_embeddings(all_words)
    embeddings = np.array(embeddings_raw)

    print("Computing PCA...")
    x, y, mean, pc1, pc2 = pca_2d(embeddings)

    # Build word entries
    words = []
    for i, (word, cat) in enumerate(zip(all_words, categories)):
        words.append({
            "word": word,
            "x": round(float(x[i]), 4),
            "y": round(float(y[i]), 4),
            "category": cat,
        })

    # Compute arithmetic results
    word_to_idx = {w: i for i, w in enumerate(all_words)}
    arithmetic = {}
    for arith in ARITHMETIC:
        vec = np.zeros_like(mean)
        for w in arith["positive"]:
            vec += embeddings[word_to_idx[w]]
        for w in arith["negative"]:
            vec -= embeddings[word_to_idx[w]]

        # Project to 2D
        centered = vec - mean
        rx = float(centered @ pc1) / (np.abs(x).max() + 1e-8)
        ry = float(centered @ pc2) / (np.abs(y).max() + 1e-8)

        arithmetic[arith["key"]] = {
            "result": arith["expected"],
            "x": round(rx, 4),
            "y": round(ry, 4),
        }

    # Build output
    output = {
        "words": words,
        "pca": {
            "mean": [round(float(v), 6) for v in mean],
            "pc1": [round(float(v), 6) for v in pc1],
            "pc2": [round(float(v), 6) for v in pc2],
            "xScale": round(float(np.abs(x).max()), 6),
            "yScale": round(float(np.abs(y).max()), 6),
        },
        "arithmetic": arithmetic,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(output, indent=2))
    print(f"Written to {OUTPUT} ({OUTPUT.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
