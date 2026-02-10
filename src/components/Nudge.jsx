import { motion } from 'framer-motion'

export default function Nudge({ icon, children, onClick, delay = 0 }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'border-color 0.3s, color 0.3s, background 0.3s',
        textAlign: 'left',
        width: 'fit-content',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--nvidia-green)'
        e.currentTarget.style.color = 'var(--text-primary)'
        e.currentTarget.style.background = 'var(--nvidia-green-dim)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-secondary)'
        e.currentTarget.style.background = 'var(--bg-surface)'
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span>{children}</span>
    </motion.button>
  )
}
