import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import TokenizerPage from './pages/TokenizerPage'
import RunLocalPage from './pages/RunLocalPage'

export default function App() {
  const location = useLocation()

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
          <Route path="/run" element={<RunLocalPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}
