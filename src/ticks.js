import { BankruptcyAlert, LawsuitAlert, InflationAlert, IncomeTaxAlert } from './alerts.js';

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
    if (dep.typeId == 'hostile-takeovers') onTickHostileTakeovers(dep, state);
    if (dep.typeId == 'termination-specialists') onTickTerminationSpecialists(dep, state);
    if (dep.typeId == 'patent-trolling') onTickPatentTrolling(dep, state);
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
  const lastDayIncome = state.cash - state.yesterdayCash;
  const incomeTaxes = lastDayIncome * state.worldState.incomeTax;
  if (incomeTaxes > 0) state.cash -= incomeTaxes;
  state.income = state.cash - state.yesterdayCash;

  resources.cash = state.yesterdayCash = state.cash;

  if (resources.cash < -1 * resources.creditLine) {
    state.bankruptcyTicks -= 1;
    state.bankruptcyTimer = Math.floor(state.bankruptcyTicks/2)+'s';
    resources.bankruptcyWarning = true;
  } else {
    state.bankruptcyTicks = 120; //reset
    state.bankruptcyTimer = undefined;
  }
  if (state.bankruptcyTicks == 0) {
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
  
  dep.resources.totalLawsuits = Math.floor( (totalIncome + income) / 1000000 );
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
  dep.resources.productivity = productivity; // just for info
}

function onTickHostileTakeovers(dep, state) {
  const { employees, wages } = dep.resources;
  const operatingCost = employees * wages;

  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
}

function onTickTerminationSpecialists(dep, state) {
  const { employees, wages, baseProductivity, morale } = dep.resources;
  const moraleMultiplier = Math.max(0.1, (morale + 100) / 200);
  const productivity = baseProductivity * (moraleMultiplier);
  const operatingCost = employees * wages;
  const outplacements = Math.floor(employees * productivity);

  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.totalOutplacements += outplacements;
  dep.resources.productivity = productivity; // just for info
  dep.resources.morale = 200; // always happy!

  const { mainTarget } = dep.connections;
  if (mainTarget && mainTarget.resources.employees) {
    mainTarget.resources.employees = Math.max(0, mainTarget.resources.employees - outplacements);
  }
}

function onTickPatentTrolling(dep, state) {
  const { employees, wages, baseProductivity, morale } = dep.resources;
  const moraleMultiplier = Math.max(0.1, (morale + 100) / 200);
  const productivity = baseProductivity * (moraleMultiplier);
  const operatingCost = employees * wages;
  const maxPatentWars = Math.floor(employees * productivity);
  
  state.cash -= operatingCost;
  dep.resources.balance = -1 * operatingCost;
  dep.resources.productivity = productivity; // just for info
  dep.resources.currentPatentWars = 0;
  
  const mainTarget = state.departments.find(dep => dep.resources.patents > 0);
  if (mainTarget) {
    const currentPatentWars = Math.min(maxPatentWars, mainTarget.resources.patents);
    const patentIncome = currentPatentWars * 10000;

    dep.resources.currentPatentWars = currentPatentWars;
    state.cash += patentIncome;
    dep.resources.balance += patentIncome;
  }
}
