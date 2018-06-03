'use strict';
const renderer = require('../webglRenderor/Renderer');
const gpuProg = require('../webglRenderor/GpuProgram');
const mesh = require('../webglRenderor/Mesh');
const material = require('../webglRenderor/Material');
const ndata = require('../webglRenderor/NamedData');
function startAnimation(renderFunc) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}
var NamedData = ndata.NamedData;
class testWebglLine {
    constructor(canv) {
        this.gpuprog = new gpuProg.GpuProgram();
        this.mesh = new mesh.Mesh();
        this.renderGroup = new renderer.RenderGroup();
        this.texture = null;
        this.rundataDesc = new NamedData();
        this.rundata = null;
        this.material = new material.Material();
        this.rundatas = [null, null];
        this.gl = null;
        this.matobj = mat4.create();
        this.matCam = mat4.create();
        this.gl = canv.getContext("webgl", { antialias: false });
        this.gl.viewport(0, 0, canv.width, canv.height);
        this.init(this.gl);
        this.rundataDesc
            .add("g_worldmatrix", 0, NamedData.tp_mat4, 1)
            .add("g_persmat", 64, NamedData.tp_mat4, 1);
        this.rundata = this.rundataDesc.createDataInstance();
        this.rundatas[0] = this.material.getRunData();
        this.rundatas[1] = this.rundata.getAB();
    }
    init(webgl) {
        renderer.Renderer.initGlExt(webgl);
        var gl = webgl;
        glMatrix.setMatrixArrayType(Float32Array);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }
    onRender() {
        var gl = this.gl;
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.lineWidth(10);
        gl.drawArrays(gl.LINE_STRIP, 0, 3);
    }
}
function main(canv) {
    var app = new testWebglLine(canv);
    startAnimation(app.onRender.bind(app));
}
exports.main = main;
