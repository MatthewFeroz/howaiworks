import { useState, useEffect, useCallback } from 'react'
import Hero from './components/Hero'
import TokenizerPhase from './components/TokenizerPhase'
import NumbersPhase from './components/NumbersPhase'
import EmbeddingTeaser from './components/EmbeddingTeaser'
import Footer from './components/Footer'
import { useTokenizer } from './hooks/useTokenizer'

export default function App() {
  const { tokens, tokenize, initialize, isLoading, isReady } = useTokenizer()
  const [inputText, setInputText] = useState('')
  const [showIds, setShowIds] = useState(true)
  const [userHasTyped, setUserHasTyped] = useState(false)

  // Initialize tokenizer on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Tokenize immediately for live feedback (no debounce)
  const handleInputChange = useCallback((text) => {
    setInputText(text)
    tokenize(text)
  }, [tokenize])

  const handleUserTyped = useCallback(() => {
    setUserHasTyped(true)
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Hero />

        <TokenizerPhase
          inputText={inputText}
          onInputChange={handleInputChange}
          tokens={tokens}
          showIds={showIds}
          onToggleIds={() => setShowIds(prev => !prev)}
          isLoading={isLoading}
          isReady={isReady}
          onUserTyped={handleUserTyped}
        />
      </div>

      <Divider />

      <NumbersPhase
        visible={userHasTyped}
        tokens={tokens}
        inputText={inputText}
        showIds={showIds}
        onToggleIds={() => setShowIds(prev => !prev)}
      />

      <Divider />

      <EmbeddingTeaser visible={userHasTyped} />

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
