
import {ShapeBase} from './ShapeBase'
import {Vector3} from '../math/Vector3';
import {Ray3,IntersectResult} from '../math/Ray3';

export class Plane implements ShapeBase{
    normal:Vector3;
    d:number;
    position:Vector3;
    material;
    constructor(norm:Vector3,d:number){
        this.normal=norm;
        this.d=d;
    }
    copy():Plane{
        return new Plane(this.normal.copy(),this.d);
    }
    initialize(){
        this.position = this.normal.multiply(this.d);
    }
    intersect(ray:Ray3):IntersectResult{
        var a = ray.direction.dot(this.normal);
        if (a >= 0)
            return IntersectResult.noHit;

        var b = this.normal.dot(ray.origin.subtract(this.position));
        var result = new IntersectResult();
        result.geometry = this;
        result.distance = -b / a;
        result.position = ray.getPoint(result.distance);
        result.normal = this.normal;
        return result;
    }
}