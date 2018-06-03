'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Renderer_1 = require('../webglRenderor/Renderer');
const GpuProgram_1 = require('../webglRenderor/GpuProgram');
const Mesh_1 = require('../webglRenderor/Mesh');
const Material_1 = require('../webglRenderor/Material');
const ndata = require('../webglRenderor/NamedData');
const ArcBall_1 = require('../common/ArcBall');
const HeadTracker_1 = require('../common/HeadTracker');
const async = require('../common/Async');
const buildBox_1 = require('../geometry/buildBox');
var NamedData = ndata.NamedData;
class testMeshRender {
    constructor() {
        this.gpuprog = new GpuProgram_1.GpuProgram();
        this.mesh = new Mesh_1.Mesh();
        this.renderGroup = new Renderer_1.RenderGroup();
        this.texture = null;
        this.rundataDesc = new NamedData();
        this.rundata = null;
        this.material = new Material_1.Material();
        this.rundatas = [null, null];
        this.eyePosFinal = new Float32Array([0, 0, -2]);
        this.targetPosFinal = new Float32Array([0, 0, 1]);
        this.upPosFinal = new Float32Array([0, 1, 0]);
        this.resok = false;
        this.arcball = new ArcBall_1.ArcBall(window);
        this.headTrack = new HeadTracker_1.HeadTracker(window);
        this.matobj = mat4.create();
        this.matCam = mat4.create();
        this.rundataDesc
            .add("g_worldmatrix", 0, NamedData.tp_mat4, 1)
            .add("g_persmat", 64, NamedData.tp_mat4, 1);
        this.rundata = this.rundataDesc.createDataInstance();
        this.rundatas[0] = this.material.getRunData();
        this.rundatas[1] = this.rundata.getAB();
    }
    init(webgl) {
        var a = 'bbb';
        a.substring(1, 2);
        Renderer_1.Renderer.initGlExt(webgl);
        var gl = webgl;
        glMatrix.setMatrixArrayType(Float32Array);
        this.arcball.init(gl.drawingBufferWidth, gl.drawingBufferHeight);
        this.prepareRes(gl);
        gl.disable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        mat4.perspective(this.rundata.g_persmat, 3.141593 / 4.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0);
        this.eyePosFinal = new Float32Array([0, 0, 2]);
        this.targetPosFinal = new Float32Array([0, 0, 0]);
        this.upPosFinal = new Float32Array([1, 0, 0]);
    }
    onRender(webgl) {
        var gl = webgl;
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (!this.resok)
            return;
        mat4.fromQuat(this.matobj, this.arcball.quatResult);
        mat4.lookAt(this.matCam, this.eyePosFinal, this.targetPosFinal, this.upPosFinal);
        mat4.mul(this.rundata.g_worldmatrix, this.matCam, this.matobj);
        gl.renderMesh(this.renderGroup, this.rundatas);
        window.requestAnimationFrame(() => { this.onRender(webgl); });
    }
    prepareRes(gl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var img = yield async.loadImage('imgs/test.jpg');
                var tex1 = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tex1);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
                this.material.textures[0] = { gltexture: tex1 };
                this.material.textures[1] = { gltexture: tex1 };
                var vssrc = yield async.loadText('shaders/default1.vs.txt');
                var pssrc = yield async.loadText('shaders/default1.ps.txt');
                this.gpuprog.setSrc(vssrc, pssrc);
                this.material.gpuProgram = this.gpuprog.compile(gl);
                var boxb = new buildBox_1.boxBuilder(0.8, 0.8, 0.8);
                boxb.sepFace(true).needUV(true).needNorm(true);
                this.mesh = boxb.build();
                this.material.alpha = 1.0;
                this.material.blendType = 0;
                this.material.enableZ = 1;
                this.renderGroup.begin = 0;
                this.renderGroup.end = this.mesh.idxNum;
                this.renderGroup.mesh = this.mesh;
                this.renderGroup.material = this.material;
                this.renderGroup.shaderInfo = gl.bindShaderFetch(this.mesh.vd, this.material.gpuProgram, [this.material.getNamedData(), this.rundataDesc]);
                this.resok = true;
                window.requestAnimationFrame(() => { this.onRender(gl); });
            }
            catch (e) {
                alert(e);
            }
        });
    }
    static main(window) {
        var test1 = new testMeshRender();
        var el = document.getElementById('content');
        var myCanvasObject = document.getElementById('myCanvas');
        var wgl = myCanvasObject.getContext("webgl", { antialias: false });
        wgl.viewport(0, 0, myCanvasObject.width, myCanvasObject.height);
        test1.init(wgl);
    }
}
testMeshRender.main(window);
