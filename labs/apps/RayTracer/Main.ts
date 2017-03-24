///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../common/FPS2D');
import {Plane} from '../shape/Plane';
import {Sphere} from '../shape/Sphere';
import {Vector3} from '../math/Vector3';
import {ShapeBase} from '../shape/ShapeBase';
import {Ray3,IntersectResult} from '../math/Ray3';
import {Color} from './Color';
import {Union} from './Union';
import {CheckerMaterial} from './CheckerMaterial';
import {PhongMaterial} from './PhongMaterial';
import {PerspectiveCamera} from './PerspectiveCamera';
import {raytrace} from './raytrace';

function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var updateFPS = new FPS2D.FPS2D().updateFPS;

class CanvasTest {
    left: HTMLDivElement;
    right: HTMLDivElement;
    fullWidth = 2984;
    fullHeight = 672;
    canv: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    img: HTMLImageElement = null;
    scene:Union;
    cam:PerspectiveCamera;
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.initScene();
    }

    initScene(){
        var plane = new Plane(new Vector3(0, 1, 0), 0);
        var sphere1 = new Sphere(new Vector3(-10, 10, -10), 10);
        var sphere2 = new Sphere(new Vector3(10, 10, -10), 10);
        plane.material = new CheckerMaterial(0.1, 0.5);
        sphere1.material = new PhongMaterial(Color.red, Color.white, 16, 0.25);
        sphere2.material = new PhongMaterial(Color.blue, Color.white, 16, 0.25);
        
        this.scene = new Union([plane, sphere1, sphere2]);
        this.cam = new PerspectiveCamera(new Vector3(0, 5, 15), new Vector3(0, 0, -1), new Vector3(0, 1, 0), 90);
    }

    Render(){
        raytrace(this.canv, this.scene,this.cam);
    }

    onRender = () => {
        this.Render();
        updateFPS(this.ctx);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
