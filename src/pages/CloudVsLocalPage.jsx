import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LatencyRace from '../components/LatencyRace'
import TradeoffCards from '../components/TradeoffCards'
import DepthPanel from '../components/DepthPanel'
import NvidiaCloudCard from '../components/NvidiaCloudCard'
import SetupGuide from '../components/SetupGuide'
import Footer from '../components/Footer'
import { markLessonComplete } from '../components/Navbar'

export default function CloudVsLocalPage({ webllm }) {
  const [ollamaConnected, setOllamaConnected] = useState(false)
  const [nimConfig, setNimConfig] = useState(() => {
    const key = localStorage.getItem('nimApiKey')
    return key ? {
      apiKey: key,
      endpoint: 'https://integrate.api.nvidia.com/v1',
      modelId: 'nvidia/llama-3.3-nemotron-super-49b-v1'
    } : null
  })
  const [allTradeoffsExplored, setAllTradeoffsExplored] = useState(false)

  // Check Ollama
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    fetch(`${apiBase}/api/health`)
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
          onRaceComplete={() => {}}
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

      {/* Ollama Local Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        style={{ marginTop: 16 }}
      >
        <OllamaLocalCard connected={ollamaConnected} webllm={webllm} />
      </motion.div>

      {/* Trade-off Cards — always visible */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        style={{ marginTop: 32 }}
      >
        <TradeoffCards onAllExplored={() => setAllTradeoffsExplored(true)} />
      </motion.div>

      {/* DepthPanel — always visible */}
      <DepthPanel
        visible={true}
        delay={0.55}
        onOpen={() => { setHasViewedDepth(true); markLessonComplete('lesson-complete-run') }}
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
    model="nvidia/llama-3.3-nemotron-super-49b-v1",
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

function CopyableCommand({ command }) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <div
      onClick={handleCopy}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'var(--bg-deep)',
        border: `1px solid ${hovered ? 'var(--text-dim)' : 'var(--border)'}`,
        borderRadius: 6,
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
    >
      <code style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        <span style={{ color: 'var(--text-dim)' }}>$</span> {command}
      </code>
      <svg
        fill={copied ? 'var(--nvidia-green)' : hovered ? 'var(--text-secondary)' : 'var(--text-dim)'}
        width="14"
        height="14"
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, marginLeft: 12, transition: 'fill 0.2s' }}
      >
        <path d="M27.2,8.22H23.78V5.42A3.42,3.42,0,0,0,20.36,2H5.42A3.42,3.42,0,0,0,2,5.42V20.36a3.43,3.43,0,0,0,3.42,3.42h2.8V27.2A2.81,2.81,0,0,0,11,30H27.2A2.81,2.81,0,0,0,30,27.2V11A2.81,2.81,0,0,0,27.2,8.22ZM5.42,21.91a1.55,1.55,0,0,1-1.55-1.55V5.42A1.54,1.54,0,0,1,5.42,3.87H20.36a1.55,1.55,0,0,1,1.55,1.55v2.8H11A2.81,2.81,0,0,0,8.22,11V21.91ZM28.13,27.2a.93.93,0,0,1-.93.93H11a.93.93,0,0,1-.93-.93V11a.93.93,0,0,1,.93-.93H27.2a.93.93,0,0,1,.93.93Z" />
      </svg>
      {copied && (
        <span style={{
          position: 'absolute',
          right: 36,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--nvidia-green)',
        }}>
          Copied!
        </span>
      )}
    </div>
  )
}

function OllamaLocalCard({ connected, webllm }) {

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Top accent — NVIDIA green */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--nvidia-green), transparent)',
      }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}>
              Run locally with Ollama
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}>
              {connected
                ? 'Ollama is running — local inference active'
                : 'Run AI on your own machine, no internet needed'}
            </div>
          </div>
          {connected && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              background: 'rgba(118,185,0,0.1)',
              border: '1px solid rgba(118,185,0,0.25)',
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--nvidia-green)',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 8 }}>●</span>
              Connected
            </div>
          )}
        </div>

        {/* Educational IntroBlock */}
        <div style={{
          padding: '12px 16px',
          background: 'var(--bg-elevated)',
          borderLeft: '3px solid var(--nvidia-green)',
          borderRadius: '0 8px 8px 0',
          marginBottom: 16,
          fontSize: 13,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}>
          <strong style={{ color: 'var(--nvidia-green)' }}>Local inference</strong> runs the AI model directly
          on your computer — no internet, no API key, no data leaving your machine. The tradeoff: your hardware
          limits which models you can run. The 0.5B-parameter model here fits in ~1GB of RAM but is far smaller
          than cloud-scale models.
        </div>

        {/* Quick-start commands */}
        {!connected && (
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
              marginBottom: 8,
            }}>
              Quick start
            </div>
            <CopyableCommand command="ollama pull qwen2.5:0.5b" />
            <CopyableCommand command="ollama run qwen2.5:0.5b" />

            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <a
                href="https://ollama.com"
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
                Get Ollama
                <span style={{ fontSize: 12 }}>↗</span>
              </a>
              {webllm && (
                <button
                  onClick={() => { if (!webllm.isReady && webllm.load) webllm.load() }}
                  disabled={webllm.isReady || webllm.status === 'loading'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: 'transparent',
                    color: webllm.isReady ? 'var(--nvidia-green)' : '#6ec0e8',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                    borderRadius: 8,
                    border: `1px solid ${webllm.isReady ? 'rgba(118,185,0,0.4)' : 'rgba(110,192,232,0.4)'}`,
                    cursor: webllm.isReady || webllm.status === 'loading' ? 'default' : 'pointer',
                    opacity: webllm.status === 'loading' ? 0.6 : 1,
                    transition: 'border-color 0.2s',
                  }}
                >
                  {webllm.isReady
                    ? 'WebGPU model loaded'
                    : webllm.status === 'loading'
                    ? 'Loading WebGPU model...'
                    : "Can't install? Try WebGPU"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
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
