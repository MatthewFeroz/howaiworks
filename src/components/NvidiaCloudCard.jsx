import { useState, useEffect } from 'react'

const MODEL_ID = 'nvidia/llama-3.3-nemotron-super-49b-v1'
const NIM_ENDPOINT = 'https://integrate.api.nvidia.com/v1'

export default function NvidiaCloudCard({ onConfigured }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('nimApiKey') || '')
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
          if (!apiKey) {
            onConfigured?.({ apiKey: '', modelId: MODEL_ID, endpoint: NIM_ENDPOINT, serverKey: true })
          }
        }
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    localStorage.setItem('nimApiKey', apiKey)
    setSaved(true)
    onConfigured?.({ apiKey, modelId: MODEL_ID, endpoint: NIM_ENDPOINT })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    localStorage.removeItem('nimApiKey')
    setApiKey('')
    if (serverKeyAvailable) {
      onConfigured?.({ apiKey: '', modelId: MODEL_ID, endpoint: NIM_ENDPOINT, serverKey: true })
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
      {/* Top accent — cloud blue for NIM */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, #6ec0e8, transparent)',
      }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 2,
          }}>
            NVIDIA NIM Cloud
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

        {/* Educational IntroBlock */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          borderLeft: '3px solid #6ec0e8',
          borderRadius: '0 8px 8px 0',
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: '#6ec0e8' }}>Cloud inference</strong> sends your prompt over the internet
          to a data center where clusters of GPUs run the model and stream the answer back. You get access
          to massive models (49B+ parameters) that would never fit on a laptop — but every request travels
          the network.
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

        {/* API key form — always visible when no server key */}
        {!serverKeyAvailable && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
              <a
                href="https://build.nvidia.com/explore/discover"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: '#6ec0e8',
                  textDecoration: 'none',
                }}
              >
                Get free API key ↗
              </a>
            </div>
          </div>
        )}
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
