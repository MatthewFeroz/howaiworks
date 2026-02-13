import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'
import embeddingData from '../data/embeddingMap.json'

const CATEGORY_COLORS = {
  animal: '#a8d86e',
  emotion: '#e8956e',
  technology: '#e8d06e',
  food: '#6ee8cc',
  place: '#94a0e8',
  person: '#c58ee8',
}

const CATEGORY_LABELS = {
  animal: 'Animals',
  emotion: 'Emotions',
  technology: 'Technology',
  food: 'Food',
  place: 'Places',
  person: 'People',
}

const REPRESENTATIVE_WORDS = embeddingData.representativeWords || {
  animal: ['cat', 'eagle', 'whale', 'butterfly'],
  emotion: ['happy', 'fear', 'love', 'calm'],
  technology: ['computer', 'AI', 'GPU', 'python'],
  food: ['pizza', 'apple', 'coffee', 'sushi'],
  place: ['Paris', 'ocean', 'school', 'forest'],
  person: ['doctor', 'king', 'artist', 'mother'],
}

const MINI_EMBEDDINGS = embeddingData.miniEmbeddings || {}

// Spread coordinates at runtime to prevent overlap while keeping category structure
function spreadCoordinates(words, spreadFactor = 3.2) {
  // Compute center of mass per category
  const categories = {}
  for (const w of words) {
    if (!categories[w.category]) categories[w.category] = { xs: [], ys: [] }
    categories[w.category].xs.push(w.x)
    categories[w.category].ys.push(w.y)
  }
  const centers = {}
  for (const [cat, data] of Object.entries(categories)) {
    centers[cat] = {
      cx: data.xs.reduce((a, b) => a + b, 0) / data.xs.length,
      cy: data.ys.reduce((a, b) => a + b, 0) / data.ys.length,
    }
  }

  // Spread each word away from its category center, add slight jitter
  const rng = (seed) => {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
  }
  const rand = rng(42)

  return words.map(w => {
    const c = centers[w.category]
    const dx = w.x - c.cx
    const dy = w.y - c.cy
    const jitterX = (rand() - 0.5) * 0.02
    const jitterY = (rand() - 0.5) * 0.02
    // Deterministic scrambled position for before/after animation
    const scrambledX = (rand() - 0.5) * 1.7
    const scrambledY = (rand() - 0.5) * 1.7
    return {
      ...w,
      spreadX: Math.max(-0.95, Math.min(0.95, c.cx + dx * spreadFactor + jitterX)),
      spreadY: Math.max(-0.95, Math.min(0.95, c.cy + dy * spreadFactor + jitterY)),
      scrambledX: Math.max(-0.85, Math.min(0.85, scrambledX)),
      scrambledY: Math.max(-0.85, Math.min(0.85, scrambledY)),
      origX: w.x,
      origY: w.y,
    }
  })
}

// Compute category cloud ellipses from spread coordinates
function computeCategoryClouds(spreadWords) {
  const groups = {}
  for (const w of spreadWords) {
    if (!groups[w.category]) groups[w.category] = []
    groups[w.category].push(w)
  }
  const clouds = {}
  for (const [cat, ws] of Object.entries(groups)) {
    const cx = ws.reduce((a, w) => a + w.spreadX, 0) / ws.length
    const cy = ws.reduce((a, w) => a + w.spreadY, 0) / ws.length
    // Compute radius as max distance from center + padding
    let maxDx = 0, maxDy = 0
    for (const w of ws) {
      maxDx = Math.max(maxDx, Math.abs(w.spreadX - cx))
      maxDy = Math.max(maxDy, Math.abs(w.spreadY - cy))
    }
    clouds[cat] = {
      cx, cy,
      rx: maxDx + 0.06,
      ry: maxDy + 0.06,
    }
  }
  return clouds
}

// Compute similarity score from 2D distance (scaled to [0, 1])
function distanceToSimilarity(dist) {
  // Max possible distance in [-1,1] space is ~2.83
  return Math.max(0, Math.min(1, 1 - dist / 1.5))
}

export default function MeaningMap({ words, onWordClick, selectedWord, neighborLines, liveWord, onPhaseChange }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const panelRef = useRef(null)
  const zoomRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 560, height: 420 })
  const [hoveredWord, setHoveredWord] = useState(null)
  const [transform, setTransform] = useState(d3.zoomIdentity)
  const [animProgress, setAnimProgress] = useState(0) // 0 to 1 (scrambled→settled interpolation)
  const [phase, setPhase] = useState('scrambled') // 'scrambled' | 'transitioning' | 'settled'
  const [cloudOpacity, setCloudOpacity] = useState(0)
  const [tooltip, setTooltip] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Spread the words
  const spreadWords = useMemo(() => spreadCoordinates(words), [words])

  // Category clouds
  const categoryClouds = useMemo(() => computeCategoryClouds(spreadWords), [spreadWords])

  // Set of representative words for quick lookup
  const repWordSet = useMemo(() => {
    const set = new Set()
    for (const arr of Object.values(REPRESENTATIVE_WORDS)) {
      for (const w of arr) set.add(w)
    }
    return set
  }, [])

  // Clicked word's nearest neighbors (for label reveal)
  const clickedNeighborWords = useMemo(() => {
    if (!neighborLines) return new Set()
    return new Set(neighborLines.map(l => l.target))
  }, [neighborLines])

  // Responsive sizing (also reacts to fullscreen changes)
  useEffect(() => {
    const el = panelRef.current || containerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      if (document.fullscreenElement) {
        // In fullscreen: use full viewport, minus legend bar (~36px)
        setDimensions({ width: Math.max(300, width), height: Math.max(320, height - 36) })
      } else {
        setDimensions({ width: Math.max(300, width), height: Math.min(450, Math.max(320, width * 0.75)) })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFullscreen])

  // D3 scales
  const xScale = useCallback(() => {
    return d3.scaleLinear().domain([-1, 1]).range([40, dimensions.width - 40])
  }, [dimensions.width])

  const yScale = useCallback(() => {
    return d3.scaleLinear().domain([-1, 1]).range([dimensions.height - 30, 30])
  }, [dimensions.height])

  // Fire phase change callback
  useEffect(() => {
    onPhaseChange?.(phase)
  }, [phase, onPhaseChange])

  // Entrance animation — 3 phases: scrambled → transitioning → settled
  useEffect(() => {
    // Phase 1: words fade in at scrambled positions (0–1.0s)
    setPhase('scrambled')
    setAnimProgress(0)
    setCloudOpacity(0)

    let rafId = null
    let cancelled = false

    // Phase 2: fly to embedding positions (1.2–2.8s)
    const flyDelay = setTimeout(() => {
      if (cancelled) return
      setPhase('transitioning')
      const duration = 1600
      const start = performance.now()

      const tick = (now) => {
        if (cancelled) return
        const elapsed = now - start
        const t = Math.min(1, elapsed / duration)
        // Ease out cubic
        const eased = 1 - Math.pow(1 - t, 3)
        setAnimProgress(eased)
        if (t < 1) {
          rafId = requestAnimationFrame(tick)
        } else {
          // Phase 3: settled — fade in clouds (2.8–3.5s)
          setPhase('settled')
          const cloudStart = performance.now()
          const cloudDuration = 700
          const cloudTick = (now2) => {
            if (cancelled) return
            const ct = Math.min(1, (now2 - cloudStart) / cloudDuration)
            setCloudOpacity(ct)
            if (ct < 1) rafId = requestAnimationFrame(cloudTick)
          }
          rafId = requestAnimationFrame(cloudTick)
        }
      }
      rafId = requestAnimationFrame(tick)
    }, 1200)

    return () => {
      cancelled = true
      clearTimeout(flyDelay)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Setup zoom with pan clamping
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const w = dimensions.width
    const h = dimensions.height
    const padding = 60
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .translateExtent([[-padding, -padding], [w + padding, h + padding]])
      .on('zoom', (event) => {
        setTransform(event.transform)
      })
    svg.call(zoom)
    zoomRef.current = zoom
  }, [dimensions])

  // Fullscreen change listener
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFSChange)
    return () => document.removeEventListener('fullscreenchange', handleFSChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const el = panelRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Compute tooltip data on hover/click
  useEffect(() => {
    const activeWord = hoveredWord || selectedWord
    if (!activeWord) {
      setTooltip(null)
      return
    }
    const w = spreadWords.find(sw => sw.word === activeWord)
    if (!w) { setTooltip(null); return }

    // Find 3 nearest neighbors
    const neighbors = spreadWords
      .filter(sw => sw.word !== activeWord)
      .map(sw => ({
        word: sw.word,
        dist: Math.sqrt((sw.origX - w.origX) ** 2 + (sw.origY - w.origY) ** 2),
        category: sw.category,
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3)
      .map(n => ({
        word: n.word,
        similarity: distanceToSimilarity(n.dist).toFixed(2),
        category: n.category,
      }))

    setTooltip({
      word: w.word,
      category: w.category,
      x: w.spreadX,
      y: w.spreadY,
      miniEmbedding: MINI_EMBEDDINGS[w.word] || null,
      neighbors,
    })
  }, [hoveredWord, selectedWord, spreadWords])

  const xs = xScale()
  const ys = yScale()

  // Category stagger delays for entrance animation
  const categoryOrder = ['animal', 'emotion', 'technology', 'food', 'place', 'person']
  const categoryDelay = {}
  categoryOrder.forEach((cat, i) => { categoryDelay[cat] = i * 0.08 })

  // Determine if a label should be visible
  const shouldShowLabel = (w, isHighlighted) => {
    if (isHighlighted) return true
    if (clickedNeighborWords.has(w.word)) return true
    if (transform.k > 1.5) return true
    if (repWordSet.has(w.word)) return true
    return false
  }

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div ref={panelRef} style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: isFullscreen ? 0 : 12,
        overflow: 'hidden',
        position: 'relative',
        ...(isFullscreen ? { display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-deep)' } : {}),
      }}>
        {/* Legend + fullscreen button */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 14px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          alignItems: 'center',
        }}>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: CATEGORY_COLORS[key],
                opacity: 0.8,
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-dim)',
              }}>
                {label}
              </span>
            </div>
          ))}
          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 5,
              padding: '3px 7px',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              fontSize: 13,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--nvidia-green)'
              e.currentTarget.style.borderColor = 'var(--nvidia-green)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-dim)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            {isFullscreen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>
        </div>

        {/* SVG scatter plot */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={isFullscreen ? '100%' : dimensions.height}
          style={{ display: 'block', cursor: 'grab', background: 'var(--bg-deep)', flex: isFullscreen ? 1 : undefined }}
        >
          <defs>
            {/* Radial gradients for category clouds */}
            {Object.entries(categoryClouds).map(([cat, cloud]) => (
              <radialGradient key={`grad-${cat}`} id={`cloud-${cat}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={CATEGORY_COLORS[cat]} stopOpacity={0.10} />
                <stop offset="60%" stopColor={CATEGORY_COLORS[cat]} stopOpacity={0.04} />
                <stop offset="100%" stopColor={CATEGORY_COLORS[cat]} stopOpacity={0} />
              </radialGradient>
            ))}
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Category cloud backgrounds — hidden until settled phase */}
            {Object.entries(categoryClouds).map(([cat, cloud]) => {
              return (
                <g key={`cloud-${cat}`} opacity={cloudOpacity}>
                  <ellipse
                    cx={xs(cloud.cx)}
                    cy={ys(cloud.cy)}
                    rx={Math.abs(xs(cloud.cx + cloud.rx) - xs(cloud.cx)) * 1.3}
                    ry={Math.abs(ys(cloud.cy + cloud.ry) - ys(cloud.cy)) * 1.3}
                    fill={`url(#cloud-${cat})`}
                  />
                  {/* Category label in center of cloud */}
                  <text
                    x={xs(cloud.cx)}
                    y={ys(cloud.cy)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={CATEGORY_COLORS[cat]}
                    fontSize={`${14 / transform.k}px`}
                    fontFamily="var(--font-body)"
                    fontWeight={600}
                    opacity={0.25}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </text>
                </g>
              )
            })}

            {/* Neighbor lines */}
            {neighborLines?.map((line, i) => {
              // Find spread coordinates for line endpoints
              const from = spreadWords.find(w => w.origX === line.x1 && w.origY === line.y1)
              const to = spreadWords.find(w => w.word === line.target)
              if (!from || !to) {
                return (
                  <line
                    key={`line-${i}`}
                    x1={xs(line.x1)}
                    y1={ys(line.y1)}
                    x2={xs(line.x2)}
                    y2={ys(line.y2)}
                    stroke="var(--nvidia-green)"
                    strokeWidth={1.2 / transform.k}
                    strokeOpacity={0.5}
                    strokeDasharray={`${4 / transform.k} ${4 / transform.k}`}
                  />
                )
              }
              return (
                <line
                  key={`line-${i}`}
                  x1={xs(from.spreadX)}
                  y1={ys(from.spreadY)}
                  x2={xs(to.spreadX)}
                  y2={ys(to.spreadY)}
                  stroke="var(--nvidia-green)"
                  strokeWidth={1.2 / transform.k}
                  strokeOpacity={0.5}
                  strokeDasharray={`${4 / transform.k} ${4 / transform.k}`}
                />
              )
            })}

            {/* Word dots */}
            {spreadWords.map((w) => {
              const isSelected = selectedWord === w.word
              const isHovered = hoveredWord === w.word
              const isNeighbor = neighborLines?.some(l => l.target === w.word)
              const highlighted = isSelected || isHovered || isNeighbor
              const r = highlighted ? 5.5 : 3.5
              const categoryColor = CATEGORY_COLORS[w.category] || '#8a8a96'

              // Phase-based positioning and color
              let posX, posY, dotColor
              if (phase === 'scrambled') {
                posX = w.scrambledX
                posY = w.scrambledY
                dotColor = '#555'
              } else if (phase === 'transitioning') {
                // Stagger by category
                const catDelay = categoryDelay[w.category] || 0
                const wordT = Math.max(0, Math.min(1, (animProgress - catDelay) / (1 - catDelay)))
                posX = w.scrambledX + (w.spreadX - w.scrambledX) * wordT
                posY = w.scrambledY + (w.spreadY - w.scrambledY) * wordT
                // Interpolate gray → category color
                const grayR = 0x55, grayG = 0x55, grayB = 0x55
                const catR = parseInt(categoryColor.slice(1, 3), 16)
                const catG = parseInt(categoryColor.slice(3, 5), 16)
                const catB = parseInt(categoryColor.slice(5, 7), 16)
                const cr = Math.round(grayR + (catR - grayR) * wordT)
                const cg = Math.round(grayG + (catG - grayG) * wordT)
                const cb = Math.round(grayB + (catB - grayB) * wordT)
                dotColor = `rgb(${cr},${cg},${cb})`
              } else {
                posX = w.spreadX
                posY = w.spreadY
                dotColor = categoryColor
              }

              const showLabel = shouldShowLabel(w, highlighted)

              return (
                <g
                  key={w.word}
                  transform={`translate(${xs(posX)}, ${ys(posY)})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onWordClick?.(w.word)}
                  onMouseEnter={() => setHoveredWord(w.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  {/* Glow for selected/hovered */}
                  {highlighted && (
                    <circle
                      r={(r + 4) / transform.k}
                      fill={dotColor}
                      opacity={0.15}
                    />
                  )}
                  <circle
                    r={r / transform.k}
                    fill={dotColor}
                    opacity={highlighted ? 1 : 0.75}
                  />
                  {/* Label */}
                  {showLabel && (
                    <text
                      y={(-9) / transform.k}
                      textAnchor="middle"
                      fill={highlighted ? 'var(--text-primary)' : 'var(--text-secondary)'}
                      fontSize={`${(highlighted ? 11.5 : 9.5) / transform.k}px`}
                      fontFamily="var(--font-mono)"
                      fontWeight={highlighted ? 600 : 400}
                      opacity={highlighted ? 1 : 0.7}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {w.word}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Live word (user-typed, animated) */}
            {liveWord && (() => {
              // Check if liveWord matches a spread word
              const match = spreadWords.find(sw => sw.word === liveWord.word)
              const lx = match ? match.spreadX : liveWord.x
              const ly = match ? match.spreadY : liveWord.y
              return (
                <g transform={`translate(${xs(lx)}, ${ys(ly)})`}>
                  <circle r={16 / transform.k} fill="var(--nvidia-green)" opacity={0.08}>
                    <animate attributeName="r" values={`${12 / transform.k};${20 / transform.k};${12 / transform.k}`} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.12;0.04;0.12" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle r={8 / transform.k} fill="var(--nvidia-green)" opacity={0.15} />
                  <circle r={4.5 / transform.k} fill="var(--nvidia-green)" opacity={0.9} />
                  <text
                    y={-12 / transform.k}
                    textAnchor="middle"
                    fill="var(--nvidia-green)"
                    fontSize={`${13 / transform.k}px`}
                    fontFamily="var(--font-mono)"
                    fontWeight={700}
                    style={{ pointerEvents: 'none' }}
                  >
                    {liveWord.word}
                  </text>
                </g>
              )
            })()}
          </g>

          {/* Zoom hint */}
          <text
            x={dimensions.width - 12}
            y={dimensions.height - 8}
            textAnchor="end"
            fill="var(--text-dim)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            opacity={0.5}
          >
            scroll to zoom · drag to pan
          </text>
        </svg>

        {/* Tooltip overlay — rendered outside SVG for better styling */}
        <AnimatePresence>
          {tooltip && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 16px',
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 15,
                  fontWeight: 700,
                  color: CATEGORY_COLORS[tooltip.category] || 'var(--text-primary)',
                }}>
                  {tooltip.word}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--text-dim)',
                  background: 'rgba(255,255,255,0.04)',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  Position: ({tooltip.x.toFixed(2)}, {tooltip.y.toFixed(2)})
                </span>
              </div>

              {/* Mini embedding bar chart */}
              {tooltip.miniEmbedding && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    marginBottom: 4,
                  }}>
                    embedding sample (12 of 768 dimensions)
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    height: 28,
                  }}>
                    {tooltip.miniEmbedding.map((val, i) => {
                      const absVal = Math.abs(val)
                      const isPositive = val >= 0
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            height: '100%',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              height: `${absVal * 100}%`,
                              background: isPositive
                                ? CATEGORY_COLORS[tooltip.category] || 'var(--nvidia-green)'
                                : '#e85a6e',
                              borderRadius: 1,
                              opacity: 0.7,
                              minHeight: 1,
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Nearest neighbors */}
              {tooltip.neighbors.length > 0 && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                }}>
                  {tooltip.neighbors.map(n => (
                    <span key={n.word} style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--text-dim)' }}>→</span>{' '}
                      <span style={{ color: CATEGORY_COLORS[n.category] || 'var(--text-secondary)' }}>{n.word}</span>
                      <span style={{ color: 'var(--text-dim)', marginLeft: 3 }}>{n.similarity}</span>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
