import { allDepartments } from './departments.js';

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

// no OOP allowed! keep it serializable
export const GameState = {
  ticksOld: 0,
  cash: MILLION,
  yesterdayCash: MILLION,
  income: 0,
  bankruptcyTicks: 120,
  bankruptcyTimer: undefined, // or "60s"
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

export function restartGame(state) {
  state.ticksOld = 0;
  state.cash = MILLION;
  state.departments.splice(0);
  addDepartment(state, 'boss-office');
  // leave achievements and alerts alone
}

let idCounter = 0;
export function addDepartment(state, typeId) {
  const departmentCost = getDepartmentCost(state);
  const departmentProto = allDepartments.find( dep => dep.typeId == typeId );
  if (!departmentProto) throw 'Invalid department typeId';
  const newDepartment = {
    ...departmentProto,
    id: typeId + '-' + (idCounter++),
    resources: {...departmentProto.resources}, // copy resources
    connections: {}, // reset connections
  };
  state.departments.push(newDepartment);
  if (departmentProto.connections.mainTarget) {
    const lastDepartment = state.departments[state.departments.length - 2];
    setTarget(newDepartment, lastDepartment, state);
  }
  state.cash -= departmentCost;
  state.yesterdayCash -= departmentCost; // it reduces taxes and does not appear as a loss
}

export function setTarget(fromDep, toDep, state) {
  fromDep.connections.mainTarget = toDep;

  const fromIndex = state.departments.indexOf(fromDep);
  const toIndex = state.departments.indexOf(toDep);
  fromDep.connection = {
    department: toDep,
    top: (toIndex - fromIndex) * 50 + 25,
    left: fromIndex * 10,
    style: `top: ${(toIndex - fromIndex) * 50 + 25}px; bottom: 100%; left: ${fromIndex * 10}px;`,
  };
}

export function onDepartmentDrop(dropEvt, department, state) {
  const fromIndex = dropEvt.dataTransfer.getData('text/plain');
  const fromDep = state.departments[fromIndex];
  const fromCoords = dropEvt.dataTransfer.getData('text/coordinates');
  const [ startX, startY ] = fromCoords.split('/');
  const { clientX, clientY }  = dropEvt;
  const { top, left } = fromDep.connection;

  fromDep.connections.mainTarget = department;
  fromDep.connection = {
    department,
    top: top - startY + clientY,
    left: left - startX + clientX,
  };
  fromDep.connection.style = `top: ${fromDep.connection.top}px; bottom: 100%; left: ${fromDep.connection.left}px;`;
}

export function getDepartmentCost(state) {
  return (state.departments.length + 1) * state.departments.length * 20000;
}
