import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Bonus Commentary Data
const commentaryData = {
  "Wicket": ["Clean bowled!", "Caught out!", "A huge appeal... GONE!"],
  "6": ["Smashed for six!", "Out of the park!", "A massive hit!"],
  "4": ["Cracking boundary!", "Timed to perfection!", "Four runs!"],
  "2": ["Good running for two.", "They push for the second!"],
  "1": ["Just a single.", "Rotating the strike."],
  "0": ["Dot ball.", "No run there."]
};

const App = () => {
  // Game State
  const [runs, setRuns] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [balls, setBalls] = useState(0);
  const [gameState, setGameState] = useState("IDLE"); // IDLE, BOWLING
  const [style, setStyle] = useState("aggressive");
  const [commentary, setCommentary] = useState("Select style and click Start Bowl!");
  
  // Animation States
  const [sliderPos, setSliderPos] = useState(0);
  const [ballX, setBallX] = useState(750);
  const [isSwinging, setIsSwinging] = useState(false);
  
  const sliderDir = useRef(1);
  const canvasRef = useRef(null);
  const bowlSfx = useRef(new Audio('/Cricket-shot.mp3'));

  // Probability Configs
  const configs = {
    aggressive: [
      { label: 'Wicket', prob: 0.40, color: '#e74c3c' },
      { label: '0', prob: 0.10, color: '#95a5a6' },
      { label: '1', prob: 0.075, color: '#2ecc71' },
      { label: '2', prob: 0.125, color: '#f1c40f' },
      { label: '4', prob: 0.175, color: '#e67e22' },
      { label: '6', prob: 0.125, color: '#9b59b6' }
    ],
    defensive: [
      { label: 'Wicket', prob: 0.15, color: '#e74c3c' },
      { label: '0', prob: 0.40, color: '#95a5a6' },
      { label: '1', prob: 0.30, color: '#2ecc71' },
      { label: '2', prob: 0.07, color: '#f1c40f' },
      { label: '4', prob: 0.05, color: '#e67e22' },
      { label: '6', prob: 0.03, color: '#9b59b6' }
    ]
  };

  // Main Animation Loop
  useEffect(() => {
    const frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  });

  const update = () => {
    // Move Slider
    setSliderPos(prev => {
      let next = prev + 2 * sliderDir.current;
      if (next >= 100 || next <= 0) sliderDir.current *= -1;
      return next;
    });

    // Move Ball
    if (gameState === "BOWLING") {
      setBallX(prev => {
        if (prev < 110) {
          processResult("0");
          return 750;
        }
        return prev - 9;
      });
    }

    draw();
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Pitch
    ctx.fillStyle = "#f3e5ab";
    ctx.fillRect(100, 100, 600, 100);

    //Batsman & Ball
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(120, 120, 30, 60);
    
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(ballX, 150, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  //Shot Logic
  const playShot = () => {
    setIsSwinging(true);
    let cumulative = 0;
    let result = "";
    const ratio = sliderPos / 100;

    for (let p of configs[style]) {
      cumulative += p.prob;
      if (ratio <= cumulative) {
        result = p.label;
        break;
      }
    }
    processResult(result);
  };

  const processResult = (res) => {
    setBalls(prev => prev + 1);
    if (res === "Wicket") setWickets(prev => prev + 1);
    else setRuns(prev => prev + parseInt(res) || 0);

    const phrases = commentaryData[res];
    setCommentary(phrases[Math.floor(Math.random() * phrases.length)]);
    
    setGameState("IDLE");
    setBallX(750);
    setTimeout(() => setIsSwinging(false), 500);
  };

  return (
    <div className="App">
      <div id="student-intro">
        <strong>Name:</strong> Muhammad Anas<br/>
        <strong>Roll Number:</strong> 23i-0853<br/>
        <strong>Section:</strong> B
      </div>

      <div id="game-container">
        <div id="scoreboard">
          <div className="stat">Runs: {runs}</div>
          <div className="stat">Wickets: {wickets}/2</div>
          <div className="stat">Overs: {Math.floor(balls/6)}.{balls%6}/2.0</div>
        </div>

        <canvas ref={canvasRef} width="800" height="300" id="gameCanvas" />

        <div id="controls">
          <button className={style === 'defensive' ? 'active' : ''} onClick={() => setStyle('defensive')}>Defensive</button>
          <button className={style === 'aggressive' ? 'active' : ''} onClick={() => setStyle('aggressive')}>Aggressive</button>
          <button id="play-btn" onClick={() => gameState === "IDLE" ? setGameState("BOWLING") : playShot()}>
            {gameState === "IDLE" ? "Start Bowl" : "HIT!"}
          </button>
        </div>

        <div className="power-bar-wrapper">
          <div id="power-bar">
            {configs[style].map((seg, i) => (
              <div key={i} className="segment" style={{width: `${seg.prob * 100}%`, backgroundColor: seg.color}}>
                {seg.label}
              </div>
            ))}
          </div>
          <div id="slider" style={{left: `${sliderPos}%`}} />
        </div>
        
        <div id="commentary">{commentary}</div>
      </div>

      {/* Game Over Modal */}
      {(wickets >= 2 || balls >= 12) && (
        <div id="game-over-screen">
          <div className="modal-content">
            <h1>Innings Over!</h1>
            <p>Score: {runs}/{wickets}</p>
            <p>Overs Played: {Math.floor(balls/6)}.{balls%6}/2.0</p>
            <button onClick={() => window.location.reload()}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;