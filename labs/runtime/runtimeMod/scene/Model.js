"use strict";
class RenderableMesh {
    constructor() {
        this.mesh = null;
    }
}
exports.RenderableMesh = RenderableMesh;
class Model {
    constructor(name) {
        this.pos = new Float32Array(3);
        this.rotmat = new Float32Array[3 * 3];
        this.meshes = null;
        this.id = Model.idg++;
        this.name = name;
    }
    copy(name) {
        var ret = new Model(name);
        ret.meshes = this.meshes;
        return ret;
    }
}
Model.idg = 0;
exports.Model = Model;
const scene = require('./scene');
const sceR = require('../webglRenderor/SceneRender');
function test1() {
    var sce = new scene.Scene;
    var m1 = new Model('test1');
    sce.addMod(m1);
    var m2 = new Model('test2');
    sce.addMod(m2);
    sceR.SceneRender.render(sce);
}
