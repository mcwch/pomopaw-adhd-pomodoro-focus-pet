export type SoundId = 'none' | 'white_noise' | 'rain' | 'cafe' | 'forest'

const sounds: ReadonlyArray<{ id: SoundId; label: string; icon: string }> = [
  { id: 'none', label: 'None', icon: '🔇' },
  { id: 'rain', label: 'Rain', icon: '☔' },
  { id: 'cafe', label: 'Café', icon: '☕' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
  { id: 'white_noise', label: 'White noise', icon: '〰' },
]

export interface SoundControlsProps { readonly value: SoundId; readonly onChange: (value: SoundId) => void }

export default function SoundControls({ value, onChange }: SoundControlsProps): React.JSX.Element {
  const current = sounds.find((sound) => sound.id === value) ?? sounds[0]
  return <div className="sound-controls" aria-label="Ambient sound">
    <div className="sound-controls__main"><span aria-hidden="true">{current.icon}</span><span><small>Sound</small>{current.label}</span></div>
    <div className="sound-controls__options" role="group" aria-label="Choose ambient sound">{sounds.map((sound) => <button type="button" aria-label={sound.label} className={sound.id === value ? 'sound-controls__option sound-controls__option--active' : 'sound-controls__option'} onClick={() => onChange(sound.id)} key={sound.id}><span aria-hidden="true">{sound.icon}</span><span>{sound.label}</span></button>)}</div>
  </div>
}
