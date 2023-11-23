import { GameState, onTickModel } from "./model.js";
import { render } from "./renderVue.js";
import { BossOffice, ScamCenter, RecruitmentAgency } from './departments.js';

const rootEl = document.getElementById('app');
const gameState = Object.assign({}, GameState);
gameState.departments.push(BossOffice, ScamCenter, RecruitmentAgency)

const clock = setInterval(gameLoop, 500);
const rerender = render(rootEl, gameState);

function gameLoop() {
  onTickModel(gameState); // mutates gameState!
  rerender();
  if (gameState.ticksOld > 100) clearInterval(clock);
}
