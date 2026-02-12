import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ChatArea from '../components/ChatArea'
import ChatInput from '../components/ChatInput'
import GPUStats from '../components/GPUStats'
import OllamaStatus from '../components/OllamaStatus'
import { DEMO_CONVERSATIONS, simulateTokenStream } from '../components/DemoReplay'
import Footer from '../components/Footer'

const MODEL = 'qwen2.5:0.5b'

export default function RunLocalPage() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [gpuInfo, setGpuInfo] = useState(null)
  const [demoIndex, setDemoIndex] = useState(0)
  const cancelRef = useRef(null)

  // Check Ollama connection on mount
  const checkOllama = useCallback(async () => {
    try {
      const res = await fetch('/api/health')
      const data = await res.json()
      setOllamaConnected(data.ollama === true)
    } catch {
      setOllamaConnected(false)
    }
  }, [])

  // Fetch GPU info
  useEffect(() => {
    checkOllama()
    fetch('/api/gpu-info')
      .then(r => r.json())
      .then(setGpuInfo)
      .catch(() => setGpuInfo(null))
  }, [checkOllama])

  // Send message (live or demo mode)
  const handleSend = useCallback(async (text) => {
    // Add user message
    const userMsg = { role: 'user', content: text, tokens: null }
    setMessages(prev => [...prev, userMsg])
    setIsStreaming(true)

    if (ollamaConnected) {
      // Live mode: stream from Ollama via backend
      try {
        const allMessages = [...messages, userMsg].map(m => ({
          role: m.role,
          content: m.content,
        }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: allMessages, model: MODEL }),
        })

        if (!res.ok) throw new Error('Chat request failed')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        const streamTokens = []

        // Add empty AI message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '',
          tokens: [],
          isStreaming: true,
        }])

        let buffer = ''
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
                streamTokens.push(token)
                setMessages(prev => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + token,
                    tokens: [...streamTokens],
                    isStreaming: true,
                  }
                  return updated
                })
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        // Mark stream as done
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            isStreaming: false,
          }
          return updated
        })
      } catch (err) {
        console.error('Chat error:', err)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Connection lost. Check that Ollama is running.',
          tokens: null,
          isStreaming: false,
        }])
      }
    } else {
      // Demo mode: find matching demo or use round-robin
      const demo = DEMO_CONVERSATIONS[demoIndex % DEMO_CONVERSATIONS.length]
      setDemoIndex(prev => prev + 1)

      const streamTokens = []

      // Add empty AI message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        tokens: [],
        isStreaming: true,
      }])

      // Simulate streaming
      const cancel = simulateTokenStream(
        demo.response,
        (token) => {
          streamTokens.push(token)
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            updated[updated.length - 1] = {
              ...last,
              content: last.content + token,
              tokens: [...streamTokens],
              isStreaming: true,
            }
            return updated
          })
        },
        () => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              isStreaming: false,
            }
            return updated
          })
          setIsStreaming(false)
        }
      )
      cancelRef.current = cancel
      return // isStreaming is handled by the callback
    }

    setIsStreaming(false)
  }, [ollamaConnected, messages, demoIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current()
    }
  }, [])

  // Demo mode suggested prompts
  const suggestedPrompts = DEMO_CONVERSATIONS.map(d => d.prompt)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Back link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ padding: '20px 0 0' }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--text-dim)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--nvidia-green)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
        >
          <span>←</span> Back to How AI Works
        </Link>
      </motion.div>

      {/* Page indicator dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '16px 0 0',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--border)',
            transition: 'background 0.2s',
          }} />
        </Link>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--nvidia-green)',
        }} />
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '48px 0 32px',
        }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 38px)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}>
          This AI is running on <span style={{ color: 'var(--nvidia-green)' }}>your computer.</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: 400,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          No cloud. No API key. Just your machine.
        </p>
      </motion.div>

      {/* Ollama status banner */}
      <OllamaStatus connected={ollamaConnected} onRetry={checkOllama} />

      {/* Chat area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '8px 16px 16px',
          marginBottom: 16,
        }}
      >
        <ChatArea messages={messages} />
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={!ollamaConnected ? 'Type anything — demo responses will stream...' : 'Type a message...'}
        />
      </motion.div>

      {/* Suggested prompts (demo mode) */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 20,
          }}
        >
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isStreaming}
              style={{
                padding: '8px 14px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                cursor: isStreaming ? 'default' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
                opacity: isStreaming ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isStreaming) {
                  e.currentTarget.style.borderColor = 'var(--nvidia-green)'
                  e.currentTarget.style.color = 'var(--nvidia-green)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              {prompt}
            </button>
          ))}
        </motion.div>
      )}

      {/* Hardware Stats */}
      <div style={{ marginBottom: 20 }}>
        <GPUStats
          model={MODEL}
          gpuInfo={gpuInfo}
          ollamaConnected={ollamaConnected}
        />
      </div>

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
            href="https://ollama.com"
            title="Ollama"
            desc="Download & run LLMs locally"
          />
          <ResourceLink
            href="https://www.nvidia.com/en-us/products/workstations/dgx-spark/"
            title="NVIDIA DGX Spark"
            desc="Personal AI supercomputer"
          />
          <ResourceLink
            href="https://huggingface.co/models"
            title="Hugging Face Hub"
            desc="Browse open-source models"
          />
          <ResourceLink
            href="https://ollama.com/blog/run-llama-locally"
            title="Run LLMs Locally"
            desc="Step-by-step guide"
          />
        </div>
      </div>

      <Footer />

      {/* Blink animation for streaming cursor */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
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
