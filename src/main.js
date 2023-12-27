import { GameState, restartGame } from "./model.js";
import { onTickModel } from './ticks.js';
import { render } from "./renderVue.js";

const rootEl = document.getElementById('app');
const gameState = Object.assign({}, GameState);
restartGame(gameState);

const clock = setInterval(gameLoop, 500);
const rerender = render(rootEl, gameState);

function gameLoop() {
  onTickModel(gameState); // mutates gameState!
  rerender();
}

// for debug
window.gameState = gameState;
window.gamePause = () => clearInterval(clock);
