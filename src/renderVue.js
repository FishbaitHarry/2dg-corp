import { createApp, shallowRef, ref, triggerRef, inject, computed } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { addDepartment, getAvailableDepartments } from './departments.js';

const TopComponent = {
  setup() {
    const state = inject('state');
    function rerender() { triggerRef(state); }
    return { state, rerender };
  },
  mounted() {
    console.log(this.state)
  },
  template: `
    <div @click="rerender">
      <DepartmentList :departments="state.departments"></DepartmentList>
    </div>
  `,
}
const app = createApp(TopComponent);

app.component('DepartmentList', {
  props: ['departments'],
  setup(props) {
    const state = inject('state');
    const departments = props.departments;
    return { state, departments };
  },
  template: `
    <div class="dep-list_container">
      <div v-for="item in departments">
        <DepartmentOverview :department="item" />
      </div>
      <AddDepartmentSelector />
      <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
    </div>
    `
});

app.component('DepartmentOverview', {
  props: ['department'],
  setup(props) {
    const state = inject('state');
    return { dep: props.department, state };
  },
  template: `
    <div class="dep-overview_container">
      <span class="material-symbols-outlined" v-if="dep.icon">{{dep.icon}}</span>
      <strong class="dep-overview_name">{{dep.displayName}}</strong>
      <div class="dep-overview_employees">employees: {{dep.resources.employees}}</div>
      <div class="dep-overview_cash">cash: {{dep.resources.cash}}</div>
      <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
      <button v-for="item in dep.actions" @click="item.onClick(dep)" class="dep-overview_action">
        <span class="material-symbols-outlined" v-if="item.icon">{{item.icon}}</span> <span>{{item.displayName}}</span>
      </button>
    </div>
  `,
});

app.component('AddDepartmentSelector', {
  setup() {
    const active = ref(false);
    const state = inject('state');
    const submit = (item) => {
      addDepartment(state.value, item.typeId);
      active.value = false;
    };
    const available = computed(() => getAvailableDepartments(state.value));
    return { state, active, submit, available };
  },
  template: `
    <div class="add-dep-selector_container">
      <div v-if="!active" class="add-dep-selector_cta" @click="active=true">
        + Add new department
      </div>
      <div v-if="active">
        <span v-for="item in available" @click="submit(item)">
          {{item.displayName}}
        </span>
      </div>
    </div>
  `,
});

export function render(rootEl, state) {
  // following line makes `this.state` available in all component instances
  const stateRef = shallowRef(state);
  // app.config.globalProperties.state = stateRef;
  app.provide('state', stateRef);
  // hook it up!
  app.mount(rootEl)
  // return a refresh hook
  function rerender() { triggerRef(stateRef); }
  return rerender;
}
