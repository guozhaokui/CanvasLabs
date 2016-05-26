'use strict'
import renderer = require('../../runtime/runtimeMod/webglRenderor/Renderer');
import gpuProg = require('../../runtime/runtimeMod/webglRenderor/GpuProgram');
import mesh = require('../../runtime/runtimeMod/webglRenderor/Mesh');
import vdesc = require('../../runtime/runtimeMod/webglRenderor/VertexDesc');
import material = require('../../runtime/runtimeMod/webglRenderor/Material');
import ndata = require('../../runtime/runtimeMod/webglRenderor/NamedData');
import async = require('../../runtime/runtimeMod/common/Async');

function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var NamedData = ndata.NamedData;
interface MyRunData extends ndata.JSRunData{
    g_worldmatrix:Float32Array,//TODO 现在必须与定义的时候的name一致
    g_persmat:Float32Array
}

class testWebglLine {
    gpuprog = new gpuProg.GpuProgram();
    mesh = new mesh.Mesh();
    renderGroup = new renderer.RenderGroup();
    
    texture:WebGLTexture = null;
    
    rundataDesc=new NamedData();        //rundata描述
    rundata:MyRunData = null;         //rundata实例
    material = new material.Material();
    rundatas: ArrayBuffer[] = [null, null];
    
    eyePosFinal = new Float32Array([0, 0, -2]);
    targetPosFinal = new Float32Array([0, 0, 1]);
    upPosFinal = new Float32Array([0, 1, 0]);
    
    resok: boolean = false;
    //camera: Camera = new Camera(this.eyePosFinal, this.targetPosFinal, this.upPosFinal);
    matobj:Float32Array = mat4.create();
    matCam:Float32Array = mat4.create();
    
    constructor(canv:HTMLCanvasElement) {
        var wgl:WebGLRenderingContext = <WebGLRenderingContext> canv.getContext("webgl", { antialias: false });
        wgl.viewport(0, 0, canv.width, canv.height);
        this.init(wgl);
        
        this.rundataDesc
            .add("g_worldmatrix", 0, NamedData.tp_mat4, 1)
            .add("g_persmat", 64, NamedData.tp_mat4, 1);
        this.rundata = <MyRunData>this.rundataDesc.createDataInstance();
        
        this.rundatas[0] = this.material.getRunData();
        this.rundatas[1] = this.rundata.getAB();
    }

    init(webgl: WebGLRenderingContext) {
        renderer.Renderer.initGlExt(webgl);
        var gl = <renderer.WebGLExt>webgl;
        glMatrix.setMatrixArrayType(Float32Array);
        
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.ALPHA_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        mat4.perspective(this.rundata.g_persmat, 3.141593 / 4.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0);
        this.eyePosFinal = new Float32Array([0, 0, 2]);
        this.targetPosFinal = new Float32Array([0, 0, 0]);
        this.upPosFinal = new Float32Array([1, 0, 0]);
    }

    onRender(webgl: WebGLRenderingContext) {
        var gl = <renderer.WebGLExt>webgl;
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (!this.resok)
            return;

        gl.renderMesh(this.renderGroup, this.rundatas);
        window.requestAnimationFrame(()=>{this.onRender(webgl)});
    }
}

export function main(canv:HTMLCanvasElement){
    new testWebglLine(canv);    
}
