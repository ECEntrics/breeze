import {IPFS_FAILED, IPFS_INITIALIZED} from "./ipfsActions";

const initialState = {
    initialized: false
};

const ipfsReducer = (state = initialState, action) => {
    switch (action.type) {
        case IPFS_INITIALIZED:
            return {
                ...state,
                initialized: true
            };
        case IPFS_FAILED:
            return {
                ...state,
                failed: true
            };
        default:
            return state;
    }
};

export default ipfsReducer;
