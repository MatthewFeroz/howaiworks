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
