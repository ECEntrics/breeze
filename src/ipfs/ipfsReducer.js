import {
    IPFS_INITIALIZING,
    IPFS_INITIALIZED,
    IPFS_FAILED,
    IPFS_PEER_CONNECTED,
    IPFS_PEER_DISCONNECTED
} from "./ipfsActions";
import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";

const initialState = {
    status: STATUS_UNINITIALIZED,
    id: null,
    peers:[]
};

const ipfsReducer = (state = initialState, action) => {
    /*
     * IPFS Status
     */
    switch (action.type) {
        case IPFS_INITIALIZING:
            return {
                ...state,
                status: STATUS_INITIALIZING
            };
        case IPFS_INITIALIZED:
            return {
                ...state,
                status: STATUS_INITIALIZED,
                id: action.id
            };
        case IPFS_FAILED:
            return {
                ...state,
                status: STATUS_FAILED
            };
        case IPFS_PEER_CONNECTED:
            const { peerId } = action;
            const index = state.peers.findIndex(peer => peer === peerId);
            if(index === -1)
                return {
                    ...state,
                    peers: [...state.peers, peerId]
                };
            return state;
        case IPFS_PEER_DISCONNECTED:
            const peerIndex = state.peers.findIndex(peer => peer === action.peerId);
            return {
                ...state,
                peers: state.peers.filter((peer, index) => index !== peerIndex)
            };
        default:
            return state;
    }
};

export default ipfsReducer;
