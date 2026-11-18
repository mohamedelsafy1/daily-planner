import { useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import { BookOpen, Grid2x2, House, Plus, Repeat, Sparkles } from 'lucide-react'
import { dkey, weekStart } from './lib/date'
import { back, go, useNav } from './lib/router'
import { useStore, type Energy } from './store'
import Splash from './components/Splash'
import Today from './pages/Today'
import Week from './pages/Week'
import Month from './pages/Month'
import Habits from './pages/Habits'
import Stats from './pages/Stats'
import More from './pages/More'
import Adhkar from './pages/Adhkar'
import Quran from './pages/Quran'
import Tasbeeh from './pages/Tasbeeh'
import { Sheet } from './ui'
import type { Tab } from './nav'

const NAV = [
  { id: 'today', label: 'اليوم', Icon: House, group: ['today', 'week', 'month'] },
  { id: 'adhkar', label: 'الأذكار', Icon: Sparkles, group: ['adhkar'] },
  { id: 'quran', label: 'القرآن', Icon: BookOpen, group: ['quran'] },
  { id: 'habits', label: 'العادات', Icon: Repeat, group: ['habits', 'stats'] },
  { id: 'more', label: 'المزيد', Icon: Grid2x2, group: ['more'] },
] as const

const DAY_SEG: { id: Tab; label: string }[] = [
  { id: 'today', label: 'اليوم' },
  { id: 'week', label: 'الأسبوع' },
  { id: 'month', label: 'الشهر' },
]

const SEGMENTS: Partial<Record<Tab, { id: Tab; label: string }[]>> = {
  today: DAY_SEG,
  week: DAY_SEG,
  month: DAY_SEG,
  habits: [
    { id: 'habits', label: 'العادات' },
    { id: 'stats', label: 'الإحصاء' },
  ],
  stats: [
    { id: 'habits', label: 'العادات' },
    { id: 'stats', label: 'الإحصاء' },
  ],
}

function QuickAdd({ open, onClose, date }: { open: boolean; onClose: () => void; date: string }) {
  const addTask = useStore((s) => s.addTask)
  const addWTask = useStore((s) => s.addWTask)
  const [title, setTitle] = useState('')
  const [scope, setScope] = useState<'day' | 'week'>('day')
  const [energy, setEnergy] = useState<Energy | undefined>()
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    if (scope === 'day') addTask(t, date, energy)
    else addWTask(t, weekStart(date))
    setTitle('')
    setEnergy(undefined)
    onClose()
  }
  return (
    <Sheet open={open} onClose={onClose} title="مهمة جديدة">
      <form onSubmit={submit}>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ماذا تريد أن تنجز؟"
          aria-label="عنوان المهمة"
          className="w-full rounded-2xl bg-mist px-4 py-3.5 text-[15px] outline-none"
        />
        <div className="mt-3 flex gap-2" role="group" aria-label="النطاق">
          {([['day', 'لهذا اليوم'], ['week', 'لهذا الأسبوع']] as const).map(([k, l]) => (
            <button
              type="button"
              key={k}
              aria-pressed={scope === k}
              onClick={() => setScope(k)}
              className={`flex-1 rounded-2xl py-2.5 text-sm ${scope === k ? 'bg-ink text-white' : 'bg-mist'}`}
            >
              {l}
            </button>
          ))}
        </div>
        {scope === 'day' && (
          <div className="mt-2 flex gap-2" role="group" aria-label="مستوى الطاقة">
            {([['deep', 'تركيز عميق'], ['light', 'مهمة خفيفة']] as const).map(([k, l]) => (
              <button
                type="button"
                key={k}
                aria-pressed={energy === k}
                onClick={() => setEnergy(energy === k ? undefined : k)}
                className={`rounded-full px-3.5 py-1.5 text-xs ${energy === k ? 'bg-sky ring-2 ring-ink/30' : 'bg-mist text-ink2'}`}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        <button type="submit" className="mt-4 w-full rounded-2xl bg-ink py-3.5 text-[15px] font-semibold text-white">
          إضافة المهمة
        </button>
      </form>
    </Sheet>
  )
}

export default function App() {
  const { tab, sub } = useNav()
  const [date, setDate] = useState(dkey())
  const [adding, setAdding] = useState(false)
  const seg = SEGMENTS[tab]
  const showFab = tab === 'today' || tab === 'week'

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto min-h-screen max-w-[480px] px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))]">
        {seg && (
          <div role="tablist" className="mb-3 flex gap-1 rounded-[20px] border border-line bg-white p-1">
            {seg.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => go(x.id)}
                className={`flex-1 rounded-2xl py-2 text-sm ${tab === x.id ? 'bg-mist font-semibold' : 'text-ink2'}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={tab + sub}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {tab === 'today' && <Today date={date} setDate={setDate} go={go} />}
            {tab === 'week' && <Week setDate={setDate} go={go} />}
            {tab === 'month' && <Month />}
            {tab === 'habits' && <Habits />}
            {tab === 'stats' && <Stats setDate={setDate} go={go} />}
            {tab === 'adhkar' && (sub === 'tasbeeh' ? <Tasbeeh onBack={back} /> : <Adhkar />)}
            {tab === 'quran' && <Quran />}
            {tab === 'more' && <More />}
          </motion.main>
        </AnimatePresence>

        {showFab && (
          <button
            aria-label="مهمة جديدة"
            onClick={() => setAdding(true)}
            className="fixed bottom-[92px] z-40 grid size-14 place-items-center rounded-full bg-ink text-white shadow-xl shadow-black/20 start-5"
          >
            <Plus size={26} />
          </button>
        )}

        <QuickAdd open={adding} onClose={() => setAdding(false)} date={date} />

        <nav
          aria-label="التنقل الرئيسي"
          className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <LayoutGroup>
            <div className="flex gap-1 rounded-[28px] border border-line bg-white/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur">
              {NAV.map(({ id, label, Icon, group }) => {
                const on = (group as readonly string[]).includes(tab)
                return (
                  <button
                    key={id}
                    data-nav
                    onClick={() => go(id)}
                    aria-current={on ? 'page' : undefined}
                    className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-[22px] py-2 ${on ? 'text-white' : 'text-ink2'}`}
                  >
                    {on && (
                      <motion.span
                        layoutId="navpill"
                        className="absolute inset-0 rounded-[22px] bg-ink"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      />
                    )}
                    <Icon size={20} className="relative" />
                    <span className="relative text-[11px]">{label}</span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </nav>
        <Splash />
      </div>
    </MotionConfig>
  )
}
