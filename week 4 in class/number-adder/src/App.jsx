
import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);

  function changeNumber(amount) {
    const newCount = count + amount;

    setHistory(prev => [
      {
        id: crypto.randomUUID(),
        action: amount > 0 ? `+${amount}` : `${amount}`,
        before: count,
        after: newCount,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

    setCount(newCount);
    setAnimationKey(prev => prev + 1);
  }

  function resetNumber() {
    setHistory(prev => [
      {
        id: crypto.randomUUID(),
        action: 'RESET',
        before: count,
        after: 0,
        time: new Date().toLocaleTimeString()
      },
      ...prev
    ]);

    setCount(0);
    setAnimationKey(prev => prev + 1);
  }

  function clearHistory() {
    setHistory([]);
  }

  return (
    <div className="app">

      {/* 01 HEADER */}
      <header className="header">
        <h1>NUMBER ADDER</h1>
        <p>ZHANG ZHANG</p>
      </header>

      <div className="content">

        {/* 02 SIDEBAR / RESULT */}
        <aside className="sidebar">
          <h3>RESULT</h3>
          <div
            key={animationKey}
            id="resultId"
            className={
              count > 0
                ? 'positive'
                : count < 0
                  ? 'negative'
                  : 'zero'
            }
          >
            {count}
          </div>
          <p>Current Value</p>
        </aside>

        {/* 03 MAIN CONTROLS */}
        <main className="main">
          <h2>CONTROLS</h2>
          <p>Click a button to change the number.</p>

          <div className="button-grid">
            <button
              className="number-btn plus-one"
              onClick={() => changeNumber(1)}
            >
              +1
            </button>

            <button
              className="number-btn plus-two"
              onClick={() => changeNumber(2)}
            >
              +2
            </button>

            <button
              className="number-btn minus-one"
              onClick={() => changeNumber(-1)}
            >
              -1
            </button>

            <button
              className="number-btn minus-two"
              onClick={() => changeNumber(-2)}
            >
              -2
            </button>
          </div>

          <button
            className="reset"
            onClick={resetNumber}
          >
            RESET
          </button>
        </main>
      </div>

      {/* 04 HISTORY */}
      <section className="history-section">
        <div className="history-header">
          <div>
            <h2>HISTORY</h2>
            <p>{history.length} operations</p>
          </div>

          <button
            className="clear-history"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            CLEAR HISTORY
          </button>
        </div>

        {history.length === 0 ? (
          <div className="history-empty">
            No history yet. Try clicking a button.
          </div>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <div
                key={item.id}
                className="history-item"
              >
                <span className="history-action">
                  {item.action}
                </span>

                <span className="history-calculation">
                  {item.before} → {item.after}
                </span>

                <span className="history-time">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default App;
