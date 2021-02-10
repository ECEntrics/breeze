import {call, put, spawn, take} from 'redux-saga/effects'
import IPFS from 'ipfs';

import * as IpfsActions from "./ipfsActions";
import {eventChannel} from "redux-saga";

const LOGGING_PREFIX = 'ipfsSaga: ';

/*
 * Initialization
 */
export function * initializeIPFS (ipfsOptions) {
    try {
        yield put({ type: IpfsActions.IPFS_INITIALIZING });

        // Initialize IPFS
        const ipfs = yield call(IPFS.create, ipfsOptions);
        const { id } = yield call(ipfs.id);

        yield put({ type: IpfsActions.IPFS_INITIALIZED, ipfs, id });

        // Event channel setup
        yield spawn(callListenForIpfsPeerEvent, { ipfs });

        return ipfs;
    } catch (error) {
        yield put({ type: IpfsActions.IPFS_FAILED, error });
        console.error(LOGGING_PREFIX + 'IPFS Initialization error:');
        console.error(error);
    }
}

/*
 * For peer connection/disconnection events
 */
function createIpfsPeerChannel (ipfs){
    return eventChannel(emit => {
        const onPeerConnected = (peerInfo) => {
            emit({ type: IpfsActions.IPFS_PEER_CONNECTED, peerId: peerInfo.remotePeer.toB58String() });
        };
        const onPeerDisconnected = (peerInfo) => {
            emit({ type: IpfsActions.IPFS_PEER_DISCONNECTED, peerId: peerInfo.remotePeer.toB58String() });
        };

        const eventListener = ipfs.libp2p.connectionManager
            .on('peer:connect', onPeerConnected)
            .on('peer:disconnect', onPeerDisconnected)

        return () => {
            eventListener.removeListener('peer:connect',onPeerConnected)
            eventListener.removeListener('peer:disconnect',onPeerDisconnected)
        };
    })
}

function * callListenForIpfsPeerEvent ({ ipfs }) {
    const ipfsPeerChannel = yield call(createIpfsPeerChannel, ipfs);

    yield put({type: IpfsActions.IPFS_PEER_EVENT_LISTEN});

    try {
        while (true) {
            let event = yield take(ipfsPeerChannel);
            yield put(event);
        }
    } finally {
        ipfsPeerChannel.close();
    }
}
