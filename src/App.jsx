import { useState, useEffect, useCallback, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import TokenizerPhase from './components/TokenizerPhase'
import NumbersPhase from './components/NumbersPhase'
import EmbeddingTeaser from './components/EmbeddingTeaser'
import Footer from './components/Footer'
import { useTokenizer } from './hooks/useTokenizer'

export default function App() {
  const { tokens, tokenize, initialize, isLoading, isReady } = useTokenizer()
  const [inputText, setInputText] = useState('')
  const [showIds, setShowIds] = useState(false)
  const [interactionCount, setInteractionCount] = useState(0)
  const [phase2Visible, setPhase2Visible] = useState(false)
  const [phase3Visible, setPhase3Visible] = useState(false)
  const debounceRef = useRef(null)

  // Initialize tokenizer on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Debounced tokenization
  const handleInputChange = useCallback((text) => {
    setInputText(text)
    
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      tokenize(text)
      if (text.length > 0) {
        setInteractionCount(prev => prev + 1)
      }
    }, 120)
  }, [tokenize])

  // Progressive reveals based on interaction
  useEffect(() => {
    if (interactionCount >= 2 && !phase2Visible) {
      setPhase2Visible(true)
    }
    if (interactionCount >= 5 && !phase3Visible) {
      setPhase3Visible(true)
    }
  }, [interactionCount, phase2Visible, phase3Visible])

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
      <Hero />

      <TokenizerPhase
        inputText={inputText}
        onInputChange={handleInputChange}
        tokens={tokens}
        showIds={showIds}
        isLoading={isLoading}
        isReady={isReady}
        interactionCount={interactionCount}
      />

      <Divider />

      <NumbersPhase
        visible={phase2Visible}
        tokens={tokens}
        inputText={inputText}
        showIds={showIds}
        onToggleIds={() => setShowIds(prev => !prev)}
      />

      <Divider />

      <EmbeddingTeaser visible={phase3Visible} />

      <Footer />
    </div>
  )
}

function Divider() {
  return (
    <div style={{
      height: 1,
      background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
      margin: '40px 0',
    }} />
  )
}
