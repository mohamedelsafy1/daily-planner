import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStore, type Group } from '../store'
import { arNum, dkey } from '../lib/date'
import { doneSet, habitStreak } from '../lib/stats'
import { PICKABLE, getIcon } from '../icons'
import { Card, Check, Sheet, Title, type Tone } from '../ui'

const GROUPS: { id: Group; label: string; tone: Tone }[] = [
  { id: 'prayer', label: 'الصلوات', tone: 'sage' },
  { id: 'religion', label: 'أذكار وعبادات', tone: 'sand' },
  { id: 'life', label: 'عادات يومية', tone: 'lilac' },
]

export default function Habits() {
  const s = useStore()
  const today = dkey()
  const done = doneSet(s.logs, today)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [group, setGroup] = useState<Group>('life')
  const [icon, setIcon] = useState('sparkles')

  const save = () => {
    const n = name.trim()
    if (!n) return
    s.addHabit(n, group, icon)
    setName('')
    setOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-semibold">العادات</h1>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm text-white"
        >
          <Plus size={16} /> عادة جديدة
        </button>
      </div>

      {GROUPS.map((g) => {
        const list = s.habits.filter((h) => h.group === g.id)
        if (!list.length) return null
        return (
          <Card key={g.id} tone={g.tone}>
            <Title>{g.label}</Title>
            <ul className="space-y-2">
              {list.map((h) => {
                const Icon = getIcon(h.icon)
                const st = habitStreak(s.logs, h.id, today)
                return (
                  <li key={h.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                    <Icon size={18} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{h.name}</p>
                      {st > 0 && <p className="text-[11px] text-ink2">{arNum(st)} يوم متتالي</p>}
                    </div>
                    <Check done={done.has(h.id)} label={`${h.name} اليوم`} onClick={() => s.toggleHabit(today, h.id)} />
                    {g.id !== 'prayer' && (
                      <button
                        aria-label={`حذف ${h.name}`}
                        onClick={() => {
                          if (confirm(`حذف عادة "${h.name}"؟ سيختفي تتبعها من التطبيق.`)) s.removeHabit(h.id)
                        }}
                      >
                        <Trash2 size={16} className="text-ink2/60" />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        )
      })}

      <Sheet open={open} onClose={() => setOpen(false)} title="عادة جديدة">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم العادة، مثل: المشي"
          aria-label="اسم العادة"
          className="w-full rounded-2xl bg-mist px-4 py-3 text-sm outline-none"
        />
        <div className="mt-3 flex gap-2" role="group" aria-label="نوع العادة">
          {GROUPS.filter((g) => g.id !== 'prayer').map((g) => (
            <button
              key={g.id}
              aria-pressed={group === g.id}
              onClick={() => setGroup(g.id)}
              className={`rounded-full px-4 py-1.5 text-sm ${group === g.id ? 'bg-ink text-white' : 'bg-mist'}`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2" role="group" aria-label="الأيقونة">
          {PICKABLE.map((k) => {
            const Icon = getIcon(k)
            return (
              <button
                key={k}
                aria-label={k}
                aria-pressed={icon === k}
                onClick={() => setIcon(k)}
                className={`grid aspect-square place-items-center rounded-xl ${icon === k ? 'bg-ink text-white' : 'bg-mist'}`}
              >
                <Icon size={18} />
              </button>
            )
          })}
        </div>
        <button onClick={save} className="mt-5 w-full rounded-2xl bg-ink py-3 text-sm text-white">
          حفظ العادة
        </button>
      </Sheet>
    </div>
  )
}
