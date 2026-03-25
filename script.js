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
