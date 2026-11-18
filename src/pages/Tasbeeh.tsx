import { ChevronRight, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import Garden from '../components/Garden'
import Well from '../components/Well'
import { play } from '../lib/sound'
import { usePrefs } from '../lib/prefs'
import { addDays, arNum } from '../lib/date'
import { dkey } from '../lib/date'
import { buzz } from '../lib/haptic'

const DHIKR = [
  { t: 'سبحان الله', goal: 33 },
  { t: 'الحمد لله', goal: 33 },
  { t: 'الله أكبر', goal: 33 },
  { t: 'لا إله إلا الله', goal: 100 },
  { t: 'أستغفر الله', goal: 100 },
  { t: 'لا حول ولا قوة إلا بالله', goal: 100 },
  { t: 'اللهم صل وسلم على نبينا محمد', goal: 100 },
]

export default function Tasbeeh({ onBack }: { onBack: () => void }) {
  const t = useStore((s) => s.tasbeeh)
  const tap = useStore((s) => s.tapTasbeeh)
  const reset = useStore((s) => s.resetTasbeeh)
  const pick = useStore((s) => s.setTasbeehDhikr)
  const date = dkey()
  const goal = DHIKR.find((d) => d.t === t.dhikr)?.goal ?? 100
  const view = usePrefs((p) => p.tasbeehView)
  const setPref = usePrefs((p) => p.set)
  const [celebrate, setCelebrate] = useState(false)
  // A finished round stays on screen as a full garden until the next tap.
  const lap = t.count > 0 && t.count % goal === 0 ? goal : t.count % goal
  const laps = Math.floor(t.count / goal)
  const todayList = Object.entries(t.perDay?.[date] ?? {}).sort((a, b) => b[1] - a[1])
  const week = Array.from({ length: 7 }, (_, i) => addDays(date, i - 6))
  const maxWeek = Math.max(10, ...week.map((d) => t.byDay[d] ?? 0))
  const weekSum = week.reduce((a, d) => a + (t.byDay[d] ?? 0), 0)
  const active = Object.values(t.byDay).filter((n) => n > 0)
  const best = active.length ? Math.max(...active) : 0
  const avg = active.length ? Math.round(active.reduce((a, b) => a + b, 0) / active.length) : 0
  const onGarden = () => {
    const next = t.count + 1
    tap(date)
    const done = next % goal === 0
    setTimeout(() => play('drop'), 380)
    if (done) {
      setTimeout(() => play('done'), 700)
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 2600)
    }
    buzz(done ? [20, 50, 20] : 8)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">السبحة</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="listbox" aria-label="اختر الذكر">
        {DHIKR.map((d) => (
          <button
            key={d.t}
            role="option"
            aria-selected={t.dhikr === d.t}
            onClick={() => pick(d.t)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm ${t.dhikr === d.t ? 'bg-ink text-white' : 'bg-white border border-line'}`}
          >
            {d.t}
          </button>
        ))}
      </div>

      <div className="flex gap-2" role="group" aria-label="طريقة العرض">
        {([['garden', 'الحديقة'], ['well', 'البئر'], ['classic', 'السبحة']] as const).map(([k, l]) => (
          <button
            key={k}
            aria-pressed={view === k}
            data-silent
            onClick={() => setPref({ tasbeehView: k })}
            className={`rounded-full px-3.5 py-1.5 text-xs ${view === k ? 'bg-ink text-white' : 'border border-line bg-white'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <section className="rounded-[28px] bg-lilac p-4 text-center">
        <p className="text-lg font-semibold leading-relaxed">{t.dhikr}</p>
        {view !== 'classic' ? (
          <div className="mt-3">
            {view === 'garden' ? <Garden lap={lap} goal={goal} label={`${t.dhikr}، العدد ${lap} من ${goal}. اضغط لتسقط قطرة`} onTap={onGarden} celebrate={celebrate} /> : <Well lap={lap} goal={goal} label={`${t.dhikr}، العدد ${lap} من ${goal}. اضغط لتسقط قطرة`} onTap={onGarden} celebrate={celebrate} />}
            <p className="mt-2 text-xs text-ink2">كل تسبيحة قطرة تُحيي الصحراء. الدورة {laps + 1}</p>
          </div>
        ) : (
          <>
            <button
              onClick={() => {
                tap(date)
                buzz((t.count + 1) % goal === 0 ? [20, 50, 20] : 8)
              }}
              aria-label={`عدّ، العدد ${lap}`}
              className="mx-auto mt-4 grid size-56 select-none place-items-center rounded-full bg-white shadow-[inset_0_0_0_10px_rgb(var(--mist))] active:scale-[0.98] transition-transform"
            >
              <span className="text-6xl font-semibold tabular-nums">{t.count % goal}</span>
            </button>
            <p className="mt-3 text-sm text-ink2">
              الدورة {laps + 1} · الهدف {goal}
            </p>
          </>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[28px] bg-white border border-line p-4">
          <p className="text-xs text-ink2">اليوم</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{t.byDay[date] ?? 0}</p>
        </div>
        <div className="rounded-[28px] bg-white border border-line p-4">
          <p className="text-xs text-ink2">الإجمالي</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{t.total}</p>
        </div>
      </div>

      <section className="rounded-[28px] border border-line bg-white p-4">
        <h2 className="text-[15px] font-semibold">إحصائيات التسبيح</h2>
        {todayList.length === 0 ? (
          <p className="mt-2 text-sm text-ink2">لم تسبّح اليوم بعد. أول قطرة تبدأ بها.</p>
        ) : (
          <ul className="mt-3 space-y-1.5">
            {todayList.map(([k, n]) => (
              <li key={k} className="flex items-center justify-between rounded-2xl bg-mist px-3.5 py-2 text-sm">
                <span>{k}</span>
                <b className="tabular-nums">{arNum(n)}</b>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex h-24 items-end gap-2">
          {week.map((d) => {
            const n = t.byDay[d] ?? 0
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-ink2">{n || ''}</span>
                <span
                  className={`w-full rounded-lg ${d === date ? 'bg-lilac-d' : 'bg-lilac'}`}
                  style={{ height: `${Math.max(4, (n / maxWeek) * 64)}px` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            ['أفضل يوم', arNum(best)],
            ['متوسط الأيام النشطة', arNum(avg)],
            ['آخر ٧ أيام', arNum(weekSum)],
          ].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-mist p-2.5">
              <p className="text-lg font-semibold tabular-nums">{v}</p>
              <p className="text-[10px] leading-tight text-ink2">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={reset}
        className="mx-auto flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-ink2 border border-line"
      >
        <RotateCcw size={14} /> تصفير العدّاد
      </button>
    </div>
  )
}
