import { useState, type FormEvent } from 'react'
import './App.css'

type Screen = 'home' | 'create' | 'join'

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [displayName, setDisplayName] = useState('')
  const [playerCount, setPlayerCount] = useState('4')
  const [roomCode, setRoomCode] = useState('')
  const [message, setMessage] = useState('')

  function goToScreen(nextScreen: Screen) {
    setScreen(nextScreen)
    setMessage('')
  }

  function handleCreateGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(
      `Ready to host a ${playerCount}-player game as ${displayName.trim()}. Room creation will be connected in the next step.`,
    )
  }

  function handleJoinGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(
      `Your details are ready, ${displayName.trim()}. Joining room ${roomCode.trim().toUpperCase()} will be connected in the next step.`,
    )
  }

  return (
    <main className="home">
      <nav className="navbar">
        <button
          className="brand"
          type="button"
          onClick={() => goToScreen('home')}
          aria-label="Return to home"
        >
          <span className="brand-icon">S</span>
          <span>Sequence</span>
        </button>

        <span className="nav-label">PLAY WITH FRIENDS</span>
      </nav>

      {screen === 'home' && (
        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="status-dot" />
              YOUR NEXT GAME NIGHT STARTS HERE
            </span>

            <h1>
              Think ahead.
              <br />
              <span>Play together.</span>
            </h1>

            <p className="description">
              A classic game of cards, strategy, and a little friendly
              competition. Gather your friends and make your move.
            </p>

            <div className="actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => goToScreen('create')}
              >
                Create a game <span aria-hidden="true">↗</span>
              </button>

              <button
                className="secondary-button"
                type="button"
                onClick={() => goToScreen('join')}
              >
                Join a game
              </button>
            </div>

            <div className="features">
              <span>
                <span className="feature-icon">♟</span> Play with friends
              </span>
              <span>
                <span className="feature-icon">◎</span> No account needed
              </span>
            </div>
          </div>

          <div className="hero-art" aria-label="Sequence game illustration">
            <div className="art-glow" />

            <div className="playing-card card-back">
              <div className="card-pattern">✳</div>
            </div>

            <div className="playing-card card-left">
              <span className="card-corner">
                A<br />♠
              </span>
              <span className="card-symbol">♠</span>
            </div>

            <div className="playing-card card-right">
              <span className="card-corner red">
                K<br />♥
              </span>
              <span className="card-symbol red">♥</span>
            </div>

            <div className="game-board">
              {Array.from({ length: 25 }, (_, index) => (
                <div className="board-cell" key={index}>
                  {index === 6 || index === 8 || index === 12 ? (
                    <span className="chip blue-chip" />
                  ) : index === 7 || index === 17 || index === 18 ? (
                    <span className="chip red-chip" />
                  ) : index === 0 || index === 24 ? (
                    <span className="free-space">✳</span>
                  ) : (
                    <span className="mini-card">
                      {['A', 'K', 'Q', 'J', '10'][index % 5]}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="art-caption">
              <span className="caption-dot" />
              EVERY MOVE COUNTS
            </div>
          </div>
        </section>
      )}

      {screen === 'create' && (
        <section className="lobby-section">
          <button
            className="back-button"
            type="button"
            onClick={() => goToScreen('home')}
          >
            ← Back to home
          </button>

          <div className="lobby-card">
            <span className="eyebrow">START A NEW GAME</span>
            <h1>Create a game</h1>
            <p className="description">
              Set up your game, then invite your friends to join.
            </p>

            <form className="lobby-form" onSubmit={handleCreateGame}>
              <label htmlFor="host-name">Your display name</label>
              <input
                id="host-name"
                type="text"
                placeholder="What should friends call you?"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={20}
                required
              />

              <label htmlFor="player-count">Number of players</label>
              <select
                id="player-count"
                value={playerCount}
                onChange={(event) => setPlayerCount(event.target.value)}
              >
                {[2, 3, 4, 6, 8, 9, 10, 12].map((count) => (
                  <option key={count} value={count}>
                    {count} players
                  </option>
                ))}
              </select>

              <button className="primary-button form-submit" type="submit">
                Continue <span aria-hidden="true">→</span>
              </button>
            </form>

            {message && <p className="form-message" role="status">{message}</p>}
          </div>
        </section>
      )}

      {screen === 'join' && (
        <section className="lobby-section">
          <button
            className="back-button"
            type="button"
            onClick={() => goToScreen('home')}
          >
            ← Back to home
          </button>

          <div className="lobby-card">
            <span className="eyebrow">YOUR FRIENDS ARE WAITING</span>
            <h1>Join a game</h1>
            <p className="description">
              Enter the room code your friend shared with you.
            </p>

            <form className="lobby-form" onSubmit={handleJoinGame}>
              <label htmlFor="guest-name">Your display name</label>
              <input
                id="guest-name"
                type="text"
                placeholder="What should friends call you?"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={20}
                required
              />

              <label htmlFor="room-code">Room code</label>
              <input
                id="room-code"
                type="text"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value)}
                maxLength={8}
                required
              />

              <button className="primary-button form-submit" type="submit">
                Join room <span aria-hidden="true">→</span>
              </button>
            </form>

            {message && <p className="form-message" role="status">{message}</p>}
          </div>
        </section>
      )}

      <footer className="footer">
        <span>GOOD FRIENDS. SMART MOVES. ONE MORE ROUND.</span>
        <span className="footer-right">MADE FOR GAME NIGHT ♡</span>
      </footer>
    </main>
  )
}

export default App
