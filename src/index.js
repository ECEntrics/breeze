import Breeze from './Breeze.js'
import breezeStatusReducer from './breezeStatus/breezeStatusReducer';
import ipfsReducer from './ipfs/ipfsReducer';
import orbitReducer from './orbit/orbitReducer';

import breezeStatusSaga from './breezeStatus/breezeStatusSaga';
import orbitSaga from "./orbit/orbitSaga";

import * as BreezeActions from './breezeStatus/breezeActions'
import * as IpfsActions from './ipfs/ipfsActions'
import * as OrbitActions from './orbit/orbitActions'

import * as breezeConstants from './constants'
import * as orbitConstants from './orbit/orbitConstants'

import * as orbitUtils from './orbit/orbitUtils'

const breezeReducers = {
    breezeStatus: breezeStatusReducer,
    ipfs: ipfsReducer,
    orbit: orbitReducer
}

const breezeSagas = [
    breezeStatusSaga,
    orbitSaga
]

const breezeActions = {
    breeze: BreezeActions,
    orbit: OrbitActions,
    ipfs: IpfsActions
}

export {
    Breeze,
    breezeConstants,
    breezeActions,
    breezeReducers,
    breezeSagas,
    orbitConstants,
    orbitUtils
}

