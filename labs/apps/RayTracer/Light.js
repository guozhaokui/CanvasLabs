"use strict";
const Vector3_1 = require('../math/Vector3');
const Color_1 = require('./Color');
class PointLight {
    constructor() {
    }
}
exports.PointLight = PointLight;
class DirLight {
    constructor(dir, color) {
        this.dir = new Vector3_1.Vector3(0, 0, 0);
        this.color = new Color_1.Color(1, 1, 1);
        this.dir = dir;
        this.color = color;
    }
    getLight(pos, dir, color) {
    }
}
exports.DirLight = DirLight;
