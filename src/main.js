import { GameState, onTickModel } from "./model.js";
import { render } from "./renderVue.js";
import { BossOffice } from './departments.js';

const rootEl = document.getElementById('app');
const gameState = Object.assign({}, GameState);
gameState.departments.push(BossOffice)

const clock = setInterval(gameLoop, 500);
const rerender = render(rootEl, gameState);

function gameLoop() {
  onTickModel(gameState); // mutates gameState!
  rerender();
  if (gameState.ticksOld > 200) clearInterval(clock);
}
