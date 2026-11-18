import { useMemo, useState } from 'react'
import { ChevronRight, Check, ChevronDown, RotateCcw, Undo2 } from 'lucide-react'
import { useStore, type AdhkarKind } from '../store'
import { ADHKAR } from '../data/adhkar'
import { dkey } from '../lib/date'
import { buzz } from '../lib/haptic'

export default function Adhkar({ onBack }: { onBack: () => void }) {
  const [kind, setKind] = useState<AdhkarKind>(new Date().getHours() < 15 ? 'am' : 'pm')
  const [fadl, setFadl] = useState<string | null>(null)
  const date = dkey()
  const items = ADHKAR[kind]
  const prog = useStore((s) => s.adhkar[`${date}:${kind}`]) ?? {}
  const tap = useStore((s) => s.tapAdhkar)
  const reset = useStore((s) => s.resetAdhkar)
  const needs = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i.count])), [items])
  const total = items.reduce((a, i) => a + i.count, 0)
  const done = items.reduce((a, i) => a + Math.min(prog[i.id] ?? 0, i.count), 0)
  const all = done >= total

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">الأذكار</h1>
      </div>

      <div role="tablist" className="flex gap-1 rounded-[22px] bg-white p-1 border border-line">
        {(['am', 'pm'] as const).map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
            className={`flex-1 rounded-[18px] py-2 text-sm ${kind === k ? 'bg-ink text-white' : 'text-ink2'}`}
          >
            {k === 'am' ? 'أذكار الصباح' : 'أذكار المساء'}
          </button>
        ))}
      </div>

      <section className={`rounded-[28px] p-4 ${all ? 'bg-sage' : 'bg-sand'}`} aria-live="polite">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{all ? 'أتممت الأذكار، تقبّل الله منك' : 'المسّ البطاقة لتعدّ'}</span>
          <span className="text-ink2">
            {done} / {total}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
          <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${(done / total) * 100}%` }} />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink2">
          وقت أذكار الصباح من الفجر إلى الضحى، والمساء من العصر إلى ما بعد المغرب. وإن فاتك الوقت فاذكر متى تذكّرت.
        </p>
      </section>

      {items.map((it) => {
        const n = Math.min(prog[it.id] ?? 0, it.count)
        const ok = n >= it.count
        const open = fadl === it.id
        return (
          <article key={it.id} className={`rounded-[28px] border p-4 ${ok ? 'border-transparent bg-sage' : 'border-line bg-white'}`}>
            <button
              onClick={() => {
                if (ok) return
                tap(date, kind, it.id, needs)
                buzz(n + 1 >= it.count ? [18, 40, 18] : 10)
              }}
              aria-label={`${it.title}، تم ${n} من ${it.count}. المس للعدّ`}
              className="block w-full text-start"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-ink2">{it.title}</h3>
                <span
                  className={`grid h-9 min-w-9 shrink-0 place-items-center rounded-full px-2 text-sm font-semibold ${
                    ok ? 'bg-ink text-white' : 'bg-mist'
                  }`}
                >
                  {ok ? <Check size={18} strokeWidth={3} /> : `${n}/${it.count}`}
                </span>
              </div>
              {it.quran ? (
                <p className="mt-3 rounded-2xl bg-mist p-3 text-[15px] leading-loose">
                  من القرآن الكريم، اقرأها من مصحفك. سيظهر نصها هنا من مصحف مجمع الملك فهد عند إضافته.
                </p>
              ) : (
                <p className="mt-3 text-[19px] leading-[2.1]" lang="ar">
                  {it.text}
                </p>
              )}
            </button>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs text-ink2">
              <span>المصدر: {it.source}</span>
              <span className="flex gap-1">
                {n > 0 && (
                  <button
                    aria-label="تراجع عن آخر عدّة"
                    onClick={() => tap(date, kind, it.id, needs, -1)}
                    className="grid size-8 place-items-center rounded-full bg-mist"
                  >
                    <Undo2 size={15} />
                  </button>
                )}
              </span>
            </div>
            {it.fadl && (
              <div className="mt-2">
                <button
                  onClick={() => setFadl(open ? null : it.id)}
                  aria-expanded={open}
                  className="flex items-center gap-1 text-xs font-semibold"
                >
                  الفضل <ChevronDown size={14} className={open ? 'rotate-180' : ''} />
                </button>
                {open && <p className="mt-2 rounded-2xl bg-mist p-3 text-sm leading-loose">{it.fadl}</p>}
              </div>
            )}
          </article>
        )
      })}

      <button
        onClick={() => reset(date, kind)}
        className="mx-auto flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs text-ink2 border border-line"
      >
        <RotateCcw size={14} /> ابدأ من جديد
      </button>

      <p className="px-2 pb-2 text-center text-xs leading-relaxed text-ink2">
        الأذكار مأخوذة من «حصن المسلم» وكتب السنة، وكل ذكر بمصدره. عند الحاجة إلى حكم حديث بعينه فاسأل أهل العلم.
      </p>
    </div>
  )
}
