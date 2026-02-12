import { useState, useRef } from 'react'

export default function ChatInput({ onSend, disabled, placeholder }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div style={{
      display: 'flex',
      gap: 10,
      alignItems: 'flex-end',
    }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder || 'Type a message...'}
          rows={1}
          disabled={disabled}
          style={{
            width: '100%',
            minHeight: 52,
            padding: '14px 20px',
            background: 'var(--bg-surface)',
            border: `1px solid ${focused ? 'var(--nvidia-green)' : 'var(--border)'}`,
            borderRadius: 12,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 15,
            lineHeight: 1.5,
            resize: 'none',
            overflow: 'hidden',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px var(--nvidia-green-dim)' : 'none',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          border: 'none',
          background: value.trim() && !disabled ? 'var(--nvidia-green)' : 'var(--bg-elevated)',
          color: value.trim() && !disabled ? '#0a0a0b' : 'var(--text-dim)',
          fontSize: 20,
          cursor: value.trim() && !disabled ? 'pointer' : 'default',
          transition: 'background 0.2s, color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        ↑
      </button>
    </div>
  )
}
