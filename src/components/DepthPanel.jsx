import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * DepthPanel — expandable section that adds university-level depth
 * 
 * Each panel has:
 * - A "Go Deeper" toggle
 * - CS concept explanation
 * - Optional code snippet
 * - A mini challenge
 * - Real-world connection
 */
export default function DepthPanel({ concept, code, challenge, realWorld, visible, delay = 0 }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!visible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ margin: '24px 0' }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          padding: '14px 20px',
          background: isOpen ? 'var(--bg-elevated)' : 'var(--bg-surface)',
          border: `1px solid ${isOpen ? 'rgba(118,185,0,0.3)' : 'var(--border)'}`,
          borderRadius: isOpen ? '12px 12px 0 0' : 12,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s',
          textAlign: 'left',
        }}
      >
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'var(--nvidia-green-dim)',
          color: 'var(--nvidia-green)',
          fontSize: 12,
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          flexShrink: 0,
        }}>
          CS
        </span>
        <span style={{ flex: 1 }}>Go Deeper — The Computer Science</span>
        <span style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s',
          color: 'var(--text-dim)',
          fontSize: 18,
        }}>
          ▾
        </span>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-elevated)',
              border: '1px solid rgba(118,185,0,0.15)',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              padding: '24px',
            }}>

              {/* CS Concept */}
              {concept && (
                <Section label="The CS Concept" color="var(--nvidia-green)">
                  {concept}
                </Section>
              )}

              {/* Code snippet */}
              {code && (
                <Section label="See It In Code" color="#6ec0e8">
                  <pre style={{
                    background: 'var(--bg-deep)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 16,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 13,
                    lineHeight: 1.7,
                    overflowX: 'auto',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}>
                    {code}
                  </pre>
                </Section>
              )}

              {/* Challenge */}
              {challenge && (
                <Section label="🧪 Challenge" color="#e8d06e">
                  {challenge}
                </Section>
              )}

              {/* Real-world connection */}
              {realWorld && (
                <Section label="Why This Matters" color="#e87a96">
                  {realWorld}
                </Section>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


function Section({ label, color, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: color,
        marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 14,
        lineHeight: 1.7,
        color: 'var(--text-secondary)',
      }}>
        {children}
      </div>
    </div>
  )
}
