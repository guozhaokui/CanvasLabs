///<reference path="../../defination/gl-matrix.d.ts" />
'use strict';


class HeadTracker{
    constructor(window:Window){
        window.addEventListener('devicemotion',this.onDeviceMotion.bind(this),false)
        window.addEventListener('deviceorientation', this.onDeviceOrientation.bind(this),false);
    }
    
    onDeviceMotion(e:DeviceMotionEvent){
        var SHAKE_THRESHOLD=100;
        e.acceleration.x;
        e.rotationRate.alpha;
    }
    
    onDeviceOrientation(e:DeviceOrientationEvent){
        /**
         * alpha 绕着z
         * beta 绕着x
         * gamma 绕着y
         */
        e.alpha;
        e.beta;
        e.gamma;
    }
    
    /**
     * 返回的是一个四元数
     */
    getResult():Float32Array{
        return null;
    }
    
}
