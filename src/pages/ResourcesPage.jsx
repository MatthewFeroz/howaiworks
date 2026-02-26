import { motion } from 'framer-motion'
import Footer from '../components/Footer'

const TRUSTED_VOICES = [
  {
    name: 'Andrew Ng',
    role: 'Co-founder of Coursera, founder of DeepLearning.AI',
    photo: 'https://pbs.twimg.com/profile_images/1851634748498673664/Rjl5D4c0_400x400.jpg',
    desc: 'Stanford professor and former head of Google Brain. His free courses on machine learning and deep learning are the gold standard for getting started.',
    links: [
      { label: 'DeepLearning.AI', href: 'https://www.deeplearning.ai/' },
      { label: 'Coursera ML Course', href: 'https://www.coursera.org/learn/machine-learning' },
    ],
  },
  {
    name: 'Andrej Karpathy',
    role: 'Former Director of AI at Tesla, ex-OpenAI',
    photo: 'https://pbs.twimg.com/profile_images/1296667294148382721/9Pr6XrPB_400x400.jpg',
    desc: 'His "Neural Networks: Zero to Hero" YouTube series builds transformers from scratch — the best way to truly understand what\'s under the hood.',
    links: [
      { label: 'YouTube', href: 'https://www.youtube.com/@AndrejKarpathy' },
      { label: 'Zero to Hero', href: 'https://karpathy.ai/zero-to-hero.html' },
    ],
  },
  {
    name: '3Blue1Brown (Grant Sanderson)',
    role: 'Math & ML educator',
    photo: 'https://pbs.twimg.com/profile_images/1603443713498820608/KDaMR36Y_400x400.jpg',
    desc: 'Beautiful visual explanations of neural networks, transformers, and the math behind them. If you want to build intuition, start here.',
    links: [
      { label: 'YouTube', href: 'https://www.youtube.com/@3blue1brown' },
      { label: 'Neural Networks Series', href: 'https://www.3blue1brown.com/topics/neural-networks' },
    ],
  },
  {
    name: 'Yannic Kilcher',
    role: 'ML researcher & paper explainer',
    photo: 'https://pbs.twimg.com/profile_images/1612547532254187520/LmMVCkKN_400x400.jpg',
    desc: 'Deep, honest breakdowns of the latest AI papers. Great for understanding what\'s actually new vs. hype.',
    links: [
      { label: 'YouTube', href: 'https://www.youtube.com/@YannicKilcher' },
    ],
  },
  {
    name: 'Jeremy Howard',
    role: 'Co-founder of fast.ai',
    photo: 'https://pbs.twimg.com/profile_images/1550854978044698624/Rj2vTOiR_400x400.jpg',
    desc: 'Practical, top-down approach to deep learning. The fast.ai courses are free and designed for people who want to build things, not just study theory.',
    links: [
      { label: 'fast.ai', href: 'https://www.fast.ai/' },
      { label: 'Course', href: 'https://course.fast.ai/' },
    ],
  },
]

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

      {/* Trusted voices section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ marginTop: 48 }}
      >
        <h2 style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 6,
          letterSpacing: -0.3,
        }}>
          Trusted Voices in AI
        </h2>
        <p style={{
          fontSize: 14,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: 20,
        }}>
          People worth following — researchers and educators who explain AI with depth and honesty.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {TRUSTED_VOICES.map((v) => (
            <div key={v.name} style={{
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
            }}>
              <img
                src={v.photo}
                alt={v.name}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border)',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {v.name}
                </div>
                <div style={{
                  fontSize: 12,
                  color: 'var(--text-dim)',
                  marginTop: 2,
                  fontFamily: "'IBM Plex Mono', monospace",
                }}>
                  {v.role}
                </div>
                <div style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginTop: 8,
                }}>
                  {v.desc}
                </div>
                <div style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}>
                  {v.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13,
                        color: 'var(--nvidia-green)',
                        textDecoration: 'none',
                        fontWeight: 500,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px' }}
                      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none' }}
                    >
                      {l.label} <span style={{ fontSize: 11, opacity: 0.6 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '40px 0',
      }} />

      <Footer />
    </div>
  )
}
