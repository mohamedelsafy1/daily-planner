import { create } from 'zustand'
import { Capacitor } from '@capacitor/core'
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { useStore } from '../store'

type Snapshot = Pick<
  ReturnType<typeof useStore.getState>,
  'tasks' | 'wtasks' | 'habits' | 'logs' | 'adhkar' | 'tasbeeh' | 'scores' | 'quran' | 'journal'
>

type AuthState = {
  user: User | null
  ready: boolean
  busy: boolean
  error: string
  lastSync: number
}
export const useAuth = create<AuthState>(() => ({ user: null, ready: false, busy: false, error: '', lastSync: 0 }))
const patch = (p: Partial<AuthState>) => useAuth.setState(p)

const snap = (): Snapshot => {
  const s = useStore.getState()
  return { tasks: s.tasks, wtasks: s.wtasks, habits: s.habits, logs: s.logs, adhkar: s.adhkar, tasbeeh: s.tasbeeh, scores: s.scores, quran: s.quran, journal: s.journal }
}
const ref = (uid: string) => doc(db, 'users', uid, 'state', 'main')

const byId = <T extends { id: string }>(a: T[], b: T[]) => {
  const m = new Map<string, T>()
  for (const x of b) m.set(x.id, x)
  for (const x of a) m.set(x.id, x) // local wins on the same id
  return [...m.values()]
}

/** Union merge so nothing from either side is lost. */
export function merge(local: Snapshot, remote: Partial<Snapshot> | undefined): Snapshot {
  if (!remote) return local
  const logs: Snapshot['logs'] = { ...(remote.logs ?? {}) }
  for (const [d, ids] of Object.entries(local.logs)) logs[d] = [...new Set([...(logs[d] ?? []), ...ids])]
  const adhkar: Snapshot['adhkar'] = { ...(remote.adhkar ?? {}) }
  for (const [k, v] of Object.entries(local.adhkar)) {
    const r = { ...(adhkar[k] ?? {}) }
    for (const [id, n] of Object.entries(v)) r[id] = Math.max(r[id] ?? 0, n)
    adhkar[k] = r
  }
  const scores: Snapshot['scores'] = { ...(remote.scores ?? {}) }
  for (const [g, v] of Object.entries(local.scores)) {
    const low = g === 'memory' || g === 'schulte'
    scores[g] = g in scores ? (low ? Math.min(scores[g], v) : Math.max(scores[g], v)) : v
  }
  const rt = remote.tasbeeh
  const lt = local.tasbeeh
  const byDay = { ...(rt?.byDay ?? {}) }
  for (const [d, n] of Object.entries(lt.byDay)) byDay[d] = Math.max(byDay[d] ?? 0, n)
  const tasbeeh = { ...lt, total: Math.max(lt.total, rt?.total ?? 0), byDay }
  const rq = remote.quran
  const lq = local.quran
  const qlog = { ...(rq?.log ?? {}) }
  for (const [d, n] of Object.entries(lq.log)) qlog[d] = Math.max(qlog[d] ?? 0, n)
  const newerPos = !rq || lq.posAt >= rq.posAt ? lq : rq
  const goal = !rq?.goal ? lq.goal : !lq.goal ? rq.goal : lq.goal.start >= rq.goal.start ? lq.goal : rq.goal
  const quran = { log: qlog, goal, pos: newerPos.pos, posAt: newerPos.posAt }
  const journal = { ...(remote.journal ?? {}) }
  for (const [d, e] of Object.entries(local.journal)) if (!journal[d] || e.at >= journal[d].at) journal[d] = e
  return {
    journal,
    quran,
    tasks: byId(local.tasks, remote.tasks ?? []),
    wtasks: byId(local.wtasks, remote.wtasks ?? []),
    habits: byId(local.habits, remote.habits ?? []),
    logs,
    adhkar,
    scores,
    tasbeeh,
  }
}

let applying = false
let timer: ReturnType<typeof setTimeout> | undefined

export async function pullAndMerge() {
  const u = auth.currentUser
  if (!u) return
  patch({ busy: true, error: '' })
  try {
    const s = await getDoc(ref(u.uid))
    const merged = merge(snap(), s.exists() ? (s.data() as Partial<Snapshot>) : undefined)
    applying = true
    useStore.setState(merged)
    applying = false
    await setDoc(ref(u.uid), JSON.parse(JSON.stringify({ ...merged, updatedAt: Date.now() })))
    patch({ lastSync: Date.now() })
  } catch (e) {
    applying = false
    patch({ error: 'تعذّرت المزامنة. تأكد من الاتصال بالإنترنت وحاول مرة أخرى.' })
    console.error(e)
  } finally {
    patch({ busy: false })
  }
}

async function push() {
  const u = auth.currentUser
  if (!u) return
  try {
    await setDoc(ref(u.uid), JSON.parse(JSON.stringify({ ...snap(), updatedAt: Date.now() })))
    patch({ lastSync: Date.now(), error: '' })
  } catch (e) {
    patch({ error: 'لم تُحفظ آخر تغييراتك على الإنترنت بعد. سنعيد المحاولة.' })
    console.error(e)
  }
}

export function initSync() {
  onAuthStateChanged(auth, (user) => {
    patch({ user, ready: true })
    if (user) void pullAndMerge()
  })
  useStore.subscribe(() => {
    if (applying || !auth.currentUser) return
    clearTimeout(timer)
    timer = setTimeout(push, 1500)
  })
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && auth.currentUser) void pullAndMerge()
  })
}

export async function signInGoogle() {
  patch({ busy: true, error: '' })
  try {
    if (Capacitor.isNativePlatform()) {
      const r = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true })
      const idToken = r.credential?.idToken
      if (!idToken) throw new Error('no id token')
      await signInWithCredential(auth, GoogleAuthProvider.credential(idToken))
    } else {
      await signInWithPopup(auth, new GoogleAuthProvider())
    }
  } catch (e) {
    const msg = String((e as { code?: string; message?: string })?.code ?? (e as Error)?.message ?? e)
    if (!/cancel|closed-by-user/i.test(msg)) patch({ error: 'تعذّر تسجيل الدخول. حاول مرة أخرى.\nسبب الخطأ: ' + msg.slice(0, 200) })
    console.error(e)
  } finally {
    patch({ busy: false })
  }
}

export async function signOutAll() {
  try {
    if (Capacitor.isNativePlatform()) await FirebaseAuthentication.signOut()
  } catch {
    /* ignore */
  }
  await fbSignOut(auth)
}
