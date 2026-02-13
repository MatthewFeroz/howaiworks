import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BrevDeployCard({ onConfigured }) {
  const [showSetup, setShowSetup] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('brevApiKey') || '')
  const [modelId, setModelId] = useState(() => localStorage.getItem('brevModelId') || 'meta-llama/Llama-3.1-8B-Instruct')
  const [brevEndpoint, setBrevEndpoint] = useState(() => localStorage.getItem('brevEndpoint') || '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    localStorage.setItem('brevApiKey', apiKey)
    localStorage.setItem('brevModelId', modelId)
    localStorage.setItem('brevEndpoint', brevEndpoint)
    setSaved(true)
    onConfigured?.({ apiKey, modelId, endpoint: brevEndpoint })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('brevApiKey')
    localStorage.removeItem('brevModelId')
    localStorage.removeItem('brevEndpoint')
    setApiKey('')
    setModelId('meta-llama/Llama-3.1-8B-Instruct')
    setBrevEndpoint('')
    onConfigured?.(null)
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Top accent — blue for cloud */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, #6ec0e8, transparent)',
      }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Deploy CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(110, 192, 232, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            ☁️
          </div>
          <div>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}>
              Race with a real cloud GPU
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              Deploy on Brev.dev (NVIDIA A100) and see real cloud latency
            </div>
          </div>
        </div>

        {/* Deploy button */}
        <a
          href="https://brev.nvidia.com/environment/new/public?gpu=A100"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            background: '#6ec0e8',
            color: '#0a0a0b',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            borderRadius: 8,
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            marginBottom: 12,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 192, 232, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          Deploy with Brev
          <span style={{ fontSize: 12 }}>↗</span>
        </a>

        {/* Setup toggle */}
        <button
          onClick={() => setShowSetup(o => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            padding: '8px 0',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: showSetup ? '#6ec0e8' : 'var(--text-dim)',
            transition: 'color 0.2s',
          }}
        >
          <motion.span
            animate={{ rotate: showSetup ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block', fontSize: 10 }}
          >
            ▶
          </motion.span>
          {apiKey ? 'API Key Configured' : 'Configure API Key'}
        </button>

        {/* Setup form */}
        <AnimatePresence initial={false}>
          {showSetup && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: '12px 0 4px',
              }}>
                <div>
                  <label style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                    display: 'block',
                  }}>
                    Brev Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={brevEndpoint}
                    onChange={(e) => setBrevEndpoint(e.target.value)}
                    placeholder="https://your-deployment.brev.dev/v1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                    display: 'block',
                  }}>
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                    display: 'block',
                  }}>
                    Model ID
                  </label>
                  <input
                    type="text"
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    placeholder="meta-llama/Llama-3.1-8B-Instruct"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 16px',
                      background: '#6ec0e8',
                      color: '#0a0a0b',
                      border: 'none',
                      borderRadius: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {saved ? 'Saved!' : 'Save'}
                  </button>
                  {apiKey && (
                    <button
                      onClick={handleClear}
                      style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        color: 'var(--text-dim)',
                        border: '1px solid var(--border)',
                        borderRadius: 6,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  background: 'var(--bg-deep)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  outline: 'none',
}
