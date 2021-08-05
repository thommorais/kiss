import { createStore, combineReducers, applyMiddleware } from "redux"
import { composeWithDevTools } from "redux-devtools-extension"

import frames from "./frames"
import scenes from "./scenes"

const composeEnhancers = composeWithDevTools({})

const store = createStore(
    combineReducers({
        frames,
        scenes
    }),

    composeEnhancers(applyMiddleware())
)

// store.subscribe(() => console.log(store.getState()))

export default store
