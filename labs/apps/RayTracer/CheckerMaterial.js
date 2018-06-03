"use strict";
const Color_1 = require('./Color');
class CheckerMaterial {
    constructor(scale, reflectiveness) {
        this.scale = 0;
        this.reflectiveness = 0;
        this.scale = scale;
        this.reflectiveness = reflectiveness;
    }
    sample(ray, position, normal) {
        return Math.abs((Math.floor(position.x * 0.1) + Math.floor(position.z * this.scale)) % 2) < 1 ? Color_1.Color.black : Color_1.Color.white;
    }
}
exports.CheckerMaterial = CheckerMaterial;
