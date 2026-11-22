import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export default function Splash() {
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 2300)
    return () => clearTimeout(t)
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          role="presentation"
          onClick={() => setShow(false)}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-mist"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45 }}
        >
          <motion.div
            className="absolute size-72 rounded-full bg-sage"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
          />
          <motion.svg
            width="132"
            height="132"
            viewBox="0 0 512 512"
            aria-hidden
            initial={{ scale: 0.4, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
          >
            <rect x="60" y="60" width="392" height="392" rx="112" className="fill-ink" />
            <motion.path
              d="M165 280 L228 338 L350 192"
              fill="none"
              strokeWidth="44"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="stroke-mist"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.55, ease: 'easeOut' }}
            />
          </motion.svg>
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <h1 className="text-2xl font-semibold tracking-wide" dir="ltr">
              Daily Planner
            </h1>
            <p className="mt-1 text-sm text-ink2">رتّب يومك، واصنع عاداتك</p>
          </motion.div>
          <motion.p
            className="absolute bottom-10 text-xs text-ink2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
          >
            تطوير <span className="font-semibold text-ink">محمد الصافي</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
