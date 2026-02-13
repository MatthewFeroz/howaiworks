import { useState, useRef, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { simulateTokenStream, DEMO_CONVERSATIONS } from './DemoReplay'
import { simulateCloudStream, CLOUD_DEMO_RESPONSES } from './CloudDemoReplay'

const TOKEN_COLORS = [
  '#a8d86e', '#6ec0e8', '#e8956e', '#c58ee8', '#e8d06e', '#6ee8cc',
  '#e87a96', '#94a0e8', '#e8a0d6', '#b0d87a', '#e8a07a', '#7ac0e8',
]

const DEFAULT_PROMPT = 'What is artificial intelligence?'

export default function LatencyRace({ ollamaConnected, brevConfig, onRaceComplete }) {
  const [prompt, setPrompt] = useState('')
  const [isRacing, setIsRacing] = useState(false)
  const [hasRaced, setHasRaced] = useState(false)

  // Cloud state
  const [cloudTokens, setCloudTokens] = useState([])
  const [cloudDone, setCloudDone] = useState(false)
  const [cloudTTFT, setCloudTTFT] = useState(null)
  const [cloudTPS, setCloudTPS] = useState(null)
  const [cloudStartTime, setCloudStartTime] = useState(null)
  const [cloudFirstToken, setCloudFirstToken] = useState(null)
  const [cloudIsSimulated, setCloudIsSimulated] = useState(false)

  // Local state
  const [localTokens, setLocalTokens] = useState([])
  const [localDone, setLocalDone] = useState(false)
  const [localTTFT, setLocalTTFT] = useState(null)
  const [localTPS, setLocalTPS] = useState(null)
  const [localStartTime, setLocalStartTime] = useState(null)
  const [localFirstToken, setLocalFirstToken] = useState(null)
  const [localIsSimulated, setLocalIsSimulated] = useState(false)

  const cloudCancelRef = useRef(null)
  const localCancelRef = useRef(null)
  const cloudTokenCountRef = useRef(0)
  const localTokenCountRef = useRef(0)

  // Auto-race on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      startRace(DEFAULT_PROMPT)
    }, 800)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const resetState = () => {
    setCloudTokens([])
    setCloudDone(false)
    setCloudTTFT(null)
    setCloudTPS(null)
    setCloudStartTime(null)
    setCloudFirstToken(null)
    setLocalTokens([])
    setLocalDone(false)
    setLocalTTFT(null)
    setLocalTPS(null)
    setLocalStartTime(null)
    setLocalFirstToken(null)
    cloudTokenCountRef.current = 0
    localTokenCountRef.current = 0
  }

  const startRace = useCallback((racePrompt) => {
    if (cloudCancelRef.current) cloudCancelRef.current()
    if (localCancelRef.current) localCancelRef.current()
    resetState()
    setIsRacing(true)

    const now = Date.now()

    // ── CLOUD COLUMN ──
    const hasBrev = brevConfig?.apiKey && brevConfig?.endpoint
    setCloudIsSimulated(!hasBrev)

    if (hasBrev) {
      // Real Brev streaming
      setCloudStartTime(now)
      ;(async () => {
        try {
          const res = await fetch('/api/cloud-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: racePrompt,
              apiKey: brevConfig.apiKey,
              endpoint: brevConfig.endpoint,
              model: brevConfig.modelId || 'meta-llama/Llama-3.1-8B-Instruct',
            }),
          })
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let firstTokenTime = null

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                const token = parsed.token || parsed.content || ''
                if (token) {
                  if (!firstTokenTime) {
                    firstTokenTime = Date.now()
                    setCloudFirstToken(firstTokenTime)
                    setCloudTTFT(firstTokenTime - now)
                  }
                  cloudTokenCountRef.current++
                  setCloudTokens(prev => [...prev, token])
                  const elapsed = (Date.now() - firstTokenTime) / 1000
                  if (elapsed > 0) setCloudTPS(Math.round(cloudTokenCountRef.current / elapsed))
                }
              } catch { /* skip */ }
            }
          }
        } catch (err) {
          console.error('Cloud race error:', err)
        }
        setCloudDone(true)
        checkRaceComplete()
      })()
    } else {
      // Simulated cloud
      setCloudStartTime(now)
      const demo = CLOUD_DEMO_RESPONSES.find(d => d.prompt === racePrompt) || CLOUD_DEMO_RESPONSES[0]
      const cancel = simulateCloudStream(
        demo.response,
        (token) => {
          const tokenTime = Date.now()
          setCloudTokens(prev => {
            if (prev.length === 0) {
              setCloudFirstToken(tokenTime)
              setCloudTTFT(tokenTime - now)
            }
            return [...prev, token]
          })
          cloudTokenCountRef.current++
          const firstTime = cloudTokenCountRef.current === 1 ? tokenTime : null
          if (cloudTokenCountRef.current > 1) {
            // Use a rough estimate of first token for TPS calculation
            setCloudTPS(prev => {
              const elapsed = (tokenTime - now) / 1000
              return elapsed > 0 ? Math.round(cloudTokenCountRef.current / elapsed) : prev
            })
          }
        },
        () => {
          setCloudDone(true)
          checkRaceComplete()
        },
      )
      cloudCancelRef.current = cancel
    }

    // ── LOCAL COLUMN ──
    setLocalIsSimulated(!ollamaConnected)

    if (ollamaConnected) {
      // Real Ollama streaming
      setLocalStartTime(now)
      ;(async () => {
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{ role: 'user', content: racePrompt }],
              model: 'qwen2.5:0.5b',
            }),
          })
          const reader = res.body.getReader()
          const decoder = new TextDecoder()
          let buffer = ''
          let firstTokenTime = null

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6)
              if (data === '[DONE]') break
              try {
                const parsed = JSON.parse(data)
                const token = parsed.token || ''
                if (token) {
                  if (!firstTokenTime) {
                    firstTokenTime = Date.now()
                    setLocalFirstToken(firstTokenTime)
                    setLocalTTFT(firstTokenTime - now)
                  }
                  localTokenCountRef.current++
                  setLocalTokens(prev => [...prev, token])
                  const elapsed = (Date.now() - firstTokenTime) / 1000
                  if (elapsed > 0) setLocalTPS(Math.round(localTokenCountRef.current / elapsed))
                }
              } catch { /* skip */ }
            }
          }
        } catch (err) {
          console.error('Local race error:', err)
        }
        setLocalDone(true)
        checkRaceComplete()
      })()
    } else {
      // Simulated local
      setLocalStartTime(now)
      const demo = DEMO_CONVERSATIONS[0]
      const cancel = simulateTokenStream(
        demo.response,
        (token) => {
          const tokenTime = Date.now()
          setLocalTokens(prev => {
            if (prev.length === 0) {
              setLocalFirstToken(tokenTime)
              setLocalTTFT(tokenTime - now)
            }
            return [...prev, token]
          })
          localTokenCountRef.current++
          if (localTokenCountRef.current > 1) {
            setLocalTPS(prev => {
              const elapsed = (tokenTime - now) / 1000
              return elapsed > 0 ? Math.round(localTokenCountRef.current / elapsed) : prev
            })
          }
        },
        () => {
          setLocalDone(true)
          checkRaceComplete()
        },
      )
      localCancelRef.current = cancel
    }
  }, [ollamaConnected, brevConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkRaceComplete = () => {
    // This is called from async contexts; we use a timeout to let state settle
    setTimeout(() => {
      setIsRacing(false)
      setHasRaced(true)
      onRaceComplete?.()
    }, 100)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (prompt.trim()) {
      startRace(prompt.trim())
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cloudCancelRef.current) cloudCancelRef.current()
      if (localCancelRef.current) localCancelRef.current()
    }
  }, [])

  return (
    <div>
      {/* Race columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}>
        {/* Cloud column */}
        <RaceColumn
          label="CLOUD"
          sublabel={cloudIsSimulated ? 'Simulated · Brev GPU' : `Brev · ${brevConfig?.modelId || 'llama3.1:8b'}`}
          accentColor="#6ec0e8"
          tokens={cloudTokens}
          done={cloudDone}
          ttft={cloudTTFT}
          tps={cloudTPS}
          isSimulated={cloudIsSimulated}
          model={brevConfig?.modelId || 'llama3.1:8b'}
        />

        {/* Local column */}
        <RaceColumn
          label="LOCAL"
          sublabel={localIsSimulated ? 'Simulated · Your Machine' : 'Ollama · Your Machine'}
          accentColor="var(--nvidia-green)"
          tokens={localTokens}
          done={localDone}
          ttft={localTTFT}
          tps={localTPS}
          isSimulated={localIsSimulated}
          model="qwen2.5:0.5b"
        />
      </div>

      {/* Re-race input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type a prompt and race again..."
          disabled={isRacing}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            outline: 'none',
            opacity: isRacing ? 0.5 : 1,
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--nvidia-green)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)'
          }}
        />
        <button
          type="submit"
          disabled={isRacing || !prompt.trim()}
          style={{
            padding: '12px 20px',
            background: isRacing ? 'var(--border)' : 'var(--nvidia-green)',
            color: '#0a0a0b',
            border: 'none',
            borderRadius: 10,
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 600,
            cursor: isRacing ? 'default' : 'pointer',
            opacity: isRacing || !prompt.trim() ? 0.5 : 1,
          }}
        >
          {isRacing ? 'Racing...' : 'Race'}
        </button>
      </form>
    </div>
  )
}

function RaceColumn({ label, sublabel, accentColor, tokens, done, ttft, tps, isSimulated, model }) {
  const contentRef = useRef(null)

  // Auto-scroll to bottom as tokens stream
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight
    }
  }, [tokens])

  const tokenText = tokens.join('')

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header with accent line */}
      <div style={{ height: 2, background: accentColor }} />
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: accentColor,
          }}>
            {label}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-dim)',
            marginTop: 2,
          }}>
            {sublabel}
          </div>
        </div>
        {isSimulated && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-dim)',
            background: 'var(--bg-elevated)',
            padding: '2px 6px',
            borderRadius: 4,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Simulated
          </span>
        )}
      </div>

      {/* Token stream area */}
      <div
        ref={contentRef}
        style={{
          padding: '12px 16px',
          minHeight: 140,
          maxHeight: 200,
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        {tokens.length === 0 && !done && (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Waiting...
            <span style={{ animation: 'pulse-dot 1.5s infinite' }}> ●</span>
          </div>
        )}
        {/* Render colored tokens */}
        {tokens.map((token, i) => (
          <span
            key={i}
            style={{
              color: TOKEN_COLORS[i % TOKEN_COLORS.length],
              whiteSpace: 'pre-wrap',
            }}
          >
            {token}
          </span>
        ))}
        {tokens.length > 0 && !done && (
          <span style={{
            display: 'inline-block',
            width: 2,
            height: '1em',
            background: accentColor,
            marginLeft: 2,
            verticalAlign: 'text-bottom',
            animation: 'blink 1s step-end infinite',
          }} />
        )}
      </div>

      {/* Metrics bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-dim)',
      }}>
        <span>
          TTFT: {ttft !== null ? (
            <span style={{ color: accentColor, fontWeight: 600 }}>{ttft}ms</span>
          ) : '—'}
        </span>
        <span>
          {tps !== null ? (
            <span style={{ color: accentColor, fontWeight: 600 }}>{tps} tok/s</span>
          ) : '— tok/s'}
        </span>
        <span style={{ fontSize: 10 }}>{model}</span>
      </div>
    </div>
  )
}
