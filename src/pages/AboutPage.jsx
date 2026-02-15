import { motion } from 'framer-motion'
import Footer from '../components/Footer'

const sectionStyle = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: '24px',
  marginBottom: 16,
}

const headingStyle = {
  fontSize: 17,
  fontWeight: 600,
  color: 'var(--text-primary)',
  marginBottom: 12,
}

const bodyStyle = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.7,
}

export default function AboutPage() {
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
          About{' '}
          howaiworks<span style={{ color: 'var(--nvidia-green)' }}>.io</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.5,
        }}>
          Making AI education visceral and interactive.
        </p>
      </motion.div>

      {/* The Story */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={sectionStyle}
      >
        <div style={headingStyle}>The Story</div>
        <div style={bodyStyle}>
          <p style={{ marginBottom: 12 }}>
            During an NVIDIA Developer Livestream, Matt Feroz asked:
          </p>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(118,185,0,0.06)',
            border: '1px solid rgba(118,185,0,0.25)',
            borderRadius: 8,
            marginBottom: 12,
            fontStyle: 'italic',
            color: 'var(--text-primary)',
          }}>
            "Is AI literacy a hardware problem or a software education problem?"
          </div>
          <p style={{ marginBottom: 12 }}>
            NVIDIA's answer: DGX Spark solves the hardware side — 128GB of unified
            memory that can run 200B-parameter models on your desk.
          </p>
          <p>
            <strong style={{ color: 'var(--nvidia-green)' }}>howaiworks.io</strong> is
            the software side. Instead of reading about tokenization, embeddings, and
            inference — you experience them. Type text and watch it become tokens.
            See words organize by meaning. Race cloud vs. local inference. No slides,
            no lectures. Just the machine, made visible.
          </p>
        </div>
      </motion.div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '24px 0 40px',
      }} />

      <Footer />
    </div>
  )
}
