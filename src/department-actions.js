const HIRE_EMPLOYEE = {
  displayName: 'Hire Employee',
  icon: 'person_add',
  onClick: (dep) => { dep.resources.employees += 1; },
};

const FIRE_EMPLOYEE = {
  displayName: 'Fire Employee',
  icon: 'local_fire_department',
  onClick: (dep) => { dep.resources.employees = Math.max(0, dep.resources.employees - 1); },
};

const INCREASE_WAGES = {
  displayName: 'Increase Wages',
  info: 'Increases morale slightly (+20 morale, max.200) and thus productivity.',
  icon: 'price_check',
  onClick: (dep) => { dep.resources.wages += 1; dep.resources.morale = Math.min(200, dep.resources.morale + 20); },
};

const SHOW_INFO = {
  displayName: 'Learn More',
  icon: 'help',
  onClick: (dep) => { dep.showInfo = true },
};

const SET_TARGET = {
  displayName: 'Set Target',
  icon: 'help',
  onClick: (dep) => { dep.showInfo = true },
};

export const HOSTILE_TAKEOVER = {
  displayName: 'Buy a company',
  icon: 'receipt_long',
  onClick: (dep) => {
    dep.resources.companiesBought += 1;
    dep.resources.patents += (dep.resources.companiesBought + 1);
    dep.resources.employees += dep.resources.companiesBought * (dep.resources.companiesBought + 1) * 1000;
  },
}

export const DEFAULT_ACTIONS = [
  HIRE_EMPLOYEE,
  FIRE_EMPLOYEE,
  INCREASE_WAGES,
  SHOW_INFO,
];
