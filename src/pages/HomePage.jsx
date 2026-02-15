import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'

const LESSONS = [
  {
    num: 1,
    title: 'Tokenize',
    desc: 'See how AI splits your words into pieces',
    path: '/tokenize',
    completionKey: 'lesson-complete-tokenizer',
  },
  {
    num: 2,
    title: 'Understand',
    desc: 'Watch AI organize words by meaning',
    path: '/understand',
    completionKey: 'lesson-complete-understand',
  },
  {
    num: 3,
    title: 'Run',
    desc: 'Race cloud vs local inference',
    path: '/run',
    completionKey: 'lesson-complete-run',
  },
]

const LOCKED = [
  { num: 4, title: 'Fine-tune', desc: 'Train on your own data' },
  { num: 5, title: 'Evaluate', desc: 'Measure model quality' },
  { num: 6, title: 'Deploy', desc: 'Ship it to production' },
]

export default function HomePage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 24px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: 'center', padding: '56px 0 48px' }}
      >
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 44px)',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: 16,
          letterSpacing: -0.5,
        }}>
          This is how AI{' '}
          <span style={{ color: 'var(--nvidia-green)' }}>works.</span>
        </h1>
        <p style={{
          fontSize: 17,
          color: 'var(--text-secondary)',
          fontWeight: 400,
          maxWidth: 420,
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          Don't read about AI. Experience it. Type, see, and understand
          what happens inside the machine.
        </p>
      </motion.div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: 32 }}>
        {/* Vertical line — active portion */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{
            position: 'absolute',
            left: 9,
            top: 0,
            bottom: 0,
            width: 2,
            transformOrigin: 'top',
          }}
        >
          {/* Green portion for active lessons */}
          <div style={{
            width: 2,
            background: 'var(--nvidia-green)',
            opacity: 0.4,
            height: `${(LESSONS.length / (LESSONS.length + LOCKED.length)) * 100}%`,
          }} />
          {/* Dashed portion for locked lessons */}
          <div style={{
            width: 2,
            backgroundImage: 'repeating-linear-gradient(to bottom, #2a2a30 0, #2a2a30 6px, transparent 6px, transparent 12px)',
            height: `${(LOCKED.length / (LESSONS.length + LOCKED.length)) * 100}%`,
          }} />
        </motion.div>

        {/* Active lessons */}
        {LESSONS.map((lesson, i) => {
          const completed = localStorage.getItem(lesson.completionKey) === 'true'
          return (
            <motion.div
              key={lesson.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.12 }}
            >
              <Link
                to={lesson.path}
                style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}
              >
                <div
                  style={{
                    position: 'relative',
                    padding: '16px 20px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--nvidia-green)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--nvidia-green-dim)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Dot on the timeline */}
                  <div style={{
                    position: 'absolute',
                    left: -32,
                    top: 20,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: completed ? 'var(--nvidia-green)' : 'var(--bg-deep)',
                    border: `2px solid ${completed ? 'var(--nvidia-green)' : 'var(--nvidia-green)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {completed ? (
                      <span style={{ color: '#0a0a0b', fontSize: 11, fontWeight: 700 }}>✓</span>
                    ) : (
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--nvidia-green)',
                      }}>
                        {lesson.num}
                      </span>
                    )}
                  </div>

                  <div>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      marginBottom: 4,
                    }}>
                      {lesson.title}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                    }}>
                      {lesson.desc}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}

        {/* Locked lessons */}
        {LOCKED.map((lesson, i) => (
          <motion.div
            key={lesson.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.86 + i * 0.12 }}
            style={{ marginBottom: 8 }}
          >
            <div style={{
              position: 'relative',
              padding: '16px 20px',
              background: 'var(--bg-surface)',
              border: '1px dashed #2a2a30',
              borderRadius: 12,
              opacity: 0.45,
            }}>
              {/* Dot on the timeline */}
              <div style={{
                position: 'absolute',
                left: -32,
                top: 20,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--bg-deep)',
                border: '2px dashed #2a2a30',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--text-dim)',
                }}>
                  {lesson.num}
                </span>
              </div>

              <div style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-dim)',
                marginBottom: 4,
              }}>
                {lesson.title}
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--text-dim)',
                lineHeight: 1.4,
              }}>
                {lesson.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.25 }}
        style={{ textAlign: 'center', padding: '40px 0 16px' }}
      >
        <Link
          to="/tokenize"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 28px',
            background: 'var(--nvidia-green)',
            color: '#0a0a0b',
            fontSize: 15,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            borderRadius: 10,
            textDecoration: 'none',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 0 20px rgba(118, 185, 0, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 4px 30px rgba(118, 185, 0, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(118, 185, 0, 0.3)'
          }}
        >
          Start with tokenization
          <span style={{ fontSize: 18 }}>→</span>
        </Link>
      </motion.div>

      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
        margin: '40px 0',
      }} />

      <Footer />
    </div>
  )
}
