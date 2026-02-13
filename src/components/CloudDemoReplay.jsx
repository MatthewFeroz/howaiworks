// Pre-recorded cloud responses for demo mode
// Simulates cloud inference: longer initial delay (network hop) + faster token rate

export const CLOUD_DEMO_RESPONSES = [
  {
    prompt: 'What is artificial intelligence?',
    response: 'Artificial intelligence (AI) refers to computer systems designed to perform tasks that typically require human intelligence. This includes understanding natural language, recognizing patterns in data, making decisions, and generating creative content.\n\nAt its core, modern AI works through neural networks — mathematical models loosely inspired by the human brain. These networks contain billions of parameters (numbers) that are adjusted during training on massive datasets. The model learns statistical patterns: given this input, what output is most likely?\n\nThe transformer architecture, introduced in 2017, revolutionized AI by enabling models to process entire sequences of text simultaneously using "attention mechanisms" — allowing every word to consider every other word when determining meaning. This is the foundation of GPT-4, Claude, Gemini, and other large language models you interact with today.\n\nImportantly, AI doesn\'t "understand" in the way humans do. It\'s an extraordinarily sophisticated pattern matcher that has learned the statistical structure of human language from trillions of words of text.',
  },
  {
    prompt: 'Explain how neural networks learn',
    response: 'Neural networks learn through a process called training, which involves three key steps repeated millions of times:\n\n1. **Forward pass**: Input data flows through layers of neurons. Each neuron multiplies its inputs by weights, adds a bias, and applies an activation function. The network produces a prediction.\n\n2. **Loss calculation**: The prediction is compared to the correct answer using a loss function. This produces a single number measuring how wrong the prediction was.\n\n3. **Backpropagation**: The loss is propagated backwards through the network using calculus (specifically, the chain rule). This computes the gradient — how much each weight contributed to the error. Weights are then nudged in the direction that reduces the loss.\n\nThis process, called gradient descent, is repeated over billions of examples. Over time, the weights converge to values that make accurate predictions across the training data.\n\nThe key insight is that the network discovers its own internal representations. Nobody tells it what features to look for — it learns that certain patterns in the data are useful for making predictions. This is what makes deep learning so powerful and so different from traditional programming.',
  },
]

// Simulate cloud streaming: initial delay (300-800ms) + faster token rate (~80 tok/s)
export function simulateCloudStream(text, onToken, onDone, options = {}) {
  const {
    initialDelay = 400 + Math.random() * 400,
    tokenInterval = 12 + Math.random() * 8,
  } = options

  // Split into small chunks that approximate tokens
  const chunks = []
  let i = 0
  while (i < text.length) {
    const chunkSize = Math.min(2 + Math.floor(Math.random() * 4), text.length - i)
    let end = i + chunkSize
    if (end < text.length && text[end] !== ' ' && text.indexOf(' ', i) > 0) {
      const nextSpace = text.indexOf(' ', end)
      if (nextSpace > 0 && nextSpace - end < 3) {
        end = nextSpace + 1
      }
    }
    chunks.push(text.slice(i, end))
    i = end
  }

  let idx = 0
  let intervalId = null
  let cancelled = false

  // Initial delay simulating network latency
  const delayTimer = setTimeout(() => {
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
  }, initialDelay)

  return () => {
    cancelled = true
    clearTimeout(delayTimer)
    if (intervalId) clearInterval(intervalId)
  }
}
