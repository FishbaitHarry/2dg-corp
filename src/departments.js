import { DEFAULT_ACTIONS, HOSTILE_TAKEOVER } from "./department-actions.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

export const BossOffice = {
  id: 'boss-office-id',
  displayName: 'Boss Office',
  icon: 'monitoring',
  typeId: 'boss-office',
  resources: { cash: MILLION, creditLine: 10000 },
  connections: {},
  actions: [],
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
    employees: 0, balance: 0, productivity: 1, wages: 16,
    baseProductivity: 1, morale: 110,
    corruptPoliticians: 0, cooldown: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}
export const ResearchAndDevelopment = {
  id: 'research-and-development-1',
  displayName: 'Research and Development',
  icon: 'experiment',
  typeId: 'research-and-development',
  resources: {
    employees: 0, balance: 0, productivity: 10, wages: 16,
    baseProductivity: 1, morale: 20,
    patents: 0, trashIdeas: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}
export const HostileTakeovers = {
  id: 'hostile-takeovers-1',
  displayName: 'Hostile Takeovers',
  icon: 'front_loader',
  typeId: 'hostile-takeovers',
  info: 'Buyout other companies to get their patents and employees.',
  resources: {
    employees: 0, balance: 0, wages: 16, productivity: 0,
    companiesBought: 0, patents: 0,
  },
  connections: {},
  actions: [HOSTILE_TAKEOVER],
}
export const TerminationSpecialists = {
  id: 'termination-specialists-1',
  displayName: 'Termination Specialists',
  icon: 'trending_down',
  typeId: 'termination-specialists',
  info: 'Psychopaths who love their jobs and would do it for free if not for labor laws.',
  resources: {
    employees: 0, balance: 0, productivity: 1, wages: 16,
    baseProductivity: 1, morale: 200, outplaced: 0,
  },
  connections: { mainTarget: ScamCenter },
  actions: DEFAULT_ACTIONS,
}
export const PatentTrolling = {
  id: 'patent-trolling-1',
  displayName: 'Patent Trolling',
  icon: 'sentiment_extremely_dissatisfied',
  typeId: 'patent-trolling',
  info: 'You might not know what to do with all those patents, but they do.',
  resources: {
    employees: 0, balance: 0, productivity: 1, wages: 16,
    baseProductivity: 1, morale: 100, currentPatentWars: 0,
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
}

export const allDepartments = [
  BossOffice,
  ScamCenter,
  RecruitmentAgency,
  LegalDepartment,
  EmployeeRetention,
  CorporateLobbying,
  HostileTakeovers,
  TerminationSpecialists,
  PatentTrolling,
];
export function getAvailableDepartments(state) {
  // TODO: check state.achievements here
  return [
    ScamCenter,
    RecruitmentAgency,
    LegalDepartment,
    EmployeeRetention,
    CorporateLobbying,
    HostileTakeovers,
    TerminationSpecialists,
    PatentTrolling,
  ];
}
