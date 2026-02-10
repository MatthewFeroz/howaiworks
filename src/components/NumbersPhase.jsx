import { motion } from 'framer-motion'
import Insight from './Insight'
import DepthPanel from './DepthPanel'

export default function NumbersPhase({ visible, tokens, inputText, showIds, onToggleIds }) {
  if (!visible) return null

  const tokenIds = tokens.map((t) => t.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ padding: '40px 0' }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--nvidia-green)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
        Phase 02
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
        It's all just numbers
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
        Each token maps to a numeric ID. These numbers are the{' '}
        <strong style={{ color: 'var(--text-primary)' }}>only thing</strong>{' '}
        the AI model receives. Not letters, not meaning — just integers.
      </p>

      {/* Toggle button */}
      <button
        onClick={onToggleIds}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 20px',
          background: showIds ? 'var(--nvidia-green-dim)' : 'var(--bg-surface)',
          border: `1px solid ${showIds ? 'var(--nvidia-green)' : 'var(--border)'}`,
          borderRadius: 8, color: showIds ? 'var(--nvidia-green)' : 'var(--text-primary)',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
          cursor: 'pointer', transition: 'all 0.3s', marginBottom: 24,
        }}
      >
        <div style={{
          width: 36, height: 20,
          background: showIds ? 'rgba(118, 185, 0, 0.3)' : 'var(--bg-elevated)',
          borderRadius: 10, position: 'relative', transition: 'background 0.3s',
        }}>
          <div style={{
            position: 'absolute', width: 16, height: 16,
            background: showIds ? 'var(--nvidia-green)' : 'var(--text-secondary)',
            borderRadius: '50%', top: 2, left: showIds ? 18 : 2, transition: 'all 0.3s',
          }} />
        </div>
        Reveal the numbers underneath
      </button>

      {/* AI view comparison */}
      {showIds && inputText && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: 24, marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12 }}>
              What you see
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, lineHeight: 1.8 }}>
              {inputText}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--nvidia-green)', marginBottom: 12 }}>
              What AI sees
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, lineHeight: 1.8, color: 'var(--nvidia-green)', wordBreak: 'break-all' }}>
              {tokenIds.length > 0 ? `[${tokenIds.join(', ')}]` : '...'}
            </div>
          </div>
        </motion.div>
      )}

      {/* Surface insight */}
      <Insight visible={showIds}>
        <strong style={{ color: 'var(--nvidia-green)', fontWeight: 600 }}>Think about this:</strong>{' '}
        When you ask ChatGPT a question, it never sees your words. It receives a sequence
        of numbers like [{tokenIds.slice(0, 5).join(', ')}{tokenIds.length > 5 ? ', ...' : ''}] and
        has to figure out what you mean from those alone. Every response it gives starts as
        numbers too — translated back into text only at the very end.
      </Insight>

      {/* University-depth panel */}
      <DepthPanel
        visible={showIds}
        concept={
          <div>
            <p style={{ marginBottom: 12 }}>
              Each token ID is an index into an <strong style={{ color: 'var(--text-primary)' }}>embedding matrix</strong> — 
              a giant lookup table where each row is a high-dimensional vector (typically 768 to 12,288 dimensions
              depending on the model). When the model receives token ID 496, it looks up row 496 and retrieves
              a vector like [0.023, -0.817, 0.445, ...].
            </p>
            <p style={{ marginBottom: 12 }}>
              This vector IS the meaning. The entire intelligence of a language model operates on these
              vectors — transforming them through attention layers and feed-forward networks. The raw
              text is gone. Only the vectors remain.
            </p>
            <p>
              The embedding matrix is <strong style={{ color: 'var(--text-primary)' }}>learned during training</strong>.
              Words used in similar contexts end up with similar vectors — not because anyone programmed that,
              but because the training objective (predicting the next token) naturally creates this structure.
              This is the foundation of Phase 03.
            </p>
          </div>
        }
        code={`# Python — from token ID to embedding vector
import numpy as np

# Conceptual model of what happens inside a transformer:
vocab_size = 100256       # cl100k_base vocabulary
embedding_dim = 1536      # GPT-4's embedding dimension

# The embedding matrix — learned during training
# Shape: (100256, 1536) — ~154 million parameters just for this table!
embedding_matrix = model.get_embedding_weights()

# When the model receives token IDs:
token_ids = [791, 1071, 64, 2294]  # "What does AI see"

# Each ID becomes a vector:
vectors = embedding_matrix[token_ids]  # Shape: (4, 1536)

# These vectors are what the transformer actually processes.
# The text is gone. Only numbers remain.

# Fun fact: this embedding matrix alone is ~600MB for GPT-4.
# It's the "dictionary" the model uses to convert tokens to meaning.
print(f"Matrix size: {vocab_size * embedding_dim * 4 / 1e6:.0f} MB (float32)")`}
        challenge={
          <div>
            <p style={{ marginBottom: 8 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Think about this:</strong> The cl100k_base vocabulary
              has 100,256 tokens. GPT-4's embedding dimension is 1,536. How many parameters are in the
              embedding matrix alone?
            </p>
            <p style={{ marginBottom: 8 }}>
              Now consider: GPT-4 reportedly has ~1.8 trillion total parameters. What percentage of the
              model is "just" the embedding lookup table?
            </p>
            <p style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
              The embedding matrix is the bridge between human language and the mathematical space where
              all reasoning happens. It's a small fraction of the model, but without it, nothing works.
            </p>
          </div>
        }
        realWorld={
          <div>
            <p style={{ marginBottom: 12 }}>
              <strong style={{ color: 'var(--text-primary)' }}>Every AI API call is billed by token count.</strong>{' '}
              Understanding token IDs isn't just academic — it directly affects the cost of every
              application built on LLMs.
            </p>
            <p style={{ marginBottom: 8, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ GPT-4 Turbo input:</strong> ~$0.01 per 1,000 tokens.
              A single page of English text (~500 words) costs about $0.005 to process.
            </p>
            <p style={{ marginBottom: 8, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Context windows:</strong> GPT-4 Turbo supports 128K tokens.
              That's roughly a 300-page book. But every token you spend on the prompt is a token you
              can't use for the response.
            </p>
            <p style={{ marginBottom: 12, paddingLeft: 16 }}>
              <strong style={{ color: '#e8d06e' }}>→ Prompt engineering is token engineering:</strong>{' '}
              The most effective prompts are token-efficient. Understanding how text maps to tokens
              helps you write prompts that maximize the model's available reasoning space.
            </p>
            <p style={{ fontStyle: 'italic', color: 'var(--text-dim)' }}>
              Companies building AI products obsess over token counts. Reducing a system prompt from
              500 tokens to 300 tokens across millions of API calls saves tens of thousands of dollars.
            </p>
          </div>
        }
      />
    </motion.div>
  )
}
