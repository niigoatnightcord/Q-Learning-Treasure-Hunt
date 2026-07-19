"use strict";

const ROWS = 5;
const COLS = 5;
const START = [4, 0];
const GOAL = [0, 4];
const TRAPS = new Set(["1,2", "3,3"]);

const ACTIONS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1]
];

const ACTION_NAMES = ["up", "down", "left", "right"];
const ARROWS = ["↑", "↓", "←", "→"];

let agent = [...START];
let latestReward = 0;
let totalReward = 0;
let steps = 0;
let episodes = 0;
let gameOver = false;
let aiIsRunning = false;
let qTable = createEmptyQTable();

const boardElement = document.getElementById("board");
const policyElement = document.getElementById("policy");
const rewardElement = document.getElementById("reward");
const totalRewardElement = document.getElementById("totalReward");
const stepsElement = document.getElementById("steps");
const episodesElement = document.getElementById("episodes");
const statusElement = document.getElementById("status");

const controlButtons = [
  document.getElementById("up"),
  document.getElementById("down"),
  document.getElementById("left"),
  document.getElementById("right"),
  document.getElementById("reset"),
  document.getElementById("train"),
  document.getElementById("runAI"),
  document.getElementById("clearQ")
];

function createEmptyQTable() {
  return Array.from({ length: ROWS * COLS }, () => [0, 0, 0, 0]);
}

function stateKey(position) {
  return `${position[0]},${position[1]}`;
}

function stateIndex(position) {
  return position[0] * COLS + position[1];
}

function isGoal(position) {
  return position[0] === GOAL[0] && position[1] === GOAL[1];
}

function isTerminal(position) {
  return isGoal(position) || TRAPS.has(stateKey(position));
}

function transition(state, actionIndex) {
  const [rowChange, columnChange] = ACTIONS[actionIndex];

  const nextState = [
    Math.max(0, Math.min(ROWS - 1, state[0] + rowChange)),
    Math.max(0, Math.min(COLS - 1, state[1] + columnChange))
  ];

  let reward = -0.1;

  if (isGoal(nextState)) {
    reward = 10;
  } else if (TRAPS.has(stateKey(nextState))) {
    reward = -10;
  }

  return {
    nextState,
    reward,
    done: isTerminal(nextState)
  };
}

function renderBoard() {
  boardElement.innerHTML = "";

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLS; column += 1) {
      const position = [row, column];
      const cell = document.createElement("div");
      cell.className = "cell";

      if (isGoal(position)) {
        cell.textContent = "💎";
        cell.classList.add("goal");
      } else if (TRAPS.has(stateKey(position))) {
        cell.textContent = "🕳️";
        cell.classList.add("trap");
      }

      if (agent[0] === row && agent[1] === column) {
        cell.textContent = "🤖";
        cell.classList.add("agent");
      }

      const coordinate = document.createElement("span");
      coordinate.className = "coordinate";
      coordinate.textContent = `${row},${column}`;
      cell.appendChild(coordinate);

      boardElement.appendChild(cell);
    }
  }
}

function renderPolicy() {
  policyElement.innerHTML = "";

  for (let row = 0; row < ROWS; row += 1) {
    for (let column = 0; column < COLS; column += 1) {
      const position = [row, column];
      const cell = document.createElement("div");
      cell.className = "policy-cell";

      if (isGoal(position)) {
        cell.textContent = "💎";
      } else if (TRAPS.has(stateKey(position))) {
        cell.textContent = "🕳️";
      } else {
        const values = qTable[stateIndex(position)];
        const largestValue = Math.max(...values);
        cell.textContent = largestValue === 0 ? "·" : ARROWS[chooseArgmax(values)];
      }

      policyElement.appendChild(cell);
    }
  }
}

function renderStatistics() {
  rewardElement.textContent = latestReward.toFixed(1);
  totalRewardElement.textContent = totalReward.toFixed(1);
  stepsElement.textContent = String(steps);
  episodesElement.textContent = String(episodes);
}

function render() {
  renderBoard();
  renderPolicy();
  renderStatistics();
}

function setControlsDisabled(disabled) {
  controlButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function performMove(actionIndex) {
  const result = transition(agent, actionIndex);

  agent = result.nextState;
  latestReward = result.reward;
  totalReward += result.reward;
  steps += 1;
  gameOver = result.done;

  if (result.done) {
    statusElement.textContent = isGoal(agent)
      ? `Success! The agent reached the treasure in ${steps} steps with a total reward of ${totalReward.toFixed(1)}.`
      : `The agent fell into a trap. Final total reward: ${totalReward.toFixed(1)}.`;
  } else {
    statusElement.textContent =
      `Action: ${ACTION_NAMES[actionIndex]}. New state: (${agent[0]}, ${agent[1]}). Reward: ${result.reward.toFixed(1)}.`;
  }

  render();
}

function moveAgent(actionIndex) {
  if (!gameOver && !aiIsRunning) {
    performMove(actionIndex);
  }
}

function resetGame() {
  agent = [...START];
  latestReward = 0;
  totalReward = 0;
  steps = 0;
  gameOver = false;
  statusElement.textContent = "The agent is at state (4, 0), waiting for an action.";
  render();
}

function chooseArgmax(values) {
  const largestValue = Math.max(...values);
  const bestActions = [];

  values.forEach((value, index) => {
    if (value === largestValue) {
      bestActions.push(index);
    }
  });

  return bestActions[Math.floor(Math.random() * bestActions.length)];
}

function trainAgent(numberOfEpisodes) {
  const learningRate = 0.15;
  const discountFactor = 0.95;

  for (let episode = 0; episode < numberOfEpisodes; episode += 1) {
    let state = [...START];
    const epsilon = Math.max(0.05, 0.8 * (1 - episode / numberOfEpisodes));

    for (let timeStep = 0; timeStep < 100; timeStep += 1) {
      const actionIndex =
        Math.random() < epsilon
          ? Math.floor(Math.random() * ACTIONS.length)
          : chooseArgmax(qTable[stateIndex(state)]);

      const result = transition(state, actionIndex);
      const currentIndex = stateIndex(state);
      const nextIndex = stateIndex(result.nextState);
      const futureValue = result.done ? 0 : Math.max(...qTable[nextIndex]);

      const target = result.reward + discountFactor * futureValue;
      const oldQValue = qTable[currentIndex][actionIndex];

      qTable[currentIndex][actionIndex] =
        oldQValue + learningRate * (target - oldQValue);

      state = result.nextState;

      if (result.done) {
        break;
      }
    }
  }

  episodes += numberOfEpisodes;
  statusElement.textContent =
    `Training complete: ${numberOfEpisodes.toLocaleString()} new episodes.`;
  render();
}

function delay(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function runLearnedPolicy() {
  if (aiIsRunning) {
    return;
  }

  resetGame();
  aiIsRunning = true;
  setControlsDisabled(true);

  try {
    for (let timeStep = 0; timeStep < 40; timeStep += 1) {
      if (gameOver) {
        break;
      }

      const values = qTable[stateIndex(agent)];

      if (Math.max(...values) === 0) {
        statusElement.textContent =
          "The agent has not learned a useful policy yet. Train it first.";
        break;
      }

      performMove(chooseArgmax(values));
      await delay(250);
    }

    if (!gameOver && steps >= 40) {
      statusElement.textContent =
        "The run stopped after 40 steps. More training may be needed.";
    }
  } finally {
    aiIsRunning = false;
    setControlsDisabled(false);
  }
}

document.getElementById("up").addEventListener("click", () => moveAgent(0));
document.getElementById("down").addEventListener("click", () => moveAgent(1));
document.getElementById("left").addEventListener("click", () => moveAgent(2));
document.getElementById("right").addEventListener("click", () => moveAgent(3));
document.getElementById("reset").addEventListener("click", resetGame);

document.getElementById("train").addEventListener("click", () => {
  const count = Number(document.getElementById("trainCount").value);
  trainAgent(count);
});

document.getElementById("runAI").addEventListener("click", runLearnedPolicy);

document.getElementById("clearQ").addEventListener("click", () => {
  qTable = createEmptyQTable();
  episodes = 0;
  statusElement.textContent = "The Q-table has been cleared.";
  render();
});

document.addEventListener("keydown", (event) => {
  const keyToAction = {
    ArrowUp: 0,
    ArrowDown: 1,
    ArrowLeft: 2,
    ArrowRight: 3
  };

  if (event.key in keyToAction) {
    event.preventDefault();
    moveAgent(keyToAction[event.key]);
  }
});

render();
