function createProxy({
  initialContext,
  initialState,
  states
}, { onUpdate }) {
  let context = {...initialContext};
  let state = initialState;

  const isValidState = (stateName) => {
    if (!states.hasOwnProperty(stateName)) {
      return false;
      console && console.warn(`Unknown state ${stateName}`);
    }
    return true;
  };

  const getState = () => state;
  const getContext = () => context;

  const setState = stateName => {
    state = isValidState(stateName) ? stateName : state;
  };
  const setContext = (ctx) => {
    context = ctx;
    return context;
  }
  const updateContext = (ctx) => {
    context = {...context, ...ctx};
    return context;
  }
  const update = (nextState, updater) => {
    if(!isValidState(nextState)) {
      return false;
    }
    const prevState = state;
    state = nextState;
    updater && updateContext(updater(context));

    onUpdate && onUpdate.map(fn => fn(
      context,
      {state : {prev: prevState, current: state}}
    ));
    return context;
  }

  const machine = {
    setState,
    getState,
    getContext,
    setContext,
    updateContext,
    update
  };

  Object.entries(initialContext).forEach(([key]) => {
    Object.defineProperty(machine, key, {
      // Only allow directly reading context attributes
      get() { return context[key]; }
    })
  });

  return machine;
}

function createMachine({context, initial, states}, { onUpdate }) {
  return createProxy({
    initialContext: context,
    initialState: initial,
    states
  }, { onUpdate });
}

let machine = createMachine({
  context: {result: 10, error: undefined},
  initial: 'init',
  states: {
  	init: {},
    loading: {},
    success: {},
    error: {},
  }
}, {
  onUpdate: [
    (ctx, event) => console.log('onUpdate event', event)
  ]
});

function debug(machine) {
  console.log(`{result, error, state}`);
  // console.log(`{${JSON.stringify(machine.getContext(), null, 2)}, ${machine.getState()}}`);
  console.log(`{${machine.result}, ${machine.error}, ${machine.getState()}}`);
}

console.clear();
// machine.setState("success");
debug(machine);
console.log('');
machine.updateContext({error: 'Oh no!'});
machine.setState("error");
debug(machine);
console.log('')
machine.result = 20;
debug(machine);
console.log('')
machine.update("success", ctx => ({result: 200}));
debug(machine);