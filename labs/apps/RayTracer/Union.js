"use strict";
const Ray3_1 = require('../math/Ray3');
class Union {
    constructor(geometries) {
        this.geometries = geometries;
    }
    initialize() {
        for (var i in this.geometries)
            this.geometries[i].initialize();
    }
    intersect(ray) {
        var minDistance = Infinity;
        var minResult = Ray3_1.IntersectResult.noHit;
        for (var i in this.geometries) {
            var result = this.geometries[i].intersect(ray);
            if (result.geometry && result.distance < minDistance) {
                minDistance = result.distance;
                minResult = result;
            }
        }
        return minResult;
    }
}
exports.Union = Union;
