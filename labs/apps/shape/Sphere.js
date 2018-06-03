"use strict";
const Vector3_1 = require('../math/Vector3');
const Ray3_1 = require('../math/Ray3');
class Sphere {
    constructor(c, r) {
        this.center = new Vector3_1.Vector3(0, 0, 0);
        this.radius = 0;
        this.sqrRadius = 0;
        this.center = c;
        this.radius = r;
    }
    copy() {
        return new Sphere(this.center.copy(), this.radius);
    }
    initialize() {
        this.sqrRadius = this.radius * this.radius;
    }
    intersect(ray) {
        var v = ray.origin.subtract(this.center);
        var a0 = v.sqrLength() - this.sqrRadius;
        var DdotV = ray.direction.dot(v);
        if (DdotV <= 0) {
            var discr = DdotV * DdotV - a0;
            if (discr >= 0) {
                var result = new Ray3_1.IntersectResult();
                result.geometry = this;
                result.distance = -DdotV - Math.sqrt(discr);
                result.position = ray.getPoint(result.distance);
                result.normal = result.position.subtract(this.center).normalize();
                return result;
            }
        }
        return Ray3_1.IntersectResult.noHit;
    }
}
exports.Sphere = Sphere;
