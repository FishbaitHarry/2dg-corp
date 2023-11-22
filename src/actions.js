const HIRE_EMPLOYEE = {
  displayName: 'Hire Employee',
  icon: 'person-plus-one',
  onClick: (dep) => { dep.resources.employees += 1 },
};

export const DEFAULT_ACTIONS = [
  HIRE_EMPLOYEE,
];
