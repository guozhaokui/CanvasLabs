"use strict";
const Vector3_1 = require('../math/Vector3');
class Ray3 {
    constructor(o, dir) {
        this.origin = o;
        this.direction = dir;
    }
    getPoint(t) {
        return (this.origin.add(this.direction.multiply(t)));
    }
}
exports.Ray3 = Ray3;
class IntersectResult {
    constructor() {
        this.distance = 0;
        this.position = new Vector3_1.Vector3(0, 0, 0);
        this.normal = new Vector3_1.Vector3(0, 0, 0);
    }
}
IntersectResult.noHit = new IntersectResult();
exports.IntersectResult = IntersectResult;
