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
    gl:WebGLRenderingContext=null;
    matobj:Float32Array = mat4.create();
    matCam:Float32Array = mat4.create();
    
    constructor(canv:HTMLCanvasElement) {
        this.gl = <WebGLRenderingContext> canv.getContext("webgl", { antialias: false });
        this.gl.viewport(0, 0, canv.width, canv.height);
        this.init(this.gl);
        
        this.rundataDesc
            .add("g_worldmatrix", 0, NamedData.tp_mat4, 1)
            .add("g_persmat", 64, NamedData.tp_mat4, 1);
        this.rundata = <MyRunData>this.rundataDesc.createDataInstance();
        this.rundatas[0] = this.material.getRunData();
        this.rundatas[1] = this.rundata.getAB();
    }

    init(webgl: WebGLRenderingContext) {
        renderer.Renderer.initGlExt(webgl);
        var gl= <renderer.WebGLExt>webgl;
        glMatrix.setMatrixArrayType(Float32Array);
        
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        //gl.enable(gl.ALPHA_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }

    onRender() {
        var gl =this.gl;
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.lineWidth(10);
        gl.drawArrays(gl.LINE_STRIP,0,3);
        //gl.drawArrays(gl.LINE_STRIP,0,4);
        //gl.renderMesh(this.renderGroup, this.rundatas);
        

    }
}

export function main(canv:HTMLCanvasElement){
    var app =new testWebglLine(canv);   
    startAnimation(app.onRender.bind(app)); 
}
