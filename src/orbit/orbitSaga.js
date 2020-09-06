import {all, call, put, take, takeLatest} from 'redux-saga/effects'
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider'
import {
    ORBIT_DATABASE_CREATED,
    ORBIT_DATABASE_CREATING,
    ORBIT_DATABASE_FAILED,
    ORBIT_DATABASE_LISTEN,
    ORBIT_IDENTITY_PROVIDER_ADD,
    ORBIT_IDENTITY_PROVIDER_ADDED,
    ORBIT_IDENTITY_PROVIDER_FAILED,
    ORBIT_INIT_FAILED,
    ORBIT_INITIALIZED,
    ORBIT_INITIALIZING
} from './orbitActions';

import { resolveOrbitDBTypeFun} from "./orbitUtils";

const LOGGING_PREFIX = 'orbitSaga: ';

/*
 * Add Orbit Identity Provider
 */
export function * addOrbitIdentityProvider(identityProvider) {
    try {
        yield put({ type: ORBIT_IDENTITY_PROVIDER_ADD });

        // Add Identity Provider
        Identities.addIdentityProvider(identityProvider);

        yield put({ type: ORBIT_IDENTITY_PROVIDER_ADDED });
    } catch (error) {
        yield put({ type: ORBIT_IDENTITY_PROVIDER_FAILED, error });
        console.error(LOGGING_PREFIX + 'EthereumIdentityProvider adding error:');
        console.error(error);
    }
}

export function * initOrbit(action) {
    try {
        let { breeze, id } = action;
        const { ipfs } = breeze;
        const { identityProvider, databases } = breeze.orbitOptions;

        const identity = yield call(Identities.createIdentity, { id, type: identityProvider.type});

        const orbit = yield call (OrbitDB.createInstance, ...[ipfs, { identity }]);

        breeze.orbit = orbit;

        // Create our own initial databases, as given in the options
        yield all(databases.map(db => {
            return call(createDatabase, { orbit, db });
        }));

        yield put({ type: ORBIT_INITIALIZED, orbit });

        return orbit;
    } catch (error) {
        yield put({ type: ORBIT_INIT_FAILED, error });
        console.error(LOGGING_PREFIX + 'OrbitDB initialization error:');
        console.error(error);
    }
}

/*
 * Creates an orbit database given a name and a type as its parameters
 */
export function * createDatabase({orbit, db}) {
    try {
        const dbTypeFun = resolveOrbitDBTypeFun(orbit, db.type);

        const createdDB = yield call([orbit, dbTypeFun], db.name);

        yield put({ type: ORBIT_DATABASE_CREATED, database: createdDB });

        // Wait for event channel setup before loading
        yield take(action => action.type === ORBIT_DATABASE_LISTEN && action.id === createdDB.id);

        yield call([createdDB, createdDB.load]);

        return createdDB;
    } catch (error) {
        yield put({ type: ORBIT_DATABASE_FAILED, error });
        console.error(LOGGING_PREFIX + 'OrbitDB identity provider adding error:');
        console.error(error);
    }
}

function * orbitSaga () {
    yield takeLatest(ORBIT_INITIALIZING, initOrbit);
    yield takeLatest(ORBIT_DATABASE_CREATING, createDatabase);
}

export default orbitSaga

