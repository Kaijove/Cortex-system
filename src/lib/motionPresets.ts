import type { Transition, Variants } from 'framer-motion'

export const springSmooth: Transition = { type: 'spring', stiffness: 380, damping: 32, mass: 0.9 }
export const springSnappy: Transition = { type: 'spring', stiffness: 500, damping: 26, mass: 0.7 }
export const springGentle: Transition = { type: 'spring', stiffness: 260, damping: 30, mass: 1 }

export const hoverLift = { whileHover: { y: -2, scale: 1.01 }, whileTap: { scale: 0.98 }, transition: springSnappy }
export const pressScale = { whileTap: { scale: 0.95 }, transition: springSnappy }

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: springGentle },
  exit: { opacity: 0, scale: 0.97, y: 6, transition: { duration: 0.15 } },
}

export const notificationVariants: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: springSmooth },
  exit: { opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.2 } },
}

export const expandCollapse: Variants = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: springGentle },
}

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.12 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.08 } },
}
