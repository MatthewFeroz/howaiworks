import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TokenBlock from './TokenBlock'
import Nudge from './Nudge'
import Insight from './Insight'
import DepthPanel from './DepthPanel'

const AUTO_TYPE_TEXT = 'How does AI work?'
const TYPE_SPEED = 60 // ms per character

// Token color palette - matches globals.css .token-color-*
const TOKEN_COLORS = [
  '#a8d86e', '#6ec0e8', '#e8956e', '#c58ee8', '#e8d06e', '#6ee8cc',
  '#e87a96', '#94a0e8', '#e8a0d6', '#b0d87a', '#e8a07a', '#7ac0e8',
]

export default function TokenizerPhase({
  inputText,
  onInputChange,
  tokens,
  showIds,
  onToggleIds,
  isLoading,
  isReady,
  onUserTyped,
}) {
  const [isAutoTyping, setIsAutoTyping] = useState(true)
  const [autoTypeIndex, setAutoTypeIndex] = useState(0)
  const [userHasTyped, setUserHasTyped] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hoveredStat, setHoveredStat] = useState(null)
  const hoverTimeoutRef = useRef(null)
  // Track the highest token count seen during auto-type for smooth reveals
  const [revealedCount, setRevealedCount] = useState(0)
  const inputRef = useRef(null)
  const prevTokensRef = useRef([])

  // Auto-type animation on load
  useEffect(() => {
    if (!isReady || !isAutoTyping) return

    if (autoTypeIndex < AUTO_TYPE_TEXT.length) {
      const timer = setTimeout(() => {
        const newText = AUTO_TYPE_TEXT.slice(0, autoTypeIndex + 1)
        onInputChange(newText)
        setAutoTypeIndex(autoTypeIndex + 1)
      }, TYPE_SPEED)
      return () => clearTimeout(timer)
    } else {
      // Auto-type complete
      setIsAutoTyping(false)
    }
  }, [isReady, isAutoTyping, autoTypeIndex, onInputChange])

  // Track revealed count during auto-type so new pills fade in smoothly
  useEffect(() => {
    if (isAutoTyping && tokens.length > revealedCount) {
      setRevealedCount(tokens.length)
    }
  }, [tokens.length, isAutoTyping, revealedCount])

  // Handle user input
  const handleInput = useCallback((e) => {
    const text = e.target.value
    if (!userHasTyped && text !== AUTO_TYPE_TEXT.slice(0, text.length)) {
      setUserHasTyped(true)
      setIsAutoTyping(false)
      onUserTyped?.()
    }
    onInputChange(text)
  }, [onInputChange, userHasTyped, onUserTyped])

  // Handle nudge clicks
  const handleNudge = (text) => {
    onInputChange(text)
    if (inputRef.current) {
      inputRef.current.value = text
      inputRef.current.focus()
    }
    if (!userHasTyped) {
      setUserHasTyped(true)
      onUserTyped?.()
    }
  }

  // Build token-colored segments for inline display
  const coloredSegments = useMemo(() => {
    if (!tokens.length) return null

    let offset = 0
    return tokens.map((token, i) => {
      const color = TOKEN_COLORS[i % TOKEN_COLORS.length]
      const segment = {
        text: token.text,
        color,
        id: token.id,
        index: i,
        start: offset,
      }
      offset += token.text.length
      return segment
    })
  }, [tokens])

  // Generate stable keys for pills based on text offset + token id.
  // Always use offset-based keys so that when isAutoTyping flips to false,
  // React sees the same keys and reuses DOM nodes — no unmount/remount flash.
  const stableTokens = useMemo(() => {
    let offset = 0
    const prev = prevTokensRef.current
    const result = tokens.map((token, i) => {
      const key = `${offset}-${token.id}`
      const prevMatch = prev.find(p => p.stableKey === key)
      const entry = {
        ...token,
        stableKey: key,
        startOffset: offset,
        isNew: !prevMatch,
      }
      offset += token.text.length
      return entry
    })
    prevTokensRef.current = result
    return result
  }, [tokens])

  const tokenCount = tokens.length
  const charCount = inputText.length
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ padding: '20px 0 40px', flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {/* Chat-bar style input with inline colorization */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Colored overlay - shows colorized tokens */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            padding: '16px 20px',
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            lineHeight: 1.5,
            pointerEvents: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          {coloredSegments?.map((seg, i) => (
            <span key={i} style={{ color: seg.color }}>
              {seg.text}
            </span>
          ))}
          {/* Blinking cursor */}
          {isFocused && (
            <span
              style={{
                display: 'inline-block',
                width: 2,
                height: '1.2em',
                background: 'var(--nvidia-green)',
                marginLeft: 1,
                verticalAlign: 'text-bottom',
                animation: 'blink 1s step-end infinite',
              }}
            />
          )}
        </div>

        {/* Actual textarea - transparent text, handles input */}
        <textarea
          ref={inputRef}
          value={inputText}
          placeholder={!isAutoTyping ? "Type anything here..." : ""}
          rows={2}
          maxLength={80}
          onChange={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'var(--bg-surface)',
            border: `1px solid ${isFocused ? 'var(--nvidia-green)' : 'var(--border)'}`,
            borderRadius: 12,
            color: 'transparent',
            caretColor: 'transparent',
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            lineHeight: 1.5,
            resize: 'none',
            overflow: 'hidden',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: isFocused ? '0 0 0 3px var(--nvidia-green-dim)' : 'none',
          }}
        />

        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 12,
            right: 16,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-dim)',
          }}>
            Loading tokenizer...
          </div>
        )}
      </div>

      {/* Token pills display */}
      <div style={{
        minHeight: 60,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'flex-start',
        marginBottom: 16,
      }}>
        <AnimatePresence mode="sync">
          {stableTokens.map((token, i) => (
            <TokenBlock
              key={token.stableKey}
              token={token}
              index={i}
              showId={showIds}
              isNew={token.isNew}
              isAutoTyping={isAutoTyping}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* View toggle — below pills */}
      {tokens.length > 0 && onToggleIds && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 16,
        }}>
          <div style={{
            display: 'inline-flex',
            position: 'relative',
            background: 'var(--bg-surface)',
            borderRadius: 8,
            padding: 3,
            border: '1px solid var(--border)',
          }}>
            {/* Sliding indicator */}
            <motion.div
              layout
              style={{
                position: 'absolute',
                top: 3,
                bottom: 3,
                width: 'calc(50% - 3px)',
                left: showIds ? 3 : 'calc(50%)',
                background: 'var(--nvidia-green-dim)',
                border: '1px solid rgba(118, 185, 0, 0.25)',
                borderRadius: 6,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            <button
              onClick={() => { if (!showIds) onToggleIds() }}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '6px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: showIds ? 500 : 400,
                color: showIds ? 'var(--nvidia-green)' : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              What AI sees
            </button>
            <button
              onClick={() => { if (showIds) onToggleIds() }}
              style={{
                position: 'relative',
                zIndex: 1,
                padding: '6px 16px',
                background: 'transparent',
                border: 'none',
                borderRadius: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: !showIds ? 500 : 400,
                color: !showIds ? 'var(--nvidia-green)' : 'var(--text-dim)',
                cursor: 'pointer',
                transition: 'color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              Your text
            </button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div
        onMouseLeave={() => {
          hoverTimeoutRef.current = setTimeout(() => setHoveredStat(null), 150)
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 0',
          borderTop: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          position: 'relative',
        }}
      >
        <StatItem
          active={hoveredStat === 'tokens'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('tokens') }}
          tooltip={<>
            The subword fragments AI actually reads.{' '}
            <StatLink href="https://platform.openai.com/tokenizer">OpenAI Tokenizer</StatLink>
          </>}
        >
          <span style={{ color: 'var(--nvidia-green)', fontWeight: 600, fontSize: 15 }}>
            {tokenCount}
          </span> tokens
        </StatItem>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <StatItem
          active={hoveredStat === 'characters'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('characters') }}
          tooltip={<>
            Letters, spaces, and symbols you typed. AI converts these to tokens before processing.{' '}
            <StatLink href="https://en.wikipedia.org/wiki/Byte_pair_encoding">BPE on Wikipedia</StatLink>
          </>}
        >
          {charCount} characters
        </StatItem>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <StatItem
          active={hoveredStat === 'ratio'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('ratio') }}
          tooltip={<>
            Tokenization efficiency. English averages ~4. Lower = more tokens = higher cost.{' '}
            <StatLink href="https://blog.xenova.com/tiktoken">Tokenizer deep-dive</StatLink>
          </>}
        >
          {charsPerToken} chars/token
        </StatItem>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <StatItem
          active={hoveredStat === 'cost'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('cost') }}
          tooltip={<>
            Estimated cost at GPT-4 input pricing (~$0.03/1K tokens).{' '}
            <StatLink href="https://openai.com/api/pricing">OpenAI Pricing</StatLink>
          </>}
        >
          ~${tokenCount > 0 ? (tokenCount * 0.00003).toFixed(5) : '0.00000'}/call
        </StatItem>
      </div>

      {/* Prompt after auto-type — draws user to type and explore below */}
      <AnimatePresence>
        {!isAutoTyping && !userHasTyped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            style={{
              textAlign: 'center',
              marginTop: 'auto',
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              fontWeight: 400,
              letterSpacing: 0.2,
            }}>
              Now try your own words
            </span>
            <motion.span
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-block',
                fontSize: 18,
                color: 'var(--nvidia-green)',
                opacity: 0.7,
                lineHeight: 1,
              }}
            >
              ↓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nudges - appear staggered */}
      <AnimatePresence>
        {!isAutoTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}
          >
            <Nudge icon="🍓" onClick={() => handleNudge('strawberry')} delay={0}>
              Try <Accent>strawberry</Accent> — can AI count the r's?
            </Nudge>
            <Nudge icon="💪" onClick={() => handleNudge('Schwarzenegger')} delay={0.1}>
              Try <Accent>Schwarzenegger</Accent> — long words get shattered
            </Nudge>
            <Nudge icon="🌏" onClick={() => handleNudge('こんにちは世界')} delay={0.2}>
              Try <Accent>こんにちは世界</Accent> — how does AI handle Japanese?
            </Nudge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insight card */}
      <Insight visible={userHasTyped}>
        <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>Notice how "strawberry" becomes 3 tokens?</strong>{' '}
        AI doesn't see words — it sees fragments called tokens. The tokenizer splits text into pieces
        based on patterns it learned from training data. Every AI model starts here: it never sees
        your original letters, only these fragments.
      </Insight>

      {/* Go Deeper panel */}
      <DepthPanel
        visible={userHasTyped}
        delay={0.5}
        concept={
          <div>
            <p style={{ marginBottom: 12 }}>
              This process is called <strong style={{ color: 'var(--text-primary)' }}>Byte Pair Encoding (BPE)</strong>.
              The tokenizer starts with individual bytes and iteratively merges the most frequent pair
              of adjacent tokens into a new token. After ~100,000 merges, you get a vocabulary where
              common words are single tokens and rare words get split into subword pieces.
            </p>
            <p style={{ marginBottom: 12 }}>
              The tokenizer here is <strong style={{ color: 'var(--text-primary)' }}>cl100k_base</strong> — the same one
              used by GPT-4. It has a vocabulary of ~100,256 tokens.
            </p>
            <p>
              Key insight: <strong style={{ color: 'var(--text-primary)' }}>the tokenizer is trained separately from the language model</strong>.
              It's a preprocessing step that converts raw text into integer IDs. The neural network never sees characters — only these IDs.
            </p>
          </div>
        }
        code={`import tiktoken

enc = tiktoken.get_encoding("cl100k_base")

text = "strawberry"
tokens = enc.encode(text)
print(tokens)  # [496, 675, 15717]

# Decode each token
for t in tokens:
    print(f"  Token {t}: '{enc.decode([t])}'")
    # Token 496:   'str'
    # Token 675:   'aw'
    # Token 15717: 'berry'`}
        challenge={
          <div>
            <p style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Try this:</strong> Type the same sentence in English
              and another language. Compare the token counts.
            </p>
            <p>
              Why does non-English text produce more tokens? What does this imply about the training data?
            </p>
          </div>
        }
        realWorld={
          <div>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Tokenization is where AI inequity begins.</strong>
            </p>
            <p style={{ marginBottom: 8 }}>
              Languages underrepresented in training data produce more tokens for the same meaning:
            </p>
            <p style={{ marginBottom: 6, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Cost:</strong> API pricing is per-token. The same message in
              Yoruba or Bengali can cost 2-4x more than in English.
            </p>
            <p style={{ marginBottom: 6, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Quality:</strong> More tokens = less context window for reasoning.
            </p>
            <p style={{ paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Identity:</strong> Non-Western names get shattered while "John" stays whole.
            </p>
          </div>
        }
      />

      {/* CSS for cursor blink animation */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  )
}

function Accent({ children }) {
  return <em style={{ color: 'var(--nvidia-green)', fontStyle: 'normal', fontWeight: 500 }}>{children}</em>
}

function StatItem({ children, active, onEnter, tooltip }) {
  return (
    <span
      onMouseEnter={onEnter}
      style={{
        cursor: 'default',
        borderBottom: `1px dashed ${active ? 'var(--nvidia-green)' : 'var(--text-dim)'}`,
        paddingBottom: 2,
        color: active ? 'var(--nvidia-green)' : undefined,
        transition: 'color 0.2s, border-color 0.2s',
        position: 'relative',
      }}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 260,
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              zIndex: 10,
              pointerEvents: 'auto',
              whiteSpace: 'normal',
            }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}

function StatLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        color: 'var(--nvidia-green)',
        textDecoration: 'underline',
        textUnderlineOffset: 2,
      }}
    >
      {children} ↗
    </a>
  )
}
