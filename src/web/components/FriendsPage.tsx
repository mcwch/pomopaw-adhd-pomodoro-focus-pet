import { useMemo, useState } from 'react'
import type { SessionRecord } from '../../shared/timer'

interface FriendRow {
  readonly rank: number
  readonly name: string
  readonly initials: string
  readonly minutes: number
  readonly sessions: number
  readonly streak: number
  readonly you?: boolean
}

const OTHER_FRIENDS: readonly FriendRow[] = [
  { rank: 1, name: 'Alex M.', initials: 'AM', minutes: 120, sessions: 4, streak: 4 },
  { rank: 3, name: 'Sam T.', initials: 'ST', minutes: 50, sessions: 2, streak: 2 },
  { rank: 4, name: 'Jamie L.', initials: 'JL', minutes: 25, sessions: 1, streak: 1 }
]

interface FriendsPageProps {
  readonly completedPomodoros: number
  readonly sessions: SessionRecord[]
  readonly onStartFocus: () => void
}

export default function FriendsPage({ completedPomodoros, sessions, onStartFocus }: FriendsPageProps): React.JSX.Element {
  const [inviteCode, setInviteCode] = useState('')
  const validSessions = useMemo(() => sessions.filter((session) => session.outcome !== 'discarded'), [sessions])
  const focusedMinutes = validSessions.reduce((total, session) => total + Math.floor(session.elapsedSeconds / 60), 0)
  const returnedDays = new Set(validSessions.map((session) => session.startedAt.slice(0, 10))).size
  const you: FriendRow = {
    rank: 2,
    name: 'You',
    initials: 'You',
    minutes: focusedMinutes,
    sessions: completedPomodoros,
    streak: Math.min(returnedDays, 7),
    you: true
  }
  const rows = [...OTHER_FRIENDS.slice(0, 1), you, ...OTHER_FRIENDS.slice(1)]
  const circleMinutes = rows.reduce((total, row) => total + row.minutes, 0)

  return <main className="friends-page">
    <section className="friends-page__intro" aria-labelledby="friends-heading">
      <div className="friends-page__title-row"><h1 id="friends-heading">Study together, gently.</h1><span className="friends-preview-badge">Preview data</span></div>
      <p>A little accountability, without pressure.</p>
    </section>

    <div className="friends-page__columns">
      <section className="friends-card friends-card--pace" aria-labelledby="weekly-pace-heading">
        <h2 id="weekly-pace-heading">Your weekly pace</h2>
        <div className="friends-metrics">
          <Metric label="Focused time" value={`${focusedMinutes} min`} />
          <Metric label="Pomodoros" value={completedPomodoros} />
          <Metric label="Days returned" value={returnedDays} />
          <Metric label="Current streak" value={`${Math.min(returnedDays, 7)} days`} />
        </div>
        <div className="friends-pace-bar" aria-label={`${Math.min(completedPomodoros, 3)} of 3 focus blocks this week`}><span style={{ width: `${Math.min(100, (completedPomodoros / 3) * 100)}%` }} /></div>
        <p className="friends-card__hint">Small sessions add up.</p>
      </section>

      <div className="friends-page__right-column">
        <section className="friends-card friends-card--leaderboard" aria-labelledby="this-week-heading">
          <h2 id="this-week-heading">This week</h2>
          <div className="friends-table" role="table" aria-label="This week friends board">
            <div className="friends-table__header" role="row"><span>#</span><span>Friend</span><span>Time</span><span>Sessions</span><span>Streak</span></div>
            {rows.map((friend) => <div className={friend.you ? 'friends-table__row friends-table__row--you' : 'friends-table__row'} role="row" key={friend.name}>
              <span className="friends-table__rank">{friend.rank}</span>
              <span className="friends-table__name"><span className={friend.you ? 'friends-avatar friends-avatar--you' : 'friends-avatar'}>{friend.initials}</span>{friend.name}</span>
              <span className={friend.you ? 'friends-table__accent' : ''}>{friend.minutes}m</span>
              <span className={friend.you ? 'friends-table__accent' : ''}>{friend.sessions}</span>
              <span className={friend.you ? 'friends-table__accent' : ''}>{friend.streak}d</span>
            </div>)}
          </div>
        </section>

        <section className="friends-card friends-card--invite" aria-labelledby="find-people-heading">
          <h2 id="find-people-heading">Find your people</h2>
          <div className="friends-invite-actions">
            <button type="button" className="friends-primary friends-primary--invite" disabled title="Accounts and cloud sync are coming next">Add a friend</button>
            <div className="friends-code-field"><input aria-label="Invite code" value={inviteCode} onChange={(event) => setInviteCode(event.target.value)} placeholder="Have an invite code?" /><button type="button" aria-label="Submit invite code" disabled={!inviteCode.trim()}>&rarr;</button></div>
          </div>
          <p className="friends-privacy">&#128274; Friends see only the focus time and streaks you choose to share.</p>
        </section>
      </div>
    </div>

    <footer className="friends-page__footer"><p>You returned {returnedDays} days this week · Your circle logged {circleMinutes} focused minutes.</p><button type="button" className="friends-primary friends-primary--cta" onClick={onStartFocus}>Start 25 minutes together</button></footer>
  </main>
}

function Metric({ label, value }: { label: string; value: string | number }): React.JSX.Element { return <div className="friends-metric"><span>{label}</span><strong>{value}</strong></div> }
