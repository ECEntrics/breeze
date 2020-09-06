import * as BreezeActions from './breezeActions'

const initialState = {
    initialized: false
}

const breezeStatusReducer = (state = initialState, action) => {
    /*
     * Breeze Status
     */
    if (action.type === BreezeActions.BREEZE_INITIALIZED) {
        return {
            ...state,
            initialized: true
        }
    }
    return state
}

export default breezeStatusReducer
