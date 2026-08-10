import type { SoundId } from './components/SoundControls'

let context: AudioContext | null = null
let source: AudioBufferSourceNode | null = null
let gain: GainNode | null = null

export function startAmbientSound(sound: SoundId): void {
  if (typeof window === 'undefined') return
  const AudioContextConstructor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextConstructor) return
  stopAmbientSound()
  context ??= new AudioContextConstructor()
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const samples = buffer.getChannelData(0)
  for (let index = 0; index < samples.length; index += 1) samples[index] = Math.random() * 2 - 1
  const filter = context.createBiquadFilter()
  filter.type = sound === 'rain' ? 'lowpass' : sound === 'cafe' ? 'bandpass' : sound === 'forest' ? 'highpass' : 'allpass'
  filter.frequency.value = sound === 'rain' ? 1500 : sound === 'cafe' ? 900 : sound === 'forest' ? 2600 : 8000
  gain = context.createGain(); gain.gain.value = 0.035
  source = context.createBufferSource(); source.buffer = buffer; source.loop = true
  source.connect(filter).connect(gain).connect(context.destination); source.start(); void context.resume()
}

export function stopAmbientSound(): void {
  if (source) { try { source.stop() } catch { /* already stopped */ } source.disconnect(); source = null }
  gain?.disconnect(); gain = null
}
