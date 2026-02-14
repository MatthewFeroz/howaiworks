import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NvidiaCloudCard({ onConfigured }) {
  const [showSetup, setShowSetup] = useState(false)
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nimApiKey') || '')
  const [modelId, setModelId] = useState(() => localStorage.getItem('nimModel') || 'nvidia/llama-3.1-nemotron-70b-instruct')
  const [nimEndpoint, setNimEndpoint] = useState(() => localStorage.getItem('nimEndpoint') || 'https://integrate.api.nvidia.com/v1')
  const [saved, setSaved] = useState(false)
  const [serverKeyAvailable, setServerKeyAvailable] = useState(false)

  // Check if server has a NIM key configured
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/cloud-status`)
      .then(r => r.json())
      .then(data => {
        if (data.serverKeyConfigured) {
          setServerKeyAvailable(true)
          // Auto-notify parent that cloud is available via server key
          if (!apiKey) {
            onConfigured?.({ apiKey: '', modelId, endpoint: nimEndpoint, serverKey: true })
          }
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    localStorage.setItem('nimApiKey', apiKey)
    localStorage.setItem('nimModel', modelId)
    localStorage.setItem('nimEndpoint', nimEndpoint)
    setSaved(true)
    onConfigured?.({ apiKey, modelId, endpoint: nimEndpoint })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('nimApiKey')
    localStorage.removeItem('nimModel')
    localStorage.removeItem('nimEndpoint')
    setApiKey('')
    setModelId('nvidia/llama-3.1-nemotron-70b-instruct')
    setNimEndpoint('https://integrate.api.nvidia.com/v1')
    // If server key is available, still report as configured
    if (serverKeyAvailable) {
      onConfigured?.({ apiKey: '', modelId: 'nvidia/llama-3.1-nemotron-70b-instruct', endpoint: 'https://integrate.api.nvidia.com/v1', serverKey: true })
    } else {
      onConfigured?.(null)
    }
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Top accent — NVIDIA green for NIM */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--nvidia-green), transparent)',
      }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--nvidia-green-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}>
            ⚡
          </div>
          <div>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}>
              Race with NVIDIA NIM
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              {serverKeyAvailable
                ? 'Cloud inference is ready — NVIDIA NIM API configured on server'
                : 'Get 10K free requests from NVIDIA\'s cloud inference API'}
            </div>
          </div>
        </div>

        {/* Server key status badge */}
        {serverKeyAvailable && !apiKey && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: 'rgba(118,185,0,0.1)',
            border: '1px solid rgba(118,185,0,0.25)',
            borderRadius: 6,
            marginBottom: 12,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--nvidia-green)',
          }}>
            <span style={{ fontSize: 8 }}>●</span>
            Connected via server API key
          </div>
        )}

        {/* Get API Key link */}
        {!serverKeyAvailable && (
          <a
            href="https://build.nvidia.com/explore/discover"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'var(--nvidia-green)',
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
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(118,185,0,0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Get free API key
            <span style={{ fontSize: 12 }}>↗</span>
          </a>
        )}

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
            color: showSetup ? 'var(--nvidia-green)' : 'var(--text-dim)',
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
          {apiKey ? 'API Key Configured' : 'Paste your own API key'}
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
                    Model
                  </label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%238a8a96' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '36px',
                    }}
                  >
                    <option value="nvidia/llama-3.1-nemotron-70b-instruct">nvidia/llama-3.1-nemotron-70b-instruct</option>
                    <option value="meta/llama-3.1-8b-instruct">meta/llama-3.1-8b-instruct</option>
                    <option value="meta/llama-3.1-70b-instruct">meta/llama-3.1-70b-instruct</option>
                    <option value="mistralai/mistral-7b-instruct-v0.3">mistralai/mistral-7b-instruct-v0.3</option>
                    <option value="mistralai/mixtral-8x7b-instruct-v0.1">mistralai/mixtral-8x7b-instruct-v0.1</option>
                    <option value="google/gemma-2-9b-it">google/gemma-2-9b-it</option>
                    <option value="microsoft/phi-3-mini-128k-instruct">microsoft/phi-3-mini-128k-instruct</option>
                  </select>
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
                    placeholder="nvapi-..."
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--nvidia-green)',
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
