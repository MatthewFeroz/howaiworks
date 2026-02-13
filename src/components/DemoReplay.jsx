// Pre-recorded conversations for demo mode
// Simulates realistic Ollama streaming at ~30 tokens/sec

export const DEMO_CONVERSATIONS = [
  {
    prompt: 'What is a neural network?',
    response: 'A neural network is a computing system inspired by biological brains. It consists of layers of interconnected nodes (neurons) that process information. Each connection has a weight that adjusts during training. Data flows through input layers, gets transformed by hidden layers, and produces output. The network learns by adjusting weights to minimize prediction errors — a process called backpropagation. Even this small 500M parameter model uses the same fundamental architecture as GPT-4, just with fewer layers and neurons.',
  },
  {
    prompt: 'How do you understand my words?',
    response: 'I don\'t read words the way you do. Your text gets broken into tokens — small pieces that are often parts of words, not whole words. Each token maps to a number (an ID), and those numbers get converted into vectors (lists of hundreds of numbers). These vectors capture meaning: similar words have similar vectors. I process these vectors through layers of attention mechanisms, where each token looks at every other token to understand context. The word "bank" means something different in "river bank" vs "bank account" — attention helps me figure that out.',
  },
  {
    prompt: 'Can you run on a Chromebook?',
    response: 'Yes! I\'m qwen2.5:0.5b — a 500 million parameter model that needs only about 1GB of RAM. That\'s small enough to run on most Chromebooks, old laptops, even a Raspberry Pi. No GPU required, no internet needed, no API key, no subscription. Larger models like GPT-4 have over a trillion parameters and need massive server farms. But I can still have conversations, answer questions, and explain concepts. The tradeoff is that I\'m less capable on complex reasoning tasks — but for learning and experimentation, I work great. AI doesn\'t have to be expensive or exclusive.',
  },
]

// Simulate token streaming by splitting response into word-level chunks
// Optional params: initialDelay (ms before first token), tokenInterval (ms between tokens)
export function simulateTokenStream(text, onToken, onDone, options = {}) {
  const {
    initialDelay = 0,
    tokenInterval = 30 + Math.random() * 20,
  } = options

  // Split into small chunks that approximate tokens
  const chunks = []
  let i = 0
  while (i < text.length) {
    // Vary chunk size for realism (2-6 chars)
    const chunkSize = Math.min(2 + Math.floor(Math.random() * 4), text.length - i)
    // Don't break in the middle of a word if possible
    let end = i + chunkSize
    if (end < text.length && text[end] !== ' ' && text.indexOf(' ', i) > 0) {
      const nextSpace = text.indexOf(' ', end)
      const prevSpace = text.lastIndexOf(' ', end)
      if (nextSpace > 0 && nextSpace - end < 3) {
        end = nextSpace + 1
      } else if (prevSpace > i) {
        // keep end as-is for variety
      }
    }
    chunks.push(text.slice(i, end))
    i = end
  }

  let idx = 0
  let intervalId = null
  let cancelled = false

  const startStreaming = () => {
    if (cancelled) return
    intervalId = setInterval(() => {
      if (idx >= chunks.length) {
        clearInterval(intervalId)
        onDone()
        return
      }
      onToken(chunks[idx])
      idx++
    }, tokenInterval)
  }

  if (initialDelay > 0) {
    const delayTimer = setTimeout(startStreaming, initialDelay)
    return () => {
      cancelled = true
      clearTimeout(delayTimer)
      if (intervalId) clearInterval(intervalId)
    }
  } else {
    startStreaming()
    return () => {
      cancelled = true
      if (intervalId) clearInterval(intervalId)
    }
  }
}
