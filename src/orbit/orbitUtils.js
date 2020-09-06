import * as orbitTypes from "./constants";

export function resolveOrbitDBTypeFun(orbitdb, type){
    let dbTypeFun;
    switch(type) {
        case orbitTypes.ORBIT_TYPE_LOG:
            dbTypeFun = orbitdb.log;
            break;
        case orbitTypes.ORBIT_TYPE_FEED:
            dbTypeFun = orbitdb.feed;
            break;
        case orbitTypes.ORBIT_TYPE_KEYVALUE:
            dbTypeFun = orbitdb.keyvalue;
            break;
        case orbitTypes.ORBIT_TYPE_DOCS:
            dbTypeFun = orbitdb.docs;
            break;
        case orbitTypes.ORBIT_TYPE_COUNTER:
            dbTypeFun = orbitdb.counter;
            break;
        default:
            throw "Invalid OrbitDB type!";
    }
    return dbTypeFun;
}
