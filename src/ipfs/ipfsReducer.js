import { IPFS_INITIALIZED } from "./ipfsActions";

const initialState = {
    initialized: false,
};

const ipfsReducer = (state = initialState, action) => {
    switch (action.type) {
        case IPFS_INITIALIZED:
            return {
                ...state,
                initialized: true,
            };
        default:
            return state;
    }
};

export default ipfsReducer;
