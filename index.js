const util = require('util');

class StateManager {
    
    constructor(
        initialState = {}, 
        rootReducer = (action, state) => { return state },
        middlewares = [],
    ) {
        this.state = initialState;
        this.rootReducer = rootReducer;
        this.subscription = {
            active: false,
            fn: null 
        },
        this.middlewares = middlewares;
        this.history = [];
    }
    applyMiddleware(...fns) {
      this.middlewares = this.middlewares.concat(fns);
    }
    dispatch(action, middlewares) {
        if(!action.type || !util.isObject(action)) throw Error('Action must be an object with a type property');
        if(this.middlewares.length > 0) {
            this.middlewares.forEach(middleware => {
                util.isFunction(middleware) ? middleware(this.state) : null 
            })
        }
        console.log(this.state)
        console.log(this.history)
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
    getVisualization() {
        if(this.history.length > 0) {
            this.history.forEach(slice => {
                console.log(slice.timeStamp, slice.currentState)
            })
        }
    }
    replaceReducer(nextRootReducer) {
        if(util.isFunction(nextRootReducer)) {
            this.rootReducer = nextRootReducer;
        }
        else {
            throw TypeError(`Expected new reducer to be of type function but instead
            received ${nextRootReducer}`)
        }
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

const loggerMiddleware = state => {
    console.log(
        `Current state is ${state}`
    )
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
sm.applyMiddleware(loggerMiddleware);
sm.getVisualization();


if(typeof module === 'object') {
    module.exports = StateManager;
}