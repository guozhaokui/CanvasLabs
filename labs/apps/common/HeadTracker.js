'use strict';
var kD2R = 3.1416 / 180.0;
class HeadTracker {
    constructor(window) {
        this.matRot = mat4.create();
        this.matRotInv = mat4.create();
        window.addEventListener('devicemotion', this.onDeviceMotion.bind(this), false);
        window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this), false);
    }
    setHeight(h) {
    }
    onDeviceMotion(e) {
        var SHAKE_THRESHOLD = 100;
        e.acceleration.x;
        e.rotationRate.alpha;
    }
    onDeviceOrientation(e) {
        mat4.identity(this.matRot);
        mat4.rotateZ(this.matRot, this.matRot, e.alpha * kD2R);
        mat4.rotateX(this.matRot, this.matRot, e.beta * kD2R);
        mat4.rotateY(this.matRot, this.matRot, e.gamma * kD2R);
        mat4.invert(this.matRotInv, this.matRot);
    }
    getResult() {
        return this.matRotInv;
    }
    getViewMat() {
        return null;
    }
}
exports.HeadTracker = HeadTracker;
