import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Nudge from '../components/Nudge'
import Footer from '../components/Footer'
import { markLessonComplete } from '../components/Navbar'

// ─── Era card wrapper ───────────────────────────────────────────────────
function EraCard({ yearRange, title, explanation, children, index, paper }) {
  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  }
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '28px 24px',
        marginBottom: 20,
      }}
    >
      <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: 6,
          background: 'var(--nvidia-green-dim)',
          color: 'var(--nvidia-green)',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          {yearRange}
        </span>
      </motion.div>

      <motion.h2 variants={fadeUp} style={{
        fontSize: 'clamp(18px, 4vw, 24px)',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 8,
        lineHeight: 1.3,
      }}>
        {title}
      </motion.h2>

      <motion.p variants={fadeUp} style={{
        fontSize: 15,
        color: 'var(--text-secondary)',
        lineHeight: 1.6,
        marginBottom: 24,
      }}>
        {explanation}
      </motion.p>

      <motion.div variants={fadeUp}>
        {children}
      </motion.div>

      {paper && (
        <motion.div variants={fadeUp} style={{ marginTop: 16 }}>
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              textDecoration: 'none',
              transition: 'border-color 0.2s',
              maxWidth: '100%',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--nvidia-green)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span style={{ fontSize: 12, flexShrink: 0 }}>📄</span>
            <span style={{
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {paper.title}
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)', flexShrink: 0 }}>
              ({paper.year})
            </span>
          </a>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Era 1: Animated flowchart ──────────────────────────────────────────
function FlowchartAnimation() {
  const [step, setStep] = useState(-1)

  useEffect(() => {
    const steps = [0, 1, 2, 3, 4]
    let i = 0
    const interval = setInterval(() => {
      setStep(steps[i])
      i++
      if (i >= steps.length) {
        setTimeout(() => { setStep(-1); i = 0 }, 1800)
      }
    }, 700)
    return () => clearInterval(interval)
  }, [])

  const nodeStyle = (active) => ({
    padding: '6px 12px',
    borderRadius: 8,
    border: `1.5px solid ${active ? 'var(--nvidia-green)' : 'var(--border)'}`,
    background: active ? 'var(--nvidia-green-dim)' : 'var(--bg-elevated)',
    color: active ? 'var(--nvidia-green)' : 'var(--text-secondary)',
    fontSize: 12,
    fontFamily: 'var(--font-mono)',
    fontWeight: 500,
    textAlign: 'center',
    transition: 'all 0.35s ease',
    whiteSpace: 'nowrap',
  })

  const arrowStyle = (active) => ({
    color: active ? 'var(--nvidia-green)' : 'var(--text-dim)',
    fontSize: 14,
    transition: 'color 0.35s ease',
    textAlign: 'center',
  })

  return (
    <div style={{
      background: 'var(--bg-deep)',
      borderRadius: 10,
      padding: '20px 16px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={nodeStyle(step >= 0)}>Is it round?</div>
        <div style={arrowStyle(step >= 1)}>↓ yes</div>
        <div style={nodeStyle(step >= 1)}>Is it orange?</div>
        <div style={arrowStyle(step >= 2)}>↓ yes</div>
        <div style={nodeStyle(step >= 2)}>Does it peel?</div>
        <div style={arrowStyle(step >= 3)}>↓ yes</div>
        <div style={{
          ...nodeStyle(step >= 4),
          background: step >= 4 ? 'var(--nvidia-green)' : 'var(--bg-elevated)',
          color: step >= 4 ? '#0a0a0b' : 'var(--text-secondary)',
          fontWeight: step >= 4 ? 700 : 500,
        }}>
          It's an orange!
        </div>
      </div>
    </div>
  )
}

// ─── Era 2: Animated scatter plot ───────────────────────────────────────
function ScatterPlotAnimation() {
  // 0=empty, 1=dots appear (scattered/mixed), 2=classify (move + color), 3=dividing line
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    let timeouts = []
    const run = () => {
      setPhase(0)
      timeouts.push(setTimeout(() => setPhase(1), 400))
      timeouts.push(setTimeout(() => setPhase(2), 2200))
      timeouts.push(setTimeout(() => setPhase(3), 4000))
    }
    run()
    const interval = setInterval(run, 7000)
    return () => { timeouts.forEach(clearTimeout); clearInterval(interval) }
  }, [])

  // Each dot has a random starting position and a final clustered position
  const allDots = [
    // Spam (final positions: left cluster)
    { startX: 62, startY: 18, endX: 18, endY: 25, type: 'spam' },
    { startX: 40, startY: 55, endX: 25, endY: 35, type: 'spam' },
    { startX: 78, startY: 42, endX: 15, endY: 50, type: 'spam' },
    { startX: 52, startY: 12, endX: 30, endY: 20, type: 'spam' },
    { startX: 30, startY: 65, endX: 22, endY: 45, type: 'spam' },
    { startX: 85, startY: 30, endX: 28, endY: 55, type: 'spam' },
    { startX: 48, startY: 48, endX: 12, endY: 38, type: 'spam' },
    { startX: 70, startY: 60, endX: 35, endY: 42, type: 'spam' },
    // Not-spam (final positions: right cluster)
    { startX: 20, startY: 40, endX: 65, endY: 30, type: 'ok' },
    { startX: 55, startY: 22, endX: 72, endY: 45, type: 'ok' },
    { startX: 35, startY: 58, endX: 78, endY: 25, type: 'ok' },
    { startX: 12, startY: 15, endX: 70, endY: 55, type: 'ok' },
    { startX: 75, startY: 50, endX: 82, endY: 40, type: 'ok' },
    { startX: 42, startY: 35, endX: 68, endY: 60, type: 'ok' },
    { startX: 60, startY: 68, endX: 75, endY: 18, type: 'ok' },
    { startX: 25, startY: 28, endX: 85, endY: 50, type: 'ok' },
  ]

  const neutralColor = '#8a8a96'

  return (
    <div style={{
      background: 'var(--bg-deep)',
      borderRadius: 10,
      padding: '20px 16px',
      border: '1px solid var(--border)',
    }}>
      {/* Phase label */}
      <div style={{
        textAlign: 'center',
        marginBottom: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-dim)',
        height: 16,
        transition: 'opacity 0.3s ease',
        opacity: phase >= 1 ? 1 : 0,
      }}>
        {phase === 1 && 'collecting emails...'}
        {phase === 2 && 'classifying...'}
        {phase >= 3 && 'pattern found!'}
      </div>
      <svg viewBox="0 0 100 80" style={{ width: '100%', height: 'auto' }}>
        {allDots.map((d, i) => {
          const classified = phase >= 2
          const cx = classified ? d.endX : d.startX
          const cy = classified ? d.endY : d.startY
          const color = classified
            ? (d.type === 'spam' ? '#e05252' : 'var(--nvidia-green)')
            : neutralColor
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={3}
              fill={color}
              opacity={phase >= 1 ? 0.9 : 0}
              style={{
                transition: phase >= 1
                  ? `cx 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${i * 0.04}s, cy 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) ${i * 0.04}s, fill 0.5s ease ${i * 0.03}s, opacity 0.4s ease ${i * 0.04}s`
                  : 'opacity 0.2s ease',
              }}
            />
          )
        })}
        {/* Dividing line */}
        <line
          x1={48} y1={5} x2={48} y2={75}
          stroke="var(--nvidia-green)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          opacity={phase >= 3 ? 0.8 : 0}
          style={{ transition: 'opacity 0.6s ease' }}
        />
        {/* Labels */}
        <text x={20} y={75} fill="#e05252" fontSize={7} textAnchor="middle"
          opacity={phase >= 3 ? 0.7 : 0} style={{ transition: 'opacity 0.4s ease 0.3s', fontFamily: 'var(--font-mono)' }}>
          spam
        </text>
        <text x={75} y={75} fill="var(--nvidia-green)" fontSize={7} textAnchor="middle"
          opacity={phase >= 3 ? 0.7 : 0} style={{ transition: 'opacity 0.4s ease 0.3s', fontFamily: 'var(--font-mono)' }}>
          not spam
        </text>
      </svg>
    </div>
  )
}

// ─── Era 3: Animated neural net layers ──────────────────────────────────
function NeuralNetAnimation() {
  const [activeLayer, setActiveLayer] = useState(-1)

  useEffect(() => {
    let layer = 0
    const interval = setInterval(() => {
      setActiveLayer(layer)
      layer++
      if (layer > 4) {
        setTimeout(() => { setActiveLayer(-1); layer = 0 }, 1200)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const layers = [
    { nodes: 4, label: 'input' },
    { nodes: 5, label: '' },
    { nodes: 5, label: '' },
    { nodes: 3, label: '' },
    { nodes: 2, label: 'output' },
  ]

  const layerX = (i) => 15 + i * 18
  const nodeY = (layerIdx, nodeIdx) => {
    const count = layers[layerIdx].nodes
    const spacing = 60 / (count + 1)
    return 10 + spacing * (nodeIdx + 1)
  }

  return (
    <div style={{
      background: 'var(--bg-deep)',
      borderRadius: 10,
      padding: '20px 16px',
      border: '1px solid var(--border)',
    }}>
      <svg viewBox="0 0 100 80" style={{ width: '100%', height: 'auto' }}>
        {/* Connections */}
        {layers.map((layer, li) => {
          if (li === 0) return null
          const prevLayer = layers[li - 1]
          return prevLayer.nodes > 0 && Array.from({ length: prevLayer.nodes }).map((_, pi) =>
            Array.from({ length: layer.nodes }).map((_, ni) => (
              <line
                key={`c${li}-${pi}-${ni}`}
                x1={layerX(li - 1)} y1={nodeY(li - 1, pi)}
                x2={layerX(li)} y2={nodeY(li, ni)}
                stroke={activeLayer >= li ? 'var(--nvidia-green)' : 'var(--border)'}
                strokeWidth={0.5}
                opacity={activeLayer >= li ? 0.4 : 0.2}
                style={{ transition: 'all 0.3s ease' }}
              />
            ))
          )
        })}
        {/* Nodes */}
        {layers.map((layer, li) =>
          Array.from({ length: layer.nodes }).map((_, ni) => (
            <circle
              key={`n${li}-${ni}`}
              cx={layerX(li)} cy={nodeY(li, ni)}
              r={3}
              fill={activeLayer >= li ? 'var(--nvidia-green)' : 'var(--bg-elevated)'}
              stroke={activeLayer >= li ? 'var(--nvidia-green)' : 'var(--border)'}
              strokeWidth={1}
              style={{ transition: 'all 0.3s ease' }}
            />
          ))
        )}
        {/* Labels */}
        <text x={layerX(0)} y={78} fill="var(--text-dim)" fontSize={5.5} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)' }}>input</text>
        <text x={layerX(4)} y={78} fill="var(--text-dim)" fontSize={5.5} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)' }}>output</text>
      </svg>
    </div>
  )
}

// ─── Era 4: Next-word prediction ────────────────────────────────────────
function NextWordAnimation() {
  const [wordIndex, setWordIndex] = useState(-1)
  const words = ['The', 'cat', 'sat', 'on', 'the']
  const prediction = 'mat'

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setWordIndex(i)
      i++
      if (i > words.length + 1) {
        setTimeout(() => { setWordIndex(-1); i = 0 }, 2400)
      }
    }, 450)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      background: 'var(--bg-deep)',
      borderRadius: 10,
      padding: '24px 16px',
      border: '1px solid var(--border)',
      textAlign: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
        alignItems: 'baseline',
        fontFamily: 'var(--font-mono)',
        fontSize: 'clamp(14px, 3.5vw, 18px)',
        minHeight: 60,
      }}>
        {words.map((word, i) => (
          <span
            key={i}
            style={{
              color: wordIndex >= i ? 'var(--text-primary)' : 'transparent',
              transition: 'color 0.3s ease',
            }}
          >
            {word}
          </span>
        ))}
        {/* The blank / prediction */}
        <span style={{ position: 'relative', display: 'inline-block', minWidth: 40 }}>
          {wordIndex > words.length - 1 ? (
            <span style={{
              color: 'var(--nvidia-green)',
              fontWeight: 700,
              transition: 'color 0.3s ease',
            }}>
              {prediction}
            </span>
          ) : (
            <span style={{
              color: wordIndex >= words.length - 1 ? 'var(--text-dim)' : 'transparent',
              transition: 'color 0.3s ease',
              borderBottom: wordIndex >= words.length - 1 ? '2px dashed var(--text-dim)' : '2px dashed transparent',
            }}>
              ___
            </span>
          )}
        </span>
      </div>
      {/* Probability label */}
      <div style={{
        marginTop: 12,
        opacity: wordIndex > words.length - 1 ? 1 : 0,
        transition: 'opacity 0.4s ease',
        display: 'flex',
        justifyContent: 'center',
        gap: 6,
      }}>
        <span style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: 4,
          background: 'var(--nvidia-green-dim)',
          color: 'var(--nvidia-green)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
        }}>
          85% probability
        </span>
      </div>
    </div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────
const NUDGE_ITEMS = [
  {
    key: 'images',
    icon: '🖼',
    label: 'What about images?',
    insight: 'Same idea, different data. AI sees an image as a grid of numbers — the brightness and color of each pixel. It finds patterns in those numbers the same way it finds patterns in text. Edges → shapes → objects → scenes. Everything is numbers in, patterns out.',
  },
  {
    key: 'thinking',
    icon: '🧠',
    label: 'Is AI really thinking?',
    insight: "This is the \"Chinese Room\" question. Imagine someone in a room who doesn't speak Chinese, but has a giant rulebook. They receive Chinese characters, look up the right response, and slide it back under the door. From outside, it looks like they speak Chinese. AI is similar — it matches patterns brilliantly, but whether that counts as \"understanding\" is still debated.",
  },
  {
    key: 'learning',
    icon: '🔄',
    label: 'How does it learn?',
    insight: 'The training loop: See a sentence → predict the next word → check if you were right → adjust your weights slightly → repeat. Do this billions of times across terabytes of text, and the model slowly learns grammar, facts, reasoning patterns, and more. Each tiny adjustment makes it a little bit better.',
  },
]

export default function WhatIsAIPage() {
  const [activeNudge, setActiveNudge] = useState(null)
  const [exploredNudges, setExploredNudges] = useState(() => new Set())

  const handleNudge = (key) => {
    const wasActive = activeNudge === key
    setActiveNudge(wasActive ? null : key)

    if (!exploredNudges.has(key)) {
      setExploredNudges(prev => {
        const next = new Set(prev)
        next.add(key)

        if (next.size === NUDGE_ITEMS.length && prev.size < NUDGE_ITEMS.length) {
          markLessonComplete('lesson-complete-what-is-ai')
          setTimeout(() => {
            confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: ['#76B900', '#e8e8ed', '#8a8a96'] })
          }, 200)
          setTimeout(() => {
            confetti({ particleCount: 40, spread: 65, origin: { y: 0.65, x: 0.6 }, colors: ['#76B900', '#e8e8ed'] })
          }, 500)
        }
        return next
      })
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '48px 0 40px' }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 38px)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}>
          What is{' '}
          <span style={{ color: 'var(--nvidia-green)' }}>AI?</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: 440,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          From hand-written rules to machines that write poetry.
          <br />
          Four eras in four minutes.
        </p>
      </motion.div>

      {/* Era 1: Rules */}
      <EraCard
        index={0}
        yearRange="1950s – 1980s"
        title="Humans wrote the rules"
        explanation="Early AI was just if/then logic. Programmers told the computer exactly what to do for every situation."
        paper={{ title: 'Computing Machinery and Intelligence', year: 1950, url: 'https://doi.org/10.1093/mind/LIX.236.433' }}
      >
        <FlowchartAnimation />
      </EraCard>

      {/* Era 2: Learning from Data */}
      <EraCard
        index={1}
        yearRange="1990s – 2000s"
        title="Machines found the patterns"
        explanation="Instead of writing rules, we gave computers thousands of examples and let them figure out the patterns themselves."
        paper={{ title: 'A Training Algorithm for Optimal Margin Classifiers', year: 1992, url: 'https://doi.org/10.1145/130385.130401' }}
      >
        <ScatterPlotAnimation />
      </EraCard>

      {/* Era 3: Deep Learning */}
      <EraCard
        index={2}
        yearRange="2010s"
        title="Layers of understanding"
        explanation="Stack many pattern-finders in layers. The first layer sees edges, the next sees shapes, the next sees faces. This is how AI learned to see, hear, and speak."
        paper={{ title: 'ImageNet Classification with Deep Convolutional Neural Networks', year: 2012, url: 'https://doi.org/10.1145/3065386' }}
      >
        <NeuralNetAnimation />
      </EraCard>

      {/* Era 4: Language Models */}
      <EraCard
        index={3}
        yearRange="2020s"
        title="Predicting the next word"
        explanation="Train on billions of sentences from the internet. Learn which word comes next, over and over. That's ChatGPT — the world's best autocomplete."
        paper={{ title: 'Attention Is All You Need', year: 2017, url: 'https://doi.org/10.48550/arXiv.1706.03762' }}
      >
        <NextWordAnimation />
      </EraCard>

      {/* Bridge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '32px 20px',
          margin: '12px 0 24px',
          borderRadius: 14,
          border: '1px solid var(--border)',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-deep) 100%)',
        }}
      >
        <p style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          maxWidth: 460,
          margin: '0 auto 24px',
        }}>
          Today's AI reads text as numbers, finds patterns in those numbers, and predicts what comes next.
          But before any of that — it needs to <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>break your words into pieces</span> it can understand.
        </p>
        <Link
          to="/tokenize"
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
          See how AI reads text
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </motion.div>

      {/* Nudges — deeper exploration */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.4 }}
        style={{ marginTop: 8 }}
      >
        <p style={{
          fontSize: 13,
          color: 'var(--text-dim)',
          fontFamily: 'var(--font-mono)',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          Dig deeper — explore all three to complete this lesson
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {NUDGE_ITEMS.map((item) => (
            <Nudge
              key={item.key}
              icon={item.icon}
              explored={exploredNudges.has(item.key)}
              active={activeNudge === item.key}
              onClick={() => handleNudge(item.key)}
              insightContent={item.insight}
            >
              {item.label}
            </Nudge>
          ))}
        </div>
      </motion.div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '40px 0',
      }} />

      <Footer />
    </div>
  )
}
