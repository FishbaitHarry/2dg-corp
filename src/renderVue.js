import { createApp, shallowRef, ref, triggerRef, inject } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

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
    const departments = props.departments;
    return { departments };
  },
  template: `
    <div class="dep-list_container">
      <div v-for="item in departments">
        <DepartmentOverview :department="item" />
      </div>
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
    <strong class="dep-overview_name">{{dep.displayName}}</strong>
    <div class="dep-overview_employees">employees: {{dep.resources.employees}}</div>
    <div class="dep-overview_cash">cash: {{dep.resources.cash}}</div>
    <div class="dep-overview_ticks">ticksOld is {{state.ticksOld}}</div>
    <button v-for="item in dep.actions" @click="item.onClick(dep)" class="dep-overview_action">{{item.displayName}}</button>
    </div>
  `,
});

const MyComponent = {
  setup(props) {
    const count = ref(0)
    const name = ref(props.name);

    // expose the ref to the template
    return {
      count, name
    }
  },
  template: `
    <button @click="count++">
      You {{ name }} clicked me {{ count }} times.
    </button>`
}
app.component('MyComponent', MyComponent);

// Vue is just too smart for this project, it only rerenders smallest parts of template.

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
