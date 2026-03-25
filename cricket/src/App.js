import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const commentaryData = {
    "Wicket": [
        "Clean bowled! The stumps are flying!",
        "In the air... and TAKEN! A brilliant catch.",
        "That's a huge appeal... and the finger goes up!"
    ],
    "6": [
        "Smashed! That's gone into the top tier!",
        "Amazing! A magnificent strike for six.",
        "Exquisite Pull for a Maximum! The fielder can just watch it sail over the ropes."
    ],
    "4": [
        "Cracking shot! It races away to the boundary.",
        "Beautifully timed for a cover drive, Four.",
        "That's a boundary! The batsman is in great touch."
    ],
    "2": [
        "Two runs taken, excellent running between the wickets.",
        "Gaps found, they come back for the second.",
        "Placed well for an easy 2 runs."
    ],
    "1": [
        "Pushed into the gap for a quick single.",
        "Good fielding restricts them to only the one.",
        "Good running between the wickets, they've somehow found a single there."
    ],
    "0": [
        "Solid defense, no run there.",
        "Beaten by the pace! It's a dot.",
        "Straight to the fielder. Dots are building pressure."
    ]
};

const App = () => {
    // Game State
    const [runs, setRuns] = useState(0);
    const [wickets, setWickets] = useState(0);
    const [balls, setBalls] = useState(0);
    const [gameState, setGameState] = useState("IDLE"); 
    const [style, setStyle] = useState("aggressive");
    const [commentary, setCommentary] = useState("Select style and click Start Bowl!");
    const [showModal, setShowModal] = useState(false);
    
    // Animation/Visual States
    const [sliderPos, setSliderPos] = useState(0);
    const [ballX, setBallX] = useState(750);
    const [feedback, setFeedback] = useState({ text: "", color: "", timer: 0 });
    
    // Refs for Animation timing
    const sliderDir = useRef(1);
    const swingRef = useRef({ active: false, frame: 0 });
    const canvasRef = useRef(null);
    const bowlSfx = useRef(new Audio('/Cricket-shot.mp3'));

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

    // Main Game Loop
    useEffect(() => {
        let frameId;
        const update = () => {
            // 1. Slider Movement
            setSliderPos(prev => {
                let next = prev + 2.0 * sliderDir.current;
                if (next >= 100 || next <= 0) sliderDir.current *= -1;
                return next;
            });

            // 2. Bowling Animation
            if (gameState === "BOWLING") {
                setBallX(prev => {
                    if (prev < 110) {
                        processResult("0");
                        return 750;
                    }
                    return prev - 9;
                });
            }

            // 3. Feedback Timer
            setFeedback(prev => ({ ...prev, timer: Math.max(0, prev.timer - 1) }));

            renderCanvas();
            frameId = requestAnimationFrame(update);
        };
        frameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(frameId);
    }, [gameState, ballX, feedback.timer]);

    const renderCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Pitch
        ctx.fillStyle = "#f3e5ab";
        ctx.fillRect(100, 100, 600, 100);

        // Draw Batsman & Bat Sprite [cite: 32, 50, 127]
        ctx.save();
        ctx.translate(145, 145);
        let rotation = 0;
        if (swingRef.current.active) {
            rotation = Math.sin((swingRef.current.frame / 15) * Math.PI) * -1.5;
            swingRef.current.frame++;
            if (swingRef.current.frame > 15) {
                swingRef.current.active = false;
                swingRef.current.frame = 0;
            }
        }
        ctx.rotate(rotation);
        ctx.fillStyle = "#2c3e50"; // Body
        ctx.fillRect(-15, -25, 30, 60); 
        ctx.fillStyle = "#5d4037"; // Bat
        ctx.fillRect(0, -5, 45, 12); 
        ctx.restore();

        // Draw Ball
        ctx.fillStyle = "white";
        ctx.beginPath(); 
        ctx.arc(ballX, 150, 8, 0, Math.PI * 2); 
        ctx.fill();

        // Visual Feedback Text 
        if (feedback.timer > 0) {
            ctx.font = "bold 40px Arial";
            ctx.fillStyle = feedback.color;
            ctx.textAlign = "center";
            ctx.fillText(feedback.text, canvas.width / 2, 80);
        }
    };

    const startBowling = () => {
        setGameState("BOWLING");
        setBallX(750);
        bowlSfx.current.currentTime = 0;
        bowlSfx.current.play().catch(() => {}); 
        setCommentary("Here comes the delivery...");
    };

    const playShot = () => {
        swingRef.current = { active: true, frame: 0 };
        const ratio = sliderPos / 100;
        let cumulative = 0;
        let result = "";
        for (let p of configs[style]) {
            cumulative += p.prob;
            if (ratio <= cumulative) { result = p.label; break; }
        }
        processResult(result);
    };

    const processResult = (res) => {
        const newBalls = balls + 1;
        const newWickets = res === "Wicket" ? wickets + 1 : wickets;
        const newRuns = res === "Wicket" ? runs : runs + (parseInt(res) || 0);

        setBalls(newBalls);
        setWickets(newWickets);
        setRuns(newRuns);

        // Feedback Text Colors
        const color = res === "Wicket" ? "#e74c3c" : "#2ecc71";
        const text = res === "Wicket" ? "OUT!" : (res === "0" ? "Dot Ball" : `+${res} Runs`);
        setFeedback({ text, color, timer: 60 });

        const phrases = commentaryData[res];
        setCommentary(phrases[Math.floor(Math.random() * phrases.length)]);
        setGameState("IDLE");
        setBallX(750);

        if (newWickets >= 2 || newBalls >= 12) setShowModal(true);
    };

    const resetGame = () => {
        setRuns(0); setWickets(0); setBalls(0);
        setGameState("IDLE"); setBallX(750);
        setCommentary("New Game! Ready to bat?");
        setShowModal(false); setSliderPos(0);
        setFeedback({ text: "", color: "", timer: 0 });
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
                    <div className="style-selector">
                        <button className={style === 'defensive' ? 'active' : ''} onClick={() => setStyle('defensive')}>Defensive</button>
                        <button className={style === 'aggressive' ? 'active' : ''} onClick={() => setStyle('aggressive')}>Aggressive</button>
                    </div>
                    <button id="play-btn" onClick={() => gameState === "IDLE" ? startBowling() : playShot()}>
                        {gameState === "IDLE" ? "Start Bowl" : "HIT!"}
                    </button>
                    <button id="reset-btn" onClick={resetGame}>Restart Game</button>
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

            {showModal && (
                <div id="game-over-screen">
                    <div className="modal-content">
                        <h1>Innings Over!</h1>
                        <p>Final Score: {runs}/{wickets}</p>
                        <p>Overs bowled: {Math.floor(balls/6)}.{balls%6}/2.0</p>
                        <button id="modal-restart" onClick={resetGame}>Play Again</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;