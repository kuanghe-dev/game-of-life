const canvas = document.getElementById("canvas");

const ROWS = 50;
const COLS = 80;
const CELLSIZE = 10;
const cells = Array(ROWS).fill().map(() => Array(COLS));
const cellAlive = Array(ROWS).fill().map(() => Array(COLS));
const cellAliveOrig = Array(ROWS).fill().map(() => Array(COLS));

let gameInterval = {
  paused: false,
  intervalID: null,
  intervalIdx: 2,
  intervals: [480, 240, 120, 60, 30, 15, 7],

  isPaused() {
    return this.paused;
  },

  set() {
    this.clear();
    this.intervalID = setInterval(step, this.intervals[this.intervalIdx]);
    this.paused = false;
  },

  clear() {
    if (this.intervalID)
      clearInterval(this.intervalID);
    this.intervalID = null;
    this.paused = true;
  },

  speedUp() {
    this.intervalIdx = Math.min(this.intervalIdx + 1, this.intervals.length - 1);
    this.updateSpeed();
  },

  speedDown() {
    this.intervalIdx = Math.max(this.intervalIdx - 1, 0);
    this.updateSpeed();
  },

  updateSpeed() {
    let speedDiv = document.getElementById("speed");
    speedDiv.innerText = `${this.intervalIdx + 1} / ${this.intervals.length}`;
    if (!this.isPaused())
      gameInterval.set();
  },
};

initializeCanvas();
startGame();

// -------------------- rendering --------------------

function initializeCanvas() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let cell = document.createElement("div");
      cell.style.position = "absolute";
      cell.style.border = "1px solid #aaa";
      cell.style.left = j * CELLSIZE + "px";
      cell.style.top = i * CELLSIZE + "px";
      cell.style.width = CELLSIZE + "px";
      cell.style.height = CELLSIZE + "px";
      canvas.appendChild(cell);
      cells[i][j] = cell;
      cellAlive[i][j] = false;
    }
  }
}

function drawCanvas() {
  for (let i = 0; i < ROWS; i++)
    for (let j = 0; j < COLS; j++)
      cells[i][j].style.background = cellAlive[i][j] ? "black" : "white";
}

function step() {
  for (let i = 0; i < ROWS; i++)
    for (let j = 0; j < COLS; j++)
      cellAliveOrig[i][j] = cellAlive[i][j];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let liveNeighbors = countLiveNeighbors(cellAliveOrig, i, j);
      cellAlive[i][j] =
        (cellAliveOrig[i][j] && (liveNeighbors === 2 || liveNeighbors === 3)) ||
        (!cellAliveOrig[i][j] && liveNeighbors === 3);
    }
  }

  drawCanvas();
}

// -------------------- interaction --------------------

window.addEventListener("keydown", (e) => {
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }
  e.preventDefault();
  switch (e.key) {
    case " ":
      pauseOrResume();
      break;
    case "R":
    case "r":
      startGame();
      break;
    case "ArrowUp":
      gameInterval.speedUp();
      break;
    case "ArrowDown":
      gameInterval.speedDown();
      break;
  }
});

function pauseOrResume() {
  if (gameInterval.isPaused())
    resumeGame();    
  else
    pauseGame();
}

function pauseGame() {
  let pauseDiv = document.getElementById("pause");
  pauseDiv.innerText = "Paused!";
  gameInterval.clear();
  canvas.style.borderColor = "red";
}

function resumeGame() {
  let pauseDiv = document.getElementById("pause");
  pauseDiv.innerText = "";
  gameInterval.set();
  canvas.style.borderColor = "black";
}

function startGame() {
  makeInitialState();
  // makeInitialState_glider();
  drawCanvas();
  gameInterval.updateSpeed();
}

// -------------------- utilities --------------------

function countLiveNeighbors(isAlive, row, col) {
  let res = 0;
  for (dr = -1; dr <= 1; dr++) {
    for (dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0)
        continue;
      let rowNew = (row + dr + ROWS) % ROWS;
      let colNew = (col + dc + COLS) % COLS;
      res += isAlive[rowNew][colNew];
    }
  }
  return res;
}

function makeInitialState_glider() {
  let startCells = [
    [3, 4],
    [4, 5],
    [5, 3],
    [5, 4],
    [5, 5],
  ];

  for (let i = 0; i < startCells.length; i++)
    cellAlive[startCells[i][0]][startCells[i][1]] = true;
}

function makeInitialState() {
  for (let i = 0; i < ROWS; i++)
    for (let j = 0; j < COLS; j++)
      cellAlive[i][j] = (Math.random() < 0.5);
}