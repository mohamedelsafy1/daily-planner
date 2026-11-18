import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const W = 360
const H = 400
const PIT = { x: 180, y: 262 }
const clamp = (v: number) => Math.max(0, Math.min(1, v))

const TREES = [
  { x: 34, y: 214, s: 1.05 },
  { x: 98, y: 190, s: 0.8 },
  { x: 150, y: 184, s: 0.62 },
  { x: 258, y: 182, s: 0.66 },
  { x: 306, y: 196, s: 0.9 },
  { x: 346, y: 222, s: 1.1 },
]
const FLOWERS = Array.from({ length: 46 }, (_, i) => ({
  x: 8 + ((i * 53) % 344),
  y: 200 + ((i * 37) % 190),
  c: ['#F2A7B6', '#F7D26A', '#FFFFFF', '#C9A6F2', '#FF9E6D'][i % 5],
}))
const STAGES = [
  { at: 0, label: 'بئر', text: 'تحفر بئرًا في الصحراء. كل تسبيحة قطرة' },
  { at: 0.25, label: 'نهر', text: 'فاضت البئر فجرى نهر' },
  { at: 0.5, label: 'جنّات', text: 'اخضرّت الأرض وأينعت الأشجار' },
  { at: 0.75, label: 'مطر', text: 'وهطل المطر' },
]

export default function Well({
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
  const p = lap / goal
  const water = clamp(p / 0.25)
  const river = clamp((p - 0.25) / 0.25)
  const life = clamp((p - 0.5) / 0.25)
  const fruit = clamp((p - 0.8) / 0.15)
  const rain = p >= 0.75 && p < 1
  const stage = [...STAGES].reverse().find((s) => p >= s.at) ?? STAGES[0]
  const [drops, setDrops] = useState<number[]>([])
  const idRef = useRef(0)

  const tap = () => {
    const id = ++idRef.current
    setDrops((d) => [...d, id])
    setTimeout(() => setDrops((d) => d.filter((x) => x !== id)), 800)
    onTap()
  }

  return (
    <button
      data-silent
      onClick={tap}
      aria-label={label}
      className="no-press relative block w-full select-none overflow-hidden rounded-[28px] border border-line bg-white text-start"
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden>
        <defs>
          <linearGradient id="wSkyDry" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9B391" />
            <stop offset="1" stopColor="#F3E1C0" />
          </linearGradient>
          <linearGradient id="wSkyWet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86C4EC" />
            <stop offset="1" stopColor="#E4F4FB" />
          </linearGradient>
          <linearGradient id="wSand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E3C38A" />
            <stop offset="1" stopColor="#CFA866" />
          </linearGradient>
          <linearGradient id="wGrass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#92D08C" />
            <stop offset="1" stopColor="#4F9B5F" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#wSkyDry)" />
        <motion.rect width={W} height={H} fill="url(#wSkyWet)" animate={{ opacity: clamp(p * 1.4) }} transition={{ duration: 0.8 }} />

        <motion.g animate={{ opacity: clamp(p * 2) }} transition={{ duration: 0.8 }}>
          <circle cx={300} cy={52} r={22} fill="#FFE08A" />
          <circle cx={300} cy={52} r={40} fill="#FFE08A" opacity={0.2} />
        </motion.g>

        {/* mountains + clouds */}
        <path d="M0 176 L50 128 L96 168 L150 116 L214 172 L262 132 L318 170 L360 140 V190 H0Z" fill="#C9AC8A" opacity={0.75} />
        <motion.path
          d="M0 176 L50 128 L96 168 L150 116 L214 172 L262 132 L318 170 L360 140 V190 H0Z"
          fill="#8FA8C4"
          animate={{ opacity: clamp(p * 1.2) * 0.8 }}
          transition={{ duration: 0.8 }}
        />
        <g fill={rain ? '#9AA6B2' : '#FFFFFF'} opacity={0.95} style={{ transition: 'fill .8s' }}>
          <ellipse cx={92} cy={86} rx={42} ry={15} />
          <ellipse cx={116} cy={74} rx={26} ry={16} />
          <ellipse cx={262} cy={108} rx={38} ry={13} />
          <ellipse cx={282} cy={97} rx={22} ry={13} />
        </g>

        {/* ground */}
        <rect y={166} width={W} height={H - 166} fill="url(#wSand)" />
        <motion.rect y={166} width={W} height={H - 166} fill="url(#wGrass)" animate={{ opacity: life }} transition={{ duration: 0.8 }} />

        {/* trees: bare until the land revives */}
        {TREES.map((t, i) => (
          <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
            <path d="M0 0 V-34 M0 -20 L-12 -34 M0 -26 L11 -40 M0 -34 L-4 -50" stroke="#8A6A4A" strokeWidth={4} strokeLinecap="round" fill="none" />
            <motion.g animate={{ opacity: life, scale: 0.6 + life * 0.4 }} style={{ transformOrigin: '0px -36px' }} transition={{ duration: 0.8 }}>
              <circle cx={0} cy={-48} r={20} fill="#5BAA68" />
              <circle cx={-15} cy={-36} r={13} fill="#3F8A52" />
              <circle cx={15} cy={-38} r={14} fill="#6DBB78" />
            </motion.g>
            <motion.g animate={{ opacity: fruit }} transition={{ duration: 0.6 }}>
              <circle cx={-8} cy={-44} r={3} fill="#D84B3C" />
              <circle cx={10} cy={-52} r={3} fill="#D84B3C" />
              <circle cx={4} cy={-36} r={3} fill="#D84B3C" />
            </motion.g>
          </g>
        ))}

        {FLOWERS.map((f, i) => (
          <motion.circle
            key={i}
            cx={f.x}
            cy={f.y}
            r={2.6}
            fill={f.c}
            animate={{ opacity: life > i / FLOWERS.length ? 1 : 0, scale: life > i / FLOWERS.length ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
        ))}

        {/* river grows from the well */}
        <motion.path
          d="M180 278 C 222 312, 126 338, 176 372 S 150 398, 166 414"
          fill="none"
          stroke="#7FBF86"
          strokeWidth={50}
          strokeLinecap="round"
          animate={{ pathLength: river, opacity: river > 0 ? 0.55 : 0 }}
          transition={{ duration: 0.7 }}
        />
        <motion.path
          d="M180 278 C 222 312, 126 338, 176 372 S 150 398, 166 414"
          fill="none"
          stroke="#5EAEE6"
          strokeWidth={28}
          strokeLinecap="round"
          animate={{ pathLength: river, opacity: river > 0 ? 1 : 0 }}
          transition={{ duration: 0.7 }}
        />
        <motion.path
          d="M180 278 C 222 312, 126 338, 176 372 S 150 398, 166 414"
          fill="none"
          stroke="#BFE4F8"
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray="2 14"
          animate={{ pathLength: river, opacity: river > 0 ? 0.9 : 0 }}
          transition={{ duration: 0.7 }}
        />

        {/* the well */}
        <ellipse cx={PIT.x} cy={PIT.y + 3} rx={70} ry={22} fill="#000" opacity={0.12} />
        <ellipse cx={PIT.x} cy={PIT.y} rx={66} ry={20} fill="#A59684" />
        <ellipse cx={PIT.x} cy={PIT.y + 1} rx={56} ry={14.5} fill="#5A4030" />
        <motion.ellipse
          cx={PIT.x}
          cy={PIT.y + 1}
          rx={54}
          fill="#4FA8E6"
          animate={{ ry: 1 + water * 12.5, opacity: water > 0 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.ellipse
          cx={PIT.x}
          cy={PIT.y + 1}
          rx={30}
          fill="#BFE4F8"
          opacity={0.5}
          animate={{ ry: 0.4 + water * 3 }}
          transition={{ duration: 0.5 }}
        />
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2
          return <circle key={i} cx={PIT.x + Math.cos(a) * 62} cy={PIT.y + Math.sin(a) * 18.5} r={4} fill={i % 2 ? '#B7A894' : '#8E806E'} />
        })}

        {/* rain */}
        {rain &&
          Array.from({ length: 30 }, (_, i) => (
            <motion.line
              key={i}
              x1={10 + ((i * 41) % 340)}
              x2={6 + ((i * 41) % 340)}
              y1={110}
              y2={124}
              stroke="#CFE9FA"
              strokeWidth={2}
              strokeLinecap="round"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, 250], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: (i % 10) * 0.09, ease: 'linear' }}
            />
          ))}

        <AnimatePresence>
          {drops.map((id) => (
            <g key={id}>
              <motion.path
                d="M0 -10 Q7 0 0 7 Q-7 0 0 -10Z"
                fill="#5DB6F0"
                stroke="#fff"
                strokeWidth={0.8}
                initial={{ x: PIT.x, y: -16 }}
                animate={{ x: PIT.x, y: PIT.y }}
                transition={{ duration: 0.42, ease: [0.5, 0, 0.9, 0.6] }}
              />
              <motion.ellipse
                cx={PIT.x}
                cy={PIT.y + 1}
                rx={8}
                ry={2.4}
                fill="none"
                stroke="#fff"
                strokeWidth={1.6}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: [0.3, 3.6], opacity: [0.9, 0] }}
                transition={{ duration: 0.6, delay: 0.42 }}
              />
            </g>
          ))}
        </AnimatePresence>

        {celebrate &&
          Array.from({ length: 16 }, (_, i) => (
            <motion.circle
              key={i}
              r={2.4 + (i % 3)}
              fill={['#FFE08A', '#fff', '#F2A7B6', '#C9A6F2'][i % 4]}
              initial={{ cx: 20 + i * 21, cy: 300, opacity: 1 }}
              animate={{ cy: 60 + (i % 5) * 24, cx: 20 + i * 21 + (i % 2 ? 12 : -12), opacity: 0 }}
              transition={{ duration: 1.9, delay: i * 0.05, ease: 'easeOut' }}
            />
          ))}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
        <div className="rounded-full bg-white/85 px-4 py-1.5 text-ink shadow-sm backdrop-blur">
          <span className="text-2xl font-semibold tabular-nums">{lap}</span>
          <span className="text-sm text-ink2 tabular-nums"> / {goal}</span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3">
        <div className="relative mt-1 h-1.5 rounded-full bg-mist">
          <motion.div className="absolute inset-y-0 start-0 rounded-full bg-sky-d" animate={{ width: `${p * 100}%` }} transition={{ duration: 0.4 }} />
          {STAGES.map((s) => (
            <span
              key={s.label}
              className={`absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 ${p >= s.at && (s.at > 0 || lap > 0) ? 'border-sky-d bg-sky-d' : 'border-line bg-white'}`}
              style={{ insetInlineStart: `calc(${s.at * 100}% - ${s.at * 14}px)` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-ink2">
          {STAGES.map((s) => (
            <span key={s.label} className={p >= s.at && lap > 0 ? 'font-semibold text-ink' : ''}>
              {s.label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-sm">{p >= 1 ? 'اكتمل: رحمة وغفران بإذن الله' : stage.text}</p>
      </div>
    </button>
  )
}
