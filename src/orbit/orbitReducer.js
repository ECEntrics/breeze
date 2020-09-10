import {
    ORBIT_DATABASE_CREATED,
    ORBIT_DATABASE_READY,
    ORBIT_DATABASE_REPLICATED,
    ORBIT_DATABASE_REPLICATING,
    ORBIT_INITIALIZING,
    ORBIT_INITIALIZED,
    ORBIT_INIT_FAILED
} from "./orbitActions";

import {
    DB_STATUS_INIT,
    DB_STATUS_READY,
    DB_STATUS_REPLICATED,
    DB_STATUS_REPLICATING,
} from "./orbitConstants";

import {STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";

const initialState = {
    status: STATUS_INITIALIZING,
    databases: {}
};

const orbitReducer = (state = initialState, action) => {
    switch (action.type) {
        case ORBIT_INITIALIZING:
            return {
                ...state,
                status: STATUS_INITIALIZING
            };
        case ORBIT_INITIALIZED:
            return {
                ...state,
                status: STATUS_INITIALIZED
            };
        case ORBIT_INIT_FAILED:
            return {
                ...state,
                status: STATUS_FAILED
            };
        case ORBIT_DATABASE_CREATED:
            return newDatabasesStatus(state, action, DB_STATUS_INIT);
        case ORBIT_DATABASE_READY:
            return newDatabasesStatus(state, action, DB_STATUS_READY);
        case ORBIT_DATABASE_REPLICATING:
            return newDatabasesStatus(state, action, DB_STATUS_REPLICATING);
        case ORBIT_DATABASE_REPLICATED:
            return newDatabasesStatus(state, action, DB_STATUS_REPLICATED);
        default:
            return state;
    }
};

function newDatabasesStatus (state, action, status) {
    return {
        ...state,
        databases:{
            ...state.databases,
            [action.database.id]: {
                ...state[action.database.id],
                status,
                timestamp: action.timestamp
            }
        }
    }
}


export default orbitReducer;
