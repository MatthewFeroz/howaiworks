import { motion } from 'framer-motion'

const TOKEN_COLORS = [
  '#a8d86e', '#6ec0e8', '#e8956e', '#c58ee8', '#e8d06e', '#6ee8cc',
  '#e87a96', '#94a0e8', '#e8a0d6', '#b0d87a', '#e8a07a', '#7ac0e8',
]

export default function ChatMessage({ role, content, tokens, isStreaming }) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: 12,
      }}
    >
      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? 'var(--nvidia-green-dim)' : 'var(--bg-elevated)',
        border: `1px solid ${isUser ? 'rgba(118,185,0,0.25)' : 'var(--border)'}`,
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--text-primary)',
        fontFamily: isUser ? 'var(--font-body)' : 'var(--font-mono)',
      }}>
        {/* Role label */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: isUser ? 'var(--nvidia-green)' : 'var(--text-dim)',
          marginBottom: 6,
        }}>
          {isUser ? 'You' : 'AI'}
        </div>

        {/* Content: colorized tokens for AI, plain text for user */}
        {isUser ? (
          <span>{content}</span>
        ) : tokens && tokens.length > 0 ? (
          <span>
            {tokens.map((token, i) => (
              <span
                key={i}
                style={{ color: TOKEN_COLORS[i % TOKEN_COLORS.length] }}
              >
                {token}
              </span>
            ))}
            {isStreaming && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: '1em',
                  background: 'var(--nvidia-green)',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                  animation: 'blink 1s step-end infinite',
                }}
              />
            )}
          </span>
        ) : (
          <span>{content}</span>
        )}
      </div>
    </motion.div>
  )
}
