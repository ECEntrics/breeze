import { call, put, take, takeEvery } from 'redux-saga/effects'
import {eventChannel} from "@redux-saga/core";

import {
    ORBIT_DATABASE_CREATED,
    ORBIT_DATABASE_LISTEN,
    ORBIT_DATABASE_READY,
    ORBIT_DATABASE_REPLICATED,
    ORBIT_DATABASE_REPLICATING
} from './orbitActions';

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

export function * callListenForOrbitDatabaseEvent ({database}) {
    const orbitDatabaseChannel = yield call(createOrbitDatabaseChannel, database)
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

function * orbitStatusSaga () {
   yield takeEvery(ORBIT_DATABASE_CREATED, callListenForOrbitDatabaseEvent);
}

export default orbitStatusSaga

