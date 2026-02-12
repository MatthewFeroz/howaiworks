import { useCallback, useRef, useState } from 'react'

/**
 * useTokenizer — client-side BPE tokenization via js-tiktoken
 * 
 * js-tiktoken is a JavaScript port of OpenAI's tiktoken.
 * It loads the cl100k_base encoding (used by GPT-4) and gives us
 * real token IDs and boundaries — no backend needed.
 * 
 * We lazy-load the encoder on first use since the vocab file is ~3MB.
 */

let encoderPromise = null

async function getEncoder() {
  if (!encoderPromise) {
    encoderPromise = (async () => {
      // js-tiktoken exports getEncoding for standard encodings
      const { getEncoding } = await import('js-tiktoken')
      return getEncoding('cl100k_base')
    })()
  }
  return encoderPromise
}

export function useTokenizer() {
  const [tokens, setTokens] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const encoderRef = useRef(null)

  const initialize = useCallback(async () => {
    if (encoderRef.current) return
    setIsLoading(true)
    try {
      encoderRef.current = await getEncoder()
      setIsReady(true)
    } catch (err) {
      console.error('Failed to load tokenizer:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const tokenize = useCallback((text) => {
    if (!text) {
      setTokens([])
      return []
    }

    const encoder = encoderRef.current
    if (!encoder) return []

    // Get token IDs — synchronous, no async overhead
    const ids = encoder.encode(text)

    // Decode each token individually to get the text for each one
    const result = []

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i]
      // Decode single token to get its text representation
      const decoded = encoder.decode([id])

      result.push({
        id,
        text: decoded,
        // Display version: show space indicator for leading spaces
        display: decoded.startsWith(' ') ? '⎵' + decoded.slice(1) : decoded,
        index: i,
      })
    }

    setTokens(result)
    return result
  }, [])

  const decode = useCallback((ids) => {
    const encoder = encoderRef.current
    if (!encoder || !ids.length) return { text: '', tokens: [] }
    const tokenObjs = ids.map((id, i) => {
      try {
        const decoded = encoder.decode([id])
        return { id, text: decoded, display: decoded.startsWith(' ') ? '⎵' + decoded.slice(1) : decoded, index: i }
      } catch { return { id, text: '�', display: '�', index: i } }
    })
    return { text: tokenObjs.map(t => t.text).join(''), tokens: tokenObjs }
  }, [])

  return {
    tokens,
    tokenize,
    decode,
    initialize,
    isLoading,
    isReady,
  }
}
