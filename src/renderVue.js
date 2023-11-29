import { createApp, shallowRef, ref, triggerRef, inject, computed, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
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
      <AlertList />
      <DepartmentList :departments="state.departments" />
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
      <div class="dep-overview_employees">{{dep.resources.employees}} employees</div>
      <div class="dep-overview_cash" v-if="dep.resources.cash > 0">Cash: \${{dep.resources.cash}}</div>
      <div class="dep-overview_cash-negative" v-if="dep.resources.cash < 0">Liability: \${{dep.resources.cash}} Bankruptcy warning!</div>
      <div class="dep-overview_profit" v-if="dep.resources.balance > 0">Profit: \${{dep.resources.balance}} per day</div>
      <div class="dep-overview_loss" v-if="dep.resources.balance < 0">Loss: \${{dep.resources.balance}} per day</div>
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
      <button type="button" v-if="!active" class="add-dep-selector_cta" @click="active=true">
        + Add new department
      </button>
      <div v-if="active" class="add-dep-selector_list">
        <button type="button" v-for="item in available" @click="submit(item)" class="add-dep-selector_option">
          <div class="material-symbols-outlined">{{item.icon}}</div>
          <div class="add-dep-selector_label">{{item.displayName}}</div>
        </button>
      </div>
    </div>
  `,
});

app.component('AlertList', {
  setup() {
    const state = inject('state');
    const openAlerts = ref([]);
    watch( state, (newState, oldState) => {
      if (!newState.alerts) return;
      // sucks up all alerts from state and saves them internally
      openAlerts.value.push(...newState.alerts);
      state.value.alerts.splice(0); // remove all
    });
    function closeAlert(item) {
      const index = openAlerts.value.indexOf(item);
      openAlerts.value.splice(index, 1);
    }
    return { openAlerts, closeAlert };
  },
  template: `
    <div v-for="item in openAlerts" class="alert-list_alert-container">
      {{ item.message }} <a href="#" @click.prevent="closeAlert(item)">X</a>
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
