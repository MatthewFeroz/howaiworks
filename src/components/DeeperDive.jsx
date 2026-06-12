import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ROUTES, SITE } from '../seo/seoData'

// Renders the per-route SEO prose from seoData.js as a visible "deeper dive"
// section, and keeps document.title / meta description / canonical in sync on
// client-side navigation. The prerender script embeds the same prose in the
// static HTML, so crawlers and users always see identical content.
export default function DeeperDive({ path }) {
  const meta = ROUTES[path]

  useEffect(() => {
    if (!meta) return
    document.title = meta.title

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', meta.description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', SITE.origin + path)
  }, [path, meta])

  if (!meta) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '28px 24px',
        margin: '8px 0 24px',
      }}
    >
      <span style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 6,
        background: 'var(--brand-dim)',
        color: 'var(--brand)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.5,
        marginBottom: 14,
      }}>
        DEEPER DIVE
      </span>

      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 16,
        lineHeight: 1.3,
      }}>
        {meta.proseTitle}
      </h2>

      {meta.sections.map((section) => (
        <div key={section.heading} style={{ marginBottom: 18 }}>
          <h3 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            {section.heading}
          </h3>
          {section.paragraphs.map((p, i) => (
            <p key={i} style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: 10,
            }}>
              {p}
            </p>
          ))}
        </div>
      ))}
    </motion.section>
  )
}
