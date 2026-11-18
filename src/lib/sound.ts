import { usePrefs } from './prefs'

type Kind = 'tap' | 'check' | 'uncheck' | 'drop' | 'bloom' | 'done' | 'nav'

let ctx: AudioContext | null = null
const ac = () => {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/** One soft synthesized note: a sine/triangle with a quick attack and exponential decay. */
function note(c: AudioContext, vol: number, freq: number, start: number, dur: number, type: OscillatorType = 'sine', slideTo?: number) {
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  const t = c.currentTime + start
  o.frequency.setValueAtTime(freq, t)
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.02)
}

export function play(kind: Kind) {
  const { sound, volume } = usePrefs.getState()
  if (!sound || volume <= 0) return
  const c = ac()
  if (!c) return
  const v = volume * 0.35
  switch (kind) {
    case 'tap':
      note(c, v * 0.7, 520, 0, 0.07, 'triangle', 380)
      break
    case 'nav':
      note(c, v * 0.6, 440, 0, 0.06, 'sine', 600)
      break
    case 'check':
      note(c, v, 660, 0, 0.12, 'sine')
      note(c, v, 990, 0.07, 0.18, 'sine')
      break
    case 'uncheck':
      note(c, v * 0.7, 420, 0, 0.1, 'sine', 300)
      break
    case 'drop':
      // water plop: a fast downward chirp followed by a soft high ping
      note(c, v * 1.2, 900, 0, 0.11, 'sine', 260)
      note(c, v * 0.4, 1500, 0.02, 0.08, 'sine', 700)
      break
    case 'bloom':
      note(c, v * 0.8, 784, 0, 0.16, 'sine')
      note(c, v * 0.8, 1175, 0.08, 0.22, 'sine')
      break
    case 'done':
      ;[523, 659, 784, 1047].forEach((f, i) => note(c, v, f, i * 0.09, 0.28, 'sine'))
      break
  }
}

/** One delegated listener gives every button a sound without touching each component. */
export function initSound() {
  document.addEventListener(
    'click',
    (e) => {
      const el = (e.target as HTMLElement | null)?.closest?.('button, [role="button"]') as HTMLElement | null
      if (!el || (el as HTMLButtonElement).disabled || el.dataset.silent !== undefined) return
      if (el.getAttribute('role') === 'checkbox') {
        // aria-checked still holds the state from before this click
        play(el.getAttribute('aria-checked') === 'true' ? 'uncheck' : 'check')
      } else if (el.getAttribute('aria-pressed') !== null) {
        play(el.getAttribute('aria-pressed') === 'true' ? 'uncheck' : 'check')
      } else if (el.dataset.nav !== undefined) {
        play('nav')
      } else {
        play('tap')
      }
    },
    true,
  )
}
