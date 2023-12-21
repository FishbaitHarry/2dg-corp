const HIRE_EMPLOYEE = {
  displayName: 'Hire Employee',
  icon: 'person_add',
  onClick: (dep) => { dep.resources.employees += 1 },
};

const FIRE_EMPLOYEE = {
  displayName: 'Fire Employee',
  icon: 'local_fire_department',
  onClick: (dep) => { dep.resources.employees -= 1 },
};

const INCREASE_WAGES = {
  displayName: 'Increase Wages',
  icon: 'price_check',
  onClick: (dep) => { dep.resources.wages += 1; dep.resources.morale += 20; },
};

const SHOW_INFO = {
  displayName: 'Learn More',
  icon: 'help',
  onClick: (dep) => { dep.showInfo = true },
}

export const DEFAULT_ACTIONS = [
  HIRE_EMPLOYEE,
  FIRE_EMPLOYEE,
  INCREASE_WAGES,
  SHOW_INFO,
];
