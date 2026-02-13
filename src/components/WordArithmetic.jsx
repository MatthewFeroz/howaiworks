import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nudge from './Nudge'
import confetti from 'canvas-confetti'

const EXPERIMENTS = [
  {
    key: 'king_woman',
    icon: '👑',
    label: <><Accent>King</Accent> − <Accent>Man</Accent> + <Accent>Woman</Accent> = ?</>,
    a: 'king',
    b: 'man',
    c: 'woman',
    result: 'queen',
    arithmeticKey: 'king_man_woman',
    insight: {
      headline: 'AI learned gender relationships from text alone.',
      body: <>
        No one told the model that king and queen are related. By reading billions of sentences,
        it discovered that the <strong style={{ color: 'var(--text-primary)' }}>vector difference</strong> between
        "king" and "man" is almost identical to the difference between "queen" and "woman."
        The model encodes abstract relationships as directions in meaning-space.
      </>,
      nextHint: 'Try the next one — AI learned geography without ever seeing a map →',
    },
  },
  {
    key: 'paris_japan',
    icon: '🗼',
    label: <><Accent>Paris</Accent> − <Accent>France</Accent> + <Accent>Japan</Accent> = ?</>,
    a: 'Paris',
    b: 'France',
    c: 'Japan',
    result: 'Tokyo',
    arithmeticKey: 'paris_france_japan',
    insight: {
      headline: 'AI learned geography without ever seeing a map.',
      body: <>
        The direction from "France" to "Paris" encodes the concept of <strong style={{ color: 'var(--text-primary)' }}>"capital city of."</strong>{' '}
        Apply that same direction starting from "Japan" and you land near "Tokyo."
        The model built a geometric map of countries and capitals purely from reading text —
        no atlas, no GPS coordinates, no explicit teaching.
      </>,
      nextHint: 'Now try your own equation — discover what other relationships AI has learned →',
    },
  },
  {
    key: 'custom',
    icon: '🧪',
    label: <>Create your own word equation</>,
    isCustom: true,
    insight: {
      headline: 'These relationships emerge automatically from reading billions of sentences.',
      body: <>
        Nobody hand-codes these relationships. During training, the model learns to predict the next word
        in a sentence. To do that well, it <em>must</em> understand that "king" relates to "queen" the
        way "man" relates to "woman." The geometry of meaning-space is a
        <strong style={{ color: 'var(--text-primary)' }}> side effect of learning to predict text.</strong>
      </>,
      nextHint: null,
    },
  },
]

function Accent({ children }) {
  return <em style={{ color: 'var(--nvidia-green)', fontStyle: 'normal', fontWeight: 500 }}>{children}</em>
}

export default function WordArithmetic({ embeddingData, onShowArithmetic, onAllExplored }) {
  const [activeExperiment, setActiveExperiment] = useState(null)
  const [exploredExperiments, setExploredExperiments] = useState(new Set())
  const [customInputs, setCustomInputs] = useState({ a: '', b: '', c: '' })
  const [customResult, setCustomResult] = useState(null)

  const handleExperiment = (key) => {
    if (activeExperiment === key) {
      setActiveExperiment(null)
      return
    }

    setActiveExperiment(key)

    // Show arithmetic on map for pre-defined experiments
    const exp = EXPERIMENTS.find(e => e.key === key)
    if (exp && !exp.isCustom && exp.arithmeticKey) {
      const arithData = embeddingData?.arithmetic?.[exp.arithmeticKey]
      if (arithData) {
        // Find word positions for the animation
        const words = embeddingData.words
        const aWord = words.find(w => w.word === exp.a)
        const bWord = words.find(w => w.word === exp.b)
        const cWord = words.find(w => w.word === exp.c)
        onShowArithmetic?.({
          a: aWord,
          b: bWord,
          c: cWord,
          result: { word: arithData.result, x: arithData.x, y: arithData.y },
        })
      }
    }

    setExploredExperiments(prev => {
      const next = new Set([...prev, key])
      if (next.size === EXPERIMENTS.length && prev.size < EXPERIMENTS.length) {
        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.15, y: 0.6 },
            colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
          })
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.85, y: 0.6 },
            colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
          })
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 100,
              origin: { x: 0.5, y: 0.4 },
              colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
            })
          }, 250)
        }, 400)
        onAllExplored?.()
      }
      return next
    })
  }

  const handleCustomSubmit = () => {
    const { a, b, c } = customInputs
    if (!a || !b || !c) return

    // Find closest match in pre-computed data using simple string matching
    const words = embeddingData?.words || []
    const findWord = (term) => words.find(w => w.word.toLowerCase() === term.toLowerCase())
    const aWord = findWord(a)
    const bWord = findWord(b)
    const cWord = findWord(c)

    if (aWord && bWord && cWord) {
      // Simple vector arithmetic in 2D (approximate)
      const rx = aWord.x - bWord.x + cWord.x
      const ry = aWord.y - bWord.y + cWord.y

      // Find nearest word to result
      let closest = null
      let minDist = Infinity
      for (const w of words) {
        if (w.word === a || w.word === b || w.word === c) continue
        const d = Math.sqrt((w.x - rx) ** 2 + (w.y - ry) ** 2)
        if (d < minDist) {
          minDist = d
          closest = w
        }
      }

      setCustomResult(closest?.word || '???')
      onShowArithmetic?.({
        a: aWord,
        b: bWord,
        c: cWord,
        result: closest ? { word: closest.word, x: closest.x, y: closest.y } : { word: '?', x: rx, y: ry },
      })
    } else {
      setCustomResult('(word not in map — try words from the scatter plot)')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: 4,
      }}>
        Word Arithmetic
      </div>

      {EXPERIMENTS.map((exp) => (
        <Nudge
          key={exp.key}
          icon={exp.icon}
          onClick={() => handleExperiment(exp.key)}
          explored={exploredExperiments.has(exp.key)}
          active={activeExperiment === exp.key}
          insightContent={
            <>
              {/* Result display for pre-defined experiments */}
              {!exp.isCustom && activeExperiment === exp.key && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    textAlign: 'center',
                    padding: '12px 0 16px',
                    fontSize: 24,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{exp.a}</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>−</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{exp.b}</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>+</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{exp.c}</span>
                  <span style={{ color: 'var(--text-dim)', margin: '0 6px' }}>≈</span>
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    style={{ color: 'var(--nvidia-green)' }}
                  >
                    {exp.result}
                  </motion.span>
                </motion.div>
              )}

              {/* Custom equation form */}
              {exp.isCustom && activeExperiment === exp.key && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexWrap: 'wrap',
                    marginBottom: 12,
                  }}>
                    <MiniInput
                      value={customInputs.a}
                      onChange={(v) => setCustomInputs(p => ({ ...p, a: v }))}
                      placeholder="word"
                    />
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 18 }}>−</span>
                    <MiniInput
                      value={customInputs.b}
                      onChange={(v) => setCustomInputs(p => ({ ...p, b: v }))}
                      placeholder="word"
                    />
                    <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 18 }}>+</span>
                    <MiniInput
                      value={customInputs.c}
                      onChange={(v) => setCustomInputs(p => ({ ...p, c: v }))}
                      placeholder="word"
                    />
                    <button
                      onClick={handleCustomSubmit}
                      style={{
                        padding: '6px 14px',
                        background: 'var(--nvidia-green)',
                        color: '#0a0a0b',
                        border: 'none',
                        borderRadius: 6,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      =
                    </button>
                  </div>
                  {customResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{
                        textAlign: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--nvidia-green)',
                        padding: '4px 0',
                      }}
                    >
                      ≈ {customResult}
                    </motion.div>
                  )}
                  <div style={{
                    fontSize: 12,
                    color: 'var(--text-dim)',
                    marginTop: 6,
                  }}>
                    Try words from the map above (e.g. dog − animal + food)
                  </div>
                </div>
              )}

              {/* Insight */}
              <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>
                {exp.insight.headline}
              </strong>{' '}
              {exp.insight.body}
              {exp.insight.nextHint && (
                <div style={{
                  marginTop: 10,
                  paddingTop: 8,
                  borderTop: '1px solid rgba(118, 185, 0, 0.1)',
                  fontSize: 13,
                  color: 'var(--nvidia-green)',
                  fontWeight: 500,
                  opacity: 0.85,
                }}>
                  {exp.insight.nextHint}
                </div>
              )}
            </>
          }
        >
          {exp.label}
        </Nudge>
      ))}

      {/* Progress indicator */}
      {exploredExperiments.size > 0 && (
        <motion.div
          key={exploredExperiments.size === EXPERIMENTS.length ? 'complete' : 'progress'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: exploredExperiments.size === EXPERIMENTS.length ? 12 : 11,
            color: exploredExperiments.size === EXPERIMENTS.length ? 'var(--nvidia-green)' : 'var(--text-dim)',
            paddingLeft: 4,
            marginTop: 2,
            fontWeight: exploredExperiments.size === EXPERIMENTS.length ? 600 : 400,
          }}
        >
          {exploredExperiments.size === EXPERIMENTS.length
            ? 'All explored — you now understand meaning-space.'
            : `${exploredExperiments.size}/${EXPERIMENTS.length} explored`
          }
        </motion.div>
      )}
    </div>
  )
}

function MiniInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: 80,
        padding: '6px 10px',
        background: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--nvidia-green)'
        e.target.style.boxShadow = '0 0 0 2px var(--nvidia-green-dim)'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border)'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}
