import { BREEZE_INITIALIZING } from './breezeStatus/breezeActions'
import defaultOptions from "./misc/defaultOptions";
import merge from './misc/mergeUtils'
import {createOrbitDatabase, orbitInit} from "./orbit/orbitActions";

// Load as promise so that async Breeze initialization can still resolve
const isEnvReadyPromise = new Promise((resolve) => {
    const hasWindow = typeof window !== 'undefined'
    const hasDocument = typeof document !== 'undefined'

    if (hasWindow)
        return window.addEventListener('load', resolve)

    // Resolve in any case if we missed the load event and the document is already loaded
    if (hasDocument && document.readyState === `complete`) {
        return resolve()
    }
})

class Breeze {
    constructor (breezeOptions, store) {
        const options = merge(defaultOptions, breezeOptions)

        this.store = store;
        this.web3 = options.web3;
        this.ipfs = {}  // To be initialized in ipfsSaga
        this.orbit = {}  // To be initialized in orbitSaga
        this.orbitDatabases = {};
        this.ipfsOptions = options.ipfs;
        this.orbitOptions = options.orbit;

        // Wait for window load event in case of injected web3.
        isEnvReadyPromise.then(() => {
            // Begin Breeze initialization.
            this.store.dispatch({
                type: BREEZE_INITIALIZING,
                breeze: this
            })
        })
    }

    initOrbit(id) {
        this.store.dispatch(orbitInit (this, id));
    }

    // db = {name, type}
    createOrbitDatabase (db){
        this.store.dispatch(createOrbitDatabase (this.orbit, db));
    }
}

export default Breeze
