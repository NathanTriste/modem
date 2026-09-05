// ============================================
// NAVE ESCAPE
// v1.0.0.1
// ============================================


// ============================================
// CANVAS
// ============================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================
// ELEMENTOS HTML
// ============================================

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const gameOver =
    document.getElementById("gameOver");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const menuButton =
    document.getElementById("menuButton");

const scoreText =
    document.getElementById("score");

const livesText =
    document.getElementById("lives");

const highScoreText =
    document.getElementById("highScore");

const finalScoreText =
    document.getElementById("finalScore");


// ============================================
// VARIÁVEIS DO JOGO
// ============================================

let player;

let meteors = [];

let bullets = [];

let particles = [];

let stars = [];

let keys = {};

let score = 0;

let lives = 3;

let difficulty = 1;

let gameTime = 0;

let meteorTimer = 0;

let shootCooldown = 0;

let gameRunning = false;

let animationId;


// ============================================
// RECORDE
// ============================================

let highScore =
    Number(
        localStorage.getItem(
            "naveEscapeHighScore"
        )
    ) || 0;

highScoreText.textContent =
    highScore;


// ============================================
// TAMANHO DO CANVAS
// ============================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;


    if (player) {

        player.y =
            canvas.height - 120;

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
}


window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ============================================
// CRIAR JOGADOR
// ============================================

function createPlayer() {

    return {

        x:
            canvas.width / 2 - 25,

        y:
            canvas.height - 120,

        width: 50,

        height: 60,

        speed: 7,

        maxSpeed: 16
    };
}


// ============================================
// CRIAR METEORO
// ============================================

function createMeteor() {

    const size =
        Math.random() * 35 + 25;


    meteors.push({

        x:
            Math.random() *
            (canvas.width - size),

        y:
            -size,

        size:
            size,

        speed:
            Math.random() * 3 +
            3 +
            difficulty * 0.8,

        rotation:
            Math.random() *
            Math.PI * 2,

        rotationSpeed:
            (Math.random() - 0.5) *
            0.08,

        health:
            size > 48 ? 2 : 1
    });
}


// ============================================
// ATIRAR
// ============================================

function shoot() {

    if (!gameRunning)
        return;


    if (shootCooldown > 0)
        return;


    bullets.push({

        x:
            player.x +
            player.width / 2 -
            3,

        y:
            player.y - 20,

        width: 6,

        height: 24,

        speed: 16
    });


    // Pequeno intervalo
    // entre os tiros

    shootCooldown = 7;
}


// ============================================
// CRIAR EXPLOSÃO
// ============================================

function createExplosion(
    x,
    y
) {

    for (
        let i = 0;
        i < 25;
        i++
    ) {

        particles.push({

            x: x,

            y: y,

            vx:
                (Math.random() - 0.5) *
                9,

            vy:
                (Math.random() - 0.5) *
                9,

            size:
                Math.random() * 5 + 2,

            life: 1
        });
    }
}


// ============================================
// CRIAR ESTRELAS
// ============================================

function createStars() {

    stars = [];

    for (
        let i = 0;
        i < 180;
        i++
    ) {

        stars.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() * 2,

            speed:
                Math.random() * 2 + 0.5
        });
    }
}


createStars();


// ============================================
// FUNDO
// ============================================

function drawBackground() {

    ctx.fillStyle =
        "#02040a";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    for (
        const star of stars
    ) {

        star.y +=
            star.speed +
            difficulty * 0.15;


        if (
            star.y >
            canvas.height
        ) {

            star.y = 0;

            star.x =
                Math.random() *
                canvas.width;
        }


        ctx.globalAlpha =
            Math.random() *
            0.6 +
            0.4;


        ctx.fillStyle =
            "white";


        ctx.fillRect(

            star.x,

            star.y,

            star.size,

            star.size
        );
    }


    ctx.globalAlpha = 1;
}


// ============================================
// DESENHAR NAVE
// ============================================

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
        42 +
        Math.random() * 12
    );

    ctx.lineTo(10, 20);

    ctx.closePath();

    ctx.fillStyle =
        "#ff7b00";

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#ff5500";

    ctx.fill();


    // NAVE

    ctx.beginPath();

    ctx.moveTo(
        0,
        -30
    );

    ctx.lineTo(
        25,
        25
    );

    ctx.lineTo(
        0,
        15
    );

    ctx.lineTo(
        -25,
        25
    );

    ctx.closePath();

    ctx.fillStyle =
        "#00d9ff";

    ctx.shadowBlur = 15;

    ctx.shadowColor =
        "#00d9ff";

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

    ctx.fillStyle =
        "white";

    ctx.shadowBlur = 10;

    ctx.shadowColor =
        "white";

    ctx.fill();


    ctx.restore();
}


// ============================================
// DESENHAR METEORO
// ============================================

function drawMeteor(meteor) {

    ctx.save();


    ctx.translate(

        meteor.x +
        meteor.size / 2,

        meteor.y +
        meteor.size / 2
    );


    ctx.rotate(
        meteor.rotation
    );


    ctx.beginPath();


    const points = 9;


    for (
        let i = 0;
        i < points;
        i++
    ) {

        const angle =
            (Math.PI * 2 / points) *
            i;


        const radius =
            meteor.size / 2 *
            (
                0.75 +
                Math.random() * 0.25
            );


        const x =
            Math.cos(angle) *
            radius;

        const y =
            Math.sin(angle) *
            radius;


        if (i === 0) {

            ctx.moveTo(
                x,
                y
            );

        } else {

            ctx.lineTo(
                x,
                y
            );
        }
    }


    ctx.closePath();


    ctx.fillStyle =
        "#777";


    ctx.strokeStyle =
        "#aaa";


    ctx.lineWidth = 2;


    ctx.fill();

    ctx.stroke();


    ctx.restore();
}


// ============================================
// DESENHAR TIRO
// ============================================

function drawBullet(bullet) {

    ctx.save();


    // Brilho

    ctx.shadowBlur = 20;

    ctx.shadowColor =
        "#00ffff";


    // Núcleo

    ctx.fillStyle =
        "#ffffff";


    ctx.fillRect(

        bullet.x,

        bullet.y,

        bullet.width,

        bullet.height
    );


    // Aura

    ctx.shadowBlur = 30;

    ctx.fillStyle =
        "#00ffff";


    ctx.fillRect(

        bullet.x - 2,

        bullet.y,

        bullet.width + 4,

        bullet.height
    );


    ctx.restore();
}


// ============================================
// MOVER JOGADOR
// ============================================

function movePlayer() {

    if (
        keys["ArrowLeft"] ||
        keys["a"] ||
        keys["A"]
    ) {

        player.x -=
            player.speed;
    }


    if (
        keys["ArrowRight"] ||
        keys["d"] ||
        keys["D"]
    ) {

        player.x +=
            player.speed;
    }


    if (
        player.x < 0
    ) {

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


// ============================================
// ATUALIZAR TIROS
// ============================================

function updateBullets() {

    if (
        shootCooldown > 0
    ) {

        shootCooldown--;
    }


    for (
        let i = bullets.length - 1;
        i >= 0;
        i--
    ) {

        const bullet =
            bullets[i];


        // Movimento

        bullet.y -=
            bullet.speed;


        // Saiu da tela

        if (
            bullet.y <
            -50
        ) {

            bullets.splice(
                i,
                1
            );

            continue;
        }


        // Verificar meteoros

        for (
            let j = meteors.length - 1;
            j >= 0;
            j--
        ) {

            const meteor =
                meteors[j];


            const hit =

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
                meteor.y;


            if (hit) {

                // Dano

                meteor.health--;


                createExplosion(

                    meteor.x +
                    meteor.size / 2,

                    meteor.y +
                    meteor.size / 2
                );


                bullets.splice(
                    i,
                    1
                );


                // Destruiu

                if (
                    meteor.health <= 0
                ) {

                    meteors.splice(
                        j,
                        1
                    );


                    score += 3;


                    scoreText.textContent =
                        score;
                }


                break;
            }
        }
    }
}


// ============================================
// COLISÃO NAVE / METEORO
// ============================================

function playerMeteorCollision(
    meteor
) {

    const playerCenterX =
        player.x +
        player.width / 2;


    const playerCenterY =
        player.y +
        player.height / 2;


    const meteorCenterX =
        meteor.x +
        meteor.size / 2;


    const meteorCenterY =
        meteor.y +
        meteor.size / 2;


    const dx =
        playerCenterX -
        meteorCenterX;


    const dy =
        playerCenterY -
        meteorCenterY;


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


// ============================================
// ATUALIZAR METEOROS
// ============================================

function updateMeteors() {

    meteorTimer++;


    // Quanto maior a dificuldade,
    // menor o intervalo.

    const spawnRate =
        Math.max(
            5,
            45 -
            difficulty * 4
        );


    if (
        meteorTimer >=
        spawnRate
    ) {

        // Mais meteoros com o tempo

        const amount =
            Math.min(
                1 +
                Math.floor(
                    difficulty / 3
                ),
                7
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


        // Colisão

        if (
            playerMeteorCollision(
                meteor
            )
        ) {

            createExplosion(

                meteor.x +
                meteor.size / 2,

                meteor.y +
                meteor.size / 2
            );


            meteors.splice(
                i,
                1
            );


            lives--;


            livesText.textContent =
                lives;


            if (
                lives <= 0
            ) {

                endGame();

                return;
            }


            continue;
        }


        // Saiu da tela

        if (
            meteor.y >
            canvas.height +
            meteor.size
        ) {

            meteors.splice(
                i,
                1
            );
        }
    }
}


// ============================================
// ATUALIZAR PARTÍCULAS
// ============================================

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

            particles.splice(
                i,
                1
            );
        }
    }
}


// ============================================
// DESENHAR PARTÍCULAS
// ============================================

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


// ============================================
// AUMENTAR DIFICULDADE
// ============================================

function updateDifficulty() {

    // A cada aproximadamente
    // 10 segundos aumenta.

    difficulty =
        1 +
        Math.floor(
            gameTime / 600
        );


    // Nave fica mais rápida

    player.speed =
        Math.min(

            7 +
            difficulty * 0.8,

            player.maxSpeed
        );
}


// ============================================
// LOOP DO JOGO
// ============================================

function gameLoop() {

    if (!gameRunning)
        return;


    gameTime++;


    drawBackground();


    movePlayer();


    updateMeteors();


    updateBullets();


    updateParticles();


    updateDifficulty();


    drawPlayer();


    // Meteoros

    for (
        const meteor of meteors
    ) {

        drawMeteor(
            meteor
        );
    }


    // TIROS

    for (
        const bullet of bullets
    ) {

        drawBullet(
            bullet
        );
    }


    drawParticles();


    animationId =
        requestAnimationFrame(
            gameLoop
        );
}


// ============================================
// COMEÇAR JOGO
// ============================================

function startGame() {

    menu.classList.add(
        "hidden"
    );


    game.classList.remove(
        "hidden"
    );


    gameOver.classList.add(
        "hidden"
    );


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


    scoreText.textContent =
        "0";


    livesText.textContent =
        "3";


    gameRunning = true;


    createStars();


    cancelAnimationFrame(
        animationId
    );


    gameLoop();
}


// ============================================
// GAME OVER
// ============================================

function endGame() {

    gameRunning = false;


    cancelAnimationFrame(
        animationId
    );


    finalScoreText.textContent =
        score;


    // Novo recorde

    if (
        score > highScore
    ) {

        highScore =
            score;


        localStorage.setItem(

            "naveEscapeHighScore",

            highScore
        );


        highScoreText.textContent =
            highScore;
    }


    gameOver.classList.remove(
        "hidden"
    );
}


// ============================================
// BOTÃO JOGAR
// ============================================

startButton.addEventListener(
    "click",
    startGame
);


// ============================================
// RECOMEÇAR
// ============================================

restartButton.addEventListener(
    "click",
    startGame
);


// ============================================
// VOLTAR AO MENU
// ============================================

menuButton.addEventListener(
    "click",
    function() {

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


// ============================================
// TECLADO
// ============================================

window.addEventListener(
    "keydown",
    function(event) {

        keys[event.key] = true;


        // =================================
        // ESPAÇO = TIRO
        // =================================

        if (
            event.code === "Space"
        ) {

            event.preventDefault();

            shoot();
        }


        // Evita a página
        // de rolar

        if (
            event.code === "ArrowLeft" ||
            event.code === "ArrowRight" ||
            event.code === "Space"
        ) {

            event.preventDefault();
        }
    }
);


window.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;
    }
);