import { motion } from 'framer-motion'

export default function OllamaStatus({ connected, onRetry }) {
  if (connected) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '10px 16px',
        background: 'rgba(239, 71, 111, 0.08)',
        border: '1px solid rgba(239, 71, 111, 0.2)',
        borderRadius: 10,
        fontSize: 13,
        color: 'var(--text-secondary)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          padding: '2px 8px',
          background: 'rgba(239, 71, 111, 0.15)',
          borderRadius: 4,
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: '#ef476f',
          letterSpacing: 0.5,
        }}>
          DEMO
        </span>
        <span>
          Pre-recorded responses — <a
            href="https://ollama.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--nvidia-green)', textDecoration: 'underline', textUnderlineOffset: 2 }}
          >install Ollama</a> to chat live
        </span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-dim)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}
        >
          Retry
        </button>
      )}
    </motion.div>
  )
}
