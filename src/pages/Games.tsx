import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronRight, Circle, Droplets, Grid3x3, Calculator, Brain, Palette, Sparkles, Leaf, Star, Heart, Sun, Moon, Cloud, Flower2, Gem,
} from 'lucide-react'
import { useStore } from '../store'
import { buzz } from '../lib/haptic'
import { Card, type Tone } from '../ui'

type Kind = 'calm' | 'brain'
const rnd = (n: number) => Math.floor(Math.random() * n)
const shuffle = <T,>(a: T[]) => {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = rnd(i + 1)
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

function Best({ id, unit, low }: { id: string; unit: string; low?: boolean }) {
  const v = useStore((s) => s.scores[id])
  return <span className="text-xs text-ink2">{v === undefined ? 'لا رقم قياسي بعد' : `أفضل ${low ? 'نتيجة' : 'رقم'}: ${v} ${unit}`}</span>
}

function Shell({ title, onBack, children, best }: { title: string; onBack: () => void; children: React.ReactNode; best?: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">{title}</h1>
        <span className="ms-auto">{best}</span>
      </div>
      {children}
    </div>
  )
}

/* ───────── تفريغ التوتر ───────── */

function Bubbles({ onBack }: { onBack: () => void }) {
  const N = 35
  const [popped, setPopped] = useState<boolean[]>(() => Array(N).fill(false))
  const [rounds, setRounds] = useState(0)
  const left = popped.filter((p) => !p).length
  useEffect(() => {
    if (left === 0) {
      const t = setTimeout(() => {
        setPopped(Array(N).fill(false))
        setRounds((r) => r + 1)
      }, 700)
      return () => clearTimeout(t)
    }
  }, [left])
  return (
    <Shell title="فقاعات" onBack={onBack} best={<span className="text-xs text-ink2">دورات: {rounds}</span>}>
      <div className="grid grid-cols-5 gap-3 rounded-[28px] bg-sky p-4">
        {popped.map((p, i) => (
          <button
            key={i}
            aria-label={p ? 'فقاعة مفرقعة' : 'فقاعة'}
            onClick={() => {
              if (p) return
              buzz(8)
              setPopped((a) => a.map((x, j) => (j === i ? true : x)))
            }}
            className={`aspect-square rounded-full border-2 transition-all duration-150 ${
              p ? 'scale-75 border-transparent bg-white/40' : 'border-white bg-white/80 shadow-[inset_-4px_-4px_0_rgba(88,106,112,.12)] active:scale-90'
            }`}
          />
        ))}
      </div>
      <p className="px-2 text-center text-xs text-ink2">المس الفقاعات واحدة واحدة. تتجدد وحدها عند الانتهاء.</p>
    </Shell>
  )
}

const PHASES = [
  { t: 'شهيق', s: 4, k: 1 },
  { t: 'احبس', s: 4, k: 1 },
  { t: 'زفير', s: 6, k: 0.55 },
] as const

function Breathing({ onBack }: { onBack: () => void }) {
  const [on, setOn] = useState(false)
  const [i, setI] = useState(0)
  const [cycles, setCycles] = useState(0)
  useEffect(() => {
    if (!on) return
    const t = setTimeout(() => {
      const nx = (i + 1) % PHASES.length
      if (nx === 0) setCycles((c) => c + 1)
      setI(nx)
    }, PHASES[i].s * 1000)
    return () => clearTimeout(t)
  }, [on, i])
  const p = PHASES[i]
  return (
    <Shell title="تنفّس هادئ" onBack={onBack} best={<span className="text-xs text-ink2">دورات: {cycles}</span>}>
      <section className="rounded-[28px] bg-sage p-6 text-center">
        <div className="mx-auto grid size-64 place-items-center">
          <div
            className="grid place-items-center rounded-full bg-white/80"
            style={{
              width: on ? `${p.k * 100}%` : '55%',
              height: on ? `${p.k * 100}%` : '55%',
              transition: `all ${p.s}s ease-in-out`,
            }}
          >
            <span className="text-lg font-semibold">{on ? p.t : 'جاهز؟'}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setOn((v) => !v)
            setI(0)
          }}
          className="mt-4 rounded-full bg-ink px-8 py-2.5 text-white"
        >
          {on ? 'إيقاف' : 'ابدأ'}
        </button>
      </section>
      <p className="px-2 text-center text-xs leading-relaxed text-ink2">
        شهيق 4 ثوانٍ، احبس 4، زفير 6. الزفير الأطول يساعد الجسم على الهدوء. توقف إن شعرت بدوار.
      </p>
    </Shell>
  )
}

function Ripples({ onBack }: { onBack: () => void }) {
  const [r, setR] = useState<{ id: number; x: number; y: number }[]>([])
  const id = useRef(0)
  return (
    <Shell title="تموّجات" onBack={onBack}>
      <div
        role="button"
        tabIndex={0}
        aria-label="سطح الماء، المس لإحداث موجة"
        onPointerDown={(e) => {
          const b = e.currentTarget.getBoundingClientRect()
          const n = ++id.current
          setR((a) => [...a.slice(-8), { id: n, x: e.clientX - b.left, y: e.clientY - b.top }])
          buzz(6)
          setTimeout(() => setR((a) => a.filter((q) => q.id !== n)), 1800)
        }}
        className="relative h-[60vh] touch-none select-none overflow-hidden rounded-[28px] bg-lilac"
      >
        {r.map((q) => (
          <span key={q.id} className="ripple pointer-events-none absolute size-6 rounded-full border-2 border-white" style={{ left: q.x - 12, top: q.y - 12 }} />
        ))}
        {r.length === 0 && <p className="absolute inset-0 grid place-items-center text-sm text-ink2">المس في أي مكان</p>}
      </div>
    </Shell>
  )
}

/* ───────── ألعاب الذكاء ───────── */

const ICONS = [Leaf, Star, Heart, Sun, Moon, Cloud, Flower2, Gem]
function Memory({ onBack }: { onBack: () => void }) {
  const save = useStore((s) => s.saveScore)
  const mk = () => shuffle([...ICONS.keys(), ...ICONS.keys()])
  const [cards, setCards] = useState(mk)
  const [open, setOpen] = useState<number[]>([])
  const [found, setFound] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [msg, setMsg] = useState('')
  const lock = useRef(false)
  const flip = (i: number) => {
    if (lock.current || open.includes(i) || found.has(i)) return
    const o = [...open, i]
    setOpen(o)
    if (o.length === 2) {
      setMoves((m) => m + 1)
      lock.current = true
      setTimeout(() => {
        if (cards[o[0]] === cards[o[1]]) {
          const f = new Set(found)
          o.forEach((x) => f.add(x))
          setFound(f)
          if (f.size === cards.length) setMsg(save('memory', moves + 1, 'low') ? 'رقم قياسي جديد!' : 'أحسنت!')
        }
        setOpen([])
        lock.current = false
      }, 650)
    }
  }
  const again = () => {
    setCards(mk())
    setOpen([])
    setFound(new Set())
    setMoves(0)
    setMsg('')
  }
  return (
    <Shell title="تطابق الذاكرة" onBack={onBack} best={<Best id="memory" unit="حركة" low />}>
      <p className="px-1 text-sm text-ink2">الحركات: {moves}</p>
      <div className="grid grid-cols-4 gap-2.5">
        {cards.map((c, i) => {
          const up = open.includes(i) || found.has(i)
          const Ic = ICONS[c]
          return (
            <button
              key={i}
              aria-label={up ? 'بطاقة مكشوفة' : 'بطاقة مقلوبة'}
              onClick={() => flip(i)}
              className={`grid aspect-square place-items-center rounded-2xl transition-colors ${
                found.has(i) ? 'bg-sage' : up ? 'bg-white border border-line' : 'bg-rose'
              }`}
            >
              {up && <Ic size={26} />}
            </button>
          )
        })}
      </div>
      {msg && (
        <div className="rounded-[28px] bg-sage p-4 text-center">
          <p className="font-semibold">{msg}</p>
          <button onClick={again} className="mt-2 rounded-full bg-ink px-6 py-2 text-white">لعبة جديدة</button>
        </div>
      )}
    </Shell>
  )
}

function Schulte({ onBack }: { onBack: () => void }) {
  const save = useStore((s) => s.saveScore)
  const [grid, setGrid] = useState(() => shuffle(Array.from({ length: 25 }, (_, i) => i + 1)))
  const [next, setNext] = useState(1)
  const [t0, setT0] = useState(0)
  const [res, setRes] = useState<{ s: number; best: boolean } | null>(null)
  const [wrong, setWrong] = useState(0)
  const hit = (n: number) => {
    if (res) return
    if (n !== next) {
      setWrong(n)
      setTimeout(() => setWrong(0), 250)
      return
    }
    if (next === 1) setT0(Date.now())
    if (next === 25) {
      const s = Math.round((Date.now() - t0) / 100) / 10
      setRes({ s, best: save('schulte', s, 'low') })
    }
    setNext(next + 1)
  }
  const again = () => {
    setGrid(shuffle(Array.from({ length: 25 }, (_, i) => i + 1)))
    setNext(1)
    setRes(null)
  }
  return (
    <Shell title="جدول شولتي" onBack={onBack} best={<Best id="schulte" unit="ثانية" low />}>
      <p className="px-1 text-sm text-ink2">
        المس الأرقام من 1 إلى 25 بالترتيب بأسرع ما تستطيع، وعيناك على وسط الجدول. التالي: {Math.min(next, 25)}
      </p>
      <div className="grid grid-cols-5 gap-2">
        {grid.map((n) => (
          <button
            key={n}
            onClick={() => hit(n)}
            className={`aspect-square rounded-2xl text-xl font-semibold transition-colors ${
              n < next ? 'bg-sage text-ink2' : wrong === n ? 'bg-rose' : 'bg-white border border-line'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {res && (
        <div className="rounded-[28px] bg-sage p-4 text-center">
          <p className="font-semibold">
            {res.s} ثانية {res.best && '· رقم قياسي جديد!'}
          </p>
          <button onClick={again} className="mt-2 rounded-full bg-ink px-6 py-2 text-white">مرة أخرى</button>
        </div>
      )}
    </Shell>
  )
}

function useCountdown(sec: number) {
  const [left, setLeft] = useState(sec)
  const [run, setRun] = useState(false)
  useEffect(() => {
    if (!run) return
    if (left <= 0) {
      setRun(false)
      return
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
  }, [run, left])
  return { left, run, start: () => (setLeft(sec), setRun(true)), over: !run && left <= 0 }
}

function MathGame({ onBack }: { onBack: () => void }) {
  const save = useStore((s) => s.saveScore)
  const cd = useCountdown(60)
  const [score, setScore] = useState(0)
  const [ans, setAns] = useState('')
  const [best, setBest] = useState(false)
  const q = useMemo(() => {
    const op = ['+', '−', '×'][rnd(3)]
    let a = 2 + rnd(op === '×' ? 10 : 40)
    let b = 2 + rnd(op === '×' ? 10 : 40)
    if (op === '−' && b > a) [a, b] = [b, a]
    return { a, b, op, r: op === '+' ? a + b : op === '−' ? a - b : a * b }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, cd.run])
  const finished = useRef(false)
  useEffect(() => {
    if (cd.over && !finished.current && score > 0) {
      finished.current = true
      setBest(save('math', score, 'high'))
    }
  }, [cd.over, score, save])
  const press = (d: string) => {
    if (!cd.run) return
    const v = ans + d
    if (v.length >= String(q.r).length) {
      if (Number(v) === q.r) setScore((s) => s + 1)
      else buzz(40)
      setAns('')
    } else setAns(v)
  }
  return (
    <Shell title="حساب ذهني" onBack={onBack} best={<Best id="math" unit="إجابة" />}>
      <section className="rounded-[28px] bg-sand p-5 text-center">
        <div className="flex justify-between text-sm text-ink2">
          <span>النقاط: {score}</span>
          <span>الوقت: {cd.left}</span>
        </div>
        {cd.run ? (
          <>
            <p className="mt-4 text-5xl font-semibold tabular-nums" dir="ltr">
              {q.a} {q.op} {q.b}
            </p>
            <p className="mt-3 h-10 text-3xl tabular-nums" dir="ltr">
              {ans || '·'}
            </p>
          </>
        ) : (
          <div className="py-6">
            <p className="font-semibold">{cd.over ? `النتيجة: ${score}${best ? ' · رقم قياسي جديد!' : ''}` : 'أجب عن أكبر عدد في 60 ثانية'}</p>
            <button
              onClick={() => {
                finished.current = false
                setScore(0)
                setAns('')
                setBest(false)
                cd.start()
              }}
              className="mt-3 rounded-full bg-ink px-8 py-2.5 text-white"
            >
              {cd.over ? 'مرة أخرى' : 'ابدأ'}
            </button>
          </div>
        )}
      </section>
      {cd.run && (
        <div className="grid grid-cols-3 gap-2" dir="ltr">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((d, i) =>
            d === '' ? (
              <span key={i} />
            ) : (
              <button
                key={i}
                onClick={() => (d === '⌫' ? setAns((a) => a.slice(0, -1)) : press(d))}
                className="rounded-2xl border border-line bg-white py-3.5 text-xl font-semibold"
              >
                {d}
              </button>
            ),
          )}
        </div>
      )}
    </Shell>
  )
}

const COLORS = [
  { n: 'أحمر', c: '#B83A2E' },
  { n: 'أزرق', c: '#2F6FB3' },
  { n: 'أخضر', c: '#2E8B57' },
  { n: 'برتقالي', c: '#C46A12' },
]
function Stroop({ onBack }: { onBack: () => void }) {
  const save = useStore((s) => s.saveScore)
  const cd = useCountdown(30)
  const [score, setScore] = useState(0)
  const [miss, setMiss] = useState(0)
  const [best, setBest] = useState(false)
  const mk = useCallback(() => {
    const w = rnd(4)
    let ink = rnd(4)
    if (Math.random() < 0.8) while (ink === w) ink = rnd(4)
    return { w, ink }
  }, [])
  const [q, setQ] = useState(mk)
  const finished = useRef(false)
  useEffect(() => {
    if (cd.over && !finished.current && score > 0) {
      finished.current = true
      setBest(save('stroop', score, 'high'))
    }
  }, [cd.over, score, save])
  return (
    <Shell title="ستروب: لون الكلمة" onBack={onBack} best={<Best id="stroop" unit="إجابة" />}>
      <section className="rounded-[28px] bg-rose p-5 text-center">
        <div className="flex justify-between text-sm text-ink2">
          <span>صحيح: {score} · خطأ: {miss}</span>
          <span>الوقت: {cd.left}</span>
        </div>
        {cd.run ? (
          <p className="my-8 text-5xl font-semibold" style={{ color: COLORS[q.ink].c }}>
            {COLORS[q.w].n}
          </p>
        ) : (
          <div className="py-6">
            <p className="font-semibold">{cd.over ? `النتيجة: ${score}${best ? ' · رقم قياسي جديد!' : ''}` : 'اختر لون الحبر، لا ما تقوله الكلمة'}</p>
            <button
              onClick={() => {
                finished.current = false
                setScore(0)
                setMiss(0)
                setBest(false)
                setQ(mk())
                cd.start()
              }}
              className="mt-3 rounded-full bg-ink px-8 py-2.5 text-white"
            >
              {cd.over ? 'مرة أخرى' : 'ابدأ'}
            </button>
          </div>
        )}
      </section>
      {cd.run && (
        <div className="grid grid-cols-2 gap-2">
          {COLORS.map((c, i) => (
            <button
              key={c.n}
              onClick={() => {
                if (i === q.ink) setScore((s) => s + 1)
                else (setMiss((m) => m + 1), buzz(40))
                setQ(mk())
              }}
              className="rounded-2xl border border-line bg-white py-4 text-lg font-semibold"
            >
              {c.n}
            </button>
          ))}
        </div>
      )}
    </Shell>
  )
}

/* ───────── القوائم ───────── */

const GAMES: Record<Kind, { id: string; title: string; note: string; tone: Tone; Icon: typeof Circle; C: (p: { onBack: () => void }) => React.JSX.Element }[]> = {
  calm: [
    { id: 'bubbles', title: 'فقاعات', note: 'فرقعة هادئة بلا هدف.', tone: 'sky', Icon: Circle, C: Bubbles },
    { id: 'breath', title: 'تنفّس هادئ', note: 'دائرة تقودك للشهيق والزفير.', tone: 'sage', Icon: Droplets, C: Breathing },
    { id: 'ripples', title: 'تموّجات', note: 'المس الماء وراقب الموجات.', tone: 'lilac', Icon: Sparkles, C: Ripples },
  ],
  brain: [
    { id: 'memory', title: 'تطابق الذاكرة', note: 'اقلب البطاقات وجد الأزواج.', tone: 'rose', Icon: Brain, C: Memory },
    { id: 'schulte', title: 'جدول شولتي', note: 'تدريب على سرعة الانتباه.', tone: 'sky', Icon: Grid3x3, C: Schulte },
    { id: 'math', title: 'حساب ذهني', note: 'عمليات سريعة في دقيقة.', tone: 'sand', Icon: Calculator, C: MathGame },
    { id: 'stroop', title: 'ستروب', note: 'لون الحبر لا معنى الكلمة.', tone: 'lilac', Icon: Palette, C: Stroop },
  ],
}

export default function Games({ kind, onBack }: { kind: Kind; onBack: () => void }) {
  const [cur, setCur] = useState<string | null>(null)
  const list = GAMES[kind]
  const g = list.find((x) => x.id === cur)
  if (g) return <g.C onBack={() => setCur(null)} />
  return (
    <Shell title={kind === 'calm' ? 'تفريغ التوتر' : 'ألعاب الذكاء'} onBack={onBack}>
      <div className="grid grid-cols-2 gap-3">
        {list.map(({ id, title, note, tone, Icon }) => (
          <Card key={id} tone={tone} onClick={() => setCur(id)}>
            <Icon size={22} />
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink2">{note}</p>
          </Card>
        ))}
      </div>
    </Shell>
  )
}
