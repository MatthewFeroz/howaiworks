import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        textAlign: 'center',
        padding: '48px 0 32px',
      }}
    >
      <h1 style={{
        fontSize: 'clamp(28px, 5vw, 42px)',
        fontWeight: 700,
        lineHeight: 1.2,
        marginBottom: 12,
        letterSpacing: -0.5,
      }}>
        AI doesn't read words. It reads <span style={{ color: 'var(--nvidia-green)' }}>numbers.</span>
      </h1>

      <p style={{
        fontSize: 17,
        color: 'var(--text-secondary)',
        fontWeight: 400,
        maxWidth: 420,
        margin: '0 auto',
        lineHeight: 1.5,
      }}>
        Before AI can do anything with your text, it has to break it into smaller pieces called tokens.
        Type below and see exactly how.
      </p>
    </motion.div>
  )
}
