
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
//import {ShapeBase} from '../../runtime/runtimeMod/shape/ShapeBase';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';
import {Color} from './Color';

var lightDir = new Vector3(1, 1, 1).normalize();
var lightColor = Color.white;

export class PhongMaterial{
    diffuse:Color;
    specular:Color;
    shininess=0;
    reflectiveness=0;
    constructor(diffuse:Color, specular:Color, shininess:number, reflectiveness:number){
        this.diffuse=diffuse;
        this.specular=specular;
        this.shininess=shininess
        this.reflectiveness=reflectiveness;
    }

    sample(ray:Ray3, position:Vector3, normal:Vector3) {
        var NdotL = normal.dot(lightDir);
        var H = (lightDir.subtract(ray.direction)).normalize();
        var NdotH = normal.dot(H);
        var diffuseTerm = this.diffuse.multiply(Math.max(NdotL, 0));
        var specularTerm = this.specular.multiply(Math.pow(Math.max(NdotH, 0), this.shininess));
        return lightColor.modulate(diffuseTerm.add(specularTerm));
    }
} 