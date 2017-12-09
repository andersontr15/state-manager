class StateManager {
    constructor(initialState = {}, rootReducer = (action, state) => { return state }) {
        this.state = initialState;
        this.rootReducer = rootReducer;
        this.subscription = {
            active: false,
            fn: null 
        }
    }
    dispatch(action) {
        if(!action.type || typeof action !== 'object') throw Error('Action must be an object with a type property');
        this.state  = this.rootReducer(action, this.state);
        this.getStateIfSubscribed();
    }
    getStateIfSubscribed() {
        return this.subscription.active ? this.subscription.fn(this.state) : null
    }
    subscribe(fn) {
        this.subscription = {
            active: true,
            fn
        }
        return () => {
            this.subscription.active = false;
            this.subscription.fn = null;
        }
    }
    getState() {
        return this.state;
    }
}

const rootReducer = (action, state) => {
    switch(action.type) {
        case 'INCREMENT':
            return Object.assign(state, { counter: state.counter + 1 })
        default:
            return state;
    }
}
const sm = new StateManager({ counter: 0 }, rootReducer);
const subscription = sm.subscribe((newState) => {
    console.log('New state is ');
    console.log(newState);
});
sm.dispatch({ type: 'INCREMENT' });
sm.dispatch({ type: 'INCREMENT' });
sm.dispatch({ type: 'INCREMENT' });
sm.dispatch({ type: 'INCREMENTS' });

module.exports = StateManager;