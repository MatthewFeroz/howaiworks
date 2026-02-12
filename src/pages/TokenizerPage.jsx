import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Hero from '../components/Hero'
import TokenizerPhase from '../components/TokenizerPhase'
import Footer from '../components/Footer'
import { useTokenizer } from '../hooks/useTokenizer'

export default function TokenizerPage() {
  const { tokens, tokenize, decode, initialize, isLoading, isReady } = useTokenizer()
  const [inputText, setInputText] = useState('')
  const [userHasTyped, setUserHasTyped] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleInputChange = useCallback((text) => {
    setInputText(text)
    tokenize(text)
  }, [tokenize])

  const handleUserTyped = useCallback(() => {
    setUserHasTyped(true)
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
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
        />
      </div>

      {/* CTA to Page 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: userHasTyped ? 1 : 0, y: userHasTyped ? 0 : 20 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          textAlign: 'center',
          padding: '48px 0 24px',
          pointerEvents: userHasTyped ? 'auto' : 'none',
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

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '24px 0 40px',
      }} />

      {/* Resource Links */}
      <div style={{ padding: '0 0 20px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: 'var(--text-dim)',
          marginBottom: 16,
        }}>
          Resources
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
        }}>
          <ResourceLink
            href="https://platform.openai.com/tokenizer"
            title="OpenAI Tokenizer"
            desc="Try it yourself"
          />
          <ResourceLink
            href="https://arxiv.org/abs/1508.07909"
            title="BPE Paper"
            desc="Sennrich et al. 2016"
          />
          <ResourceLink
            href="https://github.com/dqbd/tiktoken"
            title="js-tiktoken"
            desc="Client-side tokenizer"
          />
          <ResourceLink
            href="https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them"
            title="What Are Tokens?"
            desc="OpenAI docs"
          />
        </div>
      </div>

      <Footer />
    </div>
  )
}

function ResourceLink({ href, title, desc }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'block',
        padding: '12px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--nvidia-green)'
        e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'var(--bg-surface)'
      }}
    >
      <div style={{
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--nvidia-green)',
        marginBottom: 2,
      }}>
        {title} <span style={{ fontSize: 12, opacity: 0.7 }}>↗</span>
      </div>
      <div style={{
        fontSize: 12,
        color: 'var(--text-dim)',
      }}>
        {desc}
      </div>
    </a>
  )
}
