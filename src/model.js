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
  worldState: {},
  achievements: {},
  alerts: [{message:'Objective: Make as much money as possible before you are made bankrupt!'}],
};

export function onTickModel(state) {
  state.departments.forEach(dep => {
    if (dep.typeId == 'scam-center') onTickScams(dep, state);
    if (dep.typeId == 'recruitment-agency') onTickRecruits(dep, state);
  });
  // just for display in the boss office
  state.departments[0].resources.cash = state.cash;
  state.ticksOld += 1;
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
