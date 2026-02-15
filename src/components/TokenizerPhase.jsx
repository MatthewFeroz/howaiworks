import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import Nudge from './Nudge'
import DepthPanel, { PythonCode } from './DepthPanel'
import { markLessonComplete } from './Navbar'

const CHAR_LIMIT = 280
const TYPE_SPEED = 60 // ms per character
const PAUSE_BETWEEN_PHRASES = 2000 // ms to hold each phrase before clearing

const DEMO_PHRASES = [
  'How does AI work?',
  'Just keep swimming.',
  'Summarize this document for me.',
  'Hello, World!',
  'Fix the bug in my code.',
  'With great power comes great responsibility.',
  'Explain this like I\'m five.',
  "I'm sorry Dave, I'm afraid I can't do that.", // easter egg — last
]

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
  onDepthOpened,
}) {
  const [isAutoTyping, setIsAutoTyping] = useState(true)
  const [autoTypeIndex, setAutoTypeIndex] = useState(0)
  const [demoPhraseIdx, setDemoPhraseIdx] = useState(0) // which phrase in DEMO_PHRASES
  const [userHasTyped, setUserHasTyped] = useState(false)
  const [textFocused, setTextFocused] = useState(false)
  const [textHovered, setTextHovered] = useState(false)
  const [idsFocused, setIdsFocused] = useState(false)
  const [hoveredStat, setHoveredStat] = useState(null)
  const [activeNudge, setActiveNudge] = useState(null) // key of the clicked nudge
  const [exploredNudges, setExploredNudges] = useState(new Set()) // nudges user has clicked
  const [nudgeTyping, setNudgeTyping] = useState(null) // { text, index } for nudge type animation
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
      label: <>Try <Accent>strawberry</Accent> - Why does AI have such a tough time?</>,
      insight: {
        headline: 'AI can\'t spell - and this is why.',
        body: <>
          "strawberry" becomes 3 tokens: <strong style={{ color: 'var(--text-primary)' }}>"str" + "aw" + "berry"</strong>.
          When you ask AI "how many r's in strawberry?", it never sees the individual letters -
          it sees 3 opaque fragments. The r's are scattered across token boundaries, invisible to the model.
          This is the root cause of AI's famous spelling failures.
        </>,
        nextHint: 'Now try a really long word - see what happens when AI encounters something rare ↓',
      },
    },
    {
      key: 'supercalifragilistic',
      icon: '☂️',
      text: 'supercalifragilisticexpialidocious',
      label: <>Try <Accent>supercalifragilisticexpialidocious</Accent> - 1 word you can say, 11 fragments AI sees</>,
      insight: {
        headline: 'The rarer the word, the harder AI works.',
        body: <>
          You can say this word in one breath. AI needs <strong style={{ color: 'var(--text-primary)' }}>~11 tokens</strong> just
          to represent it. The tokenizer was trained on internet text where "the" appears billions of times
          but "supercalifragilisticexpialidocious" almost never does. Common words get their own token.
          Rare words get shattered into fragments - consuming more of AI's limited context window
          and making the model work harder for the same meaning.
        </>,
        nextHint: 'Now try a different language - discover the hidden cost of not being English ↓',
      },
    },
    {
      key: 'arabic',
      icon: '🌍',
      text: 'مرحبا كيف حالك',
      label: <>Try <Accent>Hello how are you</Accent> in Arabic - same meaning, nearly 3x the tokens</>,
      insight: {
        headline: 'Same meaning. 3x the cost.',
        body: <>
          "Hello how are you" is ~5 tokens. <strong style={{ color: 'var(--text-primary)' }}>The same phrase in Arabic can be 12+ tokens.</strong>{' '}
          Because the tokenizer was trained mostly on English text, it learned efficient representations
          for English words but treats non-Latin scripts almost character-by-character. This means
          Arabic, Hindi, Yoruba, and other languages use more tokens for the same meaning -
          costing more money, filling up the context window faster, and getting worse model performance.
          <span style={{ display: 'block', marginTop: 8, color: 'var(--nvidia-green)', fontWeight: 500, fontSize: 14 }}>
            Tokenization is where AI inequity begins.
          </span>
        </>,
        nextHint: null,
      },
    },
  ]

  // Auto-type animation — cycles through DEMO_PHRASES
  useEffect(() => {
    if (!isReady || !isAutoTyping) return

    const currentPhrase = DEMO_PHRASES[demoPhraseIdx]

    if (autoTypeIndex < currentPhrase.length) {
      // Still typing the current phrase
      const timer = setTimeout(() => {
        const newText = currentPhrase.slice(0, autoTypeIndex + 1)
        onInputChange(newText)
        setAutoTypeIndex(autoTypeIndex + 1)
      }, TYPE_SPEED)
      return () => clearTimeout(timer)
    } else {
      // Phrase fully typed — pause then move to next
      const timer = setTimeout(() => {
        const nextIdx = (demoPhraseIdx + 1) % DEMO_PHRASES.length
        setDemoPhraseIdx(nextIdx)
        setAutoTypeIndex(0)
        onInputChange('')
      }, PAUSE_BETWEEN_PHRASES)
      return () => clearTimeout(timer)
    }
  }, [isReady, isAutoTyping, autoTypeIndex, demoPhraseIdx, onInputChange])

  // Nudge typing animation (character-by-character, same as initial auto-type)
  useEffect(() => {
    if (!nudgeTyping) return

    const { text, index } = nudgeTyping
    if (index < text.length) {
      const timer = setTimeout(() => {
        const newText = text.slice(0, index + 1)
        onInputChange(newText)
        setNudgeTyping({ text, index: index + 1 })
      }, TYPE_SPEED)
      return () => clearTimeout(timer)
    } else {
      // Typing complete
      setNudgeTyping(null)
    }
  }, [nudgeTyping, onInputChange])

  // Handle user text input (bar 1)
  const handleTextInput = useCallback((e) => {
    let text = e.target.value
    // Enforce character limit
    if (text.length > CHAR_LIMIT) {
      text = text.slice(0, CHAR_LIMIT)
    }
    // Cancel any in-progress nudge typing animation
    setNudgeTyping(null)
    if (!userHasTyped) {
      setUserHasTyped(true)
      setIsAutoTyping(false)
      onUserTyped?.()
    }
    onInputChange(text)
  }, [onInputChange, userHasTyped, onUserTyped])

  // Handle IDs input (bar 2)
  const handleIdsInput = useCallback((e) => {
    const raw = e.target.value
    setNudgeTyping(null) // Cancel any in-progress nudge typing
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

  // Handle nudge clicks
  const handleNudge = (nudgeKey, text) => {
    // If this nudge is already open, just close it
    if (activeNudge === nudgeKey) {
      setActiveNudge(null)
      return
    }
    // Clear current text and start typing animation
    onInputChange('')
    setNudgeTyping({ text, index: 0 })
    if (textInputRef.current) {
      textInputRef.current.focus({ preventScroll: true })
    }
    setEditingBar('text')
    setActiveNudge(nudgeKey)
    setExploredNudges(prev => {
      const next = new Set([...prev, nudgeKey])
      // Fire confetti when all nudges explored for the first time
      if (next.size === NUDGES.length && prev.size < NUDGES.length) {
        markLessonComplete('lesson-complete-tokenizer')
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
      style={{ padding: '20px 0 20px' }}
    >
      {/* === BAR 1: Your text === */}
      <div style={{ ...labelStyle, color: 'var(--nvidia-green)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Your text</span>
        {userHasTyped && (
          <span style={{
            color: charCount >= CHAR_LIMIT ? '#e87a96' : charCount >= CHAR_LIMIT * 0.85 ? '#e8d06e' : 'var(--text-dim)',
            fontWeight: charCount >= CHAR_LIMIT ? 600 : 400,
            fontSize: 11,
            transition: 'color 0.2s',
          }}>
            {charCount}/{CHAR_LIMIT}
          </span>
        )}
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
          {(textFocused || (!userHasTyped && !isAutoTyping)) && (
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
          onFocus={() => {
            setTextFocused(true)
            setEditingBar('text')
            // On first focus, stop auto-typing and clear so user can type
            if (!userHasTyped) {
              setIsAutoTyping(false)
              setNudgeTyping(null)
              setUserHasTyped(true)
              onInputChange('')
              onUserTyped?.()
            }
          }}
          onBlur={() => { setTextFocused(false); setEditingBar(null) }}
          maxLength={CHAR_LIMIT}
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

      <div style={{
        marginTop: 24,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}>
        <div>
          <div style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}>
            What is a token?
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            A token is a small piece of text — it might be a whole word, part of a word, or even a single character. AI doesn't read words the way you do. It breaks everything down into these pieces first. Each colored chunk above is one token.
          </div>
        </div>
        <div>
          <div style={{
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 12,
          }}>
            What is a tokenizer?
          </div>
          <div style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}>
            A tokenizer is the tool that decides where to split. The one running here is <span style={{ color: 'var(--text-primary)' }}>cl100k_base</span> — the same tokenizer used by ChatGPT and GPT-4. It has a vocabulary of ~100,000 tokens, and every piece of text you type gets mapped to entries in that vocabulary. This is the very first step a language model performs before it can understand anything.
          </div>
        </div>
      </div>

      {/* Nudges - accordion style, each expands to reveal insight */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
        {NUDGES.map((nudge, i) => (
          <Nudge
            key={nudge.key}
            icon={nudge.icon}
            onClick={() => handleNudge(nudge.key, nudge.text)}
            delay={0}
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
      </div>

      {/* Go Deeper panel — always visible */}
      <DepthPanel
        visible={true}
        delay={0.5}
        onOpen={onDepthOpened}
        sections={[
          {
            label: 'The Problem',
            color: 'var(--nvidia-green)',
            defaultOpen: true,
            content: (
              <div>
                <p style={{ marginBottom: 16 }}>
                  <strong style={{ color: 'var(--nvidia-green)', fontSize: 15 }}>The problem: AI can't read.</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  Neural networks are math machines — they multiply matrices and add numbers.
                  They have no concept of "a" or "z" or "strawberry." So before AI can think about
                  your text, something has to convert it into numbers. That something is called a{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>tokenizer</strong>.
                </p>
                <p style={{ marginBottom: 20 }}>
                  But <em>how</em> do you decide what each number represents? You have three options:
                </p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}>
                    <strong style={{ color: '#e87a96' }}>Option A: One number per character</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      "hello" → 5 numbers. Simple, but wildly inefficient.
                      A 1,000-word essay becomes ~5,000 tokens. AI's context window fills up fast,
                      and the model wastes processing power on individual letters that carry little meaning on their own.
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}>
                    <strong style={{ color: '#e8d06e' }}>Option B: One number per word</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Efficient for common words, but English alone has 750,000+ words. Add misspellings,
                      slang, code, other languages — you'd need millions of entries. And any word not in
                      the dictionary? Completely invisible to the model.
                    </div>
                  </div>
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(118,185,0,0.06)',
                    border: '1px solid rgba(118,185,0,0.25)',
                    borderRadius: 8,
                  }}>
                    <strong style={{ color: 'var(--nvidia-green)' }}>Option C: Byte Pair Encoding — the sweet spot</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Learn the most useful pieces from real data. Common words like "the" get their own token.
                      Rare words get broken into reusable subword pieces. A fixed vocabulary of ~100K tokens
                      can represent <em>any</em> text in <em>any</em> language.
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            label: 'How BPE Works',
            color: 'var(--nvidia-green)',
            content: (
              <div>
                <p style={{ marginBottom: 12 }}>
                  Imagine you're inventing a shorthand for writing faster. You'd look at what you write most
                  and create abbreviations for the most common patterns. BPE does exactly this, automatically,
                  by scanning billions of words of text:
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  <StepBox step={1} title="Start with individual bytes">
                    Break every piece of text into its smallest units — individual bytes (roughly characters).
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 8, color: 'var(--text-primary)', letterSpacing: 1 }}>
                      "hello" → [h] [e] [l] [l] [o]
                    </div>
                  </StepBox>
                  <StepBox step={2} title="Count every adjacent pair">
                    Scan the entire training dataset (think: all of Wikipedia, Reddit, books, code).
                    Count how often each pair of adjacent tokens appears together.
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 8, color: 'var(--text-primary)' }}>
                      "th" appears 9.2 billion times{' '}
                      <span style={{ color: 'var(--nvidia-green)' }}>← winner</span>
                    </div>
                  </StepBox>
                  <StepBox step={3} title="Merge the most frequent pair">
                    Combine [t] + [h] → [th] everywhere in the data. This new merged token
                    becomes part of the vocabulary.
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 8, color: 'var(--text-primary)' }}>
                      Before: [t] [h] [e] → After: [th] [e]
                    </div>
                  </StepBox>
                  <StepBox step={4} title="Repeat ~100,000 times">
                    Each round, find and merge the next most frequent pair. Early merges create
                    common pairs like "in", "er", "the". Later merges create full words
                    like "the", "and", "function". After ~100K merges, you have a complete vocabulary.
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 8, color: 'var(--text-primary)' }}>
                      [th] + [e] → [the] — now "the" is a single token
                    </div>
                  </StepBox>
                </div>
              </div>
            ),
          },
          {
            label: 'The Result',
            color: 'var(--nvidia-green)',
            content: (
              <div>
                <p style={{ marginBottom: 12 }}>
                  The tokenizer you're using right now is <strong style={{ color: 'var(--text-primary)' }}>cl100k_base</strong> — the
                  same one inside GPT-4. It has a vocabulary of exactly <strong style={{ color: 'var(--text-primary)' }}>100,256 tokens</strong>.
                </p>
                <p style={{ marginBottom: 6 }}>
                  Common English words like "the", "and", "hello" each get one token.
                  Rare words like "supercalifragilisticexpialidocious" get shattered into many small pieces.
                  And non-Latin scripts — Arabic, Hindi, Chinese — often get broken into even more
                  fragments, because there was less of that text in the training data.
                </p>
                <p style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(118,185,0,0.06)', borderRadius: 8, borderLeft: '3px solid var(--nvidia-green)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Key insight:</strong>{' '}
                  The tokenizer is trained <em>separately</em> from the AI model, <em>before</em> the
                  model ever sees any data. It's a preprocessing step. The neural network never sees
                  your characters — only the integer IDs the tokenizer produces. Everything the model
                  knows about language starts from these numbers.
                </p>
              </div>
            ),
          },
          {
            label: 'See It In Code',
            color: '#6ec0e8',
            content: (
              <PythonCode code={`import tiktoken

# Load the same tokenizer used by GPT-4
enc = tiktoken.get_encoding("cl100k_base")

# ── Tokenize a word ─────────────────────────────────
text = "strawberry"
token_ids = enc.encode(text)
print(f'"{text}" → {token_ids}')
# "strawberry" → [496, 675, 15717]

# ── See what each token ID represents ───────────────
for token_id in token_ids:
    fragment = enc.decode([token_id])
    print(f"  ID {token_id:>6} → '{fragment}'")
# ID    496 → 'str'
# ID    675 → 'aw'
# ID  15717 → 'berry'

# ── The language inequality ─────────────────────────
english = "Hello, how are you?"
arabic  = "مرحبا كيف حالك"

en_tokens = enc.encode(english)
ar_tokens = enc.encode(arabic)

print(f"English: {len(en_tokens)} tokens")  # ~5
print(f"Arabic:  {len(ar_tokens)} tokens")  # ~12
# Same meaning. Different cost.`} />
            ),
          },
          {
            label: 'Challenge',
            color: '#e8d06e',
            content: (
              <div>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Think about it:</strong>
                </p>
                <p style={{ marginBottom: 12 }}>
                  If BPE merges are based on frequency in training data, and the training data was
                  mostly English web text — what happens to languages that weren't well represented?
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>1.</strong> Type "Hello, how are you?" above and note the token count.
                  Then try it in Spanish, Arabic, Hindi, or Yoruba. How does the count change?
                </p>
                <p style={{ marginBottom: 8, paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>2.</strong> Try typing a common English name ("John") vs. a name from
                  another culture. Which one stays in one piece?
                </p>
                <p style={{ paddingLeft: 16 }}>
                  <strong style={{ color: '#e8d06e' }}>3.</strong> What would happen if you trained a tokenizer on <em>only</em>{' '}
                  Arabic text? Would English words start getting fragmented instead?
                </p>
              </div>
            ),
          },
          {
            label: 'Why This Matters',
            color: '#e87a96',
            content: (
              <div>
                <p style={{ marginBottom: 14 }}>
                  Tokenization seems like a small technical detail — but it has real consequences
                  for billions of people.
                </p>
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #e8d06e' }}>
                    <strong style={{ color: '#e8d06e' }}>Cost inequality</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      AI APIs charge per token. The same message in Yoruba or Bengali can use 2-4x
                      more tokens than English — meaning people in those languages literally pay more
                      for the same service.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #6ec0e8' }}>
                    <strong style={{ color: '#6ec0e8' }}>Quality gap</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      AI models have a fixed context window (e.g. 128K tokens). If your language burns
                      through tokens 3x faster, you get 3x less room for the AI to reason. Same model,
                      worse results — just because of which language you speak.
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #e87a96' }}>
                    <strong style={{ color: '#e87a96' }}>Identity erasure</strong>
                    <div style={{ marginTop: 4, fontSize: 13 }}>
                      Names like "John" or "Sarah" are single tokens — the model sees them whole.
                      Names like "Oluwaseun" or "Bhagyashree" get fragmented into meaningless syllables.
                      The model literally cannot see these names the way it sees English ones.
                    </div>
                  </div>
                </div>
                <p style={{ marginTop: 14, fontSize: 13, color: 'var(--nvidia-green)', fontWeight: 500 }}>
                  This is where AI inequity begins — not in the model's weights, but in the very first
                  step: how text becomes numbers.
                </p>
              </div>
            ),
          },
        ]}
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

function StepBox({ step, title, children }) {
  return (
    <div style={{
      display: 'flex',
      gap: 14,
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid var(--border)',
      borderRadius: 8,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'var(--nvidia-green-dim)',
        color: 'var(--nvidia-green)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {step}
      </div>
      <div style={{ flex: 1 }}>
        <strong style={{ color: 'var(--text-primary)', fontSize: 14 }}>{title}</strong>
        <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.6 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
