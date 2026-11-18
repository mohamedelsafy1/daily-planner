import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Check as CheckIcon, Plus, X } from 'lucide-react'

export type Tone = 'white' | 'sage' | 'sky' | 'sand' | 'rose' | 'lilac'

const TONES: Record<Tone, string> = {
  white: 'bg-white border border-line',
  sage: 'bg-sage',
  sky: 'bg-sky',
  sand: 'bg-sand',
  rose: 'bg-rose',
  lilac: 'bg-lilac',
}

export function Card({
  tone = 'white',
  className = '',
  children,
  onClick,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
  onClick?: () => void
}) {
  const cls = `rounded-[28px] p-4 text-start ${TONES[tone]} ${className}`
  return onClick ? (
    <button onClick={onClick} className={`${cls} block w-full`}>
      {children}
    </button>
  ) : (
    <section className={cls}>{children}</section>
  )
}

export function Title({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {aside && <span className="text-xs text-ink2">{aside}</span>}
    </div>
  )
}

export function Check({
  done,
  onClick,
  label,
}: {
  done: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      role="checkbox"
      aria-checked={done}
      aria-label={label}
      onClick={onClick}
      className={`grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors ${
        done ? 'border-ink bg-ink text-white' : 'border-ink/25 bg-white'
      }`}
    >
      {done && <CheckIcon size={16} strokeWidth={3} />}
    </button>
  )
}

export function Ring({
  value,
  size = 96,
  stroke = 10,
  color = '#22333A',
  track = '#EDF1EF',
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  track?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset .5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}

export function AddRow({
  placeholder,
  onAdd,
  extra,
}: {
  placeholder: string
  onAdd: (title: string) => void
  extra?: ReactNode
}) {
  const [v, setV] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const t = v.trim()
    if (!t) return
    onAdd(t)
    setV('')
  }
  return (
    <form onSubmit={submit} className="mt-3">
      <div className="flex items-center gap-2 rounded-2xl bg-mist p-1.5 ps-4">
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none"
        />
        <button
          type="submit"
          aria-label="إضافة"
          className="grid size-9 place-items-center rounded-xl bg-ink text-white"
        >
          <Plus size={18} />
        </button>
      </div>
      {extra}
    </form>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-t-[32px] bg-white p-5 pb-8"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="إغلاق" className="grid size-8 place-items-center rounded-full bg-mist">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-3 text-sm text-ink2">{children}</p>
}
