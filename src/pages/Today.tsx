import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useStore, type Energy, type Habit } from '../store'
import { addDays, arNum, arPct, dkey, fmtLong, weekStart } from '../lib/date'
import { doneSet, prayersComplete, streak } from '../lib/stats'
import { getIcon } from '../icons'
import { AddRow, Card, Check, Empty, Ring, Title } from '../ui'
import type { Tab } from '../nav'

const ENERGY: Record<Energy, { label: string; cls: string }> = {
  deep: { label: 'تركيز عميق', cls: 'bg-sky text-ink' },
  light: { label: 'مهمة خفيفة', cls: 'bg-sand text-ink' },
}

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'ليلة هادئة'
  if (h < 12) return 'صباح الخير'
  if (h < 17) return 'نهارك سعيد'
  if (h < 20) return 'مساء الخير'
  return 'مساء النور'
}

function HabitChip({ h, on, onClick }: { h: Habit; on: boolean; onClick: () => void }) {
  const Icon = getIcon(h.icon)
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-start text-sm transition-colors ${
        on ? 'bg-ink text-white' : 'bg-white/70'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      <span className="min-w-0 truncate">{h.name}</span>
    </button>
  )
}

export default function Today({
  date,
  setDate,
  go,
}: {
  date: string
  setDate: (d: string) => void
  go: (t: Tab) => void
}) {
  const s = useStore()
  const today = dkey()
  const isToday = date === today
  const [energy, setEnergy] = useState<Energy | undefined>()

  const tasks = s.tasks.filter((t) => t.date === date)
  const done = doneSet(s.logs, date)
  const prayers = s.habits.filter((h) => h.group === 'prayer')
  const religion = s.habits.filter((h) => h.group === 'religion')
  const life = s.habits.filter((h) => h.group === 'life')

  const total = tasks.length + s.habits.length
  const finished = tasks.filter((t) => t.done).length + s.habits.filter((h) => done.has(h.id)).length
  const pct = total ? finished / total : 0

  const ws = weekStart(date)
  const wk = s.wtasks.filter((t) => t.week === ws)
  const wkDone = wk.filter((t) => t.done).length
  const prayerStreak = streak((d) => prayersComplete(s.logs, s.habits, d), today)

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink2">{isToday ? greeting() : 'يوم سابق'}</p>
            <h1 className="text-xl font-semibold leading-tight">{fmtLong(date)}</h1>
          </div>
          <div className="flex gap-1.5">
            <button
              aria-label="اليوم السابق"
              onClick={() => setDate(addDays(date, -1))}
              className="grid size-9 place-items-center rounded-full bg-mist"
            >
              <ChevronRight size={18} />
            </button>
            <button
              aria-label="اليوم التالي"
              disabled={date >= today}
              onClick={() => setDate(addDays(date, 1))}
              className="grid size-9 place-items-center rounded-full bg-mist disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <Ring value={pct} size={104} stroke={11}>
            <span className="text-lg font-semibold">{arPct(pct)}</span>
          </Ring>
          <div className="min-w-0">
            <p className="text-sm">
              أنجزت <b>{arNum(finished)}</b> من {arNum(total)}
            </p>
            <p className="mt-1 text-xs text-ink2">مهام وعادات هذا اليوم</p>
            {!isToday && (
              <button
                onClick={() => setDate(today)}
                className="mt-2 rounded-full bg-mist px-3 py-1 text-xs"
              >
                العودة لليوم
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-5 gap-1" role="group" aria-label="الصلوات">
          {prayers.map((h) => {
            const on = done.has(h.id)
            const Icon = getIcon(h.icon)
            return (
              <button
                key={h.id}
                onClick={() => s.toggleHabit(date, h.id)}
                aria-pressed={on}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  className={`grid size-12 place-items-center rounded-full transition-colors ${
                    on ? 'bg-ink text-white' : 'bg-mist text-ink2'
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="text-[11px]">{h.name}</span>
              </button>
            )
          })}
        </div>
      </Card>

      <Card tone="sage" onClick={() => go('stats')}>
        <p className="text-xs text-ink2">صلوات كاملة متتالية</p>
        <p className="mt-2 text-4xl font-semibold leading-none">{arNum(prayerStreak)}</p>
        <p className="mt-1 text-xs text-ink2">{prayerStreak === 1 ? 'يوم' : 'أيام'}</p>
      </Card>

      <Card tone="sky" onClick={() => go('week')}>
        <p className="text-xs text-ink2">مهام الأسبوع</p>
        <p className="mt-2 text-4xl font-semibold leading-none">
          {arNum(wkDone)}
          <span className="text-lg text-ink2">/{arNum(wk.length)}</span>
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/70">
          <div
            className="h-full rounded-full bg-ink transition-all"
            style={{ width: `${wk.length ? (wkDone / wk.length) * 100 : 0}%` }}
          />
        </div>
      </Card>

      <Card className="col-span-2">
        <Title aside={tasks.length ? `${arNum(tasks.filter((t) => t.done).length)}/${arNum(tasks.length)}` : undefined}>
          مهام اليوم
        </Title>
        {tasks.length === 0 ? (
          <Empty>لا توجد مهام لهذا اليوم. أضف أول مهمة بالأسفل.</Empty>
        ) : (
          <ul>
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2">
                <Check done={t.done} label={t.title} onClick={() => s.toggleTask(t.id)} />
                <span className={`min-w-0 flex-1 text-sm ${t.done ? 'text-ink2 line-through' : ''}`}>
                  {t.title}
                </span>
                {t.energy && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${ENERGY[t.energy].cls}`}>
                    {ENERGY[t.energy].label}
                  </span>
                )}
                <button aria-label={`حذف ${t.title}`} onClick={() => s.removeTask(t.id)}>
                  <Trash2 size={16} className="text-ink2/60" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <AddRow
          placeholder="مهمة جديدة"
          onAdd={(title) => s.addTask(title, date, energy)}
          extra={
            <div className="mt-2 flex gap-2" role="group" aria-label="مستوى الطاقة">
              {(Object.keys(ENERGY) as Energy[]).map((k) => (
                <button
                  type="button"
                  key={k}
                  aria-pressed={energy === k}
                  onClick={() => setEnergy(energy === k ? undefined : k)}
                  className={`rounded-full px-3 py-1 text-xs transition-colors ${
                    energy === k ? `${ENERGY[k].cls} ring-2 ring-ink/30` : 'bg-mist text-ink2'
                  }`}
                >
                  {ENERGY[k].label}
                </button>
              ))}
            </div>
          }
        />
      </Card>

      <Card tone="sand" className="col-span-2">
        <Title>أذكار وعبادات</Title>
        {religion.length === 0 ? (
          <Empty>أضف عباداتك من تبويب العادات.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {religion.map((h) => (
              <HabitChip key={h.id} h={h} on={done.has(h.id)} onClick={() => s.toggleHabit(date, h.id)} />
            ))}
          </div>
        )}
      </Card>

      <Card tone="lilac" className="col-span-2">
        <Title>عادات يومية</Title>
        {life.length === 0 ? (
          <Empty>أضف عاداتك من تبويب العادات.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {life.map((h) => (
              <HabitChip key={h.id} h={h} on={done.has(h.id)} onClick={() => s.toggleHabit(date, h.id)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
