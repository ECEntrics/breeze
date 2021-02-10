import { call, put } from 'redux-saga/effects'
import IPFS from 'ipfs';

import * as IpfsActions from "./ipfsActions";

const LOGGING_PREFIX = 'ipfsSaga: ';

/*
 * Initialization
 */
export function * initializeIPFS (ipfsOptions) {
    try {
        yield put({ type: IpfsActions.IPFS_INITIALIZING });

        // Initialize IPFS
        const ipfs = yield call(IPFS.create, ipfsOptions);

        yield put({ type: IpfsActions.IPFS_INITIALIZED, ipfs });

        return ipfs;
    } catch (error) {
        yield put({ type: IpfsActions.IPFS_FAILED, error });
        console.error(LOGGING_PREFIX + 'IPFS Initialization error:');
        console.error(error);
    }
}
