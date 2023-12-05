const HIRE_EMPLOYEE = {
  displayName: 'Hire Employee',
  icon: 'person_add',
  onClick: (dep) => { dep.resources.employees += 1 },
};

export const DEFAULT_ACTIONS = [
  HIRE_EMPLOYEE,
];
