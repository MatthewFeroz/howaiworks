import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as d3 from 'd3'

const CATEGORY_COLORS = {
  animal: '#a8d86e',   // token-0 coral/green
  emotion: '#e8956e',  // token-2 amber
  technology: '#e8d06e', // token-4 green/amber
  food: '#6ee8cc',     // token-6 teal
  place: '#94a0e8',    // token-8 blue
  person: '#c58ee8',   // token-10 purple
}

const CATEGORY_LABELS = {
  animal: 'Animals',
  emotion: 'Emotions',
  technology: 'Technology',
  food: 'Food',
  place: 'Places',
  person: 'People',
}

export default function MeaningMap({ words, onWordClick, selectedWord, neighborLines, liveWord }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const zoomRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 560, height: 420 })
  const [hoveredWord, setHoveredWord] = useState(null)
  const [transform, setTransform] = useState(d3.zoomIdentity)

  // Responsive sizing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect
      setDimensions({ width: Math.max(300, width), height: Math.min(450, Math.max(320, width * 0.75)) })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // D3 scales
  const xScale = useCallback(() => {
    return d3.scaleLinear().domain([-1, 1]).range([40, dimensions.width - 40])
  }, [dimensions.width])

  const yScale = useCallback(() => {
    return d3.scaleLinear().domain([-1, 1]).range([dimensions.height - 30, 30])
  }, [dimensions.height])

  // Setup zoom
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        setTransform(event.transform)
      })
    svg.call(zoom)
    zoomRef.current = zoom
  }, [])

  const xs = xScale()
  const ys = yScale()

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Legend */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 14px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
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
        </div>

        {/* SVG scatter plot */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ display: 'block', cursor: 'grab', background: 'var(--bg-deep)' }}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
            {/* Neighbor lines */}
            {neighborLines?.map((line, i) => (
              <line
                key={`line-${i}`}
                x1={xs(line.x1)}
                y1={ys(line.y1)}
                x2={xs(line.x2)}
                y2={ys(line.y2)}
                stroke="var(--nvidia-green)"
                strokeWidth={1 / transform.k}
                strokeOpacity={0.4}
                strokeDasharray={`${4 / transform.k} ${4 / transform.k}`}
              />
            ))}

            {/* Word dots */}
            {words.map((w, i) => {
              const isSelected = selectedWord === w.word
              const isHovered = hoveredWord === w.word
              const isNeighbor = neighborLines?.some(l => l.target === w.word)
              const highlighted = isSelected || isHovered || isNeighbor
              const r = highlighted ? 6 : 3.5
              const color = CATEGORY_COLORS[w.category] || '#8a8a96'

              return (
                <g
                  key={w.word}
                  transform={`translate(${xs(w.x)}, ${ys(w.y)})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onWordClick?.(w.word)}
                  onMouseEnter={() => setHoveredWord(w.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                >
                  {/* Glow for selected/hovered */}
                  {highlighted && (
                    <circle
                      r={r + 4}
                      fill={color}
                      opacity={0.15}
                    />
                  )}
                  <circle
                    r={r / transform.k}
                    fill={color}
                    opacity={highlighted ? 1 : 0.7}
                  />
                  {/* Label */}
                  {(highlighted || transform.k > 1.5) && (
                    <text
                      y={-8 / transform.k}
                      textAnchor="middle"
                      fill={highlighted ? 'var(--text-primary)' : 'var(--text-secondary)'}
                      fontSize={`${(highlighted ? 12 : 10) / transform.k}px`}
                      fontFamily="var(--font-mono)"
                      fontWeight={highlighted ? 600 : 400}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {w.word}
                    </text>
                  )}
                  {/* Always show label at default zoom for readability */}
                  {!highlighted && transform.k <= 1.5 && (
                    <text
                      y={-7 / transform.k}
                      textAnchor="middle"
                      fill="var(--text-dim)"
                      fontSize={`${9 / transform.k}px`}
                      fontFamily="var(--font-mono)"
                      fontWeight={400}
                      opacity={0.6}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {w.word}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Live word (user-typed, animated) */}
            {liveWord && (
              <g transform={`translate(${xs(liveWord.x)}, ${ys(liveWord.y)})`}>
                {/* Animated glow rings */}
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
            )}
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
      </div>
    </div>
  )
}
