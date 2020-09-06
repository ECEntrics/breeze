import {ORBIT_DATABASE_CREATED} from "./orbitActions";
import {BREEZE_INITIALIZED} from "../breezeStatus/breezeActions";

export const orbitMiddleware = breezeInstance => () => next => action => {
    const { type } = action

    if (type === BREEZE_INITIALIZED)
        breezeInstance = action.breeze

    if (type === ORBIT_DATABASE_CREATED) {
        const { database } = action;
        breezeInstance.orbitDatabases[database.id] = database;
    }
    return next(action);
}

const initializedMiddleware = orbitMiddleware(undefined)
export default initializedMiddleware
