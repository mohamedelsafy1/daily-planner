import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const W = 360
const H = 300
const FLOWERS = ['#F2A7B6', '#F7D26A', '#FFFFFF', '#C9A6F2', '#FF9E6D']
const GREENS = ['#4E9A5E', '#6DB871', '#3E8350']
const frac = (n: number) => n - Math.floor(n)

type Spot = { x: number; y: number; kind: 'tree' | 'flower' | 'grass'; color: string; green: string; s: number }

function spots(n: number): Spot[] {
  return Array.from({ length: n }, (_, i) => {
    const x = 22 + frac((i + 1) * 0.6180339) * (W - 44)
    const y = 222 + frac((i + 1) * 0.4142136) * 66
    const kind: Spot['kind'] = i % 9 === 4 ? 'tree' : i % 3 === 0 ? 'grass' : 'flower'
    return {
      x,
      y,
      kind,
      color: FLOWERS[i % FLOWERS.length],
      green: GREENS[i % GREENS.length],
      s: 0.8 + frac((i + 1) * 0.7320508) * 0.5 + (y - 222) / 220,
    }
  })
}

function Plant({ p }: { p: Spot }) {
  if (p.kind === 'tree')
    return (
      <g>
        <rect x={-3} y={-34} width={6} height={34} rx={3} fill="#8A6A45" />
        <circle cx={0} cy={-42} r={17} fill={p.green} />
        <circle cx={-11} cy={-33} r={11} fill="#3E8350" />
        <circle cx={11} cy={-34} r={12} fill="#6DB871" />
      </g>
    )
  if (p.kind === 'grass')
    return (
      <g stroke={p.green} strokeWidth={3} strokeLinecap="round" fill="none">
        <path d="M-6 0 Q-9 -12 -12 -18" />
        <path d="M0 0 Q0 -14 2 -22" />
        <path d="M6 0 Q9 -10 13 -16" />
      </g>
    )
  return (
    <g>
      <path d="M0 0 Q2 -10 0 -20" stroke={p.green} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M0 -8 Q-9 -10 -10 -16 Q-2 -16 0 -8Z" fill={p.green} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-27} rx={4} ry={6.5} fill={p.color} transform={`rotate(${a} 0 -22)`} />
      ))}
      <circle cx={0} cy={-22} r={3.4} fill="#F4B400" />
    </g>
  )
}

export default function Garden({
  lap,
  goal,
  label,
  onTap,
  celebrate,
}: {
  lap: number
  goal: number
  label: string
  onTap: () => void
  celebrate: boolean
}) {
  const list = useMemo(() => spots(goal), [goal])
  const mounted = useRef(lap)
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([])
  const idRef = useRef(0)
  const p = lap / goal // 0 = desert, 1 = full garden

  // Plants sorted back-to-front so nearer ones draw over farther ones.
  const order = useMemo(() => list.map((s, i) => ({ s, i })).sort((a, b) => a.s.y - b.s.y), [list])

  const tap = () => {
    // The drop falls exactly where the next plant will sprout.
    const target = list[lap >= goal ? 0 : lap]
    const id = ++idRef.current
    setDrops((d) => [...d, { id, x: target.x, y: target.y }])
    setTimeout(() => setDrops((d) => d.filter((x) => x.id !== id)), 900)
    onTap()
  }

  return (
    <button
      data-silent
      onClick={tap}
      aria-label={label}
      className="no-press relative block w-full select-none overflow-hidden rounded-[28px] border border-line text-start"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="skyDry" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9B98B" />
            <stop offset="1" stopColor="#F7E4C2" />
          </linearGradient>
          <linearGradient id="skyWet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8FCBEF" />
            <stop offset="1" stopColor="#E6F5FB" />
          </linearGradient>
          <linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E8C98F" />
            <stop offset="1" stopColor="#D6AE69" />
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8CD08A" />
            <stop offset="1" stopColor="#4E9A5E" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#skyDry)" />
        <motion.rect width={W} height={H} fill="url(#skyWet)" animate={{ opacity: p }} transition={{ duration: 0.8 }} />

        <motion.circle cx={292} cy={58} fill="#FFE08A" animate={{ r: 22 + p * 8, opacity: 0.85 + p * 0.15 }} transition={{ duration: 0.8 }} />
        <motion.circle cx={292} cy={58} fill="#FFE08A" animate={{ r: 38 + p * 14, opacity: 0.18 }} transition={{ duration: 0.8 }} />

        {/* distant dunes */}
        <path d="M0 200 Q70 168 150 196 T300 186 T360 198 V300 H0Z" fill="#E2BC7C" />
        <motion.path
          d="M0 200 Q70 168 150 196 T300 186 T360 198 V300 H0Z"
          fill="#7FBF86"
          animate={{ opacity: p * 0.9 }}
          transition={{ duration: 0.8 }}
        />
        {/* foreground ground */}
        <path d="M0 214 Q90 200 180 216 T360 210 V300 H0Z" fill="url(#sand)" />
        <motion.path
          d="M0 214 Q90 200 180 216 T360 210 V300 H0Z"
          fill="url(#grass)"
          animate={{ opacity: Math.pow(p, 1.25) }}
          transition={{ duration: 0.8 }}
        />

        {order.map(({ s, i }) =>
          i < lap ? (
            <g key={i} transform={`translate(${s.x} ${s.y})`}>
              <motion.g
                initial={i < mounted.current ? false : { scale: 0, opacity: 0 }}
                animate={{ scale: s.s, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: i < mounted.current ? 0 : 0.38 }}
              >
                <Plant p={s} />
              </motion.g>
            </g>
          ) : null,
        )}

        <AnimatePresence>
          {drops.map((d) => (
            <g key={d.id}>
              <motion.path
                d="M0 -9 Q6 0 0 6 Q-6 0 0 -9Z"
                fill="#5DB6F0"
                stroke="#FFFFFF"
                strokeWidth={0.8}
                initial={{ x: d.x, y: -14, opacity: 1 }}
                animate={{ x: d.x, y: d.y, opacity: 1 }}
                transition={{ duration: 0.38, ease: [0.5, 0, 0.9, 0.6] }}
              />
              <motion.ellipse
                cx={d.x}
                cy={d.y}
                rx={4}
                ry={1.6}
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={1.6}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 3.2], opacity: [0.9, 0] }}
                transition={{ duration: 0.55, delay: 0.38 }}
              />
            </g>
          ))}
        </AnimatePresence>

        {celebrate &&
          Array.from({ length: 14 }, (_, i) => (
            <motion.circle
              key={i}
              r={2.6 + (i % 3)}
              fill={FLOWERS[i % FLOWERS.length]}
              initial={{ cx: 20 + i * 24, cy: 250, opacity: 1 }}
              animate={{ cy: 40 + (i % 5) * 20, cx: 20 + i * 24 + (i % 2 ? 14 : -14), opacity: 0 }}
              transition={{ duration: 1.8, delay: i * 0.05, ease: 'easeOut' }}
            />
          ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <div className="rounded-full bg-white/85 px-4 py-1.5 text-ink shadow-sm backdrop-blur">
          <span className="text-2xl font-semibold tabular-nums">{lap}</span>
          <span className="text-sm text-ink2 tabular-nums"> / {goal}</span>
        </div>
      </div>
      {celebrate && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-sm font-semibold text-[#fff] drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        >
          ما شاء الله، اكتملت الحديقة
        </motion.p>
      )}
    </button>
  )
}
