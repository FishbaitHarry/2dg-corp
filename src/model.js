import { addDepartment } from "./departments.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

// prototype
const Department = {
  id: 'fake-id-string',
  displayName: 'New Department',
  icon: 'department',
  typeId: 'default', // boss-office, scam-center, recruitment-agency, legal-dep,
  resources: {},
  connections: {},
  actions: {},
};

// no OOP allowed!
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
  message: 'Bankrupt! Your liabilities exceeded your credit limit.',
  actionLabel: 'Restart game',
  action: restartGame,
};
const LawsuitAlert = {
  message: 'Lawsuit! One of your departments has been sued and is unable to provide income while being investigated!',
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
  });
  state.ticksOld += 1;
  // some global checks, might move to a department later
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
  const { employees, productivity, wages, totalIncome } = dep.resources;
  const income = employees * productivity;
  const operatingCost = employees * wages;

  state.cash += income - operatingCost;
  dep.resources.balance = income - operatingCost;
  dep.resources.totalIncome = totalIncome + income;
  
  const { lawsuits, totalLawsuits } = dep.resources;

  dep.resources.totalLawsuits = Math.floor( (totalIncome + income) / MILLION );
  const newLawsuits = dep.resources.totalLawsuits - totalLawsuits;
  dep.resources.lawsuits = lawsuits + newLawsuits;

  if (newLawsuits > 0) {
    dep.resources.productivity = 0;
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
