import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { addDays, arNum, dkey, fmtNarrow, fmtShort, parseKey, weekStart } from '../lib/date'
import { dayScore } from '../lib/stats'
import { AddRow, Card, Check, Empty, Ring, Title } from '../ui'
import type { Tab } from '../nav'

export default function Week({ setDate, go }: { setDate: (d: string) => void; go: (t: Tab) => void }) {
  const s = useStore()
  const today = dkey()
  const [ws, setWs] = useState(weekStart(today))
  const we = addDays(ws, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i))
  const list = s.wtasks.filter((t) => t.week === ws)
  const done = list.filter((t) => t.done).length
  const dailyDone = s.tasks.filter((t) => t.done && t.date >= ws && t.date <= we).length
  const current = ws === weekStart(today)

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink2">{current ? 'هذا الأسبوع' : 'أسبوع آخر'}</p>
            <h1 className="text-lg font-semibold">
              {fmtShort(ws)} – {fmtShort(we)}
            </h1>
          </div>
          <div className="flex gap-1.5">
            <button
              aria-label="الأسبوع السابق"
              onClick={() => setWs(addDays(ws, -7))}
              className="grid size-9 place-items-center rounded-full bg-mist"
            >
              <ChevronRight size={18} />
            </button>
            <button
              aria-label="الأسبوع التالي"
              onClick={() => setWs(addDays(ws, 7))}
              className="grid size-9 place-items-center rounded-full bg-mist"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const isToday = d === today
            return (
              <button
                key={d}
                onClick={() => {
                  setDate(d)
                  go('today')
                }}
                aria-label={`فتح يوم ${fmtShort(d)}`}
                className={`flex flex-col items-center gap-1 rounded-2xl py-2 ${isToday ? 'bg-mist' : ''}`}
              >
                <span className="text-[11px] text-ink2">{fmtNarrow(d)}</span>
                <Ring value={dayScore(s.logs, s.habits, d)} size={34} stroke={4} color="#4E8A68">
                  <span className="text-[11px]">{arNum(parseKey(d).getDate())}</span>
                </Ring>
              </button>
            )
          })}
        </div>
      </Card>

      <Card tone="sky">
        <p className="text-xs text-ink2">مهام الأسبوع المنجزة</p>
        <p className="mt-2 text-3xl font-semibold leading-none">
          {arNum(done)}
          <span className="text-base text-ink2">/{arNum(list.length)}</span>
        </p>
      </Card>
      <Card tone="sage">
        <p className="text-xs text-ink2">مهام يومية منجزة</p>
        <p className="mt-2 text-3xl font-semibold leading-none">{arNum(dailyDone)}</p>
      </Card>

      <Card className="col-span-2">
        <Title>أهداف الأسبوع</Title>
        {list.length === 0 ? (
          <Empty>اكتب ما تريد إنجازه هذا الأسبوع، وقسّمه على أيامك لاحقًا.</Empty>
        ) : (
          <ul>
            {list.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <Check done={t.done} label={t.title} onClick={() => s.toggleWTask(t.id)} />
                <span className={`min-w-0 flex-1 text-sm ${t.done ? 'text-ink2 line-through' : ''}`}>
                  {t.title}
                </span>
                <button aria-label={`حذف ${t.title}`} onClick={() => s.removeWTask(t.id)}>
                  <Trash2 size={16} className="text-ink2/60" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <AddRow placeholder="هدف أسبوعي جديد" onAdd={(title) => s.addWTask(title, ws)} />
      </Card>
    </div>
  )
}
