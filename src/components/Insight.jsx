import { motion } from 'framer-motion'

export default function Insight({ children, visible }) {
  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: 'linear-gradient(135deg, var(--nvidia-green-dim), transparent)',
        border: '1px solid rgba(118, 185, 0, 0.15)',
        borderRadius: 12,
        padding: '20px 24px',
        margin: '24px 0',
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
      }}
    >
      {children}
    </motion.div>
  )
}
