export default function Footer() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '60px 0 40px',
      fontSize: 13,
      color: 'var(--text-dim)',
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
        marginBottom: 16,
      }}>
        <span style={{
          width: 6, height: 6,
          background: 'var(--nvidia-green)',
          borderRadius: '50%',
          animation: 'pulse-dot 2s ease-in-out infinite',
        }} />
        Powered by NVIDIA · Ollama
      </div>

      <div>
        <a
          href="https://howaiworks.io"
          style={{ color: 'var(--nvidia-green)', textDecoration: 'none' }}
        >
          howaiworks.io
        </a>
        {' · Open Source · MIT License'}
      </div>
    </div>
  )
}
