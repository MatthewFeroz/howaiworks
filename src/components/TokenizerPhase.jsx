import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Nudge from './Nudge'
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
  decode,
  isLoading,
  isReady,
  onUserTyped,
}) {
  const [isAutoTyping, setIsAutoTyping] = useState(true)
  const [autoTypeIndex, setAutoTypeIndex] = useState(0)
  const [userHasTyped, setUserHasTyped] = useState(false)
  const [textFocused, setTextFocused] = useState(false)
  const [textHovered, setTextHovered] = useState(false)
  const [idsFocused, setIdsFocused] = useState(false)
  const [hoveredStat, setHoveredStat] = useState(null)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [activeNudge, setActiveNudge] = useState(null) // key of the clicked nudge
  const [exploredNudges, setExploredNudges] = useState(new Set()) // nudges user has clicked
  const hoverTimeoutRef = useRef(null)
  const textInputRef = useRef(null)
  const idsInputRef = useRef(null)

  // Which bar the user is actively editing
  const [editingBar, setEditingBar] = useState(null) // 'text' | 'ids' | null
  // Raw user input in the IDs bar during editing
  const [idsInputText, setIdsInputText] = useState('')

  // Nudge definitions with unique insights
  const NUDGES = [
    {
      key: 'strawberry',
      icon: '🍓',
      text: 'strawberry',
      label: <>Try <Accent>strawberry</Accent> — 1 word, 3 tokens. This is why AI can't count the r's</>,
      insight: {
        headline: 'AI can\'t spell — and this is why.',
        body: <>
          "strawberry" becomes 3 tokens: <strong style={{ color: 'var(--text-primary)' }}>"str" + "aw" + "berry"</strong>.
          When you ask AI "how many r's in strawberry?", it never sees the individual letters —
          it sees 3 opaque fragments. The r's are scattered across token boundaries, invisible to the model.
          This is the root cause of AI's famous spelling failures.
        </>,
        nextHint: 'Now try a really long word — see what happens when AI encounters something rare →',
      },
    },
    {
      key: 'supercalifragilistic',
      icon: '🎪',
      text: 'supercalifragilisticexpialidocious',
      label: <>Try <Accent>supercalifragilisticexpialidocious</Accent> — 1 word you can say, 11 fragments AI sees</>,
      insight: {
        headline: 'The rarer the word, the harder AI works.',
        body: <>
          You can say this word in one breath. AI needs <strong style={{ color: 'var(--text-primary)' }}>~11 tokens</strong> just
          to represent it. The tokenizer was trained on internet text where "the" appears billions of times
          but "supercalifragilisticexpialidocious" almost never does. Common words get their own token.
          Rare words get shattered into fragments — consuming more of AI's limited context window
          and making the model work harder for the same meaning.
        </>,
        nextHint: 'Now try a different language — discover the hidden cost of not being English →',
      },
    },
    {
      key: 'arabic',
      icon: '🌍',
      text: 'مرحبا كيف حالك',
      label: <>Try <Accent>Hello how are you</Accent> in Arabic — same meaning, nearly 3x the tokens</>,
      insight: {
        headline: 'Same meaning. 3x the cost.',
        body: <>
          "Hello how are you" is ~5 tokens. <strong style={{ color: 'var(--text-primary)' }}>The same phrase in Arabic can be 12+ tokens.</strong>{' '}
          Because the tokenizer was trained mostly on English text, it learned efficient representations
          for English words but treats non-Latin scripts almost character-by-character. This means
          Arabic, Hindi, Yoruba, and other languages use more tokens for the same meaning —
          costing more money, filling up the context window faster, and getting worse model performance.
          <span style={{ display: 'block', marginTop: 8, color: 'var(--nvidia-green)', fontWeight: 500, fontSize: 14 }}>
            Tokenization is where AI inequity begins.
          </span>
        </>,
        nextHint: null,
      },
    },
  ]

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
      setIsAutoTyping(false)
    }
  }, [isReady, isAutoTyping, autoTypeIndex, onInputChange])

  // Handle user text input (bar 1)
  const handleTextInput = useCallback((e) => {
    const text = e.target.value
    if (!userHasTyped && text !== AUTO_TYPE_TEXT.slice(0, text.length)) {
      setUserHasTyped(true)
      setIsAutoTyping(false)
      onUserTyped?.()
    }
    onInputChange(text)
  }, [onInputChange, userHasTyped, onUserTyped])

  // Handle IDs input (bar 2)
  const handleIdsInput = useCallback((e) => {
    const raw = e.target.value
    setIdsInputText(raw)

    // Parse space-separated numbers
    const parts = raw.trim().split(/\s+/)
    const ids = parts
      .map(p => parseInt(p, 10))
      .filter(n => !isNaN(n) && n >= 0)

    if (ids.length > 0 && decode) {
      const { text } = decode(ids)
      onInputChange(text)
      if (!userHasTyped) {
        setUserHasTyped(true)
        onUserTyped?.()
      }
    } else if (raw.trim() === '') {
      onInputChange('')
    }
  }, [decode, onInputChange, userHasTyped, onUserTyped])

  // Auto-resize text textarea when text changes programmatically (auto-type, nudges)
  useEffect(() => {
    const el = textInputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [inputText])

  // Derived IDs text from tokens
  const derivedIdsText = useMemo(() => {
    return tokens.map(t => t.id).join('  ')
  }, [tokens])

  // Auto-resize IDs textarea when derived IDs change (not during editing)
  useEffect(() => {
    if (editingBar === 'ids') return
    const el = idsInputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [derivedIdsText, editingBar])

  // Track scroll to dismiss the "Scroll to explore more" indicator
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setHasScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle nudge clicks
  const handleNudge = (nudgeKey, text) => {
    onInputChange(text)
    if (textInputRef.current) {
      textInputRef.current.value = text
      textInputRef.current.focus()
    }
    setEditingBar('text')
    setActiveNudge(nudgeKey)
    setExploredNudges(prev => {
      const next = new Set([...prev, nudgeKey])
      // Fire confetti when all nudges explored for the first time
      if (next.size === NUDGES.length && prev.size < NUDGES.length) {
        setTimeout(() => {
          // Left burst
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.15, y: 0.6 },
            colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
          })
          // Right burst
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { x: 0.85, y: 0.6 },
            colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
          })
          // Center shower after a beat
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 100,
              origin: { x: 0.5, y: 0.4 },
              colors: ['#76B900', '#00b4d8', '#e0aaff', '#ffd166', '#ef476f', '#06d6a0'],
            })
          }, 250)
        }, 400)
      }
      return next
    })
    if (!userHasTyped) {
      setUserHasTyped(true)
      onUserTyped?.()
    }
  }

  // Build token-colored segments for text bar overlay
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

  // Build colored segments for IDs bar overlay
  const idsColoredSegments = useMemo(() => {
    if (editingBar === 'ids') {
      // During editing: colorize the parsed numbers from user input
      const parts = idsInputText.trim().split(/\s+/)
      let colorIdx = 0
      const segments = []
      let pos = 0
      for (const part of parts) {
        const idx = idsInputText.indexOf(part, pos)
        if (idx > pos) {
          segments.push({ text: idsInputText.slice(pos, idx), color: 'var(--text-dim)', isSpace: true })
        }
        const num = parseInt(part, 10)
        const isValid = !isNaN(num) && num >= 0
        segments.push({
          text: part,
          color: isValid ? TOKEN_COLORS[colorIdx % TOKEN_COLORS.length] : '#ef476f',
          isSpace: false,
        })
        if (isValid) colorIdx++
        pos = idx + part.length
      }
      if (pos < idsInputText.length) {
        segments.push({ text: idsInputText.slice(pos), color: 'var(--text-dim)', isSpace: true })
      }
      return segments
    }

    // Not editing: derive from tokens
    if (!tokens.length) return null
    const segments = []
    tokens.forEach((token, i) => {
      if (i > 0) {
        segments.push({ text: '  ', color: 'var(--text-dim)', isSpace: true })
      }
      segments.push({
        text: String(token.id),
        color: TOKEN_COLORS[i % TOKEN_COLORS.length],
        isSpace: false,
      })
    })
    return segments
  }, [tokens, editingBar, idsInputText])

  // IDs bar value when not editing
  const idsDisplayValue = editingBar === 'ids' ? idsInputText : derivedIdsText

  const tokenCount = tokens.length
  const charCount = inputText.length
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : 0

  // Whether bar 1 should breathe (after auto-type, before user types)
  const isBreathing = !isAutoTyping && !userHasTyped && !textFocused

  // Shared bar styles
  const barStyle = (focused, { breathing = false, hovered = false } = {}) => ({
    width: '100%',
    minHeight: 59,
    padding: '16px 20px',
    background: 'var(--bg-surface)',
    border: `1px solid ${
      focused ? 'var(--nvidia-green)'
      : hovered ? 'rgba(118,185,0,0.45)'
      : 'var(--border)'
    }`,
    borderRadius: 12,
    color: 'transparent',
    caretColor: 'transparent',
    fontFamily: 'var(--font-mono)',
    fontSize: 18,
    lineHeight: 1.5,
    resize: 'none',
    overflow: 'hidden',
    outline: 'none',
    transition: breathing && !hovered ? 'none' : 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? '0 0 0 3px var(--nvidia-green-dim)'
      : hovered ? '0 0 0 3px rgba(118,185,0,0.15)'
      : 'none',
    animation: (breathing && !hovered) ? 'breathe 2.5s ease-in-out infinite' : 'none',
  })

  const overlayStyle = {
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
  }

  const labelStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      style={{ padding: '20px 0 40px' }}
    >
      {/* === BAR 1: Your text === */}
      <div style={{ ...labelStyle, color: 'var(--nvidia-green)' }}>
        Your text
      </div>
      <div
        style={{ position: 'relative', marginBottom: 0, cursor: textFocused ? undefined : 'pointer' }}
        onMouseEnter={() => setTextHovered(true)}
        onMouseLeave={() => setTextHovered(false)}
      >
        {/* Colored overlay */}
        <div style={overlayStyle}>
          {coloredSegments?.map((seg, i) => (
            <span key={i} style={{ color: seg.color }}>
              {seg.text}
            </span>
          ))}
          {textFocused && (
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

        {/* Actual textarea */}
        <textarea
          ref={textInputRef}
          value={inputText}
          placeholder={!isAutoTyping ? "Type anything here..." : ""}
          rows={1}
          onChange={(e) => {
            handleTextInput(e)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onFocus={() => { setTextFocused(true); setEditingBar('text') }}
          onBlur={() => { setTextFocused(false); setEditingBar(null) }}
          style={barStyle(textFocused, { breathing: isBreathing, hovered: textHovered && !textFocused })}
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

      {/* === Connector (spacer only) === */}
      <div style={{ padding: '12px 0' }} />

      {/* === BAR 2: What AI sees (IDs) === */}
      <div style={{ ...labelStyle, color: 'var(--nvidia-green)' }}>
        What AI sees
      </div>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Colored overlay for IDs */}
        <div style={overlayStyle}>
          {idsColoredSegments?.map((seg, i) => (
            <span key={i} style={{ color: seg.color }}>
              {seg.text}
            </span>
          ))}
          {idsFocused && (
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

        {/* Actual textarea for IDs */}
        <textarea
          ref={idsInputRef}
          value={idsDisplayValue}
          placeholder="Token IDs appear here..."
          rows={1}
          onChange={(e) => {
            handleIdsInput(e)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onFocus={() => {
            setIdsFocused(true)
            setEditingBar('ids')
            setIdsInputText(derivedIdsText)
          }}
          onBlur={() => {
            setIdsFocused(false)
            setEditingBar(null)
          }}
          style={barStyle(idsFocused)}
        />
      </div>

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
            AI can't read text. It splits your input into small pieces called tokens — often parts of words, not whole words. "strawberry" becomes 3 tokens: "str", "aw", "berry". Everything AI does starts from these fragments.{' '}
            <StatLink href="https://platform.openai.com/tokenizer">Try OpenAI's Tokenizer</StatLink>
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
            The raw letters, spaces, and symbols you typed — what humans read. AI never sees these directly. It converts them into tokens first, which is why the token count is always different from the character count.{' '}
            <StatLink href="https://huggingface.co/learn/llm-course/en/chapter2/4">How Tokenizers Work</StatLink>
          </>}
        >
          {charCount} characters
        </StatItem>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <StatItem
          active={hoveredStat === 'ratio'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('ratio') }}
          tooltip={<>
            How many characters fit in one token on average. English text averages ~4 chars/token. A lower ratio means more tokens for the same text — making AI slower and more expensive. Non-English languages often score worse here.{' '}
            <StatLink href="https://huggingface.co/spaces/Xenova/the-tokenizer-playground">Tokenizer Playground</StatLink>
          </>}
        >
          {charsPerToken} chars/token
        </StatItem>
        <span style={{ color: 'var(--text-dim)' }}>·</span>
        <StatItem
          active={hoveredStat === 'cost'}
          onEnter={() => { clearTimeout(hoverTimeoutRef.current); setHoveredStat('cost') }}
          tooltip={<>
            AI APIs charge per token, not per word or message. This estimate uses GPT-4's input rate (~$0.03 per 1K tokens). More tokens = higher cost — which is why inefficient tokenization for non-English text creates real cost inequality.{' '}
            <StatLink href="https://openai.com/api/pricing/">OpenAI Pricing</StatLink>
          </>}
        >
          ~${tokenCount > 0 ? (tokenCount * 0.00003).toFixed(5) : '0.00000'}/call
        </StatItem>
      </div>

      {/* Phase 2: "Scroll to explore more" — after user types, until they scroll */}
      <AnimatePresence>
        {userHasTyped && !hasScrolled && (
          <motion.div
            key="scroll-prompt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 24,
              height: 60,
              background: 'linear-gradient(transparent, var(--bg-deep) 60%)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            <span style={{
              fontSize: 15,
              color: 'var(--text-secondary)',
              fontWeight: 400,
              letterSpacing: 0.2,
            }}>
              Scroll to explore more
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
                marginTop: 4,
              }}
            >
              ↓
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nudges - accordion style, each expands to reveal insight */}
      <AnimatePresence>
        {!isAutoTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}
          >
            {NUDGES.map((nudge, i) => (
              <Nudge
                key={nudge.key}
                icon={nudge.icon}
                onClick={() => handleNudge(nudge.key, nudge.text)}
                delay={i * 0.1}
                explored={exploredNudges.has(nudge.key)}
                active={activeNudge === nudge.key}
                insightContent={
                  <>
                    <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>
                      {nudge.insight.headline}
                    </strong>{' '}
                    {nudge.insight.body}
                    {nudge.insight.nextHint && (
                      <div style={{
                        marginTop: 10,
                        paddingTop: 8,
                        borderTop: '1px solid rgba(118, 185, 0, 0.1)',
                        fontSize: 13,
                        color: 'var(--nvidia-green)',
                        fontWeight: 500,
                        opacity: 0.85,
                      }}>
                        {nudge.insight.nextHint}
                      </div>
                    )}
                  </>
                }
              >
                {nudge.label}
              </Nudge>
            ))}
            {exploredNudges.size > 0 && (
              <motion.div
                key={exploredNudges.size === NUDGES.length ? 'complete' : 'progress'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: exploredNudges.size === NUDGES.length ? 12 : 11,
                  color: exploredNudges.size === NUDGES.length ? 'var(--nvidia-green)' : 'var(--text-dim)',
                  paddingLeft: 4,
                  marginTop: 2,
                  fontWeight: exploredNudges.size === NUDGES.length ? 600 : 400,
                }}
              >
                {exploredNudges.size === NUDGES.length
                  ? 'All explored — you now see what AI sees.'
                  : `${exploredNudges.size}/${NUDGES.length} explored`
                }
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* CSS for cursor blink and breathing border animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes breathe {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(118,185,0,0.08);
            border-color: rgba(118,185,0,0.25);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(118,185,0,0.2);
            border-color: rgba(118,185,0,0.45);
          }
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
