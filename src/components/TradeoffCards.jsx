import { useState } from 'react'
import { motion } from 'framer-motion'
import Nudge from './Nudge'
import confetti from 'canvas-confetti'

const TRADEOFFS = [
  {
    key: 'latency',
    icon: '⚡',
    label: <>Latency — <Accent>Cloud thinks faster, but has a longer commute</Accent></>,
    insight: {
      headline: 'Time-to-first-token vs. tokens-per-second.',
      body: <>
        <strong style={{ color: '#6ec0e8' }}>Cloud</strong> has high TTFT (time-to-first-token) — your prompt
        travels over the internet to a data center, waits in a queue, then starts generating.
        But once it starts, powerful A100/H100 GPUs produce tokens at 80-150 tok/s.
        <br /><br />
        <strong style={{ color: 'var(--nvidia-green)' }}>Local</strong> starts almost instantly (no network hop),
        but consumer hardware generates at 10-30 tok/s. For short responses, local <em>feels</em> faster.
        For long responses, cloud pulls ahead.
      </>,
    },
  },
  {
    key: 'privacy',
    icon: '🔒',
    label: <>Privacy — <Accent>Local AI keeps your secrets</Accent></>,
    insight: {
      headline: 'Your data never leaves your machine.',
      body: <>
        When you use cloud AI, your prompts are sent to a remote server — stored, potentially logged,
        sometimes used for training. With local AI, the model runs entirely on your hardware.
        <strong style={{ color: 'var(--text-primary)' }}> Nothing is transmitted. Nothing is stored. Nothing is shared.</strong>
        <br /><br />
        This matters for healthcare (HIPAA), legal (attorney-client privilege), finance (SEC regulations),
        and anyone who values data sovereignty. Hospitals increasingly run local models for patient data.
        Law firms use them for confidential documents.
      </>,
    },
  },
  {
    key: 'cost',
    icon: '💰',
    label: <>Cost — <Accent>Cloud charges per token. Local is free after setup.</Accent></>,
    insight: {
      headline: 'Pay-per-use vs. upfront investment.',
      body: <>
        <strong style={{ color: '#6ec0e8' }}>Cloud pricing</strong> (typical): ~$0.03 per 1K input tokens,
        ~$0.06 per 1K output tokens. A busy chatbot handling 10,000 conversations/day can cost $500-2,000/month.
        <br /><br />
        <strong style={{ color: 'var(--nvidia-green)' }}>Local pricing</strong>: buy the hardware once, run forever.
        A $200 GPU can run small models. NVIDIA DGX Spark ($3,000) can run 70B-parameter models.
        After the initial investment, every token is free.
        <br /><br />
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          The breakeven depends on usage volume — low usage favors cloud, high usage favors local.
        </span>
      </>,
    },
  },
  {
    key: 'capability',
    icon: '🧠',
    label: <>Capability — <Accent>Bigger models, better answers</Accent></>,
    insight: {
      headline: '500M parameters vs 8B+ parameters — size matters.',
      body: <>
        The local model you saw (qwen2.5:0.5b) has <strong style={{ color: 'var(--nvidia-green)' }}>500 million parameters</strong>.
        Cloud models like Llama 3.1 have <strong style={{ color: '#6ec0e8' }}>8 billion+ parameters</strong> — 16x more.
        <br /><br />
        More parameters means more "memory" for facts, better reasoning, and more coherent long-form text.
        But it also means more GPU memory needed. A 70B model needs ~35GB of VRAM (at 4-bit quantization) —
        that's an A100 or a high-end consumer GPU.
        <br /><br />
        The future is trending toward smaller, more efficient models (distillation, quantization)
        that close this gap. NVIDIA's DGX Spark is designed to bring larger models to your desk.
      </>,
    },
  },
]

function Accent({ children }) {
  return <em style={{ color: 'var(--nvidia-green)', fontStyle: 'normal', fontWeight: 500 }}>{children}</em>
}

export default function TradeoffCards({ onAllExplored }) {
  const [activeCard, setActiveCard] = useState(null)
  const [exploredCards, setExploredCards] = useState(new Set())

  const handleCard = (key) => {
    if (activeCard === key) {
      setActiveCard(null)
      return
    }
    setActiveCard(key)
    setExploredCards(prev => {
      const next = new Set([...prev, key])
      if (next.size === TRADEOFFS.length && prev.size < TRADEOFFS.length) {
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
        The Trade-offs
      </div>

      {TRADEOFFS.map((card) => (
        <Nudge
          key={card.key}
          icon={card.icon}
          onClick={() => handleCard(card.key)}
          explored={exploredCards.has(card.key)}
          active={activeCard === card.key}
          insightContent={
            <>
              <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>
                {card.insight.headline}
              </strong>{' '}
              {card.insight.body}
            </>
          }
        >
          {card.label}
        </Nudge>
      ))}

      {exploredCards.size > 0 && (
        <motion.div
          key={exploredCards.size === TRADEOFFS.length ? 'complete' : 'progress'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: exploredCards.size === TRADEOFFS.length ? 12 : 11,
            color: exploredCards.size === TRADEOFFS.length ? 'var(--nvidia-green)' : 'var(--text-dim)',
            paddingLeft: 4,
            marginTop: 2,
            fontWeight: exploredCards.size === TRADEOFFS.length ? 600 : 400,
          }}
        >
          {exploredCards.size === TRADEOFFS.length
            ? 'All explored — you understand the cloud vs. local landscape.'
            : `${exploredCards.size}/${TRADEOFFS.length} explored`
          }
        </motion.div>
      )}
    </div>
  )
}
