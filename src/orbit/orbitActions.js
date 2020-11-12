// OrbitDB Status
export const ORBIT_INITIALIZING = 'ORBIT_INITIALIZING';
export const ORBIT_INITIALIZED = 'ORBIT_INITIALIZED';
export const ORBIT_INIT_FAILED = 'ORBIT_INIT_FAILED';

// Identity Provider Status
export const ORBIT_IDENTITY_PROVIDER_ADD = 'ORBIT_IDENTITY_PROVIDER_ADD';
export const ORBIT_IDENTITY_PROVIDER_ADDED = 'ORBIT_IDENTITY_PROVIDER_ADDED';
export const ORBIT_IDENTITY_PROVIDER_FAILED = 'ORBIT_IDENTITY_PROVIDER_FAILED';

// Database Status
export const ORBIT_DB_ADD = 'ORBIT_DB_ADD';
export const ORBIT_DB_ADDED = 'ORBIT_DB_ADDED';
export const ORBIT_DB_REMOVE = 'ORBIT_DB_REMOVE';
export const ORBIT_DB_REMOVED = 'ORBIT_DB_REMOVED';
export const ORBIT_DB_ALREADY_ADDED = 'ORBIT_DB_ALREADY_ADDED';
export const ORBIT_DB_ALREADY_REMOVED = 'ORBIT_DB_ALREADY_REMOVED';
export const ORBIT_DB_LISTEN = 'ORBIT_DB_LISTEN';
export const ORBIT_DB_ERROR = 'ORBIT_DB_ERROR';

// Database Events
export const ORBIT_DB_READY = 'ORBIT_DB_READY';
export const ORBIT_DB_REPLICATING = 'ORBIT_DB_REPLICATING';
export const ORBIT_DB_REPLICATED = 'ORBIT_DB_REPLICATED';
export const ORBIT_DB_WRITE = 'ORBIT_DB_WRITE';

export function orbitInit (breeze, id) {
    return {
        type: ORBIT_INITIALIZING,
        breeze,
        id
    }
}

// dbInfo = {address, type}    (where address can also be a name)
export function addOrbitDB (dbInfo) {
    return {
        type: ORBIT_DB_ADD,
        dbInfo
    }
}

// dbInfo = {address, type}    (where address can also be a name)
export function removeOrbitDB (dbInfo) {
    return {
        type: ORBIT_DB_REMOVE,
        dbInfo
    }
}

