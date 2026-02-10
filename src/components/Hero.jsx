import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        textAlign: 'center',
        padding: '80px 0 40px',
      }}
    >
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 700,
        lineHeight: 1.15,
        marginBottom: 16,
        letterSpacing: -0.5,
      }}>
        What does AI{' '}
        <span style={{ color: 'var(--nvidia-green)' }}>actually see?</span>
      </h1>

      <p style={{
        fontSize: 18,
        color: 'var(--text-secondary)',
        fontWeight: 300,
        maxWidth: 520,
        margin: '0 auto',
        lineHeight: 1.6,
      }}>
        Type anything. Watch how an AI breaks down your words into something completely different.
      </p>
    </motion.div>
  )
}
