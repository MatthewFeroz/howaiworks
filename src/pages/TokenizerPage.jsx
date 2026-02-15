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
          onDepthOpened={() => {}}
        />
      </div>

      {/* CTA to Page 2 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{ padding: '8px 0 24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Link
          to="/understand"
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
          Explore how AI understands
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </motion.div>

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '24px 0 40px',
      }} />

      <Footer />
    </div>
  )
}
