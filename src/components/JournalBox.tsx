import { useEffect, useState } from 'react'
import { useStore } from '../store'

/** Free-text notes for one day, saved as you type. */
export default function JournalBox({ date, rows = 4 }: { date: string; rows?: number }) {
  const saved = useStore((s) => s.journal[date]?.t ?? '')
  const set = useStore((s) => s.setJournal)
  const [v, setV] = useState(saved)
  // switch day -> load that day's note
  useEffect(() => setV(saved), [date]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (v === saved) return
    const t = setTimeout(() => set(date, v), 500)
    return () => clearTimeout(t)
  }, [v, date]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <textarea
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== saved && set(date, v)}
      rows={rows}
      aria-label="مذكرات اليوم"
      placeholder="اكتب أهم نقاط يومك: ما أنجزته، ما تعلّمته، ما تشكر الله عليه…"
      className="w-full resize-none rounded-2xl bg-mist p-3.5 text-sm leading-relaxed outline-none placeholder:text-ink2/60"
    />
  )
}
