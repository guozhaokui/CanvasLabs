"use strict";
const Vector3_1 = require('../math/Vector3');
const Ray3_1 = require('../math/Ray3');
class PerspectiveCamera {
    constructor(eye, front, up, fov) {
        this.eye = new Vector3_1.Vector3(0, 0, 0);
        this.front = new Vector3_1.Vector3(0, 0, 0);
        this.refUp = new Vector3_1.Vector3(0, 0, 0);
        this.up = new Vector3_1.Vector3(0, 0, 0);
        this.right = new Vector3_1.Vector3(0, 0, 0);
        this.fovScale = 1;
        this.fov = 0;
        this.eye = eye;
        this.front = front;
        this.refUp = up;
        this.fov = fov;
    }
    initialize() {
        this.right = this.front.cross(this.refUp);
        this.up = this.right.cross(this.front);
        this.fovScale = Math.tan(this.fov * 0.5 * Math.PI / 180) * 2;
    }
    generateRay(x, y) {
        var r = this.right.multiply((x - 0.5) * this.fovScale);
        var u = this.up.multiply((y - 0.5) * this.fovScale);
        return new Ray3_1.Ray3(this.eye, this.front.add(r).add(u).normalize());
    }
}
exports.PerspectiveCamera = PerspectiveCamera;
