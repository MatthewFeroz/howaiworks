import { motion } from 'framer-motion'
import { FUNNEL_CTAS } from '../seo/seoData'

// Contextual end-of-lesson CTA into the wider ecosystem (roadmap quiz,
// community, coaching). Copy and destination live in seoData.js.
export default function FunnelCTA({ path }) {
  const cta = FUNNEL_CTAS[path]
  if (!cta) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-surface) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '32px 28px',
        margin: '8px 0 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, var(--brand), transparent)',
      }} />

      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 10,
        lineHeight: 1.3,
      }}>
        {cta.headline}
      </h2>

      <p style={{
        fontSize: 14,
        color: 'var(--text-secondary)',
        lineHeight: 1.7,
        maxWidth: 480,
        margin: '0 auto 22px',
      }}>
        {cta.body}
      </p>

      <a
        href={cta.buttonUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 32px',
          background: 'var(--brand)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          borderRadius: 999,
          textDecoration: 'none',
          transition: 'transform 0.2s, box-shadow 0.2s',
          boxShadow: '0 0 20px rgba(248, 95, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 30px rgba(248, 95, 0, 0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(248, 95, 0, 0.3)'
        }}
      >
        {cta.buttonText}
        <span style={{ fontSize: 16 }}>→</span>
      </a>

      <div style={{ marginTop: 14 }}>
        <a
          href={cta.secondaryUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: 'var(--text-dim)',
            textDecoration: 'none',
            borderBottom: '1px dotted var(--text-dim)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          {cta.secondaryText}
        </a>
      </div>
    </motion.section>
  )
}
