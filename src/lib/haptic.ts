import { usePrefs } from './prefs'

export const buzz = (ms: number | number[] = 12) => {
  try {
    if (usePrefs.getState().haptics) navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}
