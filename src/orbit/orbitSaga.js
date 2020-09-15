import { all, call, put, spawn, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga';
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider'

import {
    ORBIT_DATABASE_CREATED,
    ORBIT_DATABASE_CREATING,
    ORBIT_DATABASE_FAILED,
    ORBIT_DATABASE_LISTEN,
    ORBIT_DATABASE_READY,
    ORBIT_DATABASE_REPLICATED,
    ORBIT_DATABASE_REPLICATING,
    ORBIT_IDENTITY_PROVIDER_ADD,
    ORBIT_IDENTITY_PROVIDER_ADDED,
    ORBIT_IDENTITY_PROVIDER_FAILED,
    ORBIT_INIT_FAILED,
    ORBIT_INITIALIZED,
    ORBIT_INITIALIZING
} from './orbitActions';

import { resolveOrbitDBTypeFun} from './orbitUtils';

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
        console.error(LOGGING_PREFIX + 'IdentityProvider adding error:');
        console.error(error);
    }
}

function * initOrbit(action) {
    try {
        let { breeze, id } = action;
        const { ipfs } = breeze;
        const { identityProvider, databases } = breeze.orbitOptions;

        const identity = yield call(Identities.createIdentity, { id, type: identityProvider.type});

        const orbit = yield call (OrbitDB.createInstance, ...[ipfs, { identity }]);

        breeze.orbit = orbit;

        // Create initial databases from options
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
function * createDatabase({ orbit, db }) {
    try {
        const dbTypeFun = resolveOrbitDBTypeFun(orbit, db.type);

        const createdDB = yield call([orbit, dbTypeFun], db.name);

        yield put({ type: ORBIT_DATABASE_CREATED, database: createdDB, timestamp: +new Date });

        // Event channel setup
        yield spawn(callListenForOrbitDatabaseEvent, { database: createdDB });

        // Wait for event channel setup before loading
        yield take(action => action.type === ORBIT_DATABASE_LISTEN && action.id === createdDB.id);

        yield call([createdDB, createdDB.load]);

        return createdDB;
    } catch (error) {
        yield put({ type: ORBIT_DATABASE_FAILED, error });
        console.error(LOGGING_PREFIX + 'OrbitDB database creation error:');
        console.error(error);
    }
}


/*
 * Database Events
 * See also https://redux-saga.js.org/docs/advanced/Channels.html
 */
function createOrbitDatabaseChannel (database){
    return eventChannel(emit => {
        const onReady = () => {
            emit({ type: ORBIT_DATABASE_READY, database, timestamp: +new Date });
        };
        const onReplicate = () => {
            emit({ type: ORBIT_DATABASE_REPLICATING, database, timestamp: +new Date });
        };
        const onReplicated = () => {
            emit({ type: ORBIT_DATABASE_REPLICATED, database, timestamp: +new Date });
        };

        const eventListener = database.events
            .once('ready', onReady)
            .on('replicate', onReplicate)
            .on('replicated', onReplicated)

        return () => {
            eventListener.removeListener('ready',onReady)
            eventListener.removeListener('replicate',onReplicate)
            eventListener.removeListener('replicated',onReplicated)
        };

    })
}

function * callListenForOrbitDatabaseEvent ({ database }) {
    const orbitDatabaseChannel = yield call(createOrbitDatabaseChannel, database);
    yield put({type: ORBIT_DATABASE_LISTEN, id: database.id});

    try {
        while (true) {
            let event = yield take(orbitDatabaseChannel);
            yield put(event);
        }
    } finally {
        orbitDatabaseChannel.close();
    }
}

function * orbitSaga () {
    yield takeLatest(ORBIT_INITIALIZING, initOrbit);
    yield takeEvery(ORBIT_DATABASE_CREATING, createDatabase);
}

export default orbitSaga

