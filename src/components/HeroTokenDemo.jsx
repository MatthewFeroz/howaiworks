import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTokenizer } from '../hooks/useTokenizer'

const SENTENCES = [
  'How does AI actually work?',
  'The cat sat on the mat',
  'strawberry',
  'مرحبا كيف حالك',
]

const TYPE_SPEED = 70
const HOLD_TIME = 2000
const FADE_TIME = 400

const TOKEN_COLORS = [
  '#a8d86e', '#6ec0e8', '#e8956e', '#c58ee8',
  '#e8d06e', '#6ee8cc', '#e87a96', '#94a0e8',
  '#e8a0d6', '#b0d87a', '#e8a07a', '#7ac0e8',
]

const TOKEN_BGS = [
  'rgba(118,185,0,0.12)', 'rgba(0,163,255,0.12)', 'rgba(255,107,53,0.12)', 'rgba(189,85,236,0.12)',
  'rgba(255,198,0,0.12)', 'rgba(0,210,178,0.12)', 'rgba(255,82,119,0.12)', 'rgba(130,148,255,0.12)',
  'rgba(255,159,243,0.12)', 'rgba(162,221,90,0.12)', 'rgba(255,138,101,0.12)', 'rgba(73,190,255,0.12)',
]

const TOKEN_BORDERS = [
  'rgba(118,185,0,0.3)', 'rgba(0,163,255,0.3)', 'rgba(255,107,53,0.3)', 'rgba(189,85,236,0.3)',
  'rgba(255,198,0,0.3)', 'rgba(0,210,178,0.3)', 'rgba(255,82,119,0.3)', 'rgba(130,148,255,0.3)',
  'rgba(255,159,243,0.3)', 'rgba(162,221,90,0.3)', 'rgba(255,138,101,0.3)', 'rgba(73,190,255,0.3)',
]

export default function HeroTokenDemo() {
  const { tokenize, initialize, isReady } = useTokenizer()
  const [typed, setTyped] = useState('')
  const [tokens, setTokens] = useState([])
  const [visible, setVisible] = useState(true)
  const [typing, setTyping] = useState(false)
  const sentenceIdx = useRef(0)
  const cancelled = useRef(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const runCycle = useCallback(async () => {
    if (!isReady) return
    cancelled.current = false

    while (!cancelled.current) {
      const sentence = SENTENCES[sentenceIdx.current % SENTENCES.length]
      setVisible(true)
      setTyping(true)

      // Type each character
      for (let i = 1; i <= sentence.length; i++) {
        if (cancelled.current) return
        const partial = sentence.slice(0, i)
        setTyped(partial)
        const result = tokenize(partial)
        setTokens(result)
        await new Promise(r => setTimeout(r, TYPE_SPEED))
      }

      setTyping(false)

      // Hold
      if (cancelled.current) return
      await new Promise(r => setTimeout(r, HOLD_TIME))

      // Fade out
      if (cancelled.current) return
      setVisible(false)
      await new Promise(r => setTimeout(r, FADE_TIME))

      // Reset for next sentence
      setTyped('')
      setTokens([])
      sentenceIdx.current++
    }
  }, [isReady, tokenize])

  useEffect(() => {
    if (!isReady) return
    // Small delay before starting the typing animation
    const timer = setTimeout(() => runCycle(), 200)
    return () => {
      cancelled.current = true
      clearTimeout(timer)
    }
  }, [isReady, runCycle])

  return (
    <div style={{
      position: 'relative',
      marginTop: 32,
      padding: '20px 24px',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
      minHeight: 100,
    }}>
      {/* Green radial glow */}
      <div style={{
        position: 'absolute',
        inset: -40,
        background: 'radial-gradient(ellipse at center, rgba(118,185,0,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <AnimatePresence mode="wait">
        {visible && tokens.length > 0 && (
          <motion.div
            key={sentenceIdx.current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'relative' }}
          >
            {/* Token spans row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 12,
              minHeight: 36,
              alignItems: 'center',
            }}>
              {tokens.map((tok, i) => {
                const ci = i % 12
                return (
                  <motion.span
                    key={`${sentenceIdx.current}-${i}-${tok.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 15,
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 500,
                      background: TOKEN_BGS[ci],
                      border: `1px solid ${TOKEN_BORDERS[ci]}`,
                      color: TOKEN_COLORS[ci],
                      whiteSpace: 'pre',
                    }}
                  >
                    {tok.display}
                  </motion.span>
                )
              })}
              {typing && (
                <span style={{
                  display: 'inline-block',
                  width: 2,
                  height: 20,
                  background: 'var(--nvidia-green)',
                  borderRadius: 1,
                  animation: 'blink-cursor 1s step-end infinite',
                  marginLeft: 2,
                }} />
              )}
            </div>

            {/* Token IDs row */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              alignItems: 'center',
            }}>
              {tokens.map((tok, i) => (
                <motion.span
                  key={`id-${sentenceIdx.current}-${i}-${tok.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: 0.05 }}
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    color: 'var(--text-dim)',
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  {tok.id}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {!isReady && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 60,
          color: 'var(--text-dim)',
          fontSize: 13,
          fontFamily: 'var(--font-mono)',
        }}>
          Loading tokenizer...
        </div>
      )}
    </div>
  )
}
