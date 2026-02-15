import { motion } from 'framer-motion'
import Footer from '../components/Footer'

const RESOURCES = [
  {
    href: 'https://bbycroft.net/llm',
    title: 'LLM Visualizer (Brendan Bycroft)',
    desc: '3D interactive walkthrough of a full transformer — see how tokens flow through embeddings, attention, and prediction step by step.',
  },
  {
    href: 'https://arxiv.org/abs/1508.07909',
    title: 'BPE Paper (Sennrich et al. 2016)',
    desc: 'The original paper that introduced Byte Pair Encoding for neural machine translation.',
  },
  {
    href: 'https://github.com/dqbd/tiktoken',
    title: 'js-tiktoken',
    desc: 'The client-side tokenizer library powering this demo — runs entirely in your browser.',
  },
  {
    href: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them',
    title: 'What Are Tokens?',
    desc: 'OpenAI\'s official explainer on tokens, counting, and how they affect pricing.',
  },
]

export default function ResourcesPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '56px 0 40px' }}
      >
        <h1 style={{
          fontSize: 'clamp(24px, 5vw, 38px)',
          fontWeight: 700,
          lineHeight: 1.2,
          marginBottom: 12,
          letterSpacing: -0.5,
        }}>
          Resources
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          Here are some more resources to go deeper.
        </p>
      </motion.div>

      {/* Resource list */}
      <motion.ul
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {RESOURCES.map((r) => (
          <li key={r.href} style={{
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
          }}>
            <a
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--nvidia-green)',
                fontSize: 15,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px' }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
            >
              {r.title} <span style={{ fontSize: 11, opacity: 0.6 }}>↗</span>
            </a>
            <div style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              marginTop: 4,
            }}>
              {r.desc}
            </div>
          </li>
        ))}
      </motion.ul>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '40px 0',
      }} />

      <Footer />
    </div>
  )
}
