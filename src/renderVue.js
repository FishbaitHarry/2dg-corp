import { createApp, shallowRef, ref, triggerRef, inject, computed, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import { getAvailableDepartments } from './departments.js';
import { addDepartment, getDepartmentCost, onDepartmentDrop } from './model.js';

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
      <TopBar />
      <AlertList />
      <DepartmentList />
    </div>
  `,
}
const app = createApp(TopComponent);

app.component('TopBar', {
  setup() {
    const state = inject('state');
    return { state };
  },
  template: `
    <div class="topbar_container">
      <img class="topbar_ceo-portrait" src="./img/ceo1.png" />
      <div class="topbar_resources">
        <strong class="topbar_name">Fail Fast Corporation v0.6</strong>
        <div class="topbar_cash">Account Balance: <Currency :value="state.cash" /></div>
        <div class="topbar_income" v-if="state.income > 0">Income: <Income :value="state.income" /> per day (after tax)</div>
        <div class="topbar_income" v-if="state.income <= 0">Loss: <Income :value="state.income" /> per day</div>
      </div>
      <div class="topbar_timer" v-if="state.bankruptcyTimer">{{state.bankruptcyTimer}}</div>
      <button class="topbar_actions icon">menu</button>
    </div>
  `,
});

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
    const highlight = ref(false);
    const addEmployee = (dep) => { dep.resources.employees += 1 };
    const onDragover = (evt) => {
      evt.preventDefault();
      highlight.value = true;
      evt.dataTransfer.dropEffect = "link";
    };
    const onDragleave = (evt) => { highlight.value = false; };
    const onDrop = (evt) => {
      evt.preventDefault();
      highlight.value = false;
      onDepartmentDrop(evt, props.department, state.value);
      triggerRef(state);
    };
    return { dep: props.department, state, showDetails, highlight, addEmployee, onDragover, onDragleave, onDrop };
  },
  template: `
    <div class="dep-overview_container" :class="{highlight:highlight}" @dragover="onDragover" @dragenter="onDragover" @dragleave="onDragleave" @drop="onDrop">
      <span class="icon dep-overview_icon" @click="showDetails = true">{{dep.icon}}</span>
      <div class="dep-overview_resources" @click="showDetails = true">
        <strong class="dep-overview_name">{{dep.displayName}}</strong>
        <div class="dep-overview_employees" v-if="dep.resources.employees != undefined"><BigNumber :value="dep.resources.employees"/> employees</div>
        <div class="dep-overview_info" v-if="dep.resources.totalRaises != undefined">Raises given: {{dep.resources.totalRaises}} times</div>
        <div class="dep-overview_info" v-if="dep.resources.totalLeads != undefined">Recruited total: {{dep.resources.totalLeads}} employees</div>
        <div class="dep-overview_info" v-if="dep.resources.corruptPoliticians != undefined">Corrupt politicians: <BigNumber :value="dep.resources.corruptPoliticians" />\%</div>
        <div class="dep-overview_info" v-if="dep.resources.cooldown != undefined">Department busy: <BigNumber :value="dep.resources.cooldown" />\%</div>
        <div class="dep-overview_info" v-if="dep.resources.patents != undefined">Patents obtained: {{dep.resources.patents}}</div>
        <div class="dep-overview_info" v-if="dep.resources.currentPatentWars != undefined">Abusing: {{dep.resources.currentPatentWars}} patents</div>
        <div class="dep-overview_profit" v-if="dep.resources.balance > 0">Profit: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_loss" v-if="dep.resources.balance < 0">Loss: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
        <div class="dep-overview_info" v-if="dep.typeId == 'boss-office'">
          <div>Credit limit: <Currency :value='dep.resources.cash' /></div>
          <div>Income tax: <BigNumber :value="state.worldState.incomeTax*100" />\% of daily income</div>
          <div>Minimum wage: <Currency :value='state.worldState.minimumWage' /> per day</div>
        </div>
      </div>
      <button v-if="dep.actions.length > 0" @click="dep.actions[0].onClick(dep)" class="dep-overview_action primary-button">
        <span class="icon">{{dep.actions[0].icon}}</span>
        <span style="display:none;">{{dep.actions[0].displayName}}</span>
      </button>
      <div class="dep-overview_connections">
        <ConnectionArrow v-if="dep.connection" :from="dep" />
      </div>
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
          <InfoBox msg="Each employee takes a minimum wage of at least $16 per day." />
        </div>
        <div class="dep-overview_cash" v-if="dep.resources.cash > 0">Cash: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_cash-negative" v-if="dep.resources.cash < 0">Liability: <Currency :value='dep.resources.cash' /></div>
        <div class="dep-overview_credit" v-if="dep.resources.creditLine > 0">
          Credit limit: <Currency :value='dep.resources.creditLine' />
          <InfoBox msg="Maximum amount your balance can drop below zero before bank blocks your business. Approx equal to your highest monthly profit." />
        </div>
        <div class="dep-overview_bankrupt" v-if="dep.resources.bankrupt">BANKRUPT!</div>
        <div class="dep-overview_profit" v-if="dep.resources.balance > 0">Profit: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_loss" v-if="dep.resources.balance < 0">Loss: <Income :value='dep.resources.balance' /> per day</div>
        <div class="dep-overview_wages" v-if="dep.resources.wages">Wages: <Currency :value='dep.resources.wages' /> per employee per day</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'boss-office'">
          Current income tax: <BigNumber :value="state.worldState.incomeTax*100"/>\% of daily income
          <InfoBox msg="You only need to pay income tax if company generates profit." />
          Current minimum wage: <Currency :value='state.worldState.minimumWage' /> per day
          <InfoBox msg="Minimum wage value increases over time as Worker Unions push for them to match inflation." />
        </div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'scam-center'">Scam gain: <Income :value='dep.resources.productivity' /> per employee per day</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'recruitment-agency'">Recruits: {{dep.resources.productivity}} new hire per employee</div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'legal-department'">
          Lawsuit processing speed: {{dep.resources.productivity}}\% per employee per day
          <InfoBox msg="After it picks up a lawsuit, the department needs some time to process it. The more employees, the faster this cooldown will drop." />
        </div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'lobbying'">
          Lobbying speed: {{dep.resources.productivity}}\% per employee per day
          <InfoBox msg="Convincing a new politician takes time and effort, each new one takes more." />
        </div>
        <div class="dep-overview_productivity" v-if="dep.typeId == 'patent-trolling'">
          Lawyer efficiency: {{dep.resources.productivity}} patents can be guarded per employee
          <InfoBox msg="You must control enough patents and enough employees to extract value from them." />
        </div>
        <div class="dep-overview_info" v-if="dep.resources.totalRaises > 0">Raises given: {{dep.resources.totalRaises}}</div>
        <div class="dep-overview_info" v-if="dep.resources.cooldown != undefined">Department busy: <BigNumber :value="dep.resources.cooldown" />\%</div>
        <div class="dep-overview_info" v-if="dep.resources.patents != undefined">Patents obtained: {{dep.resources.patents}}</div>
        <div class="dep-overview_info" v-if="dep.resources.currentPatentWars != undefined">Abusing: {{dep.resources.currentPatentWars}} patents</div>
        <div class="dep-details_morale" v-if="dep.resources.morale != undefined">
          Employee morale: <BigNumber :value="dep.resources.morale" />
          <span class="icon" v-if="dep.resources.morale > 90">sentiment_satisfied</span>
          <span class="icon" v-if="dep.resources.morale <= 90 && dep.resources.morale >= 50">sentiment_neutral</span>
          <span class="icon" v-if="dep.resources.morale < 50">sentiment_dissatisfied</span>
          <InfoBox msg="Morale affects productivity. Raise the wages above the minimum to improve morale." />
        </div>
        <div class="dep-overview_info" v-if="dep.resources.corruptPoliticians != undefined">
          Corruption: <BigNumber :value="dep.resources.corruptPoliticians" />\% of all politicians are in your pocket
          <InfoBox msg="Your lobbying reduces the rate at which income tax raises proportionally to the above metric." />
        </div>
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
    const cost = computed(() => getDepartmentCost(state.value));
    return { active, submit, available, cost };
  },
  template: `
    <div class="add-dep-selector_container">
      <button type="button" v-if="!active" class="add-dep-selector_cta" @click="active=true">
        <span class="material-symbols-outlined">box_add</span>
        Add new department [<Currency :value="cost" />]
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
    <div v-for="item in openAlerts" class="alert-list_alert-container" :hidden="item.hidden">
      {{ item.message }}
      <button type="button" class="primary-button" v-if="!item.action" @click.prevent="closeAlert(item)">Ok</button>
      <button type="button" class="primary-button" v-if="!item.action" @click.prevent="item.hidden = true">I don't care</button>
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

app.component('ConnectionArrow', {
  props: ['from'],
  setup(props) {
    const state = inject('state');
    const fromIndex = state.value.departments.indexOf(props.from);
    function onDragStart(evt) {
      evt.dataTransfer.setData('text/plain', fromIndex);
      evt.dataTransfer.setData('text/coordinates', `${evt.clientX}/${evt.clientY}`);
    }
    return { state, onDragStart };
  },
  template: `
    <div :style="from.connection.style" class="dep-overview_arrow" :data-fresh="state.ticksOld">
      <div class="dep-overview_endpoint" draggable="true" @dragstart="onDragStart">link</div>
    </div>
  `,
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
