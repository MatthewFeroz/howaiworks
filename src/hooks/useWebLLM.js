import { useState, useRef, useEffect, useCallback } from 'react'

const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC'

export function useWebLLM({ autoLoad = true } = {}) {
  const [status, setStatus] = useState('idle') // idle | loading | ready | unsupported | error
  const [progress, setProgress] = useState({ text: '', progress: 0 })
  const engineRef = useRef(null)
  const loadingRef = useRef(false)

  const load = useCallback(async () => {
    if (loadingRef.current || engineRef.current) return
    loadingRef.current = true

    // Check WebGPU support
    if (!navigator.gpu) {
      setStatus('unsupported')
      loadingRef.current = false
      return
    }

    setStatus('loading')
    setProgress({ text: 'Initializing WebGPU...', progress: 0 })

    try {
      const { CreateMLCEngine } = await import('@mlc-ai/web-llm')

      const engine = await CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report) => {
          setProgress({
            text: report.text || '',
            progress: report.progress || 0,
          })
        },
      })

      engineRef.current = engine
      setStatus('ready')
    } catch (err) {
      console.error('WebLLM load error:', err)
      setStatus('error')
      loadingRef.current = false
    }
  }, [])

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) load()
  }, [autoLoad, load])

  const chat = useCallback((prompt, { onToken, onDone, onError } = {}) => {
    const engine = engineRef.current
    if (!engine) {
      onError?.('WebLLM engine not ready')
      return () => {}
    }

    let aborted = false

    ;(async () => {
      try {
        const reply = await engine.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          stream: true,
          max_tokens: 256,
          temperature: 0.7,
        })

        for await (const chunk of reply) {
          if (aborted) break
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) onToken?.(delta)
        }

        if (!aborted) onDone?.()
      } catch (err) {
        if (!aborted) {
          console.error('WebLLM chat error:', err)
          onError?.(err)
        }
      }
    })()

    return () => { aborted = true }
  }, [])

  return {
    status,
    progress,
    isReady: status === 'ready',
    load,
    chat,
  }
}
