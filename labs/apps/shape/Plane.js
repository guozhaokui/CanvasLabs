"use strict";
const Ray3_1 = require('../math/Ray3');
class Plane {
    constructor(norm, d) {
        this.normal = norm;
        this.d = d;
    }
    copy() {
        return new Plane(this.normal.copy(), this.d);
    }
    initialize() {
        this.position = this.normal.multiply(this.d);
    }
    intersect(ray) {
        var a = ray.direction.dot(this.normal);
        if (a >= 0)
            return Ray3_1.IntersectResult.noHit;
        var b = this.normal.dot(ray.origin.subtract(this.position));
        var result = new Ray3_1.IntersectResult();
        result.geometry = this;
        result.distance = -b / a;
        result.position = ray.getPoint(result.distance);
        result.normal = this.normal;
        return result;
    }
}
exports.Plane = Plane;
