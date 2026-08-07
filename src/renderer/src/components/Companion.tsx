import lion from '../assets/lion/blue-maned-study-lion.png'

const copy = { idle: 'Waiting for your next small step', focus: 'Studying with you', break: 'Taking a real break with you', celebrate: 'That was a good focus session' }

export default function Companion({ state }: { state: keyof typeof copy }): React.JSX.Element {
  return <aside className="companion" data-state={state}><img src={lion} alt="Blue-maned lion companion" /><p>{copy[state]}</p></aside>
}
