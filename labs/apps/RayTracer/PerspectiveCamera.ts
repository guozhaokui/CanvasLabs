
import {Vector3} from '../math/Vector3';
import {Ray3} from '../math/Ray3';

export class PerspectiveCamera{
    eye=new Vector3(0,0,0);
    front=new Vector3(0,0,0);
    refUp=new Vector3(0,0,0);
    up=new Vector3(0,0,0);
    right=new Vector3(0,0,0);
    fovScale=1;
    fov=0;
    constructor(eye:Vector3, front:Vector3, up:Vector3, fov:number){
        this.eye=eye;
        this.front=front;
        this.refUp=up;
        this.fov=fov;
    }
    initialize(){
        this.right = this.front.cross(this.refUp);
        this.up = this.right.cross(this.front);
        this.fovScale = Math.tan(this.fov * 0.5 * Math.PI / 180) * 2;
        
    }
    generateRay (x, y):Ray3 {
        var r = this.right.multiply((x - 0.5) * this.fovScale);
        var u = this.up.multiply((y - 0.5) * this.fovScale);
        return new Ray3(this.eye, this.front.add(r).add(u).normalize());
    }
}