// Post-build prerender: emits dist/<route>/index.html with route-specific
// <head> metadata, JSON-LD structured data, and a static-HTML fallback of the
// lesson prose inside #root (replaced by React on load). Also writes
// dist/sitemap.xml. Run automatically by `bun run build`.
//
// Vercel serves these files via its filesystem handler, which takes precedence
// over the SPA rewrite in vercel.json — so crawlers (and users) get real HTML
// per URL while client-side routing keeps working unchanged.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE, ROUTES, ROUTE_ORDER, LESSON_ROUTES, FUNNEL_CTAS } from '../src/seo/seoData.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

const esc = (s) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const NAV_LABELS = {
  '/': 'Home',
  '/what-is-ai': 'What is AI?',
  '/tokenize': 'Tokenize',
  '/understand': 'Understand',
  '/attention': 'Attention',
  '/run': 'Run',
  '/about': 'About',
  '/resources': 'Resources',
}

function jsonLd(path, meta) {
  const url = SITE.origin + path
  const author = {
    '@type': 'Person',
    name: SITE.author.name,
    url: SITE.author.url,
  }

  if (path === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      alternateName: 'How AI Works',
      url: SITE.origin,
      description: meta.description,
      author,
    }
  }

  if (LESSON_ROUTES.includes(path)) {
    return {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: meta.title.split(' | ')[0],
      description: meta.description,
      url,
      isAccessibleForFree: true,
      educationalLevel: 'beginner',
      learningResourceType: 'interactive simulation',
      inLanguage: 'en',
      author,
      isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.origin },
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': path === '/about' ? 'AboutPage' : 'CollectionPage',
    name: meta.title.split(' | ')[0],
    description: meta.description,
    url,
    inLanguage: 'en',
    author,
  }
}

// Static fallback rendered inside #root for crawlers that don't execute JS.
// React replaces it on mount; the same prose is rendered by <DeeperDive />,
// so script-on and script-off views carry the same content.
function staticBody(path, meta) {
  const h1 = esc(meta.title.split(' | ')[0])
  const nav = ROUTE_ORDER.map(
    (r) => `<a href="${r}" style="color:#f85f00;text-decoration:none;margin-right:14px">${esc(NAV_LABELS[r])}</a>`,
  ).join('')

  const sections = meta.sections
    .map(
      (s) =>
        `<h2 style="font-size:18px;margin:24px 0 8px">${esc(s.heading)}</h2>` +
        s.paragraphs.map((p) => `<p style="line-height:1.7;margin:0 0 12px;color:#9aa0aa">${esc(p)}</p>`).join(''),
    )
    .join('')

  const cta = FUNNEL_CTAS[path]
  const ctaHtml = cta
    ? `<p style="margin-top:24px;line-height:1.7;color:#9aa0aa">${esc(cta.headline)} ` +
      `<a href="${cta.buttonUrl}" style="color:#f85f00">${esc(cta.buttonText)}</a></p>`
    : ''

  return (
    `<div style="max-width:640px;margin:0 auto;padding:48px 24px;font-family:'Poppins',system-ui,sans-serif;color:#dbdbdb">` +
    `<nav style="margin-bottom:32px;font-size:14px">${nav}</nav>` +
    `<h1 style="font-size:28px;line-height:1.25;margin:0 0 16px">${h1}</h1>` +
    sections +
    ctaHtml +
    `<p style="margin-top:32px;font-size:13px;color:#6b7078">` +
    `${SITE.name} is free and open source (<a href="${SITE.github}" style="color:#f85f00">GitHub</a>), ` +
    `built by <a href="${SITE.author.url}" style="color:#f85f00">${esc(SITE.author.name)}</a>.</p>` +
    `</div>`
  )
}

function renderRoute(path) {
  const meta = ROUTES[path]
  const url = SITE.origin + path
  let html = template

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(meta.title)}</title>`)

  const swapContent = (selector, value) => {
    html = html.replace(new RegExp(`(<meta ${selector} content=")[^"]*(")`), `$1${esc(value)}$2`)
  }
  swapContent('name="description"', meta.description)
  swapContent('property="og:title"', meta.title)
  swapContent('property="og:description"', meta.description)
  swapContent('property="og:url"', url)
  swapContent('name="twitter:title"', meta.title)
  swapContent('name="twitter:description"', meta.description)

  const extras = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:image" content="${SITE.origin}${SITE.ogImage}" />`,
    `<meta name="twitter:image" content="${SITE.origin}${SITE.ogImage}" />`,
    `<meta name="author" content="${esc(SITE.author.name)}" />`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd(path, meta))}</script>`,
  ].join('\n    ')
  html = html.replace('</head>', `    ${extras}\n  </head>`)

  html = html.replace('<div id="root"></div>', `<div id="root">${staticBody(path, meta)}</div>`)

  const outDir = path === '/' ? dist : join(dist, path.slice(1))
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'index.html'), html)
  console.log(`prerendered ${path} -> ${join(outDir, 'index.html')}`)
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = ROUTE_ORDER.map(
    (r) =>
      `  <url>\n    <loc>${SITE.origin + r}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>${r === '/' ? '1.0' : LESSON_ROUTES.includes(r) ? '0.8' : '0.5'}</priority>\n  </url>`,
  ).join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  writeFileSync(join(dist, 'sitemap.xml'), xml)
  console.log('wrote sitemap.xml')
}

for (const path of ROUTE_ORDER) renderRoute(path)
writeSitemap()
