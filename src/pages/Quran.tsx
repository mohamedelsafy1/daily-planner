import { useState } from 'react'
import { Minus, Plus, Trophy } from 'lucide-react'
import { useStore } from '../store'
import { addDays, arNum, dkey, fmtShort } from '../lib/date'
import { PAGES, plan, readStreak, sumLog } from '../lib/quran'
import { Card, Ring, Title } from '../ui'
import { play } from '../lib/sound'

const PRESETS = [
  { days: 7, label: 'أسبوع' },
  { days: 15, label: '15 يومًا' },
  { days: 30, label: 'شهر' },
  { days: 60, label: 'شهران' },
  { days: 90, label: '3 أشهر' },
]

export default function Quran() {
  const q = useStore((s) => s.quran)
  const read = useStore((s) => s.readPages)
  const setGoal = useStore((s) => s.setQuranGoal)
  const setPos = useStore((s) => s.setQuranPos)
  const today = dkey()
  const [custom, setCustom] = useState('')
  const [adding, setAdding] = useState('')
  const [picking, setPicking] = useState(false)

  const readToday = q.log[today] ?? 0
  const p = plan(q.log, q.goal, today)
  const total = sumLog(q.log)
  const streak = readStreak(q.log, today)
  const ring = p ? (p.target ? Math.min(1, readToday / p.target) : 1) : Math.min(1, readToday / 5)
  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const maxWeek = Math.max(5, ...week.map((d) => q.log[d] ?? 0))
  const juzFill = p ? p.done : q.pos
  const per = PAGES / 30

  const start = (days: number) => {
    if (!days || days < 1 || days > 730) return
    setGoal(days, today)
    setPicking(false)
    setCustom('')
    play('bloom')
  }

  return (
    <div className="stagger space-y-3">
      <h1 className="px-1 text-xl font-semibold">القرآن</h1>

      <Card tone="sage">
        <div className="flex items-center gap-4">
          <Ring value={ring} size={112} stroke={12} color="rgb(var(--sage-d))" track="rgb(var(--white))">
            <div className="text-center leading-tight">
              <span className="text-3xl font-semibold tabular-nums">{readToday}</span>
              <p className="text-[11px] text-ink2">صفحة اليوم</p>
            </div>
          </Ring>
          <div className="min-w-0 flex-1">
            {p && !p.finished ? (
              <>
                <p className="text-sm font-semibold">
                  {p.todayLeft > 0 ? `باقي ${arNum(p.todayLeft)} صفحة لورد اليوم` : 'أتممت ورد اليوم، تقبّل الله منك'}
                </p>
                <p className="mt-1 text-xs text-ink2">هدف اليوم {arNum(p.target)} صفحة</p>
              </>
            ) : p?.finished ? (
              <p className="text-sm font-semibold">ما شاء الله، ختمت التحدي</p>
            ) : (
              <p className="text-sm font-semibold">سجّل ما قرأته اليوم</p>
            )}
            {streak > 0 && <p className="mt-1 text-xs text-ink2">قراءة متتالية: {arNum(streak)} {streak === 1 ? 'يوم' : 'أيام'}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          {[1, 5, 10, 20].map((n) => (
            <button key={n} onClick={() => read(today, n)} className="rounded-2xl bg-white py-3 text-sm font-semibold">
              +{n}
            </button>
          ))}
        </div>
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            const n = Number(adding)
            if (n > 0 && n <= PAGES) read(today, Math.round(n))
            setAdding('')
          }}
        >
          <button type="button" aria-label="تراجع صفحة" onClick={() => read(today, -1)} className="grid size-11 place-items-center rounded-2xl bg-white">
            <Minus size={16} />
          </button>
          <input
            value={adding}
            onChange={(e) => setAdding(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="عدد صفحات آخر"
            aria-label="عدد الصفحات"
            className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 text-sm outline-none"
          />
          <button type="submit" aria-label="إضافة" className="grid size-11 place-items-center rounded-2xl bg-ink text-white">
            <Plus size={18} />
          </button>
        </form>
      </Card>

      <Card>
        <Title aside={q.goal ? `ينتهي ${fmtShort(p?.end ?? today)}` : undefined}>تحدّي الختمة</Title>
        {p && q.goal && !picking ? (
          <>
            <div className="flex items-end justify-between">
              <p className="text-sm">
                قرأت <b className="tabular-nums">{arNum(p.done)}</b> من {PAGES}
              </p>
              <p className="text-xs text-ink2">
                {p.finished ? 'اكتمل' : p.overdue ? 'انتهت المدة' : `متبقٍ ${arNum(p.daysLeft)} يوم`}
              </p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-mist">
              <div className="h-full rounded-full bg-sage-d transition-all duration-700" style={{ width: `${(p.done / PAGES) * 100}%` }} />
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink2">
              {p.finished
                ? 'أتممت ختمة كاملة. يمكنك بدء تحدٍّ جديد.'
                : `باقي ${arNum(p.remaining)} صفحة. ما تقرؤه اليوم يُخصم من الباقي، وإن فاتك يوم يُوزَّع ما تأخّر على الأيام المتبقية.`}
            </p>
            {p.finished && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-sand p-3 text-sm">
                <Trophy size={18} /> ختمة مباركة
              </div>
            )}
            <div className="mt-3 flex gap-2">
              <button onClick={() => setPicking(true)} className="flex-1 rounded-2xl bg-mist py-2.5 text-sm">
                تغيير المدة
              </button>
              <button onClick={() => setGoal(null, today)} className="rounded-2xl bg-mist px-4 py-2.5 text-sm text-ink2">
                إلغاء التحدي
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm leading-relaxed text-ink2">
              اختر المدة التي تريد أن تختم فيها المصحف، وسأحسب لك عدد الصفحات اليومي.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PRESETS.map((x) => (
                <button key={x.days} onClick={() => start(x.days)} className="rounded-2xl bg-mist p-3 text-start">
                  <span className="block text-sm font-semibold">{x.label}</span>
                  <span className="text-xs text-ink2">{Math.ceil(PAGES / x.days)} صفحة يوميًا</span>
                </button>
              ))}
              <form
                className="flex items-center gap-1 rounded-2xl bg-mist p-1.5 ps-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  start(Number(custom))
                }}
              >
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  placeholder="عدد أيام"
                  aria-label="عدد الأيام"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                />
                <button type="submit" aria-label="ابدأ" className="grid size-9 place-items-center rounded-xl bg-ink text-white">
                  <Plus size={16} />
                </button>
              </form>
            </div>
            {custom && Number(custom) > 0 && (
              <p className="mt-2 text-xs text-ink2">{Math.ceil(PAGES / Number(custom))} صفحة يوميًا</p>
            )}
            {picking && (
              <button onClick={() => setPicking(false)} className="mt-3 text-xs text-ink2 underline">
                إبقاء التحدي الحالي
              </button>
            )}
          </>
        )}
      </Card>

      <Card>
        <Title aside={`${arNum(juzFill)} / ${PAGES} صفحة`}>موضعك في المصحف</Title>
        <div className="grid grid-cols-10 gap-1" aria-hidden>
          {Array.from({ length: 30 }, (_, i) => {
            const f = Math.max(0, Math.min(1, (juzFill - i * per) / per))
            return (
              <span key={i} className="h-7 overflow-hidden rounded-md bg-mist">
                <span className="block h-full bg-sage-d" style={{ height: `${f * 100}%`, marginTop: `${(1 - f) * 100}%` }} />
              </span>
            )
          })}
        </div>
        <p className="mt-2 text-[11px] text-ink2">كل مربع يمثّل جزءًا تقريبيًا من ٣٠.</p>
        <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-2.5 text-sm">
          وصلت إلى صفحة
          <input
            key={q.pos}
            defaultValue={q.pos || ''}
            inputMode="numeric"
            aria-label="رقم الصفحة"
            onBlur={(e) => setPos(Number(e.target.value))}
            className="w-20 rounded-xl bg-white px-3 py-1.5 text-center tabular-nums outline-none"
          />
        </label>
      </Card>

      <Card>
        <Title aside={`الإجمالي ${arNum(total)} صفحة`}>آخر ٧ أيام</Title>
        <div className="flex h-24 items-end gap-2">
          {week.map((d) => {
            const n = q.log[d] ?? 0
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] tabular-nums text-ink2">{n || ''}</span>
                <span
                  className={`w-full rounded-lg ${d === today ? 'bg-sage-d' : 'bg-sage'}`}
                  style={{ height: `${Math.max(4, (n / maxWeek) * 64)}px` }}
                />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
