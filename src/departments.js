import { DEFAULT_ACTIONS, setTarget } from "./actions.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

export const BossOffice = {
  id: 'boss-office-id',
  displayName: 'Boss Office',
  icon: 'monitoring',
  typeId: 'boss-office',
  resources: { cash: MILLION, employees: 0, creditLine: 10000 },
  connections: {},
  actions: DEFAULT_ACTIONS,
};
export const ScamCenter = {
  id: 'scam-center-1',
  displayName: 'Scam Call Center',
  icon: 'support_agent',
  typeId: 'scam-center',
  resources: {
    employees: 0, balance: 0, productivity: 22, wages: 16,
    baseProductivity: 22, morale: 100,
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
    baseProductivity: 1, morale: 110,
    totalLeads: 0
  },
  connections: { mainTarget: ScamCenter },
  actions: DEFAULT_ACTIONS,
};
export const LegalDepartment = {
  id: 'legal-department-1',
  displayName: 'Legal Department',
  icon: 'verified_user',
  typeId: 'legal-department',
  resources: {
    employees: 0, balance: 0, productivity: 1, wages: 16,
    cooldown: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}
export const EmployeeRetention = {
  id: 'employee-retention-1',
  displayName: 'Employee Retention',
  icon: 'price_change',
  typeId: 'employee-retention',
  resources: {
    employees: 0, balance: 0, productivity: 10, wages: 16,
    cooldown: 0, moraleTarget: 180, totalRaises: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}
export const CorporateLobbying = {
  id: 'lobbying-1',
  displayName: 'Corporate Lobbying',
  icon: 'account_balance',
  typeId: 'lobbying',
  resources: {
    employees: 0, balance: 0, productivity: 10, wages: 16,
    baseProductivity: 1, morale: 110,
    corruptPoliticians: 0, cooldown: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}

const allDepartments = [BossOffice, ScamCenter, RecruitmentAgency, LegalDepartment, EmployeeRetention, CorporateLobbying];
export function getAvailableDepartments(state) {
  // TODO: check state.achievements here
  return [
    ScamCenter,
    RecruitmentAgency,
    LegalDepartment,
    EmployeeRetention,
    CorporateLobbying,
  ];
}

let idCounter = 0;
export function addDepartment(state, typeId) {
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
}
