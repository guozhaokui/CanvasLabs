"use strict";
const geobase = require('./geometryBase');
class geoSphere extends geobase.geometryBase {
    constructor(r) {
        super();
        super.type = 'sphere';
        super.param = { radius: r };
    }
}
exports.geoSphere = geoSphere;
class sphereBuilder {
    static build(r, seg, genTexcoord) {
        return null;
    }
}
exports.sphereBuilder = sphereBuilder;
