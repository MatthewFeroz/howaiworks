import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Lightweight Python syntax highlighter ──────────────────────────────
// No external dependency — tokenizes Python code into colored spans.

const PY_KEYWORDS = new Set([
  'import', 'from', 'as', 'def', 'return', 'class', 'if', 'elif', 'else',
  'for', 'in', 'while', 'break', 'continue', 'pass', 'with', 'yield',
  'try', 'except', 'finally', 'raise', 'and', 'or', 'not', 'is', 'None',
  'True', 'False', 'lambda', 'del', 'global', 'nonlocal', 'assert',
])

const PY_BUILTINS = new Set([
  'print', 'len', 'range', 'str', 'int', 'float', 'list', 'dict', 'set',
  'tuple', 'type', 'isinstance', 'enumerate', 'zip', 'map', 'filter',
  'sorted', 'reversed', 'open', 'input', 'abs', 'max', 'min', 'sum',
])

const THEME = {
  keyword:  '#c58ee8', // purple
  builtin:  '#6ec0e8', // blue
  string:   '#e8d06e', // amber
  comment:  '#55555f', // dim
  number:   '#a8d86e', // green
  fstring:  '#e8956e', // orange — f-string braces
  decorator:'#e87a96', // pink
  default:  '#8a8a96', // text-secondary
}

function highlightPython(code) {
  const tokens = []
  let i = 0
  const src = code

  while (i < src.length) {
    // Comments
    if (src[i] === '#') {
      const end = src.indexOf('\n', i)
      const slice = end === -1 ? src.slice(i) : src.slice(i, end)
      tokens.push({ text: slice, color: THEME.comment })
      i += slice.length
      continue
    }

    // Strings (f-strings, regular strings, triple-quoted)
    if (
      (src[i] === '"' || src[i] === "'") ||
      ((src[i] === 'f' || src[i] === 'r' || src[i] === 'b') && (src[i + 1] === '"' || src[i + 1] === "'"))
    ) {
      let prefix = ''
      if (src[i] === 'f' || src[i] === 'r' || src[i] === 'b') {
        prefix = src[i]
        i++
      }
      const quote = src.slice(i, i + 3) === '"""' || src.slice(i, i + 3) === "'''"
        ? src.slice(i, i + 3)
        : src[i]
      const endQuote = quote
      let j = i + quote.length
      while (j < src.length) {
        if (src[j] === '\\') { j += 2; continue }
        if (src.slice(j, j + endQuote.length) === endQuote) { j += endQuote.length; break }
        j++
      }
      const full = prefix + src.slice(i, j)

      // For f-strings, highlight {expressions} in a different color
      if (prefix === 'f') {
        let pos = 0
        const fTokens = []
        const inner = full
        let k = 0
        while (k < inner.length) {
          if (inner[k] === '{' && inner[k + 1] !== '{') {
            // find matching close brace
            const braceStart = k
            let depth = 1
            k++
            while (k < inner.length && depth > 0) {
              if (inner[k] === '{') depth++
              if (inner[k] === '}') depth--
              k++
            }
            fTokens.push({ text: inner.slice(braceStart, k), color: THEME.fstring })
          } else {
            const start = k
            while (k < inner.length && !(inner[k] === '{' && inner[k + 1] !== '{')) k++
            fTokens.push({ text: inner.slice(start, k), color: THEME.string })
          }
        }
        tokens.push(...fTokens)
      } else {
        tokens.push({ text: full, color: THEME.string })
      }
      i = j
      continue
    }

    // Decorators
    if (src[i] === '@' && (i === 0 || src[i - 1] === '\n')) {
      const end = src.indexOf('\n', i)
      const slice = end === -1 ? src.slice(i) : src.slice(i, end)
      tokens.push({ text: slice, color: THEME.decorator })
      i += slice.length
      continue
    }

    // Numbers
    if (/\d/.test(src[i]) && (i === 0 || /[\s\W]/.test(src[i - 1]))) {
      let j = i
      while (j < src.length && /[\d._xXoObBeE]/.test(src[j])) j++
      tokens.push({ text: src.slice(i, j), color: THEME.number })
      i = j
      continue
    }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(src[i])) {
      let j = i
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++
      const word = src.slice(i, j)
      if (PY_KEYWORDS.has(word)) {
        tokens.push({ text: word, color: THEME.keyword })
      } else if (PY_BUILTINS.has(word) && src[j] === '(') {
        tokens.push({ text: word, color: THEME.builtin })
      } else {
        tokens.push({ text: word, color: THEME.default })
      }
      i = j
      continue
    }

    // Whitespace and operators — pass through
    tokens.push({ text: src[i], color: THEME.default })
    i++
  }

  return tokens
}

export function PythonCode({ code }) {
  const highlighted = useMemo(() => highlightPython(code), [code])

  return (
    <div style={{ position: 'relative' }}>
      {/* Language badge */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 12,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        background: 'rgba(42, 42, 48, 0.8)',
        padding: '2px 8px',
        borderRadius: 4,
        userSelect: 'none',
      }}>
        python
      </div>
      <pre style={{
        background: 'var(--bg-deep)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '16px 20px',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.7,
        overflowX: 'auto',
        whiteSpace: 'pre',
        margin: 0,
        tabSize: 4,
      }}>
        {highlighted.map((tok, i) => (
          <span key={i} style={{ color: tok.color }}>{tok.text}</span>
        ))}
      </pre>
    </div>
  )
}

// ── DepthPanel Component ───────────────────────────────────────────────

/**
 * DepthPanel — expandable section that adds university-level depth
 *
 * Accepts a `sections` array, each rendered as a collapsible accordion.
 * First section auto-opens. Multiple sections can be open simultaneously.
 */
export default function DepthPanel({ sections, visible, delay = 0, onOpen }) {
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
        onClick={() => {
          const willOpen = !isOpen
          setIsOpen(willOpen)
          if (willOpen && onOpen) onOpen()
        }}
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
        <span style={{ flex: 1 }}>The computer science behind this</span>
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
              padding: '16px 24px 24px',
            }}>
              {sections.map((section, i) => (
                <AccordionSection
                  key={section.label}
                  label={section.label}
                  color={section.color}
                  defaultOpen={section.defaultOpen}
                  isLast={i === sections.length - 1}
                >
                  {section.content}
                </AccordionSection>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


function AccordionSection({ label, color, defaultOpen = false, isLast, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
    }}>
      {/* Clickable header */}
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '12px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{
          color: color,
          fontSize: 14,
          transition: 'transform 0.2s',
          transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          lineHeight: 1,
        }}>
          ▸
        </span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: color,
        }}>
          {label}
        </span>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '0 0 20px 0',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
