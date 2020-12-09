import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";
import { BREEZE_INITIALIZING,BREEZE_INITIALIZED,  BREEZE_FAILED } from "./breezeActions";

const initialState = {
    status: STATUS_UNINITIALIZED
}

const breezeStatusReducer = (state = initialState, action) => {
    /*
     * Breeze Status
     */
    switch (action.type) {
        case BREEZE_INITIALIZING:
            return {
                ...state,
                status: STATUS_INITIALIZING
            };
        case BREEZE_INITIALIZED:
            return {
                ...state,
                status: STATUS_INITIALIZED
            };
        case BREEZE_FAILED:
            return {
                ...state,
                status: STATUS_FAILED
            };
        default:
            return state;
    }
}

export default breezeStatusReducer
