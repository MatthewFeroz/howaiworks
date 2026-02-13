import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function IntroBlock({ accent, children }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      borderLeft: `3px solid ${accent}`,
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 13,
      lineHeight: 1.7,
      color: 'var(--text-secondary)',
      marginBottom: 12,
    }}>
      {children}
    </div>
  )
}

function SetupStep({ step, accent, title, children }) {
  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '8px 0',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: `${accent}20`,
        color: accent,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        marginTop: 1,
      }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 4,
          }}>
            {title}
          </div>
        )}
        <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SetupSection({ title, accent, connected, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      borderTop: '1px solid var(--border)',
    }}>
      <button
        onClick={() => !connected && setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: connected ? 'default' : 'pointer',
          textAlign: 'left',
        }}
      >
        {connected ? (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(118,185,0,0.15)',
            color: 'var(--nvidia-green)',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}>
            ✓
          </span>
        ) : (
          <span style={{
            color: accent,
            fontSize: 14,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            lineHeight: 1,
          }}>
            ▸
          </span>
        )}
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: connected ? 'var(--nvidia-green)' : accent,
        }}>
          {title}
        </span>
        {connected && (
          <span style={{
            fontSize: 11,
            color: 'var(--text-dim)',
            marginLeft: 4,
          }}>
            Connected
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && !connected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 0 16px 0' }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const codeStyle = (accent) => ({
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  background: `${accent}18`,
  padding: '1px 5px',
  borderRadius: 4,
})

const cloudAccent = '#6ec0e8'
const localAccent = 'var(--nvidia-green)'

function CloudSteps() {
  const code = codeStyle('rgba(110,192,232,0.4)')
  return (
    <>
      <IntroBlock accent={cloudAccent}>
        NVIDIA NIM is a cloud inference API. Your prompt travels over the internet to a data center with clusters of A100 and H100 GPUs, runs through a 70-billion-parameter model called Nemotron, and streams the answer back token by token. It's the same infrastructure behind production AI services — and NVIDIA gives you 1,000 free API calls to try it.
      </IntroBlock>

      <SetupStep step={1} accent={cloudAccent} title="Create an NVIDIA account">
        Go to{' '}
        <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer"
          style={{ color: cloudAccent, textDecoration: 'underline' }}>
          build.nvidia.com
        </a>. The free tier gives you access to dozens of models without a credit card.
      </SetupStep>

      <SetupStep step={2} accent={cloudAccent} title="Pick a model">
        We use <code style={code}>nemotron-70b-instruct</code>, a 70-billion-parameter model NVIDIA trained for instruction following. At FP16 that's 140GB of weights — too large for any consumer GPU. That's why cloud exists.
      </SetupStep>

      <SetupStep step={3} accent={cloudAccent} title="Generate an API key">
        Your key starts with <code style={code}>nvapi-</code>. This authenticates your requests so NVIDIA can track your free-tier usage.
      </SetupStep>

      <SetupStep step={4} accent={cloudAccent} title="Paste it below">
        After your first race, an NVIDIA Cloud card appears further down this page. Paste your key there. It stays in your browser — never touches any server.
      </SetupStep>

      <SetupStep step={5} accent={cloudAccent} title="Or set an env var">
        Running the backend? Set <code style={code}>NVIDIA_NIM_KEY</code> in <code style={code}>.env</code>. The server picks it up automatically.
      </SetupStep>
    </>
  )
}

function LocalSteps() {
  const code = codeStyle('rgba(118,185,0,0.3)')
  return (
    <>
      <IntroBlock accent="#76B900">
        Ollama runs AI models directly on your machine — no internet, no API key, no data leaving your computer. The model we use here is Qwen 2.5 with 500 million parameters, small enough to fit in ~1GB of RAM. It won't match cloud quality (500M vs 70B parameters), but inference starts instantly and your prompts stay private. That's the trade-off this page lets you feel.
      </IntroBlock>

      <SetupStep step={1} accent={localAccent} title="Install Ollama">
        Download from{' '}
        <a href="https://ollama.com" target="_blank" rel="noopener noreferrer"
          style={{ color: 'var(--nvidia-green)', textDecoration: 'underline' }}>
          ollama.com
        </a>. It's a runtime that manages AI models on your machine — download, load, and serve them through a local API, similar to how Docker manages containers.
      </SetupStep>

      <SetupStep step={2} accent={localAccent} title="Pull a model">
        Run <code style={code}>ollama pull qwen2.5:0.5b</code>. This downloads the model weights (~400MB) — the learned parameters that encode everything the model knows. "Pulling" is like pulling a Docker image: download once, run many times.
      </SetupStep>

      <SetupStep step={3} accent={localAccent} title="Verify it works">
        Run <code style={code}>ollama run qwen2.5:0.5b</code> and type a question. If it responds, the model is loaded. Press Ctrl+D to exit.
      </SetupStep>

      <SetupStep step={4} accent={localAccent} title="Install the Python backend">
        Run <code style={code}>pip install fastapi uvicorn httpx tiktoken</code>. This installs the server that bridges Ollama's local API to this website's frontend.
      </SetupStep>

      <SetupStep step={5} accent={localAccent} title="Start the server">
        Run <code style={code}>uvicorn main:app --port 8000</code>. This launches the FastAPI backend at localhost:8000. The frontend's dev server proxies <code style={code}>/api</code> requests there.
      </SetupStep>

      <SetupStep step={6} accent={localAccent} title="Refresh this page">
        The "Simulated" badge disappears from the Local column. You're running real inference on your own hardware.
      </SetupStep>
    </>
  )
}

export default function SetupGuide({ cloudConnected, localConnected, webllm, localInferenceMode }) {
  const localActive = localConnected || localInferenceMode === 'webllm'

  if (cloudConnected && localActive) return null

  const bothDisconnected = !cloudConnected && !localActive

  const localTitle = localActive
    ? 'Local — Running in Browser (WebGPU)'
    : webllm?.status === 'loading'
      ? 'Connect Local — Loading in browser...'
      : 'Connect Local — Ollama'

  return (
    <AnimatePresence>
      <motion.div
        key="setup-guide"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.35 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Top accent line */}
          <div style={{
            height: 2,
            background: 'linear-gradient(90deg, transparent, #e8d06e, transparent)',
          }} />

          {/* Header */}
          <div style={{ padding: '14px 16px 8px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 13 }}>⚡</span>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: '#e8d06e',
              }}>
                Setup Guide
              </span>
            </div>
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              margin: 0,
            }}>
              {bothDisconnected
                ? 'Both sides are simulated — connect real backends to see the difference.'
                : cloudConnected
                  ? 'Local side is simulated — connect Ollama to run AI on your machine.'
                  : localActive
                    ? 'Cloud side is simulated — add an NVIDIA NIM key to use real cloud inference.'
                    : 'Cloud side is simulated — add an NVIDIA NIM key to use real cloud inference.'
              }
            </p>
          </div>

          {/* Sections */}
          <div style={{ padding: '0 16px 8px' }}>
            <SetupSection
              title="Connect Cloud — NVIDIA NIM"
              accent={cloudAccent}
              connected={cloudConnected}
            >
              <CloudSteps />
            </SetupSection>

            <SetupSection
              title={localTitle}
              accent={localAccent}
              connected={localActive}
            >
              <LocalSteps />
            </SetupSection>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
