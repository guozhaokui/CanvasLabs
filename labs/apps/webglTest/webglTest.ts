///<reference path="../../runtime/defination/gl-matrix.d.ts"/>
'use strict'
import renderer = require('../../runtime/runtimeMod/webglRenderor/Renderer');
import gpuProg = require('../../runtime/runtimeMod/webglRenderor/GpuProgram');
import mesh = require('../../runtime/runtimeMod/webglRenderor/Mesh');
import vdesc = require('../../runtime/runtimeMod/webglRenderor/VertexDesc');
import material = require('../../runtime/runtimeMod/webglRenderor/Material');
import ndata = require('../../runtime/runtimeMod/webglRenderor/NamedData');
import arcball = require('../../runtime/runtimeMod/common/ArcBall');
import headTrack = require('../../runtime/runtimeMod/common/HeadTracker'); 
import async = require('../../runtime/runtimeMod/common/Async');
import meshbuilder = require('../../runtime/runtimeMod/geometry/buildBox');

var NamedData = ndata.NamedData;
interface MyRunData extends ndata.JSRunData{
    g_worldmatrix:Float32Array,//TODO 现在必须与定义的时候的name一致
    g_persmat:Float32Array
}

class testMeshRender {
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
    arcball = new arcball.ArcBall(window);
    
    headTrack = new headTrack.HeadTracker(window);
    
    matobj:Float32Array = mat4.create();
    matCam:Float32Array = mat4.create();
    
    constructor() {
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
        
        this.arcball.init(gl.drawingBufferWidth,gl.drawingBufferHeight);
        this.prepareRes(gl);

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

        mat4.fromQuat(this.matobj,this.arcball.quatResult);
        //mat4.copy(this.matobj, this.headTrack.getResult());
        mat4.lookAt(this.matCam, this.eyePosFinal, this.targetPosFinal, this.upPosFinal);
        //顺序好像是先b再a
        mat4.mul(this.rundata.g_worldmatrix,this.matCam,this.matobj);
        
        // set light vector = camera direction
        //viewDir = vec3.create();
        //vec3.subtract(eyevec, eyePosFinal, targetPosFinal);

        gl.renderMesh(this.renderGroup, this.rundatas);
        window.requestAnimationFrame(()=>{this.onRender(webgl)});
    }

    async prepareRes(gl:renderer.WebGLExt) {
        try {
            var img = await async.loadImage('imgs/test.jpg');
            var tex1: WebGLTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);   
            this.material.textures[0] = { gltexture: tex1 };
            this.material.textures[1] = { gltexture: tex1 }
            var vssrc = await async.loadText('shaders/default1.vs.txt');
            var pssrc = await async.loadText('shaders/default1.ps.txt');
            this.gpuprog.setSrc(vssrc, pssrc);
            this.material.gpuProgram = this.gpuprog.compile(gl);

            var boxb = new meshbuilder.boxBuilder(0.8,0.8,0.8);
            boxb.sepFace(true).needUV(true).needNorm(true);
            this.mesh = boxb.build();
            this.material.alpha = 1.0;
            this.material.blendType = 0;
            this.material.enableZ = 1;
            //this.material.gpuProgram = prog;
            //this.material.textures[0] = { gltexture: tex1 };
            //this.material.textures[1] = { gltexture: tex2 }

            this.renderGroup.begin = 0;
            this.renderGroup.end = this.mesh.idxNum;
            this.renderGroup.mesh = this.mesh;
            this.renderGroup.material = this.material;

            this.renderGroup.shaderInfo = gl.bindShaderFetch(this.mesh.vd, this.material.gpuProgram, [this.material.getNamedData(), this.rundataDesc]);
            this.resok = true;
            window.requestAnimationFrame(()=>{this.onRender(gl)});
        } catch (e) {
            alert(e);
        }
    }
    
    static main(window){
        var test1 = new testMeshRender();
        
        var el = document.getElementById('content');
        var myCanvasObject:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('myCanvas');
        var wgl:WebGLRenderingContext = <WebGLRenderingContext> myCanvasObject.getContext("webgl", { antialias: false });
        wgl.viewport(0, 0, myCanvasObject.width, myCanvasObject.height);
        test1.init(wgl);
    }
}

testMeshRender.main(window);


