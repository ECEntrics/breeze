import Breeze from './Breeze.js'
import breezeStatusReducer from './breezeStatus/breezeStatusReducer';
import ipfsReducer from "./ipfs/ipfsReducer";
import orbitReducer from "./orbit/orbitReducer";

import breezeStatusSaga from './breezeStatus/breezeStatusSaga';
import orbitSaga from "./orbit/orbitSaga";

import * as BreezeActions from './breezeStatus/breezeActions'
import * as OrbitActions from './orbit/orbitActions'

import * as orbitTypes from './orbit/constants'
import orbitMiddleware from "./orbit/orbitMiddleware";
import orbitStatusSaga from "./orbit/orbitStatusSaga";

const breezeReducers = {
    breezeStatus: breezeStatusReducer,
    ipfs: ipfsReducer,
    orbit: orbitReducer
}

const breezeMiddlewares = [
    orbitMiddleware
]

const breezeSagas = [
    breezeStatusSaga,
    orbitSaga,
    orbitStatusSaga
]

const breezeActions = {
    breeze: BreezeActions,
    orbit: OrbitActions
}

export {
    Breeze,
    breezeActions,
    breezeReducers,
    breezeMiddlewares,
    breezeSagas,
    orbitTypes
}

