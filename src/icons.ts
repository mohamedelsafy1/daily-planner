import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  MoonStar,
  Moon,
  Sparkles,
  BookOpen,
  BookMarked,
  Heart,
  Dumbbell,
  Droplets,
  Footprints,
  PenLine,
  Brain,
  BedDouble,
  Apple,
  Bike,
  Coffee,
  type LucideIcon,
} from 'lucide-react'

export const ICONS: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  sun: Sun,
  cloudsun: CloudSun,
  sunset: Sunset,
  moonstar: MoonStar,
  moon: Moon,
  sparkles: Sparkles,
  book: BookOpen,
  library: BookMarked,
  heart: Heart,
  dumbbell: Dumbbell,
  droplets: Droplets,
  footprints: Footprints,
  pen: PenLine,
  brain: Brain,
  bed: BedDouble,
  apple: Apple,
  bike: Bike,
  coffee: Coffee,
}

export const PICKABLE = [
  'sparkles', 'book', 'library', 'heart', 'dumbbell', 'droplets',
  'footprints', 'pen', 'brain', 'bed', 'apple', 'bike', 'coffee',
]

export const getIcon = (k: string): LucideIcon => ICONS[k] ?? Sparkles
