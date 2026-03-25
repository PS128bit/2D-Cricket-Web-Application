const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State 
let runs = 0, wickets = 0, balls = 0;
let gameState = "IDLE"; // IDLE, BOWLING, HIT
let currentStyle = "aggressive";
let sliderPos = 0;
let sliderDir = 1;
let ballX = 750, ballY = 150;
let isSwinging = false;
let swingFrame = 0;
const SWING_DURATION = 15;

// Probabilities 
const configs = {
    aggressive: [
        { label: 'Wicket', prob: 0.40, color: '#e74c3c' },
        { label: '0', prob: 0.10, color: '#95a5a6' },
        { label: '1', prob: 0.05, color: '#2ecc71' },
        { label: '2', prob: 0.05, color: '#f1c40f' },
        { label: '4', prob: 0.20, color: '#e67e22' },
        { label: '6', prob: 0.20, color: '#9b59b6' }
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

function setStyle(style) {
    if(gameState !== "IDLE") return;
    currentStyle = style;
    document.getElementById('btn-agg').classList.toggle('active', style === 'aggressive');
    document.getElementById('btn-def').classList.toggle('active', style === 'defensive');
    renderPowerBar();
}

function renderPowerBar() {
    const bar = document.getElementById('power-bar');
    bar.innerHTML = '';
    configs[currentStyle].forEach(seg => {
        const div = document.createElement('div');
        div.className = 'segment';
        div.style.width = (seg.prob * 100) + "%";
        div.style.backgroundColor = seg.color;
        div.innerText = seg.label;
        bar.appendChild(div);
    });
}

function drawBatsman() {
    ctx.save();
    
    // Draw Body
    ctx.fillStyle = "#2c3e50";
    ctx.fillRect(120, 120, 30, 60); 

    // Draw Bat with Rotation
    ctx.translate(145, 145); 
    
    let rotation = 0;
    if (isSwinging) {
        // Simple arc
        rotation = Math.sin((swingFrame / SWING_DURATION) * Math.PI) * -1.5;
        swingFrame++;
        if (swingFrame > SWING_DURATION) isSwinging = false;
    }
    
    ctx.rotate(rotation);
    ctx.fillStyle = "#5d4037"; // Wooden color
    ctx.fillRect(0, -5, 45, 12); // The bat 
    
    ctx.restore();
}

const bowlSfx = new Audio('Cricket-shot.mp3');

function startBowling() {
    gameState = "BOWLING";
    bowlSfx.currentTime = 0;
    bowlSfx.play().catch(e => console.log("Audio needs user interaction first."));
    document.getElementById('play-btn').innerText = "HIT!";
    document.getElementById('commentary').innerText = "Here comes the delivery...";
}

function playShot() {
    // Trigger the visual animation flag
    isSwinging = true;
    swingFrame = 0;

    // Immediately calculate the outcome based on slider position 
    const ratio = sliderPos / 100; 
    let cumulative = 0;
    const currentProbs = configs[currentStyle];
    
    let result = "";
    for (let p of currentProbs) {
        cumulative += p.prob;
        if (ratio <= cumulative) {
            result = p.label;
            break;
        }
    }

    // Process the runs/wickets and show feedback
    processResult(result);
}

function handleInput() {
    if (gameState === "IDLE") {
        startBowling();
    } else if (gameState === "BOWLING") {
        playShot(); // This function is implemented when user hits the 'HIT' button 
    }
}

function processResult(res) {
    balls++;
    
    const phrases = commentaryData[res] || ["Play continues..."];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    
    if (res === "Wicket") {
        wickets++;
        showVisualFeedback("OUT!", "#e74c3c");
    } else if (res !== "0") {
        runs += parseInt(res);
        showVisualFeedback(`+${res} Runs`, "#2ecc71");
    } else {
        showVisualFeedback("Dot Ball", "#95a5a6");
    }

    document.getElementById('commentary').innerText = randomPhrase;
    updateScoreboard();
    
    // Reset for next ball
    gameState = "IDLE";
    ballX = 750;
    document.getElementById('play-btn').innerText = "Start Bowl";

    if (wickets >= 2 || balls >= 12) {
        showGameOver();
    }
}

function showGameOver() {
    // Fill the modal with final stats
    document.getElementById('final-runs').innerText = runs;
    document.getElementById('final-wickets').innerText = wickets;
    document.getElementById('final-overs').innerText = `${Math.floor(balls/6)}.${balls%6}`;
    
    // Show the modal
    document.getElementById('game-over-screen').classList.remove('hidden');
}

// --- BONUS: Visual Feedback (Pop-up text on Canvas) --- 
let feedbackText = "";
let feedbackColor = "";
let feedbackTimer = 0;

function showVisualFeedback(text, color) {
    feedbackText = text;
    feedbackColor = color;
    feedbackTimer = 60; // Show for 60 frames
}

// --- BONUS: Dynamic Commentary Data --- 
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


function updateScoreboard() {
    document.getElementById('total-runs').innerText = runs;
    document.getElementById('wickets').innerText = wickets;
    document.getElementById('overs').innerText = `${Math.floor(balls/6)}.${balls%6}`;
}

function resetGame() {
    // Reset core stats 
    runs = 0; 
    wickets = 0; 
    balls = 0;
    gameState = "IDLE";
    ballX = 750;
    
    // Update UI
    updateScoreboard();
    renderPowerBar();
    document.getElementById('commentary').innerText = "New Game! Ready to bat?";
    
    // Hide the modal
    document.getElementById('game-over-screen').classList.add('hidden');
}

function drawFeedback() {
    if (feedbackTimer > 0) {
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = feedbackColor;
        ctx.textAlign = "center";
        ctx.fillText(feedbackText, canvas.width / 2, 80);
        feedbackTimer--;
    }
}