import { useEffect, useState, type FormEvent } from 'react'
import './App.css'
import { socket } from './socket'
import type { PublicRoom, RoomCredentials, RoomResult } from './roomTypes'

type Screen = 'home' | 'create' | 'join' | 'lobby'

const ROOM_SESSION_KEY = 'sequence-room-session'

function saveRoomSession(credentials: RoomCredentials) {
  sessionStorage.setItem(ROOM_SESSION_KEY, JSON.stringify(credentials))
}

function loadRoomSession(): RoomCredentials | null {
  const saved = sessionStorage.getItem(ROOM_SESSION_KEY)

  if (!saved) return null

  try {
    const parsed: unknown = JSON.parse(saved)

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'code' in parsed &&
      'reconnectToken' in parsed &&
      typeof parsed.code === 'string' &&
      typeof parsed.reconnectToken === 'string'
    ) {
      return {
        code: parsed.code,
        reconnectToken: parsed.reconnectToken,
      }
    }
  } catch {
    // Ignore invalid saved data and let the user start fresh.
  }

  sessionStorage.removeItem(ROOM_SESSION_KEY)
  return null
}

function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [displayName, setDisplayName] = useState('')
  const [playerCount, setPlayerCount] = useState('4')
  const [roomCode, setRoomCode] = useState('')
  const [room, setRoom] = useState<PublicRoom | null>(null)
  const [message, setMessage] = useState('')
  const [serverConnected, setServerConnected] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function handleConnect() {
      setServerConnected(true)

      const credentials = loadRoomSession()

      if (!credentials) return

      socket.emit(
        'room:reconnect',
        credentials,
        (result: RoomResult) => {
          if (result.success && result.room) {
            setRoom(result.room)
            setScreen('lobby')
            setMessage('')
          } else {
            sessionStorage.removeItem(ROOM_SESSION_KEY)
            setRoom(null)
            setScreen('home')
            setMessage(
              result.message ?? 'Your previous room is no longer available.',
            )
          }
        },
      )
    }

    function handleDisconnect() {
      setServerConnected(false)
    }

    function handleRoomUpdated(updatedRoom: PublicRoom) {
      setRoom(updatedRoom)
    }

    function handleRoomClosed(data: { message: string }) {
      sessionStorage.removeItem(ROOM_SESSION_KEY)
      setRoom(null)
      setScreen('home')
      setMessage(data.message)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('room:updated', handleRoomUpdated)
    socket.on('room:closed', handleRoomClosed)

    socket.connect()

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('room:updated', handleRoomUpdated)
      socket.off('room:closed', handleRoomClosed)
      socket.disconnect()
    }
  }, [])

  function goToScreen(nextScreen: Screen) {
    setScreen(nextScreen)
    setMessage('')
  }

  function handleCreateGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!serverConnected) {
      setMessage('The server is not connected. Please try again.')
      return
    }

    setBusy(true)

    socket.emit(
      'room:create',
      {
        name: displayName,
        maxPlayers: Number(playerCount),
      },
      (result: RoomResult) => {
        setBusy(false)

        if (!result.success || !result.room) {
          setMessage(result.message ?? 'Could not create the room.')
          return
        }

        if (result.credentials) {
          saveRoomSession(result.credentials)
        }

        setRoom(result.room)
        setScreen('lobby')
      },
    )
  }

  function handleJoinGame(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (!serverConnected) {
      setMessage('The server is not connected. Please try again.')
      return
    }

    setBusy(true)

    socket.emit(
      'room:join',
      {
        name: displayName,
        code: roomCode,
      },
      (result: RoomResult) => {
        setBusy(false)

        if (!result.success || !result.room) {
          setMessage(result.message ?? 'Could not join the room.')
          return
        }

        if (result.credentials) {
          saveRoomSession(result.credentials)
        }

        setRoom(result.room)
        setScreen('lobby')
      },
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

        <span className="nav-label">
          {serverConnected ? 'SERVER CONNECTED' : 'CONNECTING TO SERVER...'}
        </span>
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

            {message && <p className="form-message" role="status">{message}</p>}

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

              <button
                className="primary-button form-submit"
                type="submit"
                disabled={busy || !serverConnected}
              >
                {busy ? 'Creating...' : 'Create room →'}
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
                maxLength={6}
                required
              />

              <button
                className="primary-button form-submit"
                type="submit"
                disabled={busy || !serverConnected}
              >
                {busy ? 'Joining...' : 'Join room →'}
              </button>
            </form>

            {message && <p className="form-message" role="status">{message}</p>}
          </div>
        </section>
      )}

      {screen === 'lobby' && room && (
        <section className="lobby-section">
          <div className="lobby-card">
            <span className="eyebrow">ROOM CREATED</span>
            <h1>Waiting for players</h1>
            <p className="description">
              Share this code with your friends so they can join your game.
            </p>

            <div className="room-code-panel">
              <span className="room-code-label">ROOM CODE</span>
              <strong className="room-code">{room.code}</strong>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  void navigator.clipboard.writeText(room.code).then(
                    () => setMessage('Room code copied!'),
                    () => setMessage('Copy failed. Please select the code and copy it manually.'),
                  )
                }}
              >
                Copy code
              </button>
            </div>

            <div className="room-summary">
              <span>Players</span>
              <strong>
                {room.players.length} / {room.maxPlayers}
              </strong>
            </div>

            <div className="player-list">
              {room.players.map((player) => (
                <div className="player-row" key={player.id}>
                  <span className="player-avatar">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="player-name">{player.name}</span>
                  {player.isHost && <span className="host-label">HOST</span>}
                </div>
              ))}
            </div>

            {room.players.length < room.maxPlayers ? (
              <p className="form-message" role="status">
                Waiting for {room.maxPlayers - room.players.length}{' '}
                more {room.maxPlayers - room.players.length === 1 ? 'player' : 'players'}…
              </p>
            ) : (
              <p className="form-message" role="status">
                Everyone is here! Starting the game will be our next feature.
              </p>
            )}

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
