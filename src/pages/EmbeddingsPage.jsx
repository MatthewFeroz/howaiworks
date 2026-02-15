import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MeaningMap from '../components/MeaningMap'
import WordArithmetic from '../components/WordArithmetic'
import DepthPanel, { PythonCode } from '../components/DepthPanel'
import Footer from '../components/Footer'
import { markLessonComplete } from '../components/Navbar'
import embeddingData from '../data/embeddingMap.json'

export default function EmbeddingsPage() {
  const [selectedWord, setSelectedWord] = useState(null)
  const [neighborLines, setNeighborLines] = useState([])
  const [liveWord, setLiveWord] = useState(null)
  const [wordInput, setWordInput] = useState('')
  const [ollamaAvailable, setOllamaAvailable] = useState(false)
  const [allExperimentsExplored, setAllExperimentsExplored] = useState(false)
  const [arithmeticDisplay, setArithmeticDisplay] = useState(null)
  const [mapPhase, setMapPhase] = useState('scrambled')
  const [isAutoTyping, setIsAutoTyping] = useState(true)
  const [autoTypeIndex, setAutoTypeIndex] = useState(0)
  const [demoPhraseIdx, setDemoPhraseIdx] = useState(0)
  const inputRef = useRef(null)

  const demoPhrases = ['python', 'butterfly', 'fear', 'ocean', 'queen', 'GPU', 'chocolate', 'Tokyo', 'pride', 'algorithm']

  // Auto-type demo words and highlight them on the map
  useEffect(() => {
    if (!isAutoTyping) return

    const currentPhrase = demoPhrases[demoPhraseIdx]
    if (autoTypeIndex < currentPhrase.length) {
      const timer = setTimeout(() => {
        const newText = currentPhrase.slice(0, autoTypeIndex + 1)
        setWordInput(newText)
        setAutoTypeIndex(autoTypeIndex + 1)
      }, 70)
      return () => clearTimeout(timer)
    } else {
      // Finished typing — highlight the word on the map, then pause before next
      const match = embeddingData.words.find(w => w.word.toLowerCase() === currentPhrase.toLowerCase())
      if (match && selectedWord !== match.word) {
        handleWordClick(match.word)
      }
      const timer = setTimeout(() => {
        setAutoTypeIndex(0)
        setDemoPhraseIdx((demoPhraseIdx + 1) % demoPhrases.length)
        setWordInput('')
        setSelectedWord(null)
        setNeighborLines([])
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAutoTyping, autoTypeIndex, demoPhraseIdx])

  // Check Ollama availability
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setOllamaAvailable(data.ollama === true))
      .catch(() => setOllamaAvailable(false))
  }, [])

  // Handle clicking a word on the map — show 3 nearest neighbors
  const handleWordClick = useCallback((word) => {
    if (selectedWord === word) {
      setSelectedWord(null)
      setNeighborLines([])
      return
    }

    setSelectedWord(word)
    const target = embeddingData.words.find(w => w.word === word)
    if (!target) return

    // Find 3 nearest neighbors
    const distances = embeddingData.words
      .filter(w => w.word !== word)
      .map(w => ({
        word: w.word,
        dist: Math.sqrt((w.x - target.x) ** 2 + (w.y - target.y) ** 2),
        x: w.x,
        y: w.y,
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)

    setNeighborLines(distances.map(d => ({
      x1: target.x,
      y1: target.y,
      x2: d.x,
      y2: d.y,
      target: d.word,
    })))
  }, [selectedWord])

  // Handle word arithmetic visualization
  const handleShowArithmetic = useCallback((data) => {
    setArithmeticDisplay(data)
    setSelectedWord(null)

    // Show lines from operands to result
    if (data.result && data.a && data.c) {
      setNeighborLines([
        { x1: data.a.x, y1: data.a.y, x2: data.result.x, y2: data.result.y, target: data.result.word },
        { x1: data.c.x, y1: data.c.y, x2: data.result.x, y2: data.result.y, target: data.result.word },
      ])
      setLiveWord({ word: data.result.word, x: data.result.x, y: data.result.y })

      // Clear after viewing
      setTimeout(() => {
        setLiveWord(null)
      }, 5000)
    }
  }, [])

  // Handle live word embedding (when Ollama available)
  const handleEmbedWord = useCallback(async () => {
    if (!wordInput.trim()) return
    if (!ollamaAvailable) return

    try {
      const res = await fetch('/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [wordInput.trim()] }),
      })
      const data = await res.json()
      if (data.embeddings?.length > 0 && embeddingData.pca.mean.length > 0) {
        const embedding = data.embeddings[0]
        const mean = embeddingData.pca.mean
        const pc1 = embeddingData.pca.pc1
        const pc2 = embeddingData.pca.pc2

        // Project to 2D: subtract mean, dot with pc1 and pc2
        let x = 0, y = 0
        for (let i = 0; i < embedding.length && i < mean.length; i++) {
          const centered = embedding[i] - mean[i]
          x += centered * pc1[i]
          y += centered * pc2[i]
        }

        // Normalize
        x = x / (embeddingData.pca.xScale || 1)
        y = y / (embeddingData.pca.yScale || 1)

        // Clamp to [-1, 1]
        x = Math.max(-1, Math.min(1, x))
        y = Math.max(-1, Math.min(1, y))

        setLiveWord({ word: wordInput.trim(), x, y })

        // Find nearest neighbors
        const distances = embeddingData.words
          .map(w => ({
            word: w.word,
            dist: Math.sqrt((w.x - x) ** 2 + (w.y - y) ** 2),
            x: w.x,
            y: w.y,
          }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 3)

        setNeighborLines(distances.map(d => ({
          x1: x,
          y1: y,
          x2: d.x,
          y2: d.y,
          target: d.word,
        })))

        setWordInput('')
      }
    } catch (err) {
      console.error('Embed error:', err)
    }
  }, [wordInput, ollamaAvailable])

  // Handle finding the closest pre-computed word (fallback without Ollama)
  const handleFallbackWord = useCallback(() => {
    if (!wordInput.trim()) return

    // Check if word exists in pre-computed data
    const word = wordInput.trim().toLowerCase()
    const match = embeddingData.words.find(w => w.word.toLowerCase() === word)
    if (match) {
      handleWordClick(match.word)
      setWordInput('')
    }
  }, [wordInput, handleWordClick])

  const handleInputSubmit = (e) => {
    e.preventDefault()
    if (isAutoTyping) {
      setIsAutoTyping(false)
    }
    if (ollamaAvailable) {
      handleEmbedWord()
    } else {
      handleFallbackWord()
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '48px 0 32px' }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 38px)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}>
          AI doesn't just see numbers.{' '}
          <span style={{ color: 'var(--nvidia-green)' }}>It understands meaning.</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          AI organized these words by meaning — no one told it which words are related.
        </p>
      </motion.div>

      {/* Meaning Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <MeaningMap
          words={embeddingData.words}
          onWordClick={handleWordClick}
          selectedWord={selectedWord}
          neighborLines={neighborLines}
          liveWord={liveWord}
          onPhaseChange={setMapPhase}
        />
      </motion.div>

      {/* Word input bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        style={{ marginTop: 16, marginBottom: 8 }}
      >
        <form onSubmit={handleInputSubmit} style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="text"
            value={wordInput}
            onChange={(e) => {
              if (isAutoTyping) {
                setIsAutoTyping(false)
                setSelectedWord(null)
                setNeighborLines([])
              }
              setWordInput(e.target.value)
            }}
            placeholder="Type or click a word from the map to highlight it..."
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 15,
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              if (isAutoTyping) {
                setIsAutoTyping(false)
                setWordInput('')
                setSelectedWord(null)
                setNeighborLines([])
              }
              e.target.style.borderColor = 'var(--nvidia-green)'
              e.target.style.boxShadow = '0 0 0 3px var(--nvidia-green-dim)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)'
              e.target.style.boxShadow = 'none'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              background: 'var(--nvidia-green)',
              color: '#0a0a0b',
              border: 'none',
              borderRadius: 10,
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(118, 185, 0, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Find
          </button>
        </form>
      </motion.div>

      {/* What is an embedding / vector explainer card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          marginTop: 12,
          marginBottom: 8,
        }}
      >
        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          What is an embedding?
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          An embedding is a way of turning a word into a list of numbers that captures its{' '}
          <span style={{ color: 'var(--text-primary)' }}>meaning</span>. The model learns these numbers
          during training so that words with similar meanings end up with similar numbers. Every dot on the
          map above is one word, placed according to its embedding.
        </p>

        <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          What is a vector?
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          A vector is just a list of numbers — like coordinates, but in many dimensions. Each word's
          embedding is a vector with{' '}
          <span style={{ color: 'var(--text-primary)' }}>768 numbers</span>. We can't visualize 768
          dimensions, so the map above compresses them down to 2. Even in this simplified view, you can
          see that related words cluster together — animals near animals, emotions near emotions.
        </p>
      </motion.div>

      {/* Spacer */}
      <div style={{ height: 32 }} />

      {/* Word Arithmetic Nudges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        <WordArithmetic
          embeddingData={embeddingData}
          onShowArithmetic={handleShowArithmetic}
          onAllExplored={() => setAllExperimentsExplored(true)}
        />
      </motion.div>

      {/* DepthPanel — always visible */}
      <DepthPanel
        visible={true}
        delay={0.5}
        onOpen={() => { setHasViewedDepth(true); markLessonComplete('lesson-complete-understand') }}
        sections={[
          {
            label: 'The Concept',
            color: 'var(--nvidia-green)',
            defaultOpen: true,
            content: (
              <div>
                <p style={{ marginBottom: 20 }}>
                  The scatter plot above projects 768 dimensions down to just 2 using{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>PCA (Principal Component Analysis)</strong>.
                  Even in this crude 2D view, you can see clusters of meaning: animals together, emotions together,
                  places together. In the full 768-dimensional space, these relationships are far richer.
                </p>

                <p style={{ marginBottom: 16 }}>
                  <strong style={{ color: 'var(--nvidia-green)', fontSize: 15 }}>Why 768 numbers?</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  Each dimension captures some aspect of meaning. No single dimension means "is an animal" or
                  "is a color" — instead, meaning is distributed across all dimensions. This is why we call them{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>distributed representations.</strong>
                </p>

                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(118,185,0,0.06)',
                  border: '1px solid rgba(118,185,0,0.25)',
                  borderRadius: 8,
                  marginBottom: 20,
                }}>
                  <strong style={{ color: 'var(--nvidia-green)' }}>Cosine similarity</strong>
                  <div style={{ marginTop: 4, fontSize: 13 }}>
                    We measure how similar two embeddings are using cosine similarity — the angle between two vectors.
                    cos(0°) = 1.0 means identical direction (identical meaning). cos(90°) = 0 means unrelated.
                    "cat" and "kitten" might have cosine similarity of 0.92. "cat" and "javascript" might be 0.15.
                  </div>
                </div>

                <p style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(118,185,0,0.06)', borderRadius: 8, borderLeft: '3px solid var(--nvidia-green)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Key insight:</strong>{' '}
                  Embeddings are the bridge between human language and machine computation. The tokenizer
                  converts words to IDs (Page 1). The embedding layer converts those IDs into rich meaning
                  vectors. Everything the AI "understands" lives in this geometric space.
                </p>
              </div>
            ),
          },
          {
            label: 'The Code',
            color: '#6ec0e8',
            content: (
              <PythonCode code={`import ollama

# Get embeddings from nomic-embed-text (768 dimensions)
response = ollama.embed(
    model="nomic-embed-text",
    input=["cat", "kitten", "javascript"]
)

cat_vec = response["embeddings"][0]      # 768 numbers
kitten_vec = response["embeddings"][1]
js_vec = response["embeddings"][2]

print(f"Dimensions: {len(cat_vec)}")  # 768

# ── Cosine similarity ─────────────────────────────
import numpy as np

def cosine_sim(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

print(f"cat ↔ kitten:     {cosine_sim(cat_vec, kitten_vec):.3f}")  # ~0.92
print(f"cat ↔ javascript: {cosine_sim(cat_vec, js_vec):.3f}")      # ~0.15

# ── Word arithmetic ───────────────────────────────
king = ollama.embed(model="nomic-embed-text", input=["king"])["embeddings"][0]
man  = ollama.embed(model="nomic-embed-text", input=["man"])["embeddings"][0]
woman = ollama.embed(model="nomic-embed-text", input=["woman"])["embeddings"][0]

result = np.array(king) - np.array(man) + np.array(woman)
# Find nearest word → "queen"`} />
            ),
          },
          {
            label: 'Challenge',
            color: '#e8d06e',
            content: (
              <div>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Think about it:</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  Why might "doctor" be closer to "man" than "woman" in some embedding spaces?
                  What does this tell us about training data?
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>1.</strong> Click on "doctor" and "nurse" on the map above.
                  Look at their nearest neighbors. Do you notice a gender pattern?
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>2.</strong> If embeddings learn from text data, and the
                  training text has biases (e.g., "the doctor... he" vs "the nurse... she"), where do those biases end up?
                </p>
                <p style={{ paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>3.</strong> How might you de-bias embeddings? Can you remove
                  the "gender direction" without losing other useful information?
                </p>
              </div>
            ),
          },
          {
            label: 'Real World',
            color: '#e87a96',
            content: (
              <div>
                <p style={{ marginBottom: 14 }}>
                  Embeddings power most of the AI features you use daily — often invisibly.
                </p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #6ec0e8' }}>
                    <strong style={{ color: '#6ec0e8' }}>Search engines</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Google embeds your query and compares it to embedded documents. Searching "how to fix a flat tire"
                      finds pages about "changing a punctured tire" — different words, same meaning-space neighborhood.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #e8d06e' }}>
                    <strong style={{ color: '#e8d06e' }}>RAG (Retrieval-Augmented Generation)</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      When ChatGPT searches the web or reads documents to answer you, it's using embeddings to find
                      the most relevant chunks of text. This is how AI "knows" about your company's internal docs.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #e87a96' }}>
                    <strong style={{ color: '#e87a96' }}>Recommendation systems</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Netflix, Spotify, and YouTube embed content and users in the same space. If your "user vector"
                      is near a movie's embedding, you'll probably like it. Same math, different domain.
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* CTA to Page 3 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ padding: '32px 0 16px', textAlign: 'center' }}
      >
        <Link
          to="/run"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 28px',
            background: 'var(--nvidia-green)',
            color: '#0a0a0b',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            borderRadius: 10,
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 20px rgba(118, 185, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 30px rgba(118, 185, 0, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(118, 185, 0, 0.3)'
          }}
        >
          See where AI runs
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </motion.div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '24px 0 40px',
      }} />

      <Footer />
    </div>
  )
}
