export default function Footer() {
  const linkStyle = {
    color: 'var(--nvidia-green)',
    textDecoration: 'none',
  }

  return (
    <footer style={{
      textAlign: 'center',
      padding: '60px 0 40px',
      fontSize: 13,
      color: 'var(--text-dim)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-dim)',
      }}>
        <span style={{
          width: 6, height: 6,
          background: 'var(--nvidia-green)',
          borderRadius: '50%',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        Powered by NVIDIA · Ollama
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <a href="https://github.com/MatthewFeroz/howaiworks" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          GitHub
        </a>
        <span>·</span>
        <a href="https://youtube.com/MatthewFeroz" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          YouTube
        </a>
        <span>·</span>
        <a href="https://howaiworks.io" style={linkStyle}>
          howaiworks.io
        </a>
      </div>

      <div style={{ fontSize: 12 }}>
        This project is open source — built to make AI education accessible to everyone.
      </div>
    </footer>
  )
}
