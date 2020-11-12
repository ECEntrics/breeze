import { all, call, put, spawn, take, takeEvery, takeLatest } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga';
import OrbitDB from 'orbit-db';
import Identities from 'orbit-db-identity-provider'

import {
    ORBIT_DB_ADDED,
    ORBIT_DB_ADD,
    ORBIT_DB_FAILED,
    ORBIT_DB_LISTEN,
    ORBIT_DB_READY,
    ORBIT_DB_REPLICATED,
    ORBIT_DB_REPLICATING,
    ORBIT_DB_WRITE,
    ORBIT_IDENTITY_PROVIDER_ADD,
    ORBIT_IDENTITY_PROVIDER_ADDED,
    ORBIT_IDENTITY_PROVIDER_FAILED,
    ORBIT_INIT_FAILED,
    ORBIT_INITIALIZED,
    ORBIT_INITIALIZING, ORBIT_DB_ALREADY_ADDED
} from './orbitActions';

const LOGGING_PREFIX = 'orbitSaga: ';

let orbit = {};

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

        orbit = yield call (OrbitDB.createInstance, ...[ipfs, { identity }]);

        breeze.orbit = orbit;

        // Create initial databases from options
        yield all(databases.map(dbInfo => {
            return call(addDatabase, {dbInfo});
        }));

        yield put({ type: ORBIT_INITIALIZED, orbit });

        return orbit;
    } catch (error) {
        yield put({ type: ORBIT_INIT_FAILED, error });
        console.error(LOGGING_PREFIX + 'OrbitDB initialization error:');
        console.error(error);
    }
}

// Keeps track of added databases, so no duplicates are attempted to be created
let databases = new Set();

/*
 * Adds an Orbit database to the set of the tracked databases. The database is created and loaded, with an event channel
 * that listens to emitted events and dispatches corresponding actions.
 * dbInfo = {address, type}    (where address can also be a name)
 */
function * addDatabase({dbInfo}) {
    try {
        let {address, type} = dbInfo;
        if(!OrbitDB.isValidAddress(address))
            address = yield call([orbit, orbit.determineAddress],...[address, type]);

        const { size } = databases;
        databases.add(address);

        if (databases.size > size) {
            const createdDB = yield call([orbit, orbit.open], ...[address, { type, create: true }]);

            yield put({ type: ORBIT_DB_ADDED, database: createdDB, timestamp: +new Date });

            // Event channel setup
            yield spawn(callListenForOrbitDatabaseEvent, { database: createdDB });

            // Wait for event channel setup before loading
            yield take(action => action.type === ORBIT_DB_LISTEN && action.id === createdDB.id);

            yield call([createdDB, createdDB.load]);

            return createdDB;
        }
        else
            yield put({ type: ORBIT_DB_ALREADY_ADDED, address });
    } catch (error) {
        yield put({ type: ORBIT_DB_FAILED, error });
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
            emit({ type: ORBIT_DB_READY, database, timestamp: +new Date });
        };
        const onReplicate = () => {
            emit({ type: ORBIT_DB_REPLICATING, database, timestamp: +new Date });
        };
        const onReplicated = () => {
            emit({ type: ORBIT_DB_REPLICATED, database, timestamp: +new Date });
        };
        const onWrite = (address, entry) => {
            emit({ type: ORBIT_DB_WRITE, database, entry, timestamp: +new Date });
        };

        const eventListener = database.events
            .once('ready', onReady)
            .on('replicate', onReplicate)
            .on('replicated', onReplicated)
            .on('write', onWrite)

        return () => {
            eventListener.removeListener('ready',onReady)
            eventListener.removeListener('replicate',onReplicate)
            eventListener.removeListener('replicated',onReplicated)
            eventListener.removeListener('write',onWrite)
        };

    })
}

function * callListenForOrbitDatabaseEvent ({ database }) {
    const orbitDatabaseChannel = yield call(createOrbitDatabaseChannel, database);
    yield put({type: ORBIT_DB_LISTEN, id: database.id});

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
    yield takeEvery(ORBIT_DB_ADD, addDatabase);
}

export default orbitSaga

