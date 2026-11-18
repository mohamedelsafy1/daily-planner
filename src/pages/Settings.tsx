import { ChevronRight, Moon, Sun, SunMoon, Vibrate, Volume2, VolumeX } from 'lucide-react'
import { usePrefs, type Theme } from '../lib/prefs'
import { play } from '../lib/sound'

const THEMES: { id: Theme; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'تلقائي', Icon: SunMoon },
  { id: 'light', label: 'فاتح', Icon: Sun },
  { id: 'dark', label: 'داكن', Icon: Moon },
]

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
    </div>
  )
}
