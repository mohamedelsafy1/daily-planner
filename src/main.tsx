import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/readex-pro'
import './index.css'
import App from './App'
import { initSync } from './lib/sync'
import { initTheme } from './lib/prefs'
import { useStore } from './store'
import { initSound } from './lib/sound'
import { initNativeBack, initRouter } from './lib/router'

initRouter()
void initNativeBack()
initTheme()
initSound()
initSync()
useStore.getState().syncRoutines()
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') useStore.getState().syncRoutines()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
