import { addDepartment } from "./departments.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

// no OOP allowed! keep it serializable
export const GameState = {
  ticksOld: 0,
  cash: MILLION,
  departments: [],
  worldState: {
    minimumWage: 16, // unit: dollars per employee per day
    incomeTax: 0.2, // unit: multiplies your yearly income?
    corporateTax: 1, // unit: ???
  },
  achievements: {},
  alerts: [{
    message: 'Objective: Make as much money as possible!'
  }],
};

const BankruptcyAlert = {
  typeId: 'bankrupt',
  message: 'Bankrupt! Your liabilities exceeded your credit limit.',
  actionLabel: 'Restart game',
  action: restartGame,
};
const LawsuitAlert = {
  typeId: 'lawsuit',
  message: 'Lawsuit! One of your departments has been sued and is unable to provide income while being investigated!',
};
const InflationAlert = {
  typeId: 'inflation',
  message: 'Due to global inflation, all minimal wage worker\'s wages have been increased.',
};

export function restartGame(state) {
  state.ticksOld = 0;
  state.cash = MILLION;
  state.departments.splice(0);
  addDepartment(state, 'boss-office');
  // leave achievements and alerts alone
}

export function onTickModel(state) {
  // endgame condition
  if (state.departments[0].resources.bankrupt) return;
  // cycle all deps
  state.departments.forEach(dep => {
    if (dep.typeId == 'scam-center') onTickScams(dep, state);
    if (dep.typeId == 'recruitment-agency') onTickRecruits(dep, state);
    if (dep.typeId == 'legal-department') onTickLegal(dep, state);
  });
  state.ticksOld += 1;
  // inflation
  if (state.ticksOld % 240 == 0) {
    state.worldState.minimumWage += 1;
    state.alerts.push(InflationAlert);
    state.departments.forEach(dep => {
      if (dep.resources.wages < state.worldState.minimumWage) {
        dep.resources.wages = state.worldState.minimumWage;
      }
    });
  }
  // employee burnout
  if (state.ticksOld % 20 == 0) {
    state.departments.forEach(dep => {
      if (dep.resources.morale > 0 && dep.resources.employees > 0) {
        dep.resources.morale -= 1;
      }
    });
  }
  // check cash flow, income, credit and bankruptcy
  const resources = state.departments[0].resources;
  const lastDayIncome = state.cash - resources.cash;
  resources.cash = state.cash;
  if (resources.cash < 0) {
    resources.bankruptcyWarning = true;
  }
  if (resources.cash < -1 * resources.creditLine) {
    resources.bankrupt = true;
    state.alerts.push(BankruptcyAlert);
  }
  if (lastDayIncome * 30 > resources.creditLine) {
    resources.creditLine = lastDayIncome * 30;
  }
}

function onTickScams(dep, state) {
  const { employees, wages, totalIncome } = dep.resources;
  const { lawsuits, totalLawsuits } = dep.resources;
  const { baseProductivity, morale } = dep.resources;
  const moraleMultiplier = Math.max(0.1, (morale + 100) / 200);
  const productivity = baseProductivity * (lawsuits ? 0 : 1) * (moraleMultiplier);
  const income = employees * productivity * (lawsuits ? 0 : 1);
  const operatingCost = employees * wages;

  state.cash += income - operatingCost;
  dep.resources.balance = income - operatingCost;
  dep.resources.totalIncome = totalIncome + income;
  dep.resources.productivity = productivity; // just for info
  
  dep.resources.totalLawsuits = Math.floor( (totalIncome + income) / MILLION );
  const newLawsuits = dep.resources.totalLawsuits - totalLawsuits;
  dep.resources.lawsuits = lawsuits + newLawsuits;

  if (newLawsuits > 0) {
    state.alerts.push(LawsuitAlert);
  }
}

function onTickRecruits(dep, state) {
  const { employees, productivity, wages } = dep.resources;
  const operatingCost = employees * wages;
  const newLeads = employees * productivity;

  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.totalLeads += newLeads;

  const { mainTarget } = dep.connections;
  if (mainTarget) {
    mainTarget.resources.employees += newLeads;
  }
}

function onTickLegal(dep, state) {
  const { employees, productivity, wages } = dep.resources;
  const operatingCost = employees * wages;
  const cooldownReduction = employees * productivity;

  // currently scans all departments for lawsuits, not one target
  const mainTarget = state.departments.find(dep => dep.resources.lawsuits > 0);
  if (dep.resources.cooldown <= 0 && mainTarget) {
    const potentialWork = Math.ceil(cooldownReduction / 100);
    const maxWork = Math.min(mainTarget.resources.lawsuits, potentialWork);
    mainTarget.resources.lawsuits -= maxWork;
    dep.resources.cooldown = 100 * maxWork;
  }
  
  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.cooldown -= cooldownReduction;
}
