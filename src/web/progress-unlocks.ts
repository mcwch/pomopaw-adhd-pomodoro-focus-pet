import lamp from './assets/study-corner/lamp.png'
import books from './assets/study-corner/books.png'
import plant from './assets/study-corner/plant.png'
import window from './assets/study-corner/window.png'

export interface Decoration { id: 'lamp' | 'books' | 'plant' | 'window'; label: string; unlockAt: number; asset: string }

const decorations: Decoration[] = [
  { id: 'lamp', label: 'Warm desk lamp', unlockAt: 3, asset: lamp },
  { id: 'books', label: 'Study book stack', unlockAt: 5, asset: books },
  { id: 'plant', label: 'Little leafy plant', unlockAt: 6, asset: plant },
  { id: 'window', label: 'Daylight window', unlockAt: 8, asset: window },
]

export function unlockedDecorations(completedPomodoros: number): Decoration[] {
  return decorations.filter((decoration) => completedPomodoros >= decoration.unlockAt)
}

export function nextDecoration(completedPomodoros: number): Decoration | null {
  return decorations.find((decoration) => completedPomodoros < decoration.unlockAt) ?? null
}
