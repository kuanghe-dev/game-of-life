const canvas = document.getElementById("canvas");

const ROWS = 50;
const COLS = 80;
const CELLSIZE = 10;
const cells = Array(ROWS).fill().map(() => Array(COLS));
const cellAlive = Array(ROWS).fill().map(() => Array(COLS));

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
  const cellAliveOrig = Array(ROWS);
  for (let i = 0; i < ROWS; i++)
    cellAliveOrig[i] = [...cellAlive[i]];

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
  
  switch (e.key) {
    case " ":
      e.preventDefault();
      pauseOrResume();
      break;
    case "R":
    case "r":
      e.preventDefault();
      startGame();
      break;
    case "ArrowUp":
      e.preventDefault();
      gameInterval.speedUp();
      break;
    case "ArrowDown":
      e.preventDefault();
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

function makeInitialState() {
  for (let i = 0; i < ROWS; i++)
    for (let j = 0; j < COLS; j++)
      cellAlive[i][j] = false;

  if (window.location.search === "")
    makeRandomState();
  else if (window.location.search === "?1")
    makeSpaceships();
  else if (window.location.search === "?2") {
    makeStillLifes();
    makeOscillators();
  }
}

function makeRandomState() {
  for (let i = 0; i < ROWS; i++)
    for (let j = 0; j < COLS; j++)
      cellAlive[i][j] = (Math.random() < 0.5);
}

function makeSpaceships(row0=2, col0=2) {
  let glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
  let lightWeightSpaceship = [[0, 0], [0, 3], [1, 4], [2, 0], [2, 4], [3, 1],
                              [3, 2], [3, 3], [3, 4]];
  let middleWeightSpaceship = [[0, 2], [1, 0], [1, 4], [2, 5], [3, 0], [3, 5],
                               [4, 1], [4, 2], [4, 3], [4, 4], [4, 5]];
  let heavyWeightSpaceship = [[0, 2], [0, 3], [1, 0], [1, 5], [2, 6], [3, 0],
                              [3, 6], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6]];
 
  let objects = [
    lightWeightSpaceship,
    middleWeightSpaceship,
    heavyWeightSpaceship,
    glider,
  ];

  for (let obj of objects) {
    for (let [row, col] of obj)
      cellAlive[row + row0][col + col0] = true;
    row0 += 12;
  }
}

function makeStillLifes() {
  let block = [[0, 0], [0, 1], [1, 0], [1, 1]];
  let beehive = [[0, 1], [0, 2], [1, 0], [1, 3], [2, 1], [2, 2]];
  let loaf = [[0, 1], [0, 2], [1, 0], [1, 3], [2, 1], [2, 3], [3, 2]];
  let boat = [[0, 0], [0, 1], [1, 0], [1, 2], [2, 1]];
  let tub = [[0, 1], [1, 0], [1, 2], [2, 1]];

  let objects = [block, beehive, loaf, boat, tub];
  let row0 = 10;
  let col0 = 28;
  let startPos = [[row0, col0], [row0, col0+8], [row0, col0+17], [row0, col0+26], [row0, col0+35]];

  let idx = 0;
  for (let obj of objects) {
    for (let [row, col] of obj)
      cellAlive[row + startPos[idx][0]][col + startPos[idx][1]] = true;
    idx += 1
  }
}

function makeOscillators() {
  let blinker = [[0, 0], [0, 1], [0, 2]];
  let toad = [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [1, 2]];
  let beacon = [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]];
  let pulsar = [[0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [0, 10],
                [2, 0], [2, 5], [2, 7], [2, 12],
                [3, 0], [3, 5], [3, 7], [3, 12],
                [4, 0], [4, 5], [4, 7], [4, 12],
                [5, 2], [5, 3], [5, 4], [5, 8], [5, 9], [5, 10],
                [7, 2], [7, 3], [7, 4], [7, 8], [7, 9], [7, 10],
                [8, 0], [8, 5], [8, 7], [8, 12],
                [9, 0], [9, 5], [9, 7], [9, 12],
                [10, 0], [10, 5], [10, 7], [10, 12],
                [12, 2], [12, 3], [12, 4], [12, 8], [12, 9], [12, 10]];
  let Pentadecathlon = [[0, 2], [1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2],
                        [2, 3], [2, 4], [9, 0], [9, 1], [9, 2], [9, 3], [9, 4],
                        [10, 1], [10, 2], [10, 3], [11, 2]];

  let objects = [blinker, toad, beacon, pulsar, Pentadecathlon];
  let startPos = [[10, 15], [22, 15], [35, 15], [23, 34], [23, 61]];

  let idx = 0;
  for (let obj of objects) {
    for (let [row, col] of obj)
      cellAlive[row + startPos[idx][0]][col + startPos[idx][1]] = true;
    idx += 1
  }
}