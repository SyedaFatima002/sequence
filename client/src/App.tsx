import './App.css'

function App() {
  return (
    <main className="home">
      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-icon">S</span>
          <span>Sequence</span>
        </a>
        <span className="nav-label">PLAY WITH FRIENDS</span>
      </nav>

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
            <button className="primary-button" type="button">
              Create a game <span aria-hidden="true">↗</span>
            </button>
            <button className="secondary-button" type="button">
              Join a game
            </button>
          </div>

          <div className="features">
            <span><span className="feature-icon">♟</span> Play with friends</span>
            <span><span className="feature-icon">◎</span> No account needed</span>
          </div>
        </div>

        <div className="hero-art" aria-label="Sequence game illustration">
          <div className="art-glow" />

          <div className="playing-card card-back">
            <div className="card-pattern">✳</div>
          </div>

          <div className="playing-card card-left">
            <span className="card-corner">A<br />♠</span>
            <span className="card-symbol">♠</span>
          </div>

          <div className="playing-card card-right">
            <span className="card-corner red">K<br />♥</span>
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

      <footer className="footer">
        <span>GOOD FRIENDS. SMART MOVES. ONE MORE ROUND.</span>
        <span className="footer-right">MADE FOR GAME NIGHT ♡</span>
      </footer>
    </main>
  )
}

export default App
