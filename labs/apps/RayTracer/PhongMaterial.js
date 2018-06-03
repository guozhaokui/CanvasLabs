"use strict";
const Vector3_1 = require('../math/Vector3');
const Color_1 = require('./Color');
var lightDir = new Vector3_1.Vector3(1, 1, 1).normalize();
var lightColor = Color_1.Color.white;
class PhongMaterial {
    constructor(diffuse, specular, shininess, reflectiveness) {
        this.shininess = 0;
        this.reflectiveness = 0;
        this.diffuse = diffuse;
        this.specular = specular;
        this.shininess = shininess;
        this.reflectiveness = reflectiveness;
    }
    sample(ray, position, normal) {
        var NdotL = normal.dot(lightDir);
        var H = (lightDir.subtract(ray.direction)).normalize();
        var NdotH = normal.dot(H);
        var diffuseTerm = this.diffuse.multiply(Math.max(NdotL, 0));
        var specularTerm = this.specular.multiply(Math.pow(Math.max(NdotH, 0), this.shininess));
        return lightColor.modulate(diffuseTerm.add(specularTerm));
    }
}
exports.PhongMaterial = PhongMaterial;
