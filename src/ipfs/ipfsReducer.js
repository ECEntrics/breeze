import {
    IPFS_INITIALIZING,
    IPFS_INITIALIZED,
    IPFS_FAILED,
    IPFS_PEER_CONNECTED,
    IPFS_PEER_DISCONNECTED,
    IPFS_BOOTSTRAP_PEER_CONNECTED,
    IPFS_BOOTSTRAP_PEER_DISCONNECTED
} from "./ipfsActions";
import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";

const initialState = {
    status: STATUS_UNINITIALIZED,
    id: null,
    peers:[],
    bootstrapPeers:[]
};

const ipfsReducer = (state = initialState, action) => {
    /*
     * IPFS Status
     */
    if (action.type === IPFS_INITIALIZING) {
        return {
            ...state,
            status: STATUS_INITIALIZING
        };
    } else if (action.type === IPFS_INITIALIZED) {
        return {
            ...state,
            status: STATUS_INITIALIZED,
            id: action.id
        };
    } else if (action.type === IPFS_FAILED) {
        return {
            ...state,
            status: STATUS_FAILED
        };
    } else if (action.type === IPFS_PEER_CONNECTED) {
        const {peerId} = action;
        const index = state.peers.findIndex(peer => peer === peerId);
        if (index === -1)
            return {
                ...state,
                peers: [...state.peers, peerId]
            };
        return state;
    } else if (action.type === IPFS_PEER_DISCONNECTED) {
        const peerIndex = state.peers.findIndex(peer => peer === action.peerId);
        return {
            ...state,
            peers: state.peers.filter((peer, index) => index !== peerIndex)
        };
    } else if (action.type === IPFS_BOOTSTRAP_PEER_CONNECTED) {
        const {peerId} = action;
        const index = state.bootstrapPeers.findIndex(peer => peer === peerId);
        if (index === -1)
            return {
                ...state,
                bootstrapPeers: [...state.bootstrapPeers, peerId]
            };
        return state;
    } else if (action.type === IPFS_BOOTSTRAP_PEER_DISCONNECTED) {
        const peerIndex = state.bootstrapPeers.findIndex(peer => peer === action.peerId);
        return {
            ...state,
            bootstrapPeers: state.bootstrapPeers.filter((peer, index) => index !== peerIndex)
        };
    } else {
        return state;
    }
};

export default ipfsReducer;
