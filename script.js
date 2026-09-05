const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const menu = document.getElementById("menu");
const game = document.getElementById("game");
const gameOver = document.getElementById("gameOver");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const menuButton = document.getElementById("menuButton");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const highScoreElement = document.getElementById("highScore");
const finalScoreElement = document.getElementById("finalScore");

let player;
let meteors = [];
let particles = [];

let score = 0;
let lives = 3;

let gameRunning = false;
let animationId;

let meteorTimer = 0;
let difficulty = 1;

let keys = {};

let highScore = localStorage.getItem("naveEscapeHighScore") || 0;

highScoreElement.textContent = highScore;


// Ajusta o canvas à tela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (player) {
        player.y = canvas.height - 100;

        if (player.x > canvas.width - player.width) {
            player.x = canvas.width - player.width;
        }
    }
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// =========================
// JOGADOR
// =========================

function createPlayer() {

    return {
        x: canvas.width / 2 - 25,
        y: canvas.height - 100,

        width: 50,
        height: 60,

        speed: 7
    };
}


// =========================
// METEOROS
// =========================

function createMeteor() {

    const size = Math.random() * 25 + 25;

    meteors.push({

        x: Math.random() * (canvas.width - size),

        y: -size,

        size: size,

        speed: Math.random() * 3 + 3 + difficulty,

        rotation: Math.random() * Math.PI,

        rotationSpeed: (Math.random() - 0.5) * 0.05
    });
}


// =========================
// PARTÍCULAS
// =========================

function createExplosion(x, y) {

    for (let i = 0; i < 20; i++) {

        particles.push({

            x: x,
            y: y,

            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,

            size: Math.random() * 4 + 2,

            life: 1
        });
    }
}


// =========================
// DESENHAR NAVE
// =========================

function drawPlayer() {

    ctx.save();

    ctx.translate(
        player.x + player.width / 2,
        player.y + player.height / 2
    );

    // Fogo da nave
    ctx.beginPath();

    ctx.moveTo(-10, 20);
    ctx.lineTo(0, 40 + Math.random() * 10);
    ctx.lineTo(10, 20);

    ctx.fillStyle = "#ff7b00";
    ctx.fill();

    // Corpo
    ctx.beginPath();

    ctx.moveTo(0, -30);
    ctx.lineTo(25, 25);
    ctx.lineTo(0, 15);
    ctx.lineTo(-25, 25);

    ctx.closePath();

    ctx.fillStyle = "#00d9ff";
    ctx.fill();

    // Janela
    ctx.beginPath();

    ctx.arc(0, -8, 8, 0, Math.PI * 2);

    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
}


// =========================
// DESENHAR METEORO
// =========================

function drawMeteor(meteor) {

    ctx.save();

    ctx.translate(
        meteor.x + meteor.size / 2,
        meteor.y + meteor.size / 2
    );

    ctx.rotate(meteor.rotation);

    ctx.beginPath();

    const points = 9;

    for (let i = 0; i < points; i++) {

        const angle = (Math.PI * 2 / points) * i;

        const radius =
            meteor.size / 2 *
            (0.75 + Math.random() * 0.3);

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.closePath();

    ctx.fillStyle = "#777";
    ctx.fill();

    ctx.strokeStyle = "#aaa";
    ctx.stroke();

    ctx.restore();
}


// =========================
// FUNDO
// =========================

let stars = [];

function createStars() {

    stars = [];

    for (let i = 0; i < 150; i++) {

        stars.push({

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,

            size: Math.random() * 2,

            speed: Math.random() * 2 + 0.5
        });
    }
}

createStars();


function drawBackground() {

    ctx.fillStyle = "#030712";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    for (const star of stars) {

        star.y += star.speed;

        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }

        ctx.fillStyle = "white";

        ctx.globalAlpha =
            Math.random() * 0.6 + 0.4;

        ctx.fillRect(
            star.x,
            star.y,
            star.size,
            star.size
        );
    }

    ctx.globalAlpha = 1;
}


// =========================
// MOVIMENTO
// =========================

function movePlayer() {

    if (keys["ArrowLeft"] || keys["a"]) {
        player.x -= player.speed;
    }

    if (keys["ArrowRight"] || keys["d"]) {
        player.x += player.speed;
    }

    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x =
            canvas.width - player.width;
    }
}


// =========================
// COLISÃO
// =========================

function collision(player, meteor) {

    const meteorCenterX =
        meteor.x + meteor.size / 2;

    const meteorCenterY =
        meteor.y + meteor.size / 2;

    const playerCenterX =
        player.x + player.width / 2;

    const playerCenterY =
        player.y + player.height / 2;

    const distanceX =
        meteorCenterX - playerCenterX;

    const distanceY =
        meteorCenterY - playerCenterY;

    const distance =
        Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

    return distance <
        meteor.size / 2 + 25;
}


// =========================
// ATUALIZAR METEOROS
// =========================

function updateMeteors() {

    meteorTimer++;

    const spawnRate =
        Math.max(15, 60 - difficulty * 4);

    if (meteorTimer > spawnRate) {

        createMeteor();

        meteorTimer = 0;
    }

    for (let i = meteors.length - 1; i >= 0; i--) {

        const meteor = meteors[i];

        meteor.y += meteor.speed;
        meteor.rotation += meteor.rotationSpeed;

        // Colisão
        if (collision(player, meteor)) {

            createExplosion(
                meteor.x + meteor.size / 2,
                meteor.y + meteor.size / 2
            );

            meteors.splice(i, 1);

            lives--;

            livesElement.textContent = lives;

            if (lives <= 0) {
                endGame();
            }

            continue;
        }

        // Saiu da tela
        if (meteor.y > canvas.height + meteor.size) {

            meteors.splice(i, 1);

            score++;

            scoreElement.textContent = score;
        }
    }
}


// =========================
// PARTÍCULAS
// =========================

function updateParticles() {

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.life -= 0.03;

        particle.size *= 0.97;

        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}


function drawParticles() {

    for (const particle of particles) {

        ctx.globalAlpha = particle.life;

        ctx.fillStyle = "#ff7b00";

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;
}


// =========================
// DIFICULDADE
// =========================

function updateDifficulty() {

    difficulty =
        1 + Math.floor(score / 15);
}


// =========================
// LOOP DO JOGO
// =========================

function gameLoop() {

    if (!gameRunning) return;

    drawBackground();

    movePlayer();

    updateMeteors();

    updateParticles();

    updateDifficulty();

    drawPlayer();

    meteors.forEach(drawMeteor);

    drawParticles();

    animationId =
        requestAnimationFrame(gameLoop);
}


// =========================
// COMEÇAR JOGO
// =========================

function startGame() {

    menu.classList.add("hidden");

    game.classList.remove("hidden");

    gameOver.classList.add("hidden");

    player = createPlayer();

    meteors = [];
    particles = [];

    score = 0;
    lives = 3;

    difficulty = 1;
    meteorTimer = 0;

    scoreElement.textContent = score;
    livesElement.textContent = lives;

    gameRunning = true;

    createStars();

    cancelAnimationFrame(animationId);

    gameLoop();
}


// =========================
// GAME OVER
// =========================

function endGame() {

    gameRunning = false;

    cancelAnimationFrame(animationId);

    finalScoreElement.textContent = score;

    if (score > highScore) {

        highScore = score;

        localStorage.setItem(
            "naveEscapeHighScore",
            highScore
        );

        highScoreElement.textContent =
            highScore;
    }

    gameOver.classList.remove("hidden");
}


// =========================
// BOTÕES
// =========================

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);

menuButton.addEventListener(
    "click",
    () => {

        gameOver.classList.add("hidden");

        game.classList.add("hidden");

        menu.classList.remove("hidden");
    }
);


// =========================
// TECLADO
// =========================

window.addEventListener(
    "keydown",
    (event) => {

        keys[event.key] = true;

        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === " "
        ) {
            event.preventDefault();
        }
    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[event.key] = false;
    }
);