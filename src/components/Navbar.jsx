import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
  {
    path: '/tokenize',
    label: 'Tokenizer',
    title: 'Tokenize',
    preview: 'Split words',
    completionKey: 'lesson-complete-tokenizer',
  },
  {
    path: '/understand',
    label: 'Understand',
    title: 'Understand',
    preview: 'Meaning maps',
    completionKey: 'lesson-complete-understand',
  },
  {
    path: '/run',
    label: 'Run Local',
    title: 'Run',
    preview: 'Live inference',
    completionKey: 'lesson-complete-run',
  },
]

const LOCKED_ITEMS = [
  { title: 'Fine-tune', preview: 'Custom data' },
  { title: 'Evaluate', preview: 'Model quality' },
  { title: 'Deploy', preview: 'Ship it' },
]

const LOCKED_COUNT = LOCKED_ITEMS.length

const DOT_SIZE = 10
const LINE_WIDTH = 32

function getCompletionState() {
  const state = {}
  NAV_ITEMS.forEach(item => {
    state[item.completionKey] = localStorage.getItem(item.completionKey) === 'true'
  })
  return state
}

function TooltipCard({ stepNumber, title, completed, locked }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 8,
        padding: '5px 10px',
        background: '#1c1c20',
        border: '1px solid #2a2a30',
        borderRadius: 8,
        pointerEvents: 'none',
        zIndex: 1000,
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        fontWeight: 600,
        color: locked ? '#55555f' : '#e8e8ed',
      }}>
        {stepNumber}. {title}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)',
        fontSize: 10,
        fontStyle: 'italic',
        color: locked ? '#3a3a42' : (completed ? '#76B900' : '#55555f'),
      }}>
        {locked ? 'locked' : (completed ? 'completed' : 'in progress')}
      </span>
    </motion.div>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const totalDots = NAV_ITEMS.length + LOCKED_COUNT
  const [hoveredDot, setHoveredDot] = useState(null)
  const [completionState, setCompletionState] = useState(getCompletionState)

  // Listen for completion events from lesson pages
  useEffect(() => {
    const handler = () => setCompletionState(getCompletionState())
    window.addEventListener('lesson-complete', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('lesson-complete', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  const handleDotEnter = useCallback((i) => setHoveredDot(i), [])
  const handleDotLeave = useCallback(() => setHoveredDot(null), [])

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
    }}>
      {/* Row 1 — Primary Nav */}
      <div style={{
        height: 48,
        background: '#0a0a0b',
        borderBottom: '1px solid #2a2a30',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        position: 'relative',
      }}>
        {/* Left: Logo */}
        <Link to="/" style={{
          position: 'absolute',
          left: 24,
          textDecoration: 'none',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 15,
          color: 'var(--text-primary)',
        }}>
          howaiworks<span style={{ color: '#76B900' }}>.io</span>
        </Link>

        {/* Center: Nav links */}
        <div style={{ display: 'flex', gap: 32 }}>
          {[{ path: '/', label: 'Home' }, { path: '/resources', label: 'Resources' }, { path: '/about', label: 'About' }].map(({ path, label }) => {
            const active = pathname === path
            return (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#e8e8ed' : '#8a8a96',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = '#e8e8ed' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = '#8a8a96' }}
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Row 2 — Progress Dots connected by lines (hidden on home and about pages) */}
      <AnimatePresence>
      {!['/', '/about', '/resources'].includes(pathname) && <motion.div
        key="progress-bar"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 36, opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: '#141416',
          borderBottom: '1px solid #2a2a30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
        }}>
        {Array.from({ length: totalDots }).map((_, i) => {
          const navItem = NAV_ITEMS[i]
          const lockedItem = !navItem ? LOCKED_ITEMS[i - NAV_ITEMS.length] : null
          const isLocked = !navItem
          const isActive = navItem && pathname === navItem.path
          const isCompleted = navItem && completionState[navItem.completionKey]
          const isLast = i === totalDots - 1
          const isHovered = hoveredDot === i

          const dot = (
            <div style={{ position: 'relative', width: DOT_SIZE, height: DOT_SIZE }}>
              {isActive && (
                <motion.div
                  layoutId="active-dot-glow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: '#76B900',
                    boxShadow: '0 0 6px rgba(118,185,0,0.4)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {!isActive && (
                <div
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    borderRadius: '50%',
                    background: isLocked ? '#1c1c20' : (isCompleted ? '#76B900' : '#2a2a30'),
                    border: isLocked ? '1px dashed #2a2a30' : 'none',
                    boxSizing: 'border-box',
                    transition: 'background 0.2s',
                    opacity: isLocked ? 1 : (isCompleted ? 0.6 : 1),
                  }}
                  onMouseEnter={(e) => { if (!isLocked && !isCompleted) e.currentTarget.style.background = '#76B900' }}
                  onMouseLeave={(e) => { if (!isLocked && !isCompleted) e.currentTarget.style.background = '#2a2a30' }}
                />
              )}
            </div>
          )

          const line = !isLast ? (
            <div style={{
              width: LINE_WIDTH,
              height: 1,
              background: isLocked && !navItem ? '#1c1c20' : '#2a2a30',
            }} />
          ) : null

          const dotWithTooltip = (
            <div style={{ position: 'relative', width: DOT_SIZE, height: DOT_SIZE }}>
              {dot}
              <AnimatePresence>
                {isHovered && (
                  <TooltipCard
                    stepNumber={i + 1}
                    title={navItem?.title || lockedItem?.title}
                    completed={!!isCompleted}
                    locked={isLocked}
                  />
                )}
              </AnimatePresence>
            </div>
          )

          if (isLocked) {
            return (
              <div
                key={`locked-${i}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'default',
                }}
                onMouseEnter={() => handleDotEnter(i)}
                onMouseLeave={handleDotLeave}
              >
                {dotWithTooltip}
                {line}
              </div>
            )
          }

          return (
            <Link
              key={navItem.path}
              to={navItem.path}
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={() => handleDotEnter(i)}
              onMouseLeave={handleDotLeave}
            >
              {dotWithTooltip}
              {line}
            </Link>
          )
        })}
      </motion.div>}
      </AnimatePresence>
    </nav>
  )
}

/**
 * Call from any lesson page to mark it complete.
 * Usage: import { markLessonComplete } from '../components/Navbar'
 *        markLessonComplete('lesson-complete-tokenizer')
 */
export function markLessonComplete(key) {
  localStorage.setItem(key, 'true')
  window.dispatchEvent(new Event('lesson-complete'))
}
