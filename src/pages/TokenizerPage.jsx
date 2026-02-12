import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/Hero'
import TokenizerPhase from '../components/TokenizerPhase'
import Footer from '../components/Footer'
import { useTokenizer } from '../hooks/useTokenizer'

export default function TokenizerPage() {
  const { tokens, tokenize, decode, initialize, isLoading, isReady } = useTokenizer()
  const [inputText, setInputText] = useState('')
  const [userHasTyped, setUserHasTyped] = useState(false)
  const [hasViewedDepth, setHasViewedDepth] = useState(false)
  const [hasVisitedPageTwo, setHasVisitedPageTwo] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  // Check if user has previously visited page 2
  useEffect(() => {
    setHasVisitedPageTwo(localStorage.getItem('visitedPageTwo') === 'true')
  }, [])

  const handleInputChange = useCallback((text) => {
    setInputText(text)
    tokenize(text)
  }, [tokenize])

  const handleUserTyped = useCallback(() => {
    setUserHasTyped(true)
  }, [])

  const handleDepthOpened = useCallback(() => {
    setHasViewedDepth(true)
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Page indicator dots — visible once user has visited page 2 */}
      <AnimatePresence>
        {hasVisitedPageTwo && (
          <motion.div
            key="page-dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 8,
              padding: '24px 0 0',
            }}
          >
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--nvidia-green)',
            }} />
            <Link to="/run" style={{ textDecoration: 'none' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--border)',
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--nvidia-green)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border)'}
              />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <Hero />

        <TokenizerPhase
          inputText={inputText}
          onInputChange={handleInputChange}
          tokens={tokens}
          decode={decode}
          isLoading={isLoading}
          isReady={isReady}
          onUserTyped={handleUserTyped}
          onDepthOpened={handleDepthOpened}
        />
      </div>

      {/* CTA to Page 2 — only rendered after user views Go Deeper */}
      <AnimatePresence>
        {hasViewedDepth && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              textAlign: 'center',
              padding: '48px 0 24px',
            }}
          >
            <Link
              to="/run"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px 32px',
                background: 'var(--nvidia-green)',
                color: '#0a0a0b',
                fontSize: 16,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                borderRadius: 12,
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
              Now see AI run on your machine
              <span style={{ fontSize: 20 }}>→</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '24px 0 40px',
      }} />

      {/* Resource Links — collapsible dropdown */}
      <ResourcesDropdown />

      <Footer />
    </div>
  )
}

const RESOURCES = [
  {
    href: 'https://platform.openai.com/tokenizer',
    title: 'OpenAI Tokenizer',
    desc: 'Interactive tool — paste any text and see exactly how GPT-4 tokenizes it.',
  },
  {
    href: 'https://arxiv.org/abs/1508.07909',
    title: 'BPE Paper (Sennrich et al. 2016)',
    desc: 'The original paper that introduced Byte Pair Encoding for neural machine translation.',
  },
  {
    href: 'https://github.com/dqbd/tiktoken',
    title: 'js-tiktoken',
    desc: 'The client-side tokenizer library powering this demo — runs entirely in your browser.',
  },
  {
    href: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them',
    title: 'What Are Tokens?',
    desc: 'OpenAI\'s official explainer on tokens, counting, and how they affect pricing.',
  },
]

function ResourcesDropdown() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: '0 0 20px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: open ? 'var(--nvidia-green)' : 'var(--text-dim)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--nvidia-green)' }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.color = 'var(--text-dim)' }}
      >
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'inline-block', fontSize: 10 }}
        >
          ▶
        </motion.span>
        Resources
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            key="resources-list"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
              opacity: { duration: 0.2, delay: 0.05 },
            }}
            style={{
              overflow: 'hidden',
              listStyle: 'none',
              margin: 0,
              padding: '12px 0 0 6px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {RESOURCES.map((r) => (
              <li key={r.href} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{
                  color: 'var(--text-dim)',
                  fontSize: 8,
                  lineHeight: '22px',
                  flexShrink: 0,
                  userSelect: 'none',
                }}>●</span>
                <div>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'var(--nvidia-green)',
                      fontSize: 14,
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px' }}
                    onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                  >
                    {r.title} <span style={{ fontSize: 11, opacity: 0.6 }}>↗</span>
                  </a>
                  <div style={{
                    fontSize: 13,
                    color: 'var(--text-dim)',
                    lineHeight: 1.5,
                    marginTop: 2,
                  }}>
                    {r.desc}
                  </div>
                </div>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
