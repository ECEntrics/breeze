import { call, put, takeLatest } from 'redux-saga/effects'

import * as BreezeActions from './breezeActions';
import { initializeIPFS } from '../ipfs/ipfsSaga';
import { addOrbitIdentityProvider } from '../orbit/orbitSaga';

const LOGGING_PREFIX = 'breezeStatusSaga: ';

function * initializeBreeze (action) {
    try {
        const { breeze } = action;

        // Initialize IPFS
        const ipfs = yield call(initializeIPFS, breeze.ipfsOptions);

        if(!ipfs)
            throw new Error('IPFS initialization error');

        breeze.ipfs = ipfs;

        // If given, add custom Orbit Identity Provider
        if(breeze.orbitOptions.identityProvider)
            yield call(addOrbitIdentityProvider, breeze.orbitOptions.identityProvider);

        yield put({ type: BreezeActions.BREEZE_INITIALIZED, breeze });
    } catch (error) {
        yield put({ type: BreezeActions.BREEZE_FAILED, error });
        console.error(LOGGING_PREFIX + 'Initialization error:');
        console.error(error);
    }
}

function * breezeStatusSaga () {
    yield takeLatest(BreezeActions.BREEZE_INITIALIZING, initializeBreeze);
}

export default breezeStatusSaga
