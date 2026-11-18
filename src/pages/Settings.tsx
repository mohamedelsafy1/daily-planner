import { Copy, Download, ChevronRight, Upload, Moon, Sun, SunMoon, Vibrate, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import { usePrefs, type Theme } from '../lib/prefs'
import { useStore } from '../store'
import { merge } from '../lib/sync'
import { play } from '../lib/sound'

const THEMES: { id: Theme; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'تلقائي', Icon: SunMoon },
  { id: 'light', label: 'فاتح', Icon: Sun },
  { id: 'dark', label: 'داكن', Icon: Moon },
]

const KEYS = ['tasks', 'wtasks', 'habits', 'logs', 'adhkar', 'tasbeeh', 'scores', 'quran', 'journal', 'routines'] as const
const snapshot = () => {
  const s = useStore.getState()
  return Object.fromEntries(KEYS.map((k) => [k, s[k]]))
}

function Backup() {
  const [msg, setMsg] = useState('')
  const json = () => JSON.stringify({ app: 'daily-planner', v: 1, at: new Date().toISOString(), data: snapshot() })
  const save = async () => {
    const name = `daily-planner-${new Date().toISOString().slice(0, 10)}.json`
    try {
      const file = new File([json()], name, { type: 'application/json' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: name })
        return setMsg('تمت المشاركة')
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([json()], { type: 'application/json' }))
    a.download = name
    a.click()
    setMsg('تم تنزيل الملف')
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json())
      setMsg('نُسخت النسخة الاحتياطية، الصقها في ملاحظة أو رسالة لنفسك')
    } catch {
      setMsg('تعذّر النسخ')
    }
  }
  const load = (text: string) => {
    try {
      const d = JSON.parse(text)?.data
      if (!d || typeof d !== 'object') throw new Error('bad')
      const cur = useStore.getState()
      const local = Object.fromEntries(KEYS.map((k) => [k, cur[k]])) as unknown as Parameters<typeof merge>[0]
      cur.restore(merge(local, d))
      setMsg('تمت الاستعادة ودمجها مع بياناتك الحالية')
    } catch {
      setMsg('الملف غير صالح')
    }
  }
  return (
    <section className="rounded-[28px] border border-line bg-white p-4">
      <h2 className="text-[15px] font-semibold">نسخة احتياطية</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink2">احفظ نسخة من كل بياناتك، أو انقلها إلى هاتف آخر. الاستعادة تدمج ولا تمسح.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button onClick={save} className="flex items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-sm text-white">
          <Download size={16} /> حفظ نسخة
        </button>
        <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl bg-mist py-3 text-sm">
          <Copy size={16} /> نسخ كنص
        </button>
        <label className="col-span-2 flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-mist py-3 text-sm">
          <Upload size={16} /> استعادة من ملف
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) load(await f.text())
              e.target.value = ''
            }}
          />
        </label>
      </div>
      {msg && <p role="status" className="mt-2 text-xs text-ink2">{msg}</p>}
    </section>
  )
}

export default function Settings({ onBack }: { onBack: () => void }) {
  const p = usePrefs()
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">الإعدادات</h1>
      </div>

      <section className="rounded-[28px] border border-line bg-white p-4">
        <h2 className="text-[15px] font-semibold">المظهر</h2>
        <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="المظهر">
          {THEMES.map(({ id, label, Icon }) => (
            <button
              key={id}
              aria-pressed={p.theme === id}
              data-silent
              onClick={() => {
                p.set({ theme: id })
                play('tap')
              }}
              className={`flex flex-col items-center gap-1.5 rounded-2xl py-3 text-sm ${
                p.theme === id ? 'bg-ink text-white' : 'bg-mist'
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">الأصوات</h2>
          <button
            role="switch"
            aria-checked={p.sound}
            aria-label="تشغيل الأصوات"
            data-silent
            onClick={() => {
              const on = !p.sound
              p.set({ sound: on })
              if (on) setTimeout(() => play('check'), 30)
            }}
            className={`flex h-8 w-14 items-center rounded-full p-1 transition-colors ${p.sound ? 'bg-sage-d' : 'bg-mist'}`}
          >
            <span
              className={`grid size-6 place-items-center rounded-full bg-white text-ink transition-transform ${
                p.sound ? '-translate-x-6' : ''
              }`}
            >
              {p.sound ? <Volume2 size={13} /> : <VolumeX size={13} />}
            </span>
          </button>
        </div>
        <label className={`mt-4 block text-sm text-ink2 ${p.sound ? '' : 'opacity-40'}`}>
          مستوى الصوت
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={p.volume}
            disabled={!p.sound}
            onChange={(e) => p.set({ volume: Number(e.target.value) })}
            onPointerUp={() => play('check')}
            className="mt-2 w-full accent-[rgb(var(--sage-d))]"
          />
        </label>
      </section>

      <section className="flex items-center justify-between rounded-[28px] border border-line bg-white p-4">
        <div className="flex items-center gap-2">
          <Vibrate size={18} />
          <h2 className="text-[15px] font-semibold">الاهتزاز عند الضغط</h2>
        </div>
        <button
          role="switch"
          aria-checked={p.haptics}
          aria-label="تشغيل الاهتزاز"
          onClick={() => p.set({ haptics: !p.haptics })}
          className={`flex h-8 w-14 items-center rounded-full p-1 ${p.haptics ? 'bg-sage-d' : 'bg-mist'}`}
        >
          <span className={`size-6 rounded-full bg-white transition-transform ${p.haptics ? '-translate-x-6' : ''}`} />
        </button>
      </section>

      <Backup />
    </div>
  )
}
