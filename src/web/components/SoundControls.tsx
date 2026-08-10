export type SoundId = 'white_noise' | 'rain' | 'cafe' | 'forest'

const sounds: ReadonlyArray<{ id: SoundId; label: string }> = [
  { id: 'rain', label: 'Rain' },
  { id: 'cafe', label: 'Café' },
  { id: 'forest', label: 'Forest' },
  { id: 'white_noise', label: 'White noise' },
]

export default function SoundControls({ value, onChange }: { value: SoundId; onChange: (value: SoundId) => void }): React.JSX.Element {
  const current = sounds.find((sound) => sound.id === value) ?? sounds[3]
  return <div className="sound-controls" aria-label="Ambient sound">
    <button type="button" className="sound-controls__main" aria-label={`Sound: ${current.label}`}><span aria-hidden="true">≋</span><span><small>Sound</small>{current.label}</span><span aria-hidden="true">⌄</span></button>
    <div className="sound-controls__options" role="group" aria-label="Choose ambient sound">{sounds.map((sound) => <button type="button" className={sound.id === value ? 'sound-controls__option sound-controls__option--active' : 'sound-controls__option'} onClick={() => onChange(sound.id)} key={sound.id}>{sound.label}</button>)}</div>
  </div>
}
