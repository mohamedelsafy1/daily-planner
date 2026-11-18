import { ChevronRight, LogOut, RefreshCw } from 'lucide-react'
import { pullAndMerge, signInGoogle, signOutAll, useAuth } from '../lib/sync'

const ago = (t: number) => (t ? new Date(t).toLocaleTimeString('ar-EG-u-nu-latn', { hour: '2-digit', minute: '2-digit' }) : '—')

export default function Account({ onBack }: { onBack: () => void }) {
  const { user, busy, error, lastSync, ready } = useAuth()
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <button aria-label="رجوع" onClick={onBack} className="grid size-9 place-items-center rounded-full bg-white">
          <ChevronRight size={18} />
        </button>
        <h1 className="text-xl font-semibold">الحساب والمزامنة</h1>
      </div>

      {!user ? (
        <section className="rounded-[28px] bg-sand p-5">
          <h2 className="text-[15px] font-semibold">سجّل دخولك بجيميل</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink2">
            تُحفظ بياناتك على حسابك فقط، وتفتحها من أي جهاز. ما تسجّله الآن على هذا الجهاز لن يضيع، بل يُدمج مع حسابك.
          </p>
          <button
            onClick={signInGoogle}
            disabled={busy || !ready}
            className="mt-4 w-full rounded-2xl bg-ink py-3 text-white disabled:opacity-50"
          >
            {busy ? 'جارٍ الدخول…' : 'الدخول بحساب جوجل'}
          </button>
        </section>
      ) : (
        <section className="rounded-[28px] bg-sage p-5">
          <p className="text-xs text-ink2">أنت داخل بحساب</p>
          <p className="mt-1 break-all text-[15px] font-semibold" dir="ltr">
            {user.email}
          </p>
          <p className="mt-3 text-sm text-ink2">آخر مزامنة: {ago(lastSync)}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={pullAndMerge}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink py-3 text-white disabled:opacity-50"
            >
              <RefreshCw size={16} className={busy ? 'animate-spin' : ''} /> مزامنة الآن
            </button>
            <button onClick={signOutAll} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </section>
      )}

      {error && (
        <p role="alert" className="whitespace-pre-line break-words rounded-2xl bg-rose p-3 text-sm" dir="auto">
          {error}
        </p>
      )}

      <p className="px-2 text-xs leading-relaxed text-ink2">
        الحفظ تلقائي بعد كل تغيير. إن حذفت عنصرًا على جهاز وفيه نسخة قديمة على جهاز آخر، قد يعود العنصر بعد المزامنة.
      </p>
    </div>
  )
}
