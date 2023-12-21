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
      <DepartmentList />
    </div>
  `,
}
const app = createApp(TopComponent);

app.component('DepartmentList', {
  setup() {
    const state = inject('state');
    const departments = computed(() => state.value.departments);
    return { departments };
  },
  template: `
    <div class="dep-list_container">
      <template v-for="item in departments" :key="item.id">
        <DepartmentOverview :department="item" />
      </template>
      <AddDepartmentSelector />
    </div>
    `
});

app.component('DepartmentOverview', {
  props: ['department'],
  setup(props) {
    const state = inject('state');
    const showDetails = ref(false);
    const addEmployee = (dep) => { dep.resources.employees += 1 };
    return { dep: props.department, state, showDetails, addEmployee };
  },
  template: `
    <div class="dep-overview_container">
      <span class="material-symbols-outlined dep-overview_icon" v-if="dep.icon">{{dep.icon}}</span>
      <div class="dep-overview_resources" @click="showDetails = true">
        <strong class="dep-overview_name">{{dep.displayName}}</strong>
        <div class="dep-overview_employees" v-if="dep.resources.employees"><BigNumber :value="dep.resources.employees"/> employees</div>
        <div class="dep-overview_cash" v-if="dep.resources.cash > 0">Cash: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_cash-negative" v-if="dep.resources.cash < 0">Liability: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_info" v-if="dep.resources.cooldown > 0">Department busy: {{dep.resources.cooldown}}\%</div>
        <div class="dep-overview_profit" v-if="dep.resources.balance > 0">Profit: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_loss" v-if="dep.resources.balance < 0">Loss: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
      </div>
      <button @click="addEmployee(dep)" class="dep-overview_action primary-button">
        <span class="material-symbols-outlined">person_add</span>
        <span style="display:none;">Hire Employee</span>
      </button>
      <div class="dep-details_overlay" v-if="showDetails" @click="showDetails = false" />
      <DepartmentDetails :department="dep" v-if="showDetails" />
    </div>
  `,
});


app.component('DepartmentDetails', {
  props: ['department'],
  setup(props) {
    const state = inject('state');
    return { dep: props.department, state };
  },
  template: `
    <div class="dep-details_container">
      <span class="material-symbols-outlined dep-overview_icon" v-if="dep.icon">{{dep.icon}}</span>
      <div class="dep-details_resources">
        <strong class="dep-overview_name">{{dep.displayName}}</strong>
        <div class="dep-overview_employees" v-if="dep.resources.employees">
          <BigNumber :value="dep.resources.employees"/> employees
          <InfoBox msg="Each employee takes a minimum wage of $16 per day." />
        </div>
        <div class="dep-overview_cash" v-if="dep.resources.cash > 0">Cash: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_cash-negative" v-if="dep.resources.cash < 0">Liability: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_credit" v-if="dep.resources.creditLine > 0">
          Credit limit: <Currency :value='dep.resources.cash' />
          <InfoBox msg="Maximum amount your balance can drop below zero before bank blocks your business. Approx equal to your highest monthly profit." />
        </div>
        <div class="dep-overview_bankrupt" v-if="dep.resources.bankrupt">BANKRUPT!</div>
        <div class="dep-overview_profit" v-if="dep.resources.balance > 0">Profit: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_loss" v-if="dep.resources.balance < 0">Loss: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_wages" v-if="dep.resources.wages">Wages: <Currency :value='dep.resources.wages' /> per employee per day</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'scam-center'">Scam gain: \${{dep.resources.productivity}} per employee per day</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'recruitment-agency'">Recruits: {{dep.resources.productivity}} new hire per employee</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'legal-department'">
          Lawsuit processing speed: {{dep.resources.productivity}}\% per employee per day
          <InfoBox msg="After it picks up a lawsuit, the department needs some time to process it. The more employees, the faster this cooldown will drop." />
        </div>
        <div class="dep-overview_info" v-if="dep.resources.cooldown > 0">Department busy: {{dep.resources.cooldown}}\%</div>
        <div class="dep-overview_bankrupt" v-if="dep.resources.lawsuits > 0">Department closed due to pending lawsuits!</div>
        <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
      </div>
      <button v-for="item in dep.actions" @click="item.onClick(dep)" class="dep-details_action primary-button">
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
    return { active, submit, available };
  },
  template: `
    <div class="add-dep-selector_container">
      <button type="button" v-if="!active" class="add-dep-selector_cta" @click="active=true">
        <span class="material-symbols-outlined">box_add</span>
        Add new department
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
      const uniqueAlerts = newState.alerts.filter( a => openAlerts.value.indexOf(a) == -1 );
      openAlerts.value.push(...uniqueAlerts);
      state.value.alerts.splice(0); // remove all
    });
    function closeAlert(item) {
      const index = openAlerts.value.indexOf(item);
      openAlerts.value.splice(index, 1);
    }
    return { openAlerts, closeAlert, state };
  },
  template: `
    <div v-for="item in openAlerts" class="alert-list_alert-container">
      {{ item.message }}
      <button type="button" class="primary-button" v-if="!item.action" @click.prevent="closeAlert(item)">X</button>
      <button type="button" class="primary-button" v-if="item.action" @click="item.action(state), closeAlert(item)">{{item.actionLabel}}</button>
    </div>
  `,
});

app.component('InfoBox', {
  props: ['msg'],
  template: `
    <div class="dep-overview_description">
      <div class="material-symbols-outlined">info</div>
      {{ msg }}
    </div>`,
});

const CURRENCY_FORMAT = new Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const NUMBER_FORMAT = new Intl.NumberFormat('en-EN'); // just adds commas every 3 digits
app.component('Currency', {
  props: ['value'],
  setup(props) { return { formatted: computed(() => CURRENCY_FORMAT.format(props.value)) }; },
  template: `<span :class="{ 'currency-positive':value>0, 'currency-negative':value<0 }">{{ formatted }}</span>`,
});
app.component('Income', {
  props: ['value'],
  setup(props) { return { formatted: computed(() => CURRENCY_FORMAT.format(props.value)) }; },
  template: `<span :class="{ 'income-positive':value>0, 'income-negative':value<0 }">{{ formatted }}</span>`,
});
app.component('BigNumber', {
  props: ['value'],
  setup(props) { return { formatted: computed(() => NUMBER_FORMAT.format(props.value)) }; },
  template: `<span :class="{ 'bignumber-positive':value>0, 'bignumber-negative':value<0 }">{{ formatted }}</span>`,
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
