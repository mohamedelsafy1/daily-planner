import { useState } from 'react'
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
    <div className="mx-auto min-h-screen max-w-[480px] px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
      <main>
        {tab === 'today' && <Today date={date} setDate={setDate} go={setTab} />}
        {tab === 'week' && <Week setDate={setDate} go={setTab} />}
        {tab === 'habits' && <Habits />}
        {tab === 'stats' && <Stats setDate={setDate} go={setTab} />}
        {tab === 'more' && <More />}
      </main>

      <nav
        aria-label="التنقل الرئيسي"
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex gap-1 rounded-[28px] border border-line bg-white p-1.5">
          {NAV.map(({ id, label, Icon }) => {
            const on = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                aria-current={on ? 'page' : undefined}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-[22px] py-2 transition-colors ${
                  on ? 'bg-ink text-white' : 'text-ink2'
                }`}
              >
                <Icon size={20} />
                <span className="text-[11px]">{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
