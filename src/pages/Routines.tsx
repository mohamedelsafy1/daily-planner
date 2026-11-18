import { ChevronRight, Pause, Play, Repeat as RepeatIcon, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { describeDays } from '../components/RepeatPicker'
import { Empty } from '../ui'

export default function Routines({ onBack }: { onBack: () => void }) {
  const routines = useStore((s) => s.routines)
  const remove = useStore((s) => s.removeRoutine)
  const toggle = useStore((s) => s.toggleRoutine)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">المهام المتكررة</h1>
      </div>
      <p className="px-1 text-xs leading-relaxed text-ink2">
        تُضاف هذه المهام لقائمتك تلقائيًا في أيامها. اختر التكرار من مربع «مهمة جديدة» في صفحة اليوم. حذف مهمة متكررة لا يمسح ما أُنجز منها سابقًا.
      </p>
      {routines.length === 0 ? (
        <section className="rounded-[28px] border border-line bg-white p-4">
          <Empty>لا مهام متكررة بعد.</Empty>
        </section>
      ) : (
        routines.map((r) => (
          <section key={r.id} className={`flex items-center gap-3 rounded-[28px] border border-line bg-white p-4 ${r.paused ? 'opacity-60' : ''}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sage">
              <RepeatIcon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{r.title}</p>
              <p className="text-xs text-ink2">{r.paused ? 'متوقفة مؤقتًا · ' : ''}{describeDays(r.days)}</p>
            </div>
            <button aria-label={r.paused ? 'استئناف' : 'إيقاف مؤقت'} onClick={() => toggle(r.id)} className="grid size-9 place-items-center rounded-full bg-mist">
              {r.paused ? <Play size={15} /> : <Pause size={15} />}
            </button>
            <button
              aria-label={`حذف ${r.title}`}
              onClick={() => {
                if (confirm(`حذف «${r.title}» من المتكررة؟`)) remove(r.id)
              }}
              className="grid size-9 place-items-center rounded-full bg-mist"
            >
              <Trash2 size={15} />
            </button>
          </section>
        ))
      )}
    </div>
  )
}
