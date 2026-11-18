import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { addDays, arNum, arPct, daysInMonth, dkey, fmtMonth, fmtNarrow, parseKey, weekStart } from '../lib/date'
import { bestStreak, dayScore, habitRate, prayersComplete } from '../lib/stats'
import { getIcon } from '../icons'
import { Card, Ring, Title } from '../ui'
import type { Tab } from '../nav'

export default function Stats({ setDate, go }: { setDate: (d: string) => void; go: (t: Tab) => void }) {
  const { habits, logs, tasks } = useStore()
  const today = dkey()
  const now = new Date()
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() })

  const dim = daysInMonth(ym.y, ym.m)
  const offset = (new Date(ym.y, ym.m, 1).getDay() + 1) % 7
  const keys = Array.from({ length: dim }, (_, i) => dkey(new Date(ym.y, ym.m, i + 1)))
  const elapsed = keys.filter((k) => k <= today)
  const avg = elapsed.length ? elapsed.reduce((a, k) => a + dayScore(logs, habits, k), 0) / elapsed.length : 0
  const fullDays = elapsed.filter((k) => prayersComplete(logs, habits, k)).length
  const prefix = `${ym.y}-${String(ym.m + 1).padStart(2, '0')}`
  const doneTasks = tasks.filter((t) => t.done && t.date.startsWith(prefix)).length
  const isCurrent = ym.y === now.getFullYear() && ym.m === now.getMonth()

  const shift = (n: number) => {
    const d = new Date(ym.y, ym.m + n, 1)
    setYm({ y: d.getFullYear(), m: d.getMonth() })
  }

  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const best = bestStreak((d) => prayersComplete(logs, habits, d), today)
  const headDays = Array.from({ length: 7 }, (_, i) => fmtNarrow(addDays(weekStart(today), i)))

  return (
    <div className="grid grid-cols-2 gap-3">
      <h1 className="col-span-2 px-1 text-xl font-semibold">الإحصاء</h1>

      <Card className="col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{fmtMonth(ym.y, ym.m)}</h2>
          <div className="flex gap-1.5">
            <button aria-label="الشهر السابق" onClick={() => shift(-1)} className="grid size-8 place-items-center rounded-full bg-mist">
              <ChevronRight size={16} />
            </button>
            <button
              aria-label="الشهر التالي"
              disabled={isCurrent}
              onClick={() => shift(1)}
              className="grid size-8 place-items-center rounded-full bg-mist disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {headDays.map((d, i) => (
            <span key={i} className="pb-1 text-center text-[11px] text-ink2">
              {d}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`e${i}`} />
          ))}
          {keys.map((k) => {
            const future = k > today
            const sc = future ? 0 : dayScore(logs, habits, k)
            return (
              <button
                key={k}
                disabled={future}
                aria-label={`${arNum(parseKey(k).getDate())} — ${arPct(sc)}`}
                onClick={() => {
                  setDate(k)
                  go('today')
                }}
                style={sc > 0 ? { backgroundColor: `rgba(78,138,104,${0.14 + 0.8 * sc})` } : undefined}
                className={`grid aspect-square place-items-center rounded-xl text-xs ${
                  sc > 0 ? (sc > 0.55 ? 'text-white' : 'text-ink') : 'bg-mist text-ink2'
                } ${k === today ? 'ring-2 ring-ink' : ''} ${future ? 'opacity-40' : ''}`}
              >
                {arNum(parseKey(k).getDate())}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-ink2">
          <span>أقل</span>
          {[0.1, 0.35, 0.6, 0.9].map((v) => (
            <span key={v} className="size-3.5 rounded" style={{ backgroundColor: `rgba(78,138,104,${0.14 + 0.8 * v})` }} />
          ))}
          <span>أكثر</span>
        </div>
      </Card>

      <Card tone="sage">
        <p className="text-xs text-ink2">متوسط الإنجاز</p>
        <p className="mt-2 text-3xl font-semibold leading-none">{arPct(avg)}</p>
      </Card>
      <Card tone="sky">
        <p className="text-xs text-ink2">أيام الصلوات كاملة</p>
        <p className="mt-2 text-3xl font-semibold leading-none">{arNum(fullDays)}</p>
      </Card>
      <Card tone="sand">
        <p className="text-xs text-ink2">أطول سلسلة صلوات</p>
        <p className="mt-2 text-3xl font-semibold leading-none">
          {arNum(best)} <span className="text-base text-ink2">يوم</span>
        </p>
      </Card>
      <Card tone="rose">
        <p className="text-xs text-ink2">مهام منجزة هذا الشهر</p>
        <p className="mt-2 text-3xl font-semibold leading-none">{arNum(doneTasks)}</p>
      </Card>

      <Card className="col-span-2">
        <Title>آخر 7 أيام</Title>
        <div className="flex h-32 items-end gap-2">
          {last7.map((d) => {
            const v = dayScore(logs, habits, d)
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-ink2">{arPct(v)}</span>
                <div className="flex h-20 w-full items-end rounded-xl bg-mist">
                  <div
                    className="w-full rounded-xl bg-ink transition-all"
                    style={{ height: `${Math.max(v * 100, v > 0 ? 8 : 0)}%` }}
                  />
                </div>
                <span className="text-[11px] text-ink2">{fmtNarrow(d)}</span>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="col-span-2">
        <Title aside="آخر 30 يومًا">التزامك بكل عادة</Title>
        <div className="grid grid-cols-3 gap-y-4">
          {habits.map((h) => {
            const r = habitRate(logs, h.id, today, 30)
            const Icon = getIcon(h.icon)
            return (
              <div key={h.id} className="flex flex-col items-center gap-1.5">
                <Ring value={r} size={64} stroke={7} color="#4E8A68">
                  <Icon size={18} className="text-ink2" />
                </Ring>
                <span className="max-w-full truncate text-[11px]">{h.name}</span>
                <span className="text-[11px] text-ink2">{arPct(r)}</span>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
