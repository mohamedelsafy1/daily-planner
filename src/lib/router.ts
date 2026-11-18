import { create } from 'zustand'
import type { Tab } from '../nav'

type View = { tab: Tab; sub: string }
const HOME: View = { tab: 'today', sub: '' }

export const useNav = create<View>(() => HOME)

/** Move to a screen and add a browser-history entry, so the phone's back button steps back inside the app. */
export function go(tab: Tab, sub = '') {
  const cur = useNav.getState()
  if (cur.tab === tab && cur.sub === sub) return
  try {
    history.pushState({ tab, sub }, '')
  } catch {
    /* history unavailable */
  }
  useNav.setState({ tab, sub })
}

export const back = () => {
  if (history.length > 1) history.back()
  else useNav.setState(HOME)
}

type Overlay = { id: number; close: () => void }
const overlays: Overlay[] = []
let oid = 0

/** A popup registers here so the phone's back button closes it before leaving the screen. */
export function pushOverlay(close: () => void) {
  const id = ++oid
  overlays.push({ id, close })
  try {
    history.pushState({ overlay: id }, '')
  } catch {
    /* ignore */
  }
  return () => {
    const i = overlays.findIndex((o) => o.id === id)
    if (i < 0) return // already closed by the back button
    overlays.splice(i, 1)
    if ((history.state as { overlay?: number } | null)?.overlay === id) history.back()
  }
}

export function initRouter() {
  try {
    history.replaceState(HOME, '')
  } catch {
    /* ignore */
  }
  window.addEventListener('popstate', (e) => {
    const top = overlays[overlays.length - 1]
    if (top) {
      overlays.pop()
      top.close()
      return
    }
    const st = e.state as View | null
    useNav.setState(st && st.tab ? { tab: st.tab, sub: st.sub ?? '' } : HOME)
    window.scrollTo(0, 0)
  })
}

/** Native Android back button (needs the app plugin in the installed APK; harmless on the web). */
export async function initNativeBack() {
  try {
    const { Capacitor } = await import('@capacitor/core')
    if (!Capacitor.isNativePlatform()) return
    const { App } = await import('@capacitor/app')
    await App.addListener('backButton', () => {
      const top = overlays[overlays.length - 1]
      const v = useNav.getState()
      if (top || v.tab !== 'today' || v.sub) history.back()
      else void App.exitApp()
    })
  } catch {
    /* plugin not installed in this APK: the WebView history handles back */
  }
}
