
export function render(rootEl, state) {
  rootEl.innerHTML = ``;
  const boundRender = () => rerenderAll(rootEl, state);
  boundRender();
  return boundRender;
}

function rerenderAll(rootEl, state) {
  rerenderDepartmentList(rootEl, state);
}

function rerenderDepartmentList(el, state) {
  state.departments.forEach((dep, i) => {
    if (el.children[i] == undefined) {
      el.append(createDepartmentEl(dep));
    }
    if (el.children[i].getAttribute('data-id') == dep.id) {
      updateDepartmentEl(el.children[i], dep);
    }
  });
}

function createDepartmentEl(dep) {
  const el = document.createElement('section');
  el.setAttribute('data-id', dep.id);
  el.addEventListener('click', evt => {
    const actionIndex = evt.target.getAttribute('data-action');
    const action = dep.actions[actionIndex];
    if (action) action.onClick(dep);
  });
  updateDepartmentEl(el, dep);
  return el;
}

function updateDepartmentEl(el, dep) {
  el.innerHTML = `
    <strong>${dep.displayName}</strong>
    <div>employees: ${dep.resources.employees}</div>
    <div>cash: ${dep.resources.cash}</div>
    ${dep.actions.map( (action, i) => `
      <button data-action="${i}">${action.displayName}</button>
    `)}
  `;
}