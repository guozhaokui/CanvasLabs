import {ShapeBase} from './ShapeBase'
import {Vector3} from '../math/Vector3';
import {Ray3,IntersectResult} from '../math/Ray3'

export class Sphere implements ShapeBase{
    center=new Vector3(0,0,0);
    radius=0;
    sqrRadius=0;
    constructor(c:Vector3, r:number){
        this.center = c; 
        this.radius=r;
    }
    copy():Sphere{
        return new Sphere(this.center.copy(),this.radius);
    }
    initialize(){
        this.sqrRadius = this.radius * this.radius;
    }
    intersect(ray:Ray3):IntersectResult{
        var v = ray.origin.subtract(this.center);
        var a0 = v.sqrLength() - this.sqrRadius;
        var DdotV = ray.direction.dot(v);
        if (DdotV <= 0) {
            var discr = DdotV * DdotV - a0;
            if (discr >= 0) {
                var result = new IntersectResult();
                result.geometry = this;
                result.distance = -DdotV - Math.sqrt(discr);
                result.position = ray.getPoint(result.distance);
                result.normal = result.position.subtract(this.center).normalize();
                return result;
            }
        }

        return IntersectResult.noHit;
    }
}