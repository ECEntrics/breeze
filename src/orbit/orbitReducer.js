import {
    ORBIT_DB_ADDED,
    ORBIT_DB_READY,
    ORBIT_DB_REMOVED,
    ORBIT_DB_REPLICATED,
    ORBIT_DB_REPLICATING,
    ORBIT_INITIALIZING,
    ORBIT_INITIALIZED,
    ORBIT_INIT_FAILED,
    ORBIT_DB_WRITE
} from "./orbitActions";

import {
    DB_STATUS_INIT,
    DB_STATUS_READY,
    DB_STATUS_REPLICATED,
    DB_STATUS_REPLICATING,
    DB_STATUS_WRITTEN,
    DB_STATUS_REMOVED
} from "./orbitConstants";

import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";

const initialState = {
    status: STATUS_UNINITIALIZED,
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
        case ORBIT_DB_ADDED:
            return newDatabasesStatus(state, action, DB_STATUS_INIT);
        case ORBIT_DB_READY:
            return newDatabasesStatus(state, action, DB_STATUS_READY);
        case ORBIT_DB_REPLICATING:
            return newDatabasesStatus(state, action, DB_STATUS_REPLICATING);
        case ORBIT_DB_REPLICATED:
            return newDatabasesStatus(state, action, DB_STATUS_REPLICATED);
        case ORBIT_DB_WRITE:
            return newDatabasesStatus(state, action, DB_STATUS_WRITTEN);
        case ORBIT_DB_REMOVED:
            return newDatabasesStatus(state, action, DB_STATUS_REMOVED);
        default:
            return state;
    }
};

function newDatabasesStatus (state, action, status) {
    if(status !== DB_STATUS_REMOVED){
        const { timestamp, database: {id} } = action;
        // Previous values, if exist
        const lastReplication = state.databases[id] ? state.databases[id].lastReplication : null;
        const lastWrite = state.databases[id] ? state.databases[id].lastWrite : null;

        return {
            ...state,
            databases:{
                ...state.databases,
                [id]: {
                    ...state.databases[id],
                    status,
                    timestamp,
                    lastReplication: status === DB_STATUS_REPLICATED ? timestamp : lastReplication,
                    lastWrite: status === DB_STATUS_WRITTEN ? timestamp : lastWrite,
                }
            }
        }
    }
    else{
        const { address } = action;
        const {[address]: _, ...remainingDBs} = state.databases;
        return {
            ...state,
            databases: remainingDBs
        }
    }
}

export default orbitReducer;
