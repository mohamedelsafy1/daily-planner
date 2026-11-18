const pad = (n: number) => String(n).padStart(2, '0')

/** Local-date key: yyyy-mm-dd */
export const dkey = (d: Date = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const parseKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (k: string, n: number) => {
  const d = parseKey(k)
  d.setDate(d.getDate() + n)
  return dkey(d)
}

/** The week starts on Saturday. */
export const weekStart = (k: string) => {
  const d = parseKey(k)
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7))
  return dkey(d)
}

export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()

const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('ar-EG-u-nu-latn', o)
export const fmtLong = (k: string) =>
  f({ weekday: 'long', day: 'numeric', month: 'long' }).format(parseKey(k))
export const fmtNarrow = (k: string) => f({ weekday: 'narrow' }).format(parseKey(k))
export const fmtShort = (k: string) => f({ day: 'numeric', month: 'short' }).format(parseKey(k))
export const fmtMonth = (y: number, m: number) =>
  f({ month: 'long', year: 'numeric' }).format(new Date(y, m, 1))
export const arNum = (n: number) => new Intl.NumberFormat('en').format(n)
export const arPct = (v: number) => `${Math.round(v * 100)}%`
