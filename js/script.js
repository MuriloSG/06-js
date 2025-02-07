const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let computerSnake = [];
let food = {};
let direction = "RIGHT";
let computerDirection = "RIGHT";
let score = 0;
let gameLoop;
let gameMode = "";
let isGameOver = false;

let ranking = JSON.parse(localStorage.getItem("snakeRanking")) || [];

function startGame(mode) {
  gameMode = mode;
  document.getElementById("startScreen").classList.add("hidden");
  canvas.classList.remove("hidden");
  initGame();
}

function initGame() {
  snake = [{ x: 10, y: 10 }];
  computerSnake = gameMode === "versus" ? [{ x: 15, y: 15 }] : [];
  direction = "RIGHT";
  computerDirection = "RIGHT";
  score = 0;
  isGameOver = false;
  generateFood();

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(update, 150);
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount),
  };
  if (
    isFoodOnSnake(food, snake) ||
    (gameMode === "versus" && isFoodOnSnake(food, computerSnake))
  ) {
    generateFood();
  }
}

function isFoodOnSnake(foodPos, snakeArray) {
  return snakeArray.some(
    (segment) => segment.x === foodPos.x && segment.y === foodPos.y
  );
}

function update() {
  moveSnake(snake, direction);

  if (gameMode === "versus") {
    computerAI();
    moveSnake(computerSnake, computerDirection);
  }

  if (
    checkCollision(snake) ||
    (gameMode === "versus" &&
      (checkCollision(computerSnake) ||
        checkSnakeCollision(snake, computerSnake)))
  ) {
    gameOver();
    return;
  }

  if (snake[0].x === food.x && snake[0].y === food.y) {
    score++;
    snake.push({});
    generateFood();
  }

  if (
    gameMode === "versus" &&
    computerSnake[0].x === food.x &&
    computerSnake[0].y === food.y
  ) {
    computerSnake.push({});
    generateFood();
  }

  draw();
}

function moveSnake(snakeArray, dir) {
  const head = { ...snakeArray[0] };
  switch (dir) {
    case "UP":
      head.y--;
      break;
    case "DOWN":
      head.y++;
      break;
    case "LEFT":
      head.x--;
      break;
    case "RIGHT":
      head.x++;
      break;
  }
  snakeArray.unshift(head);
  if (!(head.x === food.x && head.y === food.y)) {
    snakeArray.pop();
  }
}

function computerAI() {
  const head = computerSnake[0];
  const dx = food.x - head.x;
  const dy = food.y - head.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && computerDirection !== "LEFT") computerDirection = "RIGHT";
    else if (dx < 0 && computerDirection !== "RIGHT")
      computerDirection = "LEFT";
  } else {
    if (dy > 0 && computerDirection !== "UP") computerDirection = "DOWN";
    else if (dy < 0 && computerDirection !== "DOWN") computerDirection = "UP";
  }
}

function checkCollision(snakeArray) {
  const head = snakeArray[0];
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount)
    return true;
  for (let i = 1; i < snakeArray.length; i++) {
    if (head.x === snakeArray[i].x && head.y === snakeArray[i].y) return true;
  }
  return false;
}

function checkSnakeCollision(snake1, snake2) {
  return snake2.some(
    (segment) => snake1[0].x === segment.x && snake1[0].y === segment.y
  );
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#0f0";
  snake.forEach((segment) => {
    ctx.fillRect(
      segment.x * gridSize,
      segment.y * gridSize,
      gridSize - 2,
      gridSize - 2
    );
  });

  if (gameMode === "versus") {
    ctx.fillStyle = "#f00";
    computerSnake.forEach((segment) => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize - 2,
        gridSize - 2
      );
    });
  }

  ctx.fillStyle = "#ff0";
  ctx.fillRect(
    food.x * gridSize,
    food.y * gridSize,
    gridSize - 2,
    gridSize - 2
  );

  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText(`Pontuação: ${score}`, 10, 30);
}

function gameOver() {
  clearInterval(gameLoop);
  isGameOver = true;
  document.getElementById("gameOver").classList.remove("hidden");
  document.getElementById("finalScore").textContent = score;
}

function submitScore() {
  const name = document.getElementById("playerName").value.trim() || "Anônimo";
  ranking.push({ name, score, date: new Date().toISOString() });
  ranking.sort((a, b) => b.score - a.score);
  ranking = ranking.slice(0, 10);
  localStorage.setItem("snakeRanking", JSON.stringify(ranking));
  updateRankingDisplay();
}

function updateRankingDisplay() {
  const list = document.getElementById("highScores");
  list.innerHTML = "";
  ranking.forEach((entry) => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    list.appendChild(li);
  });
}

function restartGame() {
  document.getElementById("gameOver").classList.add("hidden");
  initGame();
}

document.addEventListener("keydown", (e) => {
  if (isGameOver) return;
  switch (e.key) {
    case "ArrowUp":
      if (direction !== "DOWN") direction = "UP";
      break;
    case "ArrowDown":
      if (direction !== "UP") direction = "DOWN";
      break;
    case "ArrowLeft":
      if (direction !== "RIGHT") direction = "LEFT";
      break;
    case "ArrowRight":
      if (direction !== "LEFT") direction = "RIGHT";
      break;
  }
});

updateRankingDisplay();
