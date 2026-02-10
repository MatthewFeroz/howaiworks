import { motion } from 'framer-motion'

export default function TokenBlock({ token, index, showId }) {
  const colorClass = `token-color-${index % 12}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        className={colorClass}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 16,
          fontWeight: 500,
          padding: '8px 14px',
          borderRadius: 8,
          borderWidth: 1,
          borderStyle: 'solid',
          whiteSpace: 'pre',
          cursor: 'default',
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        title={`Token ID: ${token.id.toLocaleString()}`}
      >
        {token.display}
      </div>

      <motion.div
        initial={false}
        animate={{
          opacity: showId ? 1 : 0,
          y: showId ? 0 : -4,
        }}
        transition={{ duration: 0.3 }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-dim)',
          marginTop: 4,
        }}
      >
        #{token.id.toLocaleString()}
      </motion.div>
    </motion.div>
  )
}
