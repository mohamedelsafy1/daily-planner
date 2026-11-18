import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { addDays, arNum, daysInMonth, dkey, fmtLong, fmtMonth, fmtNarrow, weekStart } from '../lib/date'
import { doneSet } from '../lib/stats'
import { AddRow, Card, Check, Empty, Title } from '../ui'
import JournalBox from '../components/JournalBox'

export default function Month() {
  const s = useStore()
  const today = dkey()
  const [ym, setYm] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))
  const [sel, setSel] = useState(today)

  const dim = daysInMonth(ym.y, ym.m)
  const key = (d: number) => dkey(new Date(ym.y, ym.m, d))
  const offset = (new Date(ym.y, ym.m, 1).getDay() + 1) % 7 // week starts on Saturday
  const heads = useMemo(() => Array.from({ length: 7 }, (_, i) => fmtNarrow(addDays(weekStart(today), i))), [today])

  const stat = (d: string) => {
    const t = s.tasks.filter((x) => x.date === d)
    return { total: t.length, done: t.filter((x) => x.done).length }
  }
  const days = Array.from({ length: dim }, (_, i) => key(i + 1))
  const past = days.filter((d) => d <= today)
  const sum = past.reduce((a, d) => ({ t: a.t + stat(d).total, c: a.c + stat(d).done }), { t: 0, c: 0 })
  const perfect = past.filter((d) => stat(d).total > 0 && stat(d).done === stat(d).total).length
  const notes = days.filter((d) => s.journal[d]).length

  const selTasks = s.tasks.filter((t) => t.date === sel)
  const habitsDone = doneSet(s.logs, sel).size
  const pages = s.quran.log[sel] ?? 0
  const future = sel > today

  const move = (n: number) =>
    setYm((c) => {
      const d = new Date(c.y, c.m + n, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })

  return (
    <div className="stagger space-y-3">
      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{fmtMonth(ym.y, ym.m)}</h2>
          <div className="flex gap-1.5">
            <button aria-label="الشهر السابق" onClick={() => move(-1)} className="grid size-9 place-items-center rounded-full bg-mist">
              <ChevronRight size={18} />
            </button>
            <button aria-label="الشهر التالي" onClick={() => move(1)} className="grid size-9 place-items-center rounded-full bg-mist">
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5 text-center">
          {heads.map((h, i) => (
            <span key={i} className="pb-1 text-[11px] text-ink2">
              {h}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`o${i}`} />
          ))}
          {days.map((d, i) => {
            const st = stat(d)
            const isFuture = d > today
            const full = st.total > 0 && st.done === st.total
            const some = st.done > 0 && !full
            const missed = !isFuture && d < today && st.total > 0 && st.done === 0
            const cls = full
              ? 'bg-sage-d text-white'
              : some
                ? 'bg-sand'
                : missed
                  ? 'bg-rose'
                  : 'bg-mist'
            return (
              <button
                key={d}
                onClick={() => setSel(d)}
                aria-label={`${fmtLong(d)}${st.total ? `، أنجز ${st.done} من ${st.total}` : ''}`}
                aria-pressed={sel === d}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm ${cls} ${
                  isFuture ? 'opacity-45' : ''
                } ${sel === d ? 'ring-2 ring-ink' : ''} ${d === today ? 'font-bold' : ''}`}
              >
                <span className="tabular-nums leading-none">{i + 1}</span>
                {st.total > 0 && !isFuture && (
                  <span className="mt-0.5 text-[9px] leading-none tabular-nums opacity-80">
                    {st.done}/{st.total}
                  </span>
                )}
                {s.journal[d] && <span className="absolute end-1.5 top-1.5 size-1.5 rounded-full bg-sky-d" />}
                {d === today && <span className="absolute bottom-1 size-1 rounded-full bg-ink" />}
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-ink2">
          <span className="flex items-center gap-1"><i className="size-2.5 rounded bg-sage-d" /> أُنجز كله</span>
          <span className="flex items-center gap-1"><i className="size-2.5 rounded bg-sand" /> جزء منه</span>
          <span className="flex items-center gap-1"><i className="size-2.5 rounded bg-rose" /> لم يُنجز</span>
          <span className="flex items-center gap-1"><i className="size-1.5 rounded-full bg-sky-d" /> فيه مذكرة</span>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        {[
          ['مهام منجزة', `${arNum(sum.c)}/${arNum(sum.t)}`],
          ['أيام مكتملة', arNum(perfect)],
          ['مذكرات', arNum(notes)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-[22px] border border-line bg-white p-3 text-center">
            <p className="text-lg font-semibold tabular-nums">{v}</p>
            <p className="text-[11px] text-ink2">{l}</p>
          </div>
        ))}
      </div>

      <Card>
        <Title aside={selTasks.length ? `${arNum(selTasks.filter((t) => t.done).length)}/${arNum(selTasks.length)}` : undefined}>
          {fmtLong(sel)}
        </Title>
        {selTasks.length === 0 ? (
          <Empty>{future ? 'لا مهام مجدولة لهذا اليوم بعد.' : 'لا مهام مسجّلة لهذا اليوم.'}</Empty>
        ) : (
          <ul>
            {selTasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <Check done={t.done} label={t.title} onClick={() => s.toggleTask(t.id)} />
                <span className={`flex-1 text-sm ${t.done ? 'text-ink2 line-through' : ''}`}>{t.title}</span>
              </li>
            ))}
          </ul>
        )}
        <AddRow placeholder="إضافة مهمة لهذا اليوم" onAdd={(t) => s.addTask(t, sel)} />
        {!future && (
          <p className="mt-3 text-xs text-ink2">
            العادات المنجزة: {arNum(habitsDone)} من {arNum(s.habits.length)}
            {pages > 0 ? ` · القرآن: ${arNum(pages)} صفحة` : ''}
          </p>
        )}
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">مذكرات اليوم</p>
          <JournalBox date={sel} />
        </div>
      </Card>
    </div>
  )
}
