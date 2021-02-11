import { call, put, spawn, take } from 'redux-saga/effects'
import IPFS from 'ipfs';
import { eventChannel } from "redux-saga";
import {
    IPFS_BOOTSTRAP_PEER_CONNECTED,
    IPFS_BOOTSTRAP_PEER_DISCONNECTED, IPFS_FAILED, IPFS_INITIALIZED, IPFS_INITIALIZING,
    IPFS_PEER_CONNECTED,
    IPFS_PEER_DISCONNECTED,
    IPFS_PEER_EVENT_LISTEN
} from "./ipfsActions";

const LOGGING_PREFIX = 'ipfsSaga: ';

/*
 * Initialization
 */
let bootstrapPeerIds = [];

export function * initializeIPFS (ipfsOptions) {
    try {
        yield put({ type: IPFS_INITIALIZING });

        // Initialize IPFS
        const ipfs = yield call(IPFS.create, ipfsOptions);
        const { id } = yield call(ipfs.id);

        // Keep a list of the initial bootstrap peers (warning: this list will not be updated with ipfs.bootstrap.add!)
        const { Peers } = yield call(ipfs.bootstrap.list);
        bootstrapPeerIds = Peers.map(peer => peer.getPeerId());

        yield put({ type: IPFS_INITIALIZED, ipfs, id });

        // Event channel setup
        yield spawn(callListenForIpfsPeerEvent, { ipfs });

        return ipfs;
    } catch (error) {
        yield put({ type: IPFS_FAILED, error });
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
            const peerId = peerInfo.remotePeer.toB58String();
            const type = bootstrapPeerIds.includes(peerId) ? IPFS_BOOTSTRAP_PEER_CONNECTED : IPFS_PEER_CONNECTED;
            emit({ type, peerId: peerInfo.remotePeer.toB58String() });
        };
        const onPeerDisconnected = (peerInfo) => {
            const peerId = peerInfo.remotePeer.toB58String();
            const type = bootstrapPeerIds.includes(peerId) ? IPFS_BOOTSTRAP_PEER_DISCONNECTED : IPFS_PEER_DISCONNECTED;
            emit({ type, peerId: peerInfo.remotePeer.toB58String() });
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
    yield put({type: IPFS_PEER_EVENT_LISTEN});

    try {
        while (true) {
            let event = yield take(ipfsPeerChannel);
            yield put(event);
        }
    } finally {
        ipfsPeerChannel.close();
    }
}
