///<reference path="../../defination/gl-matrix.d.ts" />
'use strict';

var kD2R = 3.1416/180.0;

export class HeadTracker{
    matRot:Float32Array=mat4.create();
    matRotInv:Float32Array=mat4.create();
    constructor(window:Window){
        window.addEventListener('devicemotion',this.onDeviceMotion.bind(this),false)
        window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this),false);
    }
    
    onDeviceMotion(e:DeviceMotionEvent){
        var SHAKE_THRESHOLD=100;
        e.acceleration.x;
        e.rotationRate.alpha;
    }
    
    onDeviceOrientation(e:DeviceOrientationEvent):void{
        /**
         * alpha 绕着z
         * beta 绕着x
         * gamma 绕着y
         */
        mat4.identity(this.matRot);
        /*
        mat4.rotateY(this.matRot,this.matRot,e.alpha*kD2R);//向上的轴，y
        mat4.rotateX(this.matRot,this.matRot,e.beta*kD2R);//俯仰
        mat4.rotateZ(this.matRot,this.matRot,e.gamma*kD2R);
        */
        mat4.rotateZ(this.matRot,this.matRot,e.alpha*kD2R);//向上的轴，z
        mat4.rotateX(this.matRot,this.matRot,e.beta*kD2R);//俯仰
        mat4.rotateY(this.matRot,this.matRot,e.gamma*kD2R);
        mat4.invert(this.matRotInv,this.matRot);
        
        //mat4.fromYRotation(this.matRot,e.alpha*kD2R);
        /*
        e.alpha;
        e.beta;
        e.gamma;
        */
    }
    
    /**
     * 返回的是一个四元数
     */
    getResult():Float32Array{
        return this.matRotInv;
    }
    
}
