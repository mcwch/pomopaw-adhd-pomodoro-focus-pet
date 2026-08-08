export default function TodayRail({ tasks, onChoose }: { tasks: string[]; onChoose: (title: string) => void }): React.JSX.Element {
  return <aside className="today-rail" aria-label="Today"><h2>Today</h2><p>Choose one small thing.</p><ol>{tasks.slice(0, 3).map((task) => <li key={task}><button onClick={() => onChoose(task)}>{task}</button></li>)}</ol><p className="quiet-copy">You can keep only three active tasks here.</p></aside>
}
