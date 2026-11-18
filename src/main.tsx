import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/readex-pro'
import './index.css'
import App from './App'
import { initSync } from './lib/sync'

initSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
