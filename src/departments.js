import { DEFAULT_ACTIONS } from "./actions.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

export const BossOffice = {
  id: 'boss-office-id',
  displayName: 'Boss Office',
  icon: 'monitoring',
  typeId: 'boss-office',
  resources: { cash: MILLION, employees: 1, creditLine: 10000 },
  connections: {},
  actions: DEFAULT_ACTIONS,
};
export const ScamCenter = {
  id: 'scam-center-1',
  displayName: 'Scam Call Center',
  icon: 'monetization_on',
  typeId: 'scam-center',
  resources: {
    employees: 0, balance: 0, productivity: 18, wages: 16,
    totalIncome: 0, lawsuits: 0, totalLawsuits: 0
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
};
export const RecruitmentAgency = {
  id: 'recruitment-agency-1',
  displayName: 'Recruitment Agency',
  icon: 'cases',
  typeId: 'recruitment-agency',
  resources: {
    employees: 0, balance: 0, productivity: 1, wages: 16,
    totalLeads: 0
  },
  connections: { mainTarget: ScamCenter },
  actions: DEFAULT_ACTIONS,
};

export function getAvailableDepartments(state) {
  // TODO: check state.achievements here
  return [
    ScamCenter,
    RecruitmentAgency,
  ];
}
export function addDepartment(state, typeId) {
  const departmentProto = getAvailableDepartments(state).find( dep => dep.typeId == typeId );
  if (!departmentProto) throw 'Invalid department typeId';
  const lastDepartment = state.departments[state.departments.length - 1]; // only placeholder
  const newDepartment = {
    ...departmentProto,
    id: typeId + '-' + state.ticksOld, // new id
    resources: {...departmentProto.resources}, // copy resources
    connections: { mainTarget: lastDepartment }, // reset connections
  };
  state.departments.push(newDepartment);
}
