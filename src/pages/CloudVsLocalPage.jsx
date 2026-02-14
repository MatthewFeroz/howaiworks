import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LatencyRace from '../components/LatencyRace'
import TradeoffCards from '../components/TradeoffCards'
import DepthPanel from '../components/DepthPanel'
import NvidiaCloudCard from '../components/NvidiaCloudCard'
import SetupGuide from '../components/SetupGuide'
import Footer from '../components/Footer'

export default function CloudVsLocalPage({ webllm }) {
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [nimConfig, setNimConfig] = useState(() => {
    const key = localStorage.getItem('nimApiKey')
    const endpoint = localStorage.getItem('nimEndpoint')
    const model = localStorage.getItem('nimModel')
    return key && endpoint ? { apiKey: key, endpoint, modelId: model } : null
  })
  const [raceComplete, setRaceComplete] = useState(false)
  const [allTradeoffsExplored, setAllTradeoffsExplored] = useState(false)
  const [hasViewedDepth, setHasViewedDepth] = useState(false)

  // Mark page as visited
  useEffect(() => {
    localStorage.setItem('visitedPageTwo', 'true')
    localStorage.setItem('visitedPageThree', 'true')
  }, [])

  // Check Ollama
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(data => setOllamaConnected(data.ollama === true))
      .catch(() => setOllamaConnected(false))
  }, [])

  const localInferenceMode = ollamaConnected ? 'ollama' : webllm?.isReady ? 'webllm' : 'simulated'

  const handleNimConfigured = useCallback((config) => {
    setNimConfig(config)
  }, [])

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Page indicator dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 8,
        padding: '24px 0 0',
      }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--border)', transition: 'background 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--nvidia-green)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border)'}
          />
        </Link>
        <Link to="/understand" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--border)', transition: 'background 0.2s', cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--nvidia-green)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border)'}
          />
        </Link>
        <div style={{
          width: 8, height: 8, borderRadius: '50%',
          background: 'var(--nvidia-green)',
        }} />
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '48px 0 32px' }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 38px)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}>
          The same AI.{' '}
          <span style={{ color: 'var(--nvidia-green)' }}>Two very different machines.</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: 440,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          <span style={{ color: '#6ec0e8' }}>Cloud</span>: a GPU cluster in a data center.{' '}
          <span style={{ color: 'var(--nvidia-green)' }}>Local</span>: your own computer. Watch them race.
        </p>
      </motion.div>

      {/* Setup Guide — shows when backends are disconnected */}
      <SetupGuide
        cloudConnected={!!nimConfig}
        localConnected={ollamaConnected}
        webllm={webllm}
        localInferenceMode={localInferenceMode}
      />

      {/* WebLLM progress bar */}
      <AnimatePresence>
        {webllm?.status === 'loading' && (
          <WebLLMProgressBar progress={webllm.progress} />
        )}
      </AnimatePresence>

      {/* Latency Race */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <LatencyRace
          ollamaConnected={ollamaConnected}
          nimConfig={nimConfig}
          onRaceComplete={() => setRaceComplete(true)}
          webllm={webllm}
          localInferenceMode={localInferenceMode}
        />
      </motion.div>

      {/* NVIDIA NIM Cloud Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        style={{ marginTop: 24 }}
      >
        <NvidiaCloudCard onConfigured={handleNimConfigured} />
      </motion.div>

      {/* Trade-off Cards — appear after first race */}
      <AnimatePresence>
        {raceComplete && (
          <motion.div
            key="tradeoffs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ marginTop: 32 }}
          >
            <TradeoffCards onAllExplored={() => setAllTradeoffsExplored(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* DepthPanel */}
      <DepthPanel
        visible={allTradeoffsExplored}
        delay={0.5}
        onOpen={() => setHasViewedDepth(true)}
        sections={[
          {
            label: 'The Concept',
            color: 'var(--nvidia-green)',
            defaultOpen: true,
            content: (
              <div>
                <p style={{ marginBottom: 16 }}>
                  <strong style={{ color: 'var(--nvidia-green)', fontSize: 15 }}>The inference pipeline</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  When you send a prompt to an AI model, here's what happens in the GPU:
                </p>
                <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                  <InferenceStep step={1} title="Tokenize">
                    Your text is split into tokens (you saw this on Page 1). This happens on the CPU — fast, no GPU needed.
                  </InferenceStep>
                  <InferenceStep step={2} title="Embed">
                    Token IDs are converted to embedding vectors (Page 2). The embedding table lives in GPU memory.
                  </InferenceStep>
                  <InferenceStep step={3} title="Forward pass">
                    Embeddings flow through dozens of transformer layers. Each layer has attention heads and feed-forward
                    networks — billions of matrix multiplications. This is where the GPU earns its paycheck.
                  </InferenceStep>
                  <InferenceStep step={4} title="Sample next token">
                    The model outputs a probability distribution over all ~100K tokens. We sample from it to pick the next token.
                    Then repeat from step 2 with the new token appended.
                  </InferenceStep>
                </div>

                <p style={{ marginBottom: 16 }}>
                  <strong style={{ color: 'var(--nvidia-green)', fontSize: 15 }}>GPU memory is the bottleneck</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  A model's parameters must all fit in GPU VRAM. At FP16 (2 bytes per parameter):
                </p>
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(118,185,0,0.06)',
                  border: '1px solid rgba(118,185,0,0.25)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  marginBottom: 12,
                }}>
                  <div>0.5B params × 2 bytes = <strong style={{ color: 'var(--nvidia-green)' }}>1 GB</strong> (runs on a Chromebook)</div>
                  <div>8B params × 2 bytes = <strong style={{ color: '#6ec0e8' }}>16 GB</strong> (needs a gaming GPU)</div>
                  <div>70B params × 2 bytes = <strong style={{ color: '#e8956e' }}>140 GB</strong> (needs 2× A100 80GB)</div>
                </div>
                <p>
                  <strong style={{ color: 'var(--text-primary)' }}>Quantization</strong> reduces this: 4-bit quantization
                  means each parameter uses 0.5 bytes instead of 2. A 70B model drops from 140GB to ~35GB — fitting
                  on a single A100 or a high-end consumer GPU. The tradeoff: slight accuracy loss.
                </p>
              </div>
            ),
          },
          {
            label: 'The Code',
            color: '#6ec0e8',
            defaultOpen: false,
            content: (
              <pre style={{
                background: 'var(--bg-deep)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '16px',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                lineHeight: 1.6,
                overflowX: 'auto',
                whiteSpace: 'pre',
                color: 'var(--text-secondary)',
              }}>
{`# Cloud inference (NVIDIA NIM API)
import openai

client = openai.OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="nvapi-your-key-here"
)

response = client.chat.completions.create(
    model="nvidia/llama-3.1-nemotron-70b-instruct",
    messages=[{"role": "user", "content": "What is AI?"}],
    stream=True
)

for chunk in response:
    token = chunk.choices[0].delta.content
    if token:
        print(token, end="", flush=True)

# ── Same interface, different infrastructure ──────
# Local inference (Ollama — runs on your machine)
client = openai.OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # Ollama doesn't need a real key
)

response = client.chat.completions.create(
    model="qwen2.5:0.5b",
    messages=[{"role": "user", "content": "What is AI?"}],
    stream=True
)

for chunk in response:
    token = chunk.choices[0].delta.content
    if token:
        print(token, end="", flush=True)`}
              </pre>
            ),
          },
          {
            label: 'Challenge',
            color: '#e8d06e',
            defaultOpen: false,
            content: (
              <div>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Think about it:</strong>
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>1.</strong> If an A100 has 80GB VRAM and each FP16
                  parameter is 2 bytes, what's the largest model it can hold? What about at 4-bit quantization?
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>2.</strong> NVIDIA's DGX Spark has 128GB of unified memory.
                  How does this change what models can run locally?
                </p>
                <p style={{ paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>3.</strong> Why does cloud have higher time-to-first-token
                  but faster tokens-per-second? What would change if you were on the same network as the GPU cluster?
                </p>
              </div>
            ),
          },
          {
            label: 'Real World',
            color: '#e87a96',
            defaultOpen: false,
            content: (
              <div>
                <p style={{ marginBottom: 14 }}>
                  The cloud vs. local choice isn't just technical — it shapes entire industries.
                </p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #e87a96' }}>
                    <strong style={{ color: '#e87a96' }}>Healthcare (local wins)</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Hospitals use local AI to analyze patient records. HIPAA requires data stays on-premises.
                      A patient's medical history should never traverse the internet to reach a cloud GPU.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #6ec0e8' }}>
                    <strong style={{ color: '#6ec0e8' }}>Startups (cloud wins)</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      A startup serving 1M users can't buy 100 A100s on day one. Cloud lets them scale
                      GPU usage up and down with demand — paying only for what they use.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid var(--nvidia-green)' }}>
                    <strong style={{ color: 'var(--nvidia-green)' }}>NVIDIA DGX Spark (bridging the gap)</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      128GB unified memory. Runs 200B-parameter models locally. This is NVIDIA's answer to
                      "what if you could have cloud-scale AI on your desk?" It collapses the trade-off
                      between capability and privacy.
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
        ]}
      />

      {/* Divider */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '40px 0',
      }} />

      <Footer />

      {/* Animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function WebLLMProgressBar({ progress }) {
  const pct = Math.round((progress.progress || 0) * 100)
  return (
    <motion.div
      key="webllm-progress"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      style={{ overflow: 'hidden', marginBottom: 16 }}
    >
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '12px 16px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--nvidia-green)',
            fontWeight: 600,
          }}>
            Loading AI in your browser...
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}>
            {pct}%
          </span>
        </div>
        <div style={{
          height: 4,
          background: 'var(--bg-elevated)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'var(--nvidia-green)',
              borderRadius: 2,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-dim)',
          marginTop: 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {progress.text || 'Preparing WebGPU...'}
        </div>
      </div>
    </motion.div>
  )
}

function InferenceStep({ step, title, children }) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: 8,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'var(--nvidia-green-dim)',
        color: 'var(--nvidia-green)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{title}</strong>
        <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
