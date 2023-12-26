import { addDepartment } from "./departments.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

// no OOP allowed! keep it serializable
export const GameState = {
  ticksOld: 0,
  cash: MILLION,
  departments: [],
  worldState: {
    inflation: 0,
    inflationRate: 1,
    minimumWage: 16, // unit: dollars per employee per day
    governmentGreed: 0,
    governmentGreedRate: 1,
    incomeTax: 0.01, // unit: multiplier of your income that gets taken
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
const IncomeTaxAlert = {
  typeId: 'income-tax',
  message: 'Seems like the Income Tax is eating more than half of your profits! Consider lobbying against tax hikes.'
}

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
    if (dep.typeId == 'employee-retention') onTickRetention(dep, state);
    if (dep.typeId == 'lobbying') onTickLobbying(dep, state);
  });
  state.ticksOld += 1;
  // inflation
  state.worldState.inflation += state.worldState.inflationRate;
  if (state.worldState.inflation > 240) {
    state.worldState.inflation = 0;
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
  // income tax
  state.worldState.governmentGreed += state.worldState.governmentGreedRate;
  if (state.worldState.governmentGreed >= 100) {
    state.worldState.governmentGreed -= 100;
    state.worldState.incomeTax += 0.1;
    if (state.worldState.incomeTax > 0.5) {
      state.alerts.push(IncomeTaxAlert);
    }
  }
  // check cash flow, income, credit and bankruptcy
  const resources = state.departments[0].resources;
  const lastDayIncome = state.cash - resources.cash;
  const incomeTaxes = lastDayIncome * state.worldState.incomeTax;
  if (incomeTaxes > 0) state.cash -= incomeTaxes;
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
  const { employees, wages } = dep.resources;
  const { baseProductivity, morale } = dep.resources;
  const moraleMultiplier = Math.max(0.1, (morale + 100) / 200);
  const productivity = baseProductivity * (moraleMultiplier);
  const operatingCost = employees * wages;
  const newLeads = Math.floor(employees * productivity);

  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.totalLeads += newLeads;
  dep.resources.productivity = productivity; // just for info

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
  dep.resources.cooldown = Math.max(0, dep.resources.cooldown - cooldownReduction);
}

function onTickRetention(dep, state) {
  const { employees, productivity, wages, moraleTarget } = dep.resources;
  const operatingCost = employees * wages;
  const cooldownReduction = employees * productivity;

  const mainTarget = state.departments.find(dep => dep.resources.morale < moraleTarget);
  if (!dep.resources.cooldown && mainTarget && employees) {
    mainTarget.resources.wages += 1;
    mainTarget.resources.morale += 20;
    dep.resources.totalRaises += 1;
    dep.resources.cooldown += 100;
  }
  
  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.cooldown = Math.max(0, dep.resources.cooldown - cooldownReduction);
}

function onTickLobbying(dep, state) {
  const { employees, wages, corruptPoliticians } = dep.resources;
  const { baseProductivity, morale } = dep.resources;
  const operatingCost = employees * wages;
  const moraleMultiplier = Math.max(0.1, (morale + 100) / 200);
  const corruptionMultiplier = 1 - corruptPoliticians / 100;
  const productivity = baseProductivity * (corruptionMultiplier) * (moraleMultiplier);
  const cooldownReduction = employees * productivity;

  if (!dep.resources.cooldown && employees) {
    dep.resources.corruptPoliticians += 1;
    dep.resources.cooldown += 100;
  }
  
  state.worldState.governmentGreedRate = corruptionMultiplier;
  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.cooldown = Math.max(0, dep.resources.cooldown - cooldownReduction);
}
