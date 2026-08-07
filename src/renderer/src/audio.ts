export type AmbientSound = 'white_noise' | 'rain' | 'cafe' | 'forest'

export function createAmbientSound(sound: AmbientSound, volume: number): () => void {
  try {
    const context = new AudioContext()
    const source = context.createBufferSource()
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1
    const filter = context.createBiquadFilter()
    filter.type = sound === 'white_noise' ? 'allpass' : sound === 'rain' ? 'lowpass' : 'bandpass'
    filter.frequency.value = sound === 'rain' ? 1800 : sound === 'cafe' ? 700 : 1200
    const gain = context.createGain()
    gain.gain.value = volume / 100
    source.buffer = buffer
    source.loop = true
    source.connect(filter).connect(gain).connect(context.destination)
    source.start()
    return () => { source.stop(); void context.close() }
  } catch { return () => undefined }
}
