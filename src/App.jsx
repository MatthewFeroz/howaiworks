import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import HomePage from './pages/HomePage'
import TokenizerPage from './pages/TokenizerPage'
import EmbeddingsPage from './pages/EmbeddingsPage'
import CloudVsLocalPage from './pages/CloudVsLocalPage'
import AboutPage from './pages/AboutPage'
import ResourcesPage from './pages/ResourcesPage'
import Navbar from './components/Navbar'
import { useWebLLM } from './hooks/useWebLLM'

export default function App() {
  const location = useLocation()
  const webllm = useWebLLM({ autoLoad: location.pathname === '/run' })

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: ['/', '/about', '/resources'].includes(location.pathname) ? 52 : 88 }}>
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/tokenize" element={<TokenizerPage />} />
              <Route path="/understand" element={<EmbeddingsPage />} />
              <Route path="/run" element={<CloudVsLocalPage webllm={webllm} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
            </Routes>
          </div>
        </AnimatePresence>
      </div>
    </>
  )
}
