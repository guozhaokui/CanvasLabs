'use strict';
const FPS2D = require('../common/FPS2D');
const Plane_1 = require('../shape/Plane');
const Sphere_1 = require('../shape/Sphere');
const Vector3_1 = require('../math/Vector3');
const Color_1 = require('./Color');
const Union_1 = require('./Union');
const CheckerMaterial_1 = require('./CheckerMaterial');
const PhongMaterial_1 = require('./PhongMaterial');
const PerspectiveCamera_1 = require('./PerspectiveCamera');
const raytrace_1 = require('./raytrace');
function startAnimation(renderFunc) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}
var updateFPS = new FPS2D.FPS2D().updateFPS;
class CanvasTest {
    constructor(canv) {
        this.fullWidth = 2984;
        this.fullHeight = 672;
        this.canv = null;
        this.ctx = null;
        this.img = null;
        this.onRender = () => {
            this.Render();
            updateFPS(this.ctx);
        };
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.initScene();
    }
    initScene() {
        var plane = new Plane_1.Plane(new Vector3_1.Vector3(0, 1, 0), 0);
        var sphere1 = new Sphere_1.Sphere(new Vector3_1.Vector3(-10, 10, -10), 10);
        var sphere2 = new Sphere_1.Sphere(new Vector3_1.Vector3(10, 10, -10), 10);
        plane.material = new CheckerMaterial_1.CheckerMaterial(0.1, 0.5);
        sphere1.material = new PhongMaterial_1.PhongMaterial(Color_1.Color.red, Color_1.Color.white, 16, 0.25);
        sphere2.material = new PhongMaterial_1.PhongMaterial(Color_1.Color.blue, Color_1.Color.white, 16, 0.25);
        this.scene = new Union_1.Union([plane, sphere1, sphere2]);
        this.cam = new PerspectiveCamera_1.PerspectiveCamera(new Vector3_1.Vector3(0, 5, 15), new Vector3_1.Vector3(0, 0, -1), new Vector3_1.Vector3(0, 1, 0), 90);
    }
    Render() {
        raytrace_1.raytrace(this.canv, this.scene, this.cam);
    }
}
function main(canv) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
exports.main = main;
