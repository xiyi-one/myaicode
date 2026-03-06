const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartButton = document.getElementById("restart");

const GRAVITY = 0.35;
const FLAP_POWER = -6.5;
const PIPE_SPEED = 2.2;
const PIPE_WIDTH = 60;
const PIPE_GAP = 165;
const PIPE_INTERVAL = 1400;
const FLOOR_HEIGHT = 70;

const bird = {
  x: 90,
  y: canvas.height / 2,
  radius: 14,
  velocity: 0,
};

let pipes = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let started = false;
let lastPipeTime = 0;
let lastFrame = performance.now();

function resetGame() {
  bird.y = canvas.height / 2;
  bird.velocity = 0;
  pipes = [];
  score = 0;
  gameOver = false;
  started = false;
  lastPipeTime = performance.now();
  draw();
}

function flap() {
  if (gameOver) {
    return;
  }
  started = true;
  bird.velocity = FLAP_POWER;
}

function spawnPipe() {
  const topHeight = 80 + Math.random() * (canvas.height - FLOOR_HEIGHT - PIPE_GAP - 160);
  pipes.push({
    x: canvas.width,
    topHeight,
    passed: false,
  });
}

function update(deltaMs) {
  const delta = deltaMs / 16.67;

  if (started && !gameOver) {
    bird.velocity += GRAVITY * delta;
    bird.y += bird.velocity * delta;

    if (performance.now() - lastPipeTime > PIPE_INTERVAL) {
      spawnPipe();
      lastPipeTime = performance.now();
    }

    pipes.forEach((pipe) => {
      pipe.x -= PIPE_SPEED * delta;
      const gapTop = pipe.topHeight;
      const gapBottom = gapTop + PIPE_GAP;

      const hitPipeHorizontally =
        bird.x + bird.radius > pipe.x && bird.x - bird.radius < pipe.x + PIPE_WIDTH;
      const hitPipeVertically = bird.y - bird.radius < gapTop || bird.y + bird.radius > gapBottom;

      if (hitPipeHorizontally && hitPipeVertically) {
        gameOver = true;
      }

      if (!pipe.passed && pipe.x + PIPE_WIDTH < bird.x) {
        pipe.passed = true;
        score += 1;
        bestScore = Math.max(bestScore, score);
      }
    });

    pipes = pipes.filter((pipe) => pipe.x + PIPE_WIDTH > -10);

    if (bird.y + bird.radius >= canvas.height - FLOOR_HEIGHT || bird.y - bird.radius <= 0) {
      gameOver = true;
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "#9be0ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff55";
  ctx.beginPath();
  ctx.arc(80, 110, 35, 0, Math.PI * 2);
  ctx.arc(108, 105, 26, 0, Math.PI * 2);
  ctx.arc(130, 110, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(280, 170, 30, 0, Math.PI * 2);
  ctx.arc(305, 165, 24, 0, Math.PI * 2);
  ctx.arc(328, 170, 28, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  pipes.forEach((pipe) => {
    const gapBottom = pipe.topHeight + PIPE_GAP;
    ctx.fillStyle = "#1f9d55";
    ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
    ctx.fillRect(pipe.x, gapBottom, PIPE_WIDTH, canvas.height - gapBottom - FLOOR_HEIGHT);

    ctx.fillStyle = "#177a42";
    ctx.fillRect(pipe.x - 5, pipe.topHeight - 18, PIPE_WIDTH + 10, 18);
    ctx.fillRect(pipe.x - 5, gapBottom, PIPE_WIDTH + 10, 18);
  });
}

function drawBird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(Math.min(Math.max(bird.velocity / 12, -0.6), 0.8));

  ctx.fillStyle = "#ffd166";
  ctx.beginPath();
  ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.moveTo(bird.radius - 1, -2);
  ctx.lineTo(bird.radius + 12, 3);
  ctx.lineTo(bird.radius - 1, 8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111";
  ctx.beginPath();
  ctx.arc(4, -4, 2.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFloor() {
  ctx.fillStyle = "#7cc957";
  ctx.fillRect(0, canvas.height - FLOOR_HEIGHT, canvas.width, FLOOR_HEIGHT);

  ctx.fillStyle = "#5ca03e";
  for (let i = 0; i < canvas.width; i += 24) {
    ctx.fillRect(i, canvas.height - FLOOR_HEIGHT, 12, 8);
  }
}

function drawUI() {
  ctx.fillStyle = "#05324a";
  ctx.font = "bold 28px system-ui";
  ctx.fillText(`Score: ${score}`, 14, 36);

  ctx.font = "600 18px system-ui";
  ctx.fillText(`Best: ${bestScore}`, 14, 62);

  if (!started && !gameOver) {
    ctx.font = "700 24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Click or press Space to start", canvas.width / 2, canvas.height / 2 - 20);
    ctx.textAlign = "start";
  }

  if (gameOver) {
    ctx.fillStyle = "#0000008f";
    ctx.fillRect(40, canvas.height / 2 - 80, canvas.width - 80, 150);

    ctx.fillStyle = "#fff";
    ctx.font = "700 30px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 30);
    ctx.font = "500 20px system-ui";
    ctx.fillText("Press Restart to play again", canvas.width / 2, canvas.height / 2 + 10);
    ctx.textAlign = "start";
  }
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
  drawFloor();
  drawUI();
}

function gameLoop(timestamp) {
  const deltaMs = timestamp - lastFrame;
  lastFrame = timestamp;
  update(deltaMs);
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener("pointerdown", flap);
restartButton.addEventListener("click", resetGame);

resetGame();
requestAnimationFrame(gameLoop);
