import { motion } from 'framer-motion'

export default function GPUStats({ model, gpuInfo, ollamaConnected }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        padding: '14px 18px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}
    >
      <StatChip label="Model" value={model || 'qwen2.5:0.5b'} />
      <StatChip label="Params" value="500M" />
      <StatChip
        label="Device"
        value={gpuInfo?.available ? gpuInfo.name : 'CPU'}
      />
      {gpuInfo?.available && (
        <StatChip label="VRAM" value={`${Math.round(gpuInfo.memory_mb / 1024)}GB`} />
      )}
      <StatChip
        label="RAM"
        value="~1 GB"
      />
      <StatChip
        label="Status"
        value={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: ollamaConnected ? 'var(--nvidia-green)' : '#ef476f',
              boxShadow: ollamaConnected ? '0 0 6px var(--nvidia-green)' : 'none',
            }} />
            {ollamaConnected ? 'Connected' : 'Demo Mode'}
          </span>
        }
      />
    </motion.div>
  )
}

function StatChip({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{label}:</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
