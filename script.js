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
let bullets = [];
let particles = [];

let score = 0;
let lives = 3;

let gameRunning = false;
let animationId;

let meteorTimer = 0;
let shootCooldown = 0;

let difficulty = 1;
let gameTime = 0;

let keys = {};

let highScore =
    localStorage.getItem("naveEscapeHighScore") || 0;

highScoreElement.textContent = highScore;


// ===============================
// TAMANHO DA TELA
// ===============================

function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (player) {

        player.y = canvas.height - 120;

        if (player.x > canvas.width - player.width) {
            player.x = canvas.width - player.width;
        }
    }
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// ===============================
// JOGADOR
// ===============================

function createPlayer() {

    return {

        x: canvas.width / 2 - 25,

        y: canvas.height - 120,

        width: 50,

        height: 60,

        speed: 7,

        maxSpeed: 16
    };
}


// ===============================
// METEOROS
// ===============================

function createMeteor() {

    const size =
        Math.random() * 30 + 25;

    meteors.push({

        x:
            Math.random() *
            (canvas.width - size),

        y: -size,

        size: size,

        speed:
            Math.random() *
            3 +
            3 +
            difficulty * 0.7,

        rotation:
            Math.random() *
            Math.PI,

        rotationSpeed:
            (Math.random() - 0.5) *
            0.08,

        health:
            size > 45 ? 2 : 1
    });
}


// ===============================
// TIROS
// ===============================

function shoot() {

    if (shootCooldown > 0) return;

    bullets.push({

        x:
            player.x +
            player.width / 2 -

            3,

        y:
            player.y,

        width: 6,

        height: 20,

        speed: 12
    });

    shootCooldown = 8;
}


// ===============================
// EXPLOSÃO
// ===============================

function createExplosion(x, y) {

    for (let i = 0; i < 25; i++) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) *
                10,

            vy:
                (Math.random() - 0.5) *
                10,

            size:
                Math.random() *
                5 +
                2,

            life: 1
        });
    }
}


// ===============================
// DESENHAR NAVE
// ===============================

function drawPlayer() {

    ctx.save();

    ctx.translate(

        player.x +
        player.width / 2,

        player.y +
        player.height / 2
    );


    // FOGO

    ctx.beginPath();

    ctx.moveTo(-10, 20);

    ctx.lineTo(
        0,
        40 +
        Math.random() * 12
    );

    ctx.lineTo(10, 20);

    ctx.fillStyle = "#ff7b00";

    ctx.fill();


    // CORPO

    ctx.beginPath();

    ctx.moveTo(0, -30);

    ctx.lineTo(25, 25);

    ctx.lineTo(0, 15);

    ctx.lineTo(-25, 25);

    ctx.closePath();

    ctx.fillStyle = "#00d9ff";

    ctx.fill();


    // JANELA

    ctx.beginPath();

    ctx.arc(
        0,
        -8,
        8,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "white";

    ctx.fill();


    ctx.restore();
}


// ===============================
// DESENHAR METEORO
// ===============================

function drawMeteor(meteor) {

    ctx.save();

    ctx.translate(

        meteor.x +
        meteor.size / 2,

        meteor.y +
        meteor.size / 2
    );

    ctx.rotate(meteor.rotation);

    ctx.beginPath();

    const points = 9;

    for (let i = 0; i < points; i++) {

        const angle =
            (Math.PI * 2 / points) *
            i;

        const radius =
            meteor.size / 2 *
            (0.75 +
            Math.random() * 0.25);

        const x =
            Math.cos(angle) *
            radius;

        const y =
            Math.sin(angle) *
            radius;

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


// ===============================
// DESENHAR TIROS
// ===============================

function drawBullet(bullet) {

    ctx.save();

    ctx.shadowBlur = 15;

    ctx.shadowColor = "#00ffff";

    ctx.fillStyle = "#00ffff";

    ctx.fillRect(

        bullet.x,

        bullet.y,

        bullet.width,

        bullet.height
    );

    ctx.restore();
}


// ===============================
// FUNDO
// ===============================

let stars = [];

function createStars() {

    stars = [];

    for (let i = 0; i < 180; i++) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() *
                2,

            speed:
                Math.random() *
                3 +
                0.5
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

        star.y +=
            star.speed +
            difficulty * 0.15;

        if (star.y > canvas.height) {

            star.y = 0;

            star.x =
                Math.random() *
                canvas.width;
        }

        ctx.globalAlpha =
            Math.random() *
            0.6 +
            0.4;

        ctx.fillStyle = "white";

        ctx.fillRect(

            star.x,

            star.y,

            star.size,

            star.size
        );
    }

    ctx.globalAlpha = 1;
}


// ===============================
// MOVIMENTO DA NAVE
// ===============================

function movePlayer() {

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -= player.speed;
    }


    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x += player.speed;
    }


    if (player.x < 0) {

        player.x = 0;
    }


    if (
        player.x +
        player.width >
        canvas.width
    ) {

        player.x =
            canvas.width -
            player.width;
    }
}


// ===============================
// COLISÃO NAVE / METEORO
// ===============================

function collision(player, meteor) {

    const meteorCenterX =
        meteor.x +
        meteor.size / 2;

    const meteorCenterY =
        meteor.y +
        meteor.size / 2;


    const playerCenterX =
        player.x +
        player.width / 2;

    const playerCenterY =
        player.y +
        player.height / 2;


    const dx =
        meteorCenterX -
        playerCenterX;

    const dy =
        meteorCenterY -
        playerCenterY;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    return (
        distance <
        meteor.size / 2 +
        25
    );
}


// ===============================
// COLISÃO TIRO / METEORO
// ===============================

function bulletHitsMeteor(bullet, meteor) {

    return (

        bullet.x <
        meteor.x +
        meteor.size &&

        bullet.x +
        bullet.width >
        meteor.x &&

        bullet.y <
        meteor.y +
        meteor.size &&

        bullet.y +
        bullet.height >
        meteor.y
    );
}


// ===============================
// ATUALIZAR TIROS
// ===============================

function updateBullets() {

    if (shootCooldown > 0) {

        shootCooldown--;
    }


    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];

        bullet.y -=
            bullet.speed;


        if (bullet.y < -30) {

            bullets.splice(i, 1);

            continue;
        }


        // Procurar colisão

        for (
            let j = meteors.length - 1;
            j >= 0;
            j--
        ) {

            const meteor =
                meteors[j];


            if (
                bulletHitsMeteor(
                    bullet,
                    meteor
                )
            ) {

                meteor.health--;

                bullets.splice(i, 1);

                createExplosion(

                    meteor.x +
                    meteor.size / 2,

                    meteor.y +
                    meteor.size / 2
                );


                if (meteor.health <= 0) {

                    meteors.splice(j, 1);

                    score += 3;

                    scoreElement.textContent =
                        score;
                }

                break;
            }
        }
    }
}


// ===============================
// ATUALIZAR METEOROS
// ===============================

function updateMeteors() {

    meteorTimer++;


    // Quanto mais tempo passa,
    // mais meteoros aparecem.

    const spawnRate =
        Math.max(
            5,
            45 -
            difficulty * 3
        );


    if (
        meteorTimer >
        spawnRate
    ) {

        // No começo 1 meteoro.
        // Depois podem surgir vários.

        const amount =
            Math.min(
                1 +
                Math.floor(
                    difficulty / 4
                ),
                6
            );


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            createMeteor();
        }


        meteorTimer = 0;
    }


    for (
        let i = meteors.length - 1;
        i >= 0;
        i--
    ) {

        const meteor =
            meteors[i];


        meteor.y +=
            meteor.speed;


        meteor.rotation +=
            meteor.rotationSpeed;


        // Colisão com a nave

        if (
            collision(
                player,
                meteor
            )
        ) {

            createExplosion(

                meteor.x +
                meteor.size / 2,

                meteor.y +
                meteor.size / 2
            );


            meteors.splice(i, 1);

            lives--;

            livesElement.textContent =
                lives;


            if (lives <= 0) {

                endGame();
            }

            continue;
        }


        // Saiu da tela

        if (
            meteor.y >
            canvas.height +
            meteor.size
        ) {

            meteors.splice(i, 1);
        }
    }
}


// ===============================
// PARTÍCULAS
// ===============================

function updateParticles() {

    for (
        let i = particles.length - 1;
        i >= 0;
        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx;

        particle.y +=
            particle.vy;


        particle.life -=
            0.025;


        particle.size *=
            0.97;


        if (
            particle.life <= 0
        ) {

            particles.splice(i, 1);
        }
    }
}


function drawParticles() {

    for (
        const particle of particles
    ) {

        ctx.globalAlpha =
            particle.life;

        ctx.fillStyle =
            "#ff7b00";


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


// ===============================
// DIFICULDADE
// ===============================

function updateDifficulty() {

    // A dificuldade aumenta
    // a cada 10 segundos.

    difficulty =
        1 +
        Math.floor(
            gameTime / 600
        );


    // A nave fica mais rápida
    // conforme você sobrevive.

    player.speed =
        Math.min(
            7 +
            difficulty * 0.8,

            player.maxSpeed
        );
}


// ===============================
// LOOP PRINCIPAL
// ===============================

function gameLoop() {

    if (!gameRunning) return;


    gameTime++;


    drawBackground();


    movePlayer();

    updateMeteors();

    updateBullets();

    updateParticles();

    updateDifficulty();


    drawPlayer();


    for (
        const meteor of meteors
    ) {

        drawMeteor(meteor);
    }


    for (
        const bullet of bullets
    ) {

        drawBullet(bullet);
    }


    drawParticles();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ===============================
// COMEÇAR
// ===============================

function startGame() {

    menu.classList.add("hidden");

    game.classList.remove("hidden");

    gameOver.classList.add("hidden");


    player =
        createPlayer();


    meteors = [];

    bullets = [];

    particles = [];


    score = 0;

    lives = 3;

    difficulty = 1;

    gameTime = 0;

    meteorTimer = 0;

    shootCooldown = 0;


    scoreElement.textContent =
        score;

    livesElement.textContent =
        lives;


    gameRunning = true;


    createStars();


    cancelAnimationFrame(
        animationId
    );


    gameLoop();
}


// ===============================
// GAME OVER
// ===============================

function endGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationId
    );


    finalScoreElement.textContent =
        score;


    if (score > highScore) {

        highScore = score;


        localStorage.setItem(
            "naveEscapeHighScore",
            highScore
        );


        highScoreElement.textContent =
            highScore;
    }


    gameOver.classList.remove(
        "hidden"
    );
}


// ===============================
// BOTÕES
// ===============================

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

        gameOver.classList.add(
            "hidden"
        );

        game.classList.add(
            "hidden"
        );

        menu.classList.remove(
            "hidden"
        );
    }
);


// ===============================
// TECLADO
// ===============================

window.addEventListener(
    "keydown",
    (event) => {

        keys[event.key] = true;


        // ESPAÇO = ATIRAR

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            if (gameRunning) {

                shoot();
            }
        }


        if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight"
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