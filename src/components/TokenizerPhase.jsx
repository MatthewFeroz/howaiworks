import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TokenBlock from './TokenBlock'
import Nudge from './Nudge'
import Insight from './Insight'
import DepthPanel from './DepthPanel'

export default function TokenizerPhase({
  inputText,
  onInputChange,
  tokens,
  showIds,
  isLoading,
  isReady,
  interactionCount,
}) {
  const [showNudges, setShowNudges] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [showDepth, setShowDepth] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (interactionCount >= 1 && !showNudges) setShowNudges(true)
    if (interactionCount >= 3 && !showInsight) setShowInsight(true)
    if (interactionCount >= 4 && !showDepth) setShowDepth(true)
  }, [interactionCount, showNudges, showInsight, showDepth])

  const handleNudge = (text) => {
    onInputChange(text)
    if (inputRef.current) {
      inputRef.current.value = text
      inputRef.current.focus()
    }
  }

  const handleNameNudge = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.placeholder = 'Type your name here...'
      inputRef.current.focus()
    }
    onInputChange('')
  }

  const tokenCount = tokens.length
  const charCount = inputText.length
  const charsPerToken = tokenCount > 0 ? (charCount / tokenCount).toFixed(1) : 0
  const estimatedCost = tokenCount > 0 ? (tokenCount * 0.00003).toFixed(6) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      style={{ padding: '40px 0' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--nvidia-green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
        Phase 01
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        Your words aren't words
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
        AI models don't read text the way you do. They break everything into
        fragments called <strong style={{ color: 'var(--text-primary)' }}>tokens</strong>.
        Type anything below and see what happens.
      </p>

      {/* Input */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        <textarea
          ref={inputRef}
          placeholder="Type anything here..."
          rows={2}
          autoFocus
          onChange={(e) => onInputChange(e.target.value)}
          style={{
            width: '100%', padding: '20px 24px', background: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)', fontSize: 18, lineHeight: 1.6, resize: 'none',
            outline: 'none', transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--nvidia-green)'
            e.target.style.boxShadow = '0 0 0 3px var(--nvidia-green-dim), 0 0 30px rgba(118,185,0,0.08)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        {isLoading && (
          <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
            Loading tokenizer...
          </div>
        )}
      </div>

      {/* Token display */}
      <div style={{ minHeight: 60, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start', marginBottom: 16 }}>
        <AnimatePresence mode="popLayout">
          {tokens.map((token, i) => (
            <TokenBlock key={`${token.id}-${i}-${token.text}`} token={token} index={i} showId={showIds} />
          ))}
        </AnimatePresence>
      </div>

      {/* Stats bar */}
      {tokenCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0',
            borderTop: '1px solid var(--border)', fontFamily: 'var(--font-mono)',
            fontSize: 13, color: 'var(--text-secondary)', flexWrap: 'wrap',
          }}
        >
          <span>
            <span style={{ color: 'var(--nvidia-green)', fontWeight: 600, fontSize: 15 }}>{tokenCount}</span> tokens
          </span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span>{charCount} characters</span>
          <span style={{ color: 'var(--text-dim)' }}>·</span>
          <span>{charsPerToken} chars/token</span>
          {estimatedCost && (
            <>
              <span style={{ color: 'var(--text-dim)' }}>·</span>
              <span style={{ color: '#e8d06e' }}>~${estimatedCost} API cost</span>
            </>
          )}
        </motion.div>
      )}

      {/* Nudges */}
      {showNudges && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          <Nudge icon="🍓" onClick={() => handleNudge('strawberry')} delay={0}>
            Try <Accent>strawberry</Accent> — can AI count the r's if it can't see the letters?
          </Nudge>
          <Nudge icon="👤" onClick={handleNameNudge} delay={0.1}>
            Type <Accent>your name</Accent> — how many pieces does it become?
          </Nudge>
          <Nudge icon="🏙️" onClick={() => handleNudge('I love New York City')} delay={0.2}>
            Try <Accent>I love New York City</Accent> — common phrases may merge
          </Nudge>
          <Nudge icon="🌏" onClick={() => handleNudge('こんにちは世界')} delay={0.3}>
            Try <Accent>こんにちは世界</Accent> — how does AI handle Japanese?
          </Nudge>
          <Nudge icon="💪" onClick={() => handleNudge('Schwarzenegger')} delay={0.4}>
            Try <Accent>Schwarzenegger</Accent> — long words get shattered
          </Nudge>
          <Nudge icon="💰" onClick={() => handleNudge('The quick brown fox jumps over the lazy dog')} delay={0.5}>
            Try <Accent>The quick brown fox...</Accent> — common English is token-efficient
          </Nudge>
        </div>
      )}

      {/* Surface-level insight */}
      <Insight visible={showInsight}>
        <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>What just happened?</strong>{' '}
        AI models use a <em>tokenizer</em> to chop text into pieces. Common words like "the"
        stay whole, but unusual words, names, and non-English text get split into smaller
        fragments. This is ALL the model works with — it never sees your original letters.
      </Insight>

      {/* University-depth panel */}
      <DepthPanel
        visible={showDepth}
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
              used by GPT-4. It has a vocabulary of ~100,256 tokens. Every model family trains its own
              tokenizer on its training data, which is why different models tokenize the same text differently.
            </p>
            <p>
              Key insight: <strong style={{ color: 'var(--text-primary)' }}>the tokenizer is trained separately from the language model</strong>.
              It's a preprocessing step that converts raw text into integer IDs. The neural network never sees characters — only these IDs.
            </p>
          </div>
        }
        code={`# Python — tokenize with tiktoken (same engine powering this app)
import tiktoken

enc = tiktoken.get_encoding("cl100k_base")

text = "strawberry"
tokens = enc.encode(text)
print(tokens)          # [496, 675, 15717]
print(len(tokens))     # 3 tokens

# Decode each token to see the splits
for t in tokens:
    print(f"  Token {t}: '{enc.decode([t])}'")
    # Token 496:   'str'
    # Token 675:   'aw'  
    # Token 15717: 'berry'

# This is why GPT struggles to count letters in "strawberry"
# It never receives individual characters — just [496, 675, 15717]

# Compare languages:
print(len(enc.encode("Hello, how are you?")))  # ~6 tokens (English)
print(len(enc.encode("مرحبا، كيف حالك؟")))      # ~12 tokens (Arabic)
# Same meaning, 2x the tokens — 2x the cost`}
        challenge={
          <div>
            <p style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Try this:</strong> Type the same sentence in English
              and another language. Compare the token counts.
            </p>
            <p>
              Why does non-English text produce more tokens? What does this imply about the training data?
              And what does it mean for users who primarily speak languages other than English — both in
              terms of cost and quality?
            </p>
          </div>
        }
        realWorld={
          <div>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Tokenization is where AI inequity begins.</strong>
            </p>
            <p style={{ marginBottom: 8 }}>
              Languages underrepresented in training data produce more tokens for the same meaning. This has
              cascading consequences:
            </p>
            <p style={{ marginBottom: 6, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Cost:</strong> API pricing is per-token. The same message in
              Yoruba or Bengali can cost 2-4x more than in English.
            </p>
            <p style={{ marginBottom: 6, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Quality:</strong> More tokens per message means less room in the
              model's context window for actual reasoning.
            </p>
            <p style={{ marginBottom: 12, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Identity:</strong> Names from non-Western cultures get shattered
              into meaningless fragments, while "John" stays whole. The model begins with less information
              about that person before it even starts processing.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>
              This is a structural consequence of training on English-heavy data. Understanding tokenization
              is the first step to understanding why AI systems perform differently across languages and cultures.
            </p>
          </div>
        }
      />
    </motion.div>
  )
}

function Accent({ children }) {
  return <em style={{ color: 'var(--nvidia-green)', fontStyle: 'normal', fontWeight: 500 }}>{children}</em>
}
