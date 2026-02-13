import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import TokenizerPage from './pages/TokenizerPage'
import EmbeddingsPage from './pages/EmbeddingsPage'
import CloudVsLocalPage from './pages/CloudVsLocalPage'
import { useWebLLM } from './hooks/useWebLLM'

export default function App() {
  const location = useLocation()
  const webllm = useWebLLM({ autoLoad: true })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<TokenizerPage />} />
          <Route path="/understand" element={<EmbeddingsPage />} />
          <Route path="/run" element={<CloudVsLocalPage webllm={webllm} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
