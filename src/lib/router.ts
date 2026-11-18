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

export function initRouter() {
  try {
    history.replaceState(HOME, '')
  } catch {
    /* ignore */
  }
  window.addEventListener('popstate', (e) => {
    const st = e.state as View | null
    useNav.setState(st && st.tab ? { tab: st.tab, sub: st.sub ?? '' } : HOME)
    window.scrollTo(0, 0)
  })
}
