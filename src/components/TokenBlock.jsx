import { motion } from 'framer-motion'

export default function TokenBlock({ token, index, showId, isAutoTyping, skipAnimation }) {
  const colorClass = `token-color-${index % 12}`

  const inner = (
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
      title={showId ? token.display : `Token ID: ${token.id.toLocaleString()}`}
    >
      {showId ? token.id.toLocaleString() : token.display}
    </div>
  )

  // Fast path: skip all Framer Motion overhead during rapid typing
  if (skipAnimation) {
    return (
      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
        {inner}
      </div>
    )
  }

  // During auto-type: simple fade, no layout thrashing.
  // After auto-type: subtle scale+fade entrance for new tokens.
  const variants = isAutoTyping
    ? {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.85 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.85 },
      }

  return (
    <motion.div
      layout={!isAutoTyping}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={isAutoTyping
        ? { duration: 0.18, ease: 'easeOut' }
        : { duration: 0.2, ease: 'easeOut' }
      }
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {inner}
    </motion.div>
  )
}
