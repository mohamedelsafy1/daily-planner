import { Repeat } from 'lucide-react'

export type Repeat = { mode: 'none' | 'daily' | 'work' | 'custom'; days: number[] }
export const NO_REPEAT: Repeat = { mode: 'none', days: [] }

// JS getDay(): 0 = Sunday … 6 = Saturday. The week is shown starting Saturday.
const ORDER = [6, 0, 1, 2, 3, 4, 5]
const NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const SHORT = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

export const daysOf = (r: Repeat): number[] =>
  r.mode === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : r.mode === 'work' ? [0, 1, 2, 3, 4] : r.mode === 'custom' ? r.days : []

export const describeDays = (days: number[]) => {
  const k = [...days].sort().join()
  if (days.length === 7) return 'كل يوم'
  if (k === '0,1,2,3,4') return 'أيام العمل (الأحد إلى الخميس)'
  if (days.length === 0) return 'لا يوم'
  return ORDER.filter((d) => days.includes(d)).map((d) => NAMES[d]).join('، ')
}

const PRESETS: { mode: Repeat['mode']; label: string }[] = [
  { mode: 'none', label: 'مرة واحدة' },
  { mode: 'daily', label: 'كل يوم' },
  { mode: 'work', label: 'أيام العمل' },
  { mode: 'custom', label: 'أيام محددة' },
]

export default function RepeatPicker({ value, onChange }: { value: Repeat; onChange: (r: Repeat) => void }) {
  return (
    <div className="mt-2">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs text-ink2">
        <Repeat size={13} /> التكرار
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="التكرار">
        {PRESETS.map((p) => (
          <button
            type="button"
            key={p.mode}
            aria-pressed={value.mode === p.mode}
            onClick={() => onChange({ mode: p.mode, days: p.mode === 'custom' && !value.days.length ? [6] : value.days })}
            className={`rounded-full px-3 py-1.5 text-xs ${value.mode === p.mode ? 'bg-sage ring-2 ring-sage-d/50' : 'bg-mist text-ink2'}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value.mode === 'custom' && (
        <div className="mt-2 grid grid-cols-7 gap-1" role="group" aria-label="أيام الأسبوع">
          {ORDER.map((d) => {
            const on = value.days.includes(d)
            return (
              <button
                type="button"
                key={d}
                aria-pressed={on}
                onClick={() => onChange({ mode: 'custom', days: on ? value.days.filter((x) => x !== d) : [...value.days, d] })}
                className={`rounded-xl py-2 text-[11px] ${on ? 'bg-ink text-white' : 'bg-mist text-ink2'}`}
              >
                {SHORT[d]}
              </button>
            )
          })}
        </div>
      )}
      {value.mode !== 'none' && daysOf(value).length > 0 && (
        <p className="mt-1.5 text-[11px] text-ink2">ستظهر تلقائيًا: {describeDays(daysOf(value))}</p>
      )}
    </div>
  )
}
