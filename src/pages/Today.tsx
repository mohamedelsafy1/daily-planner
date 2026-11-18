import { useState } from 'react'
import { Check as CheckMark, ChevronLeft, ChevronRight, Moon, Sun, Trash2 } from 'lucide-react'
import { usePrefs } from '../lib/prefs'
import { ADHKAR } from '../data/adhkar'
import JournalBox from '../components/JournalBox'
import { plan } from '../lib/quran'
import { BookOpen, Moon as MoonIcon, Sunrise } from 'lucide-react'
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

function Journey({ date, go, done, isToday }: { date: string; go: (t: Tab) => void; done: Set<string>; isToday: boolean }) {
  const adhkar = useStore((s) => s.adhkar)
  const quran = useStore((s) => s.quran)
  const hour = new Date().getHours()
  const frac = (kind: 'am' | 'pm') => {
    const prog = adhkar[`${date}:${kind}`] ?? {}
    const items = ADHKAR[kind]
    const total = items.reduce((a, i) => a + i.count, 0)
    return items.reduce((a, i) => a + Math.min(prog[i.id] ?? 0, i.count), 0) / total
  }
  const pl = plan(quran.log, quran.goal, date)
  const readToday = quran.log[date] ?? 0
  const quranDone = pl ? pl.todayLeft === 0 : readToday >= 5
  const quranSub = pl
    ? pl.finished
      ? 'أتممت الختمة'
      : pl.todayLeft > 0
        ? `باقي ${arNum(pl.todayLeft)} صفحة من ${arNum(pl.target)}`
        : `أتممت ${arNum(pl.target)} صفحة`
    : readToday > 0
      ? `قرأت ${arNum(readToday)} صفحة`
      : 'ابدأ ورد اليوم أو تحدّي ختمة'

  const steps = [
    {
      id: 'am',
      to: 'adhkar' as Tab,
      title: 'أذكار الصباح',
      sub: done.has('adhkar-am') ? 'تمّت' : frac('am') > 0 ? `${arNum(Math.round(frac('am') * 100))}% منها` : 'حصنك لبقية اليوم',
      Icon: Sunrise,
      ok: done.has('adhkar-am'),
      ready: true,
    },
    { id: 'quran', to: 'quran' as Tab, title: 'ورد القرآن', sub: quranSub, Icon: BookOpen, ok: quranDone, ready: true },
    {
      id: 'pm',
      to: 'adhkar' as Tab,
      title: 'أذكار المساء',
      sub: done.has('adhkar-pm') ? 'تمّت' : hour < 15 ? 'تبدأ بعد العصر' : frac('pm') > 0 ? `${arNum(Math.round(frac('pm') * 100))}% منها` : 'اختم يومك بالذكر',
      Icon: MoonIcon,
      ok: done.has('adhkar-pm'),
      ready: hour >= 15 || !isToday,
    },
  ]
  const current = isToday ? steps.find((x) => !x.ok && x.ready) : undefined
  const left = steps.filter((x) => x.ok).length

  return (
    <Card className="col-span-2" tone="sand">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink2">{isToday ? greeting() : 'يوم سابق'}</p>
          <h2 className="text-lg font-semibold">{current ? 'خطوتك التالية' : left === 3 ? 'أتممت رحلة يومك' : 'رحلة اليوم'}</h2>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs tabular-nums">{left} / 3</span>
      </div>
      <ul className="mt-3 space-y-2">
        {steps.map((st) => {
          const on = current?.id === st.id
          return (
            <li key={st.id}>
              <button
                onClick={() => go(st.to)}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-start ${
                  on ? 'bg-ink text-white shadow-md' : 'bg-white/70'
                } ${st.ok ? 'opacity-70' : ''}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${on ? 'bg-white/15' : 'bg-white'}`}>
                  {st.ok ? <CheckMark size={18} strokeWidth={3} /> : <st.Icon size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm font-semibold ${st.ok ? 'line-through' : ''}`}>{st.title}</span>
                  <span className={`block truncate text-xs ${on ? 'text-white/75' : 'text-ink2'}`}>{st.sub}</span>
                </span>
                {on && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink">ابدأ</span>}
              </button>
            </li>
          )
        })}
      </ul>
    </Card>
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
  const theme = usePrefs((p) => p.theme)
  const setPref = usePrefs((p) => p.set)
  const isDark = document.documentElement.classList.contains('dark')
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

  const yesterday = addDays(today, -1)
  const carry = s.tasks.filter((t) => t.date === yesterday && !t.done).length
  const ws = weekStart(date)
  const wk = s.wtasks.filter((t) => t.week === ws)
  const wkDone = wk.filter((t) => t.done).length
  const prayerStreak = streak((d) => prayersComplete(s.logs, s.habits, d), today)

  return (
    <div className="stagger grid grid-cols-2 gap-3">
      <Journey date={date} go={go} done={done} isToday={isToday} />
      <Card className="col-span-2">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-lg font-semibold">مهام اليوم</h2>
            <p className="mt-0.5 text-xs text-ink2">
              {tasks.length === 0
                ? 'أضف ما يجب أن ينتهي اليوم'
                : tasks.every((t) => t.done)
                  ? 'أنجزت كل مهامك، بارك الله في جهدك'
                  : `باقي ${arNum(tasks.filter((t) => !t.done).length)} من ${arNum(tasks.length)}`}
            </p>
          </div>
          {tasks.length > 0 && (
            <span className="text-2xl font-semibold tabular-nums">
              {arNum(tasks.filter((t) => t.done).length)}
              <span className="text-sm text-ink2">/{arNum(tasks.length)}</span>
            </span>
          )}
        </div>
        {tasks.length > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-sage-d transition-all duration-500"
              style={{ width: `${(tasks.filter((t) => t.done).length / tasks.length) * 100}%` }}
            />
          </div>
        )}
        {isToday && carry > 0 && (
          <button
            onClick={() => s.moveUnfinished(yesterday, date)}
            className="mt-3 flex w-full items-center justify-between rounded-2xl bg-sand px-4 py-2.5 text-sm"
          >
            <span>{arNum(carry)} {carry === 1 ? 'مهمة لم تُنجز' : 'مهام لم تُنجز'} أمس</span>
            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold">انقلها لليوم</span>
          </button>
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
        {tasks.length > 0 && (
          <ul className="mt-2">
            {[...tasks].sort((x, y) => Number(x.done) - Number(y.done)).map((t) => (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <Check done={t.done} label={t.title} onClick={() => s.toggleTask(t.id)} />
                <span className={`min-w-0 flex-1 text-[15px] ${t.done ? 'text-ink2 line-through' : ''}`}>{t.title}</span>
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
      </Card>

      <Card className="col-span-2">
        <Title aside="تُحفظ تلقائيًا">مذكرات اليوم</Title>
        <JournalBox date={date} rows={3} />
      </Card>

      <Card className="col-span-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold leading-tight">{fmtLong(date)}</h1>
          </div>
          <div className="flex gap-1.5">
            <button
              aria-label={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              data-theme={theme}
              onClick={() => setPref({ theme: isDark ? 'light' : 'dark' })}
              className="grid size-9 place-items-center rounded-full bg-mist"
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
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
