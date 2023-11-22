import { DEFAULT_ACTIONS } from "./actions.js";

const MILLION = 1000000;
const TOO_MUCH = Number.MAX_SAFE_INTEGER + 1;

export const BossOffice = {
  id: 'boss-office-id',
  displayName: 'Boss Office',
  icon: 'department',
  typeId: 'boss-office',
  resources: { cash: MILLION, employees: 1 },
  connections: {},
  actions: DEFAULT_ACTIONS,
};
export const ScamCenter = {
  id: 'scam-center-1',
  displayName: 'Scam Call Center',
  icon: 'department',
  typeId: 'scam-center',
  resources: {
    cash: 10000, employees: 1, productivity: 1.5, wages: 1,
    totalIncome: 0, lawsuits: 0, totalLawsuits: 0
  },
  connections: {},
  actions: DEFAULT_ACTIONS,
};
export const RecruitmentAgency = {
  id: 'recruitment-agency-1',
  displayName: 'Recruitment Agency',
  icon: 'department',
  typeId: 'recruitment-agency',
  resources: {
    cash: 0, employees: 0, productivity: 1, wages: 1,
    totalLeads: 0
  },
  connections: { mainTarget: ScamCenter },
  actions: DEFAULT_ACTIONS,
};
