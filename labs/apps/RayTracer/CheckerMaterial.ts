import {Vector3} from '../math/Vector3';
import {Ray3,IntersectResult} from '../math/Ray3';
import {Color} from './Color';

export class CheckerMaterial{
    scale=0;
    reflectiveness=0;
    constructor(scale:number, reflectiveness:number){
        this.scale = scale;
        this.reflectiveness = reflectiveness;
    }

    sample(ray:Ray3, position:Vector3, normal:Vector3):Color {
        return Math.abs((Math.floor(position.x * 0.1) + Math.floor(position.z * this.scale)) % 2) < 1 ? Color.black : Color.white;
    }
}