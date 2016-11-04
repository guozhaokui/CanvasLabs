
import {Vector3} from '../math/Vector3';

export class Ray3{
    origin:Vector3;
    direction:Vector3;//朝向
    constructor(o:Vector3, dir:Vector3){
        this.origin=o;
        this.direction =dir;
    }
    /**
     * 返回射线上的一个点。
     * t=0就是origin， 
     */
    getPoint(t:number){
        return (this.origin.add(this.direction.multiply(t)));
    }
}

export class IntersectResult{
    geometry;
    distance=0;
    position=new Vector3(0,0,0);
    normal = new Vector3(0,0,0);
    static noHit = new IntersectResult();
}