import { useState } from 'react'
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'motion/react'
import Splash from './components/Splash'
import { CalendarRange, ChartColumn, Grid2x2, House, Repeat } from 'lucide-react'
import { dkey } from './lib/date'
import type { Tab } from './nav'
import Today from './pages/Today'
import Week from './pages/Week'
import Habits from './pages/Habits'
import Stats from './pages/Stats'
import More from './pages/More'

const NAV = [
  { id: 'today', label: 'اليوم', Icon: House },
  { id: 'week', label: 'الأسبوع', Icon: CalendarRange },
  { id: 'habits', label: 'العادات', Icon: Repeat },
  { id: 'stats', label: 'الإحصاء', Icon: ChartColumn },
  { id: 'more', label: 'المزيد', Icon: Grid2x2 },
] as const

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [date, setDate] = useState(dkey())

  return (
    <MotionConfig reducedMotion="user">
    <div className="mx-auto min-h-screen max-w-[480px] px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={tab}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {tab === 'today' && <Today date={date} setDate={setDate} go={setTab} />}
          {tab === 'week' && <Week setDate={setDate} go={setTab} />}
          {tab === 'habits' && <Habits />}
          {tab === 'stats' && <Stats setDate={setDate} go={setTab} />}
          {tab === 'more' && <More />}
        </motion.main>
      </AnimatePresence>

      <nav
        aria-label="التنقل الرئيسي"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <LayoutGroup>
        <div className="flex gap-1 rounded-[28px] border border-line bg-white/90 p-1.5 shadow-lg shadow-black/5 backdrop-blur">
          {NAV.map(({ id, label, Icon }) => {
            const on = tab === id
            return (
              <button
                key={id}
                data-nav
                onClick={() => setTab(id)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-[22px] py-2 ${
                  on ? 'text-white' : 'text-ink2'
                }`}
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
