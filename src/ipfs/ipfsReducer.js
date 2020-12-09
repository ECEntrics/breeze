import { IPFS_INITIALIZING , IPFS_INITIALIZED, IPFS_FAILED } from "./ipfsActions";
import { STATUS_UNINITIALIZED, STATUS_INITIALIZING, STATUS_INITIALIZED, STATUS_FAILED } from "../constants";

const initialState = {
    status: STATUS_UNINITIALIZED
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
                status: STATUS_INITIALIZED
            };
        case IPFS_FAILED:
            return {
                ...state,
                status: STATUS_FAILED
            };
        default:
            return state;
    }
};

export default ipfsReducer;
