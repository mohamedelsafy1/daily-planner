import { useState } from 'react'
import { Settings as SettingsIcon, BookOpen, ChevronDown, Cloud, Gamepad2, Puzzle, ChevronRight, Timer as TimerIcon, CircleDot } from 'lucide-react'
import { Card, type Tone } from '../ui'
import { METHODS, type Method } from './methods'
import Timer from './Timer'
import Tasbeeh from './Tasbeeh'
import Games from './Games'
import Account from './Account'
import Settings from './Settings'
import { useAuth } from '../lib/sync'
import { back, go, useNav } from '../lib/router'

function Soon({ icon, title, note, tone }: { icon: React.ReactNode; title: string; note: string; tone: Tone }) {
  return (
    <Card tone={tone} className="opacity-90">
      <div aria-disabled="true">
        <div className="flex items-start justify-between">
          {icon}
          <span className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px]">قريبًا</span>
        </div>
        <h3 className="mt-3 text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">{note}</p>
      </div>
    </Card>
  )
}

function TimeSystems({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<string | null>(null)
  const [timer, setTimer] = useState<Method | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">أنظمة تنظيم الوقت</h1>
      </div>
      <p className="px-1 text-sm leading-relaxed text-ink2">
        اختر ما يناسب طاقتك، وجرّبه أسبوعًا قبل أن تحكم عليه. الأرقام نقطة بداية وليست قوانين.
      </p>

      {timer && <Timer key={timer.id} m={timer} onClose={() => setTimer(null)} />}

      {METHODS.map((m) => {
        const on = open === m.id
        return (
          <Card key={m.id} tone={m.tone}>
            <button
              onClick={() => setOpen(on ? null : m.id)}
              aria-expanded={on}
              className="flex w-full items-center justify-between gap-3 text-start"
            >
              <span>
                <span className="block text-[15px] font-semibold">{m.name}</span>
                <span className="mt-0.5 block text-xs text-ink2">{m.tag}</span>
              </span>
              <ChevronDown size={18} className={`shrink-0 transition-transform ${on ? 'rotate-180' : ''}`} />
            </button>
            {on && (
              <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                {(
                  [
                    ['الفكرة', m.how],
                    ['تناسب مَن', m.who],
                    ['كيف تحافظ على طاقتك', m.energy],
                    ['قوة الدليل العلمي', m.evidence],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-white/70 p-3">
                    <dt className="text-xs font-semibold text-ink2">{k}</dt>
                    <dd className="mt-1">{v}</dd>
                  </div>
                ))}
                {m.timer && (
                  <button
                    onClick={() => {
                      setTimer(m)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="w-full rounded-2xl bg-ink py-2.5 text-white"
                  >
                    ابدأ مؤقت {m.name}
                  </button>
                )}
              </dl>
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default function More() {
  const sub = useNav((s) => s.sub)
  const setSub = (x: string) => go('more', x)
  const user = useAuth((s) => s.user)
  if (sub === 'time') return <TimeSystems onBack={back} />
  if (sub === 'account') return <Account onBack={back} />
  if (sub === 'settings') return <Settings onBack={back} />
  if (sub === 'tasbeeh') return <Tasbeeh onBack={back} />
  if (sub === 'calm' || sub === 'brain') return <Games kind={sub} onBack={back} />

  return (
    <div className="stagger grid grid-cols-2 gap-3">
      <h1 className="col-span-2 px-1 text-xl font-semibold">المزيد</h1>

      <Card tone="sky" className="col-span-2" onClick={() => setSub('time')}>
        <TimerIcon size={22} />
        <h3 className="mt-3 text-sm font-semibold">أنظمة تنظيم الوقت</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">
          تسع طرق معروفة، كل واحدة بشرح لمن تناسب وكيف تحافظ على طاقتك، ومؤقت تركيز.
        </p>
      </Card>

      <Card tone="lilac" className="col-span-2" onClick={() => setSub('tasbeeh')}>
        <CircleDot size={22} />
        <h3 className="mt-3 text-sm font-semibold">السبحة</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">عدّاد باللمس مع اهتزاز عند إتمام كل دورة.</p>
      </Card>
      <Card tone="rose" onClick={() => setSub('calm')}>
        <Gamepad2 size={22} />
        <h3 className="mt-3 text-sm font-semibold">تفريغ التوتر</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">فقاعات وتنفّس وتموّجات.</p>
      </Card>
      <Card tone="sky" onClick={() => setSub('brain')}>
        <Puzzle size={22} />
        <h3 className="mt-3 text-sm font-semibold">ألعاب الذكاء</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">ذاكرة وانتباه وحساب، بأرقام قياسية.</p>
      </Card>
      <div className="col-span-2">
        <Soon
          tone="sage"
          icon={<BookOpen size={22} />}
          title="القرآن الكريم"
          note="نص المصحف من مصدر رسمي، مع التفسير والاستماع. سيُضاف بعد التأكد من المصدر."
        />
      </div>
      <Card tone="lilac" className="col-span-2" onClick={() => setSub('settings')}>
        <SettingsIcon size={22} />
        <h3 className="mt-3 text-sm font-semibold">الإعدادات</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">الوضع الداكن والأصوات والاهتزاز.</p>
      </Card>
      <Card tone="sand" className="col-span-2" onClick={() => setSub('account')}>
        <Cloud size={22} />
        <h3 className="mt-3 text-sm font-semibold">الحساب والمزامنة</h3>
        <p className="mt-1 text-xs leading-relaxed text-ink2">
          {user ? `مسجّل بحساب ${user.email}، وبياناتك تُحفظ على الإنترنت.` : 'سجّل بجيميل لحفظ بياناتك واستخدامها على أكثر من جهاز.'}
        </p>
      </Card>

      <Card className="col-span-2">
        <p className="text-xs leading-relaxed text-ink2">
          بياناتك محفوظة على هذا الجهاز دائمًا، وتُنسخ إلى حسابك عند تسجيل الدخول.
        </p>
      </Card>
    </div>
  )
}
