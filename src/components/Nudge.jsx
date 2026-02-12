import { motion, AnimatePresence } from 'framer-motion'

export default function Nudge({ icon, children, onClick, delay = 0, explored = false, active = false, insightContent }) {
  return (
    <motion.div
      layout="position"
      style={{
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${active ? 'var(--nvidia-green)' : explored ? 'rgba(118,185,0,0.3)' : 'var(--border)'}`,
        background: active ? 'var(--nvidia-green-dim)' : 'var(--bg-surface)',
        transition: 'border-color 0.3s, background 0.3s',
        width: '100%',
      }}
    >
      {/* Clickable header */}
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'transparent',
          border: 'none',
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          color: active ? 'var(--text-primary)' : explored ? 'var(--text-dim)' : 'var(--text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
          width: '100%',
          transition: 'color 0.3s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.parentElement.style.borderColor = 'var(--nvidia-green)'
          e.currentTarget.parentElement.style.background = 'var(--nvidia-green-dim)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = active ? 'var(--text-primary)' : explored ? 'var(--text-dim)' : 'var(--text-secondary)'
          e.currentTarget.parentElement.style.borderColor = active ? 'var(--nvidia-green)' : explored ? 'rgba(118,185,0,0.3)' : 'var(--border)'
          e.currentTarget.parentElement.style.background = active ? 'var(--nvidia-green-dim)' : 'var(--bg-surface)'
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0 }}>
          {explored && !active ? '✓' : icon}
        </span>
        <span style={{ flex: 1 }}>{children}</span>
        <motion.span
          animate={{ rotate: active ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{
            fontSize: 12,
            color: active ? 'var(--nvidia-green)' : 'var(--text-dim)',
            flexShrink: 0,
            marginLeft: 8,
          }}
        >
          ▼
        </motion.span>
      </button>

      {/* Expandable insight content */}
      <AnimatePresence initial={false}>
        {active && insightContent && (
          <motion.div
            key="insight"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }, opacity: { duration: 0.25, delay: 0.05 } }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 16px 14px',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--text-secondary)',
              borderTop: '1px solid rgba(118, 185, 0, 0.12)',
              marginTop: 0,
              paddingTop: 12,
            }}>
              {insightContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
