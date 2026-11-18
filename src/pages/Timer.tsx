import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, X } from 'lucide-react'
import { Card, Ring } from '../ui'
import type { Method } from './methods'

const ar = (n: number) => String(n).padStart(2, '0')

export default function Timer({ m, onClose }: { m: Method; onClose: () => void }) {
  const { work, rest } = m.timer!
  const [phase, setPhase] = useState<'work' | 'rest'>('work')
  const [left, setLeft] = useState(work * 60)
  const [running, setRunning] = useState(false)
  const end = useRef(0)
  const total = (phase === 'work' ? work : rest) * 60

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const l = Math.ceil((end.current - Date.now()) / 1000)
      if (l > 0) {
        setLeft(l)
        return
      }
      const next = phase === 'work' ? 'rest' : 'work'
      const secs = (next === 'work' ? work : rest) * 60
      navigator.vibrate?.(250)
      end.current = Date.now() + secs * 1000
      setPhase(next)
      setLeft(secs)
    }, 250)
    return () => clearInterval(id)
  }, [running, phase, work, rest])

  const toggle = () => {
    if (!running) end.current = Date.now() + left * 1000
    setRunning(!running)
  }
  const reset = () => {
    setRunning(false)
    setPhase('work')
    setLeft(work * 60)
  }

  return (
    <Card tone={phase === 'work' ? 'sky' : 'sage'}>
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">{m.name}</h2>
        <button onClick={onClose} aria-label="إغلاق المؤقت" className="grid size-8 place-items-center rounded-full bg-white/70">
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 flex flex-col items-center gap-4">
        <Ring value={left / total} size={190} stroke={12} track="rgba(255,255,255,.7)">
          <div className="text-center" role="timer" aria-live="off">
            <p dir="ltr" className="text-4xl font-semibold tabular-nums">
              {ar(Math.floor(left / 60))}:{ar(left % 60)}
            </p>
            <p className="mt-1 text-sm text-ink2">{phase === 'work' ? 'وقت التركيز' : 'وقت الراحة'}</p>
          </div>
        </Ring>
        <div className="flex gap-3">
          <button
            onClick={toggle}
            className="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm text-white"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {running ? 'إيقاف مؤقت' : left === total && phase === 'work' ? 'ابدأ' : 'استمر'}
          </button>
          <button onClick={reset} className="flex items-center gap-2 rounded-full bg-white/70 px-5 py-2.5 text-sm">
            <RotateCcw size={16} /> إعادة
          </button>
        </div>
      </div>
    </Card>
  )
}
