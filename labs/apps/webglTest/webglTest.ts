///<reference path="../../runtime/defination/gl-matrix.d.ts"/>
///<reference path="../../runtime/runtimeMod/common/Camera.ts"/>
///<reference path="../../runtime/runtimeMod/common/ArcBall.ts"/>
///<reference path="../../runtime/runtimeMod/common/Async.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/GpuProgram.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/Mesh.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/VertexDesc.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/Material.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/NamedData.ts"/>
///<reference path="../../runtime/runtimeMod/webglRenderor/Renderer.ts"/>
///<reference path="../../runtime/runtimeMod/geometry/buildBox.ts"/>

//import Mesh = renderer.Mesh;
//import VertexDesc = renderer.VertexDesc;
//import Material = renderer.Material;
//import RenderGroup = renderer.RenderGroup;
//import NamedData = renderer.NamedData;
//import Renderer = renderer.Renderer;
//import WebGLExt = renderer.WebGLExt;
//import boxBuilder  = meshBuilder.boxBuilder;
//import ArcBall = util.ArcBall;

class testMeshRender {
    gpuprog = new renderer.GpuProgram();
    mesh = new renderer.Mesh();
    vertDesc = new renderer.VertexDesc();
    material = new renderer.Material();
    renderGroup = new renderer.RenderGroup();
    texture:WebGLTexture = null;
    rundata: Array<ArrayBuffer> = [null, null];
    eyePosFinal = new Float32Array([0, 0, -2]);
    targetPosFinal = new Float32Array([0, 0, 1]);
    upPosFinal = new Float32Array([0, 1, 0]);
    resok: boolean = false;
    //camera: Camera = new Camera(this.eyePosFinal, this.targetPosFinal, this.upPosFinal);
    startMouseX: number;
    startMouseY: number;
    arcball = new util.ArcBall();
    drag:boolean=false;
    arcballRot = quat.create();
    
    matobj:Float32Array = mat4.create();
    matCam:Float32Array = mat4.create();
    matProj:Float32Array = mat4.create();
    
    constructor() {
        this.rundata[0] = this.material.getRunData();
        this.rundata[1] = new ArrayBuffer(256);
    }

    onMouseDown(e:MouseEvent){
        this.startMouseX = e.layerX;
        this.startMouseY = e.layerY;
        this.drag=true;
    }
    onMouseUp(e:MouseEvent){this.drag=false;}

    onMouseMove(e:MouseEvent){
        if(this.drag){
            this.arcball.setTouchPos(this.startMouseX,this.startMouseY);
            this.arcball.dragTo(e.layerX,e.layerY,this.arcballRot);
        }
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
        
        mat4.perspective(this.matProj, 3.141593 / 4.0, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0);
        this.eyePosFinal = new Float32Array([0, 0, -2]);
        this.targetPosFinal = new Float32Array([0, 0, 1]);
        this.upPosFinal = new Float32Array([0, 1, 0]);
    }

testrad:number=0;
    onRender(webgl: WebGLRenderingContext) {
        var gl = <renderer.WebGLExt>webgl;
        gl.clearColor(0.8, 0.8, 0.8, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (!this.resok)
            return;

        var rundata = this.rundata[1];
        var rundtMat1 = new Float32Array(rundata, 0, 16);
        var rundtMat2 = new Float32Array(rundata, 16 * 4, 16);
        var eyevec = new Float32Array(rundata, 128, 3);

        if(true)
            mat4.fromQuat(this.matobj,this.arcballRot);
        else{
            mat4.identity(this.matobj);
            mat4.rotateY(this.matobj,this.matobj,this.testrad+=0.01);
        }
        mat4.lookAt(this.matCam, this.eyePosFinal, this.targetPosFinal, this.upPosFinal);
        //顺序好像是先b再a
        mat4.mul(this.matCam,this.matCam,this.matobj);
        rundtMat1.set(this.matCam);
        rundtMat2.set(this.matProj);
                
        // set light vector = camera direction
        //viewDir = vec3.create();
        //vec3.subtract(eyevec, eyePosFinal, targetPosFinal);

        gl.renderMesh(this.renderGroup, this.rundata);
    }

    async prepareRes(gl:renderer.WebGLExt) {
        try {
            var img = await util.loadImage('imgs/test.jpg');
            var tex1: WebGLTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex1);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);   
            this.material.textures[0] = { gltexture: tex1 };
            this.material.textures[1] = { gltexture: tex1 }
            var vssrc = await util.loadText('shaders/default1.vs.txt');
            var pssrc = await util.loadText('shaders/default1.ps.txt');
            this.gpuprog.setSrc(vssrc, pssrc);
            this.material.gpuProgram = this.gpuprog.compile(gl);

            var boxb = new meshBuilder.boxBuilder(0.8,0.8,0.8);
            boxb.sepFace(true);
            boxb.needUV(true);
            boxb.needNorm(true);
            var ms = boxb.build();
            this.mesh= ms.mesh;
            this.vertDesc = ms.desc;
            var runDt = new renderer.NamedData();
            runDt.add("g_worldmatrix", 0, renderer.NamedData.tp_mat4, 1);
            runDt.add("g_persmat", 64, renderer.NamedData.tp_mat4, 1);

            var nameddata: Array<renderer.NamedData> = [this.material.getNamedData(), runDt];

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

            this.renderGroup.shaderInfo = gl.bindShaderFetch(this.vertDesc, this.material.gpuProgram, nameddata);
            this.resok = true;
        } catch (e) {
            alert(e);
        }
    }
    
    static main(window){
        var test1 = new testMeshRender();
        //window.addEventListener('mousedown', (e) => { test1.onMouseEvt(e); });
        window.addEventListener('mousedown', (e) => { test1.onMouseDown(e); });
        window.addEventListener('mousemove', (e) => { test1.onMouseMove(e); });
        window.addEventListener('mouseup', (e) => { test1.onMouseUp(e); });

        
        var el = document.getElementById('content');
        var myCanvasObject:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('myCanvas');
        var wgl:WebGLRenderingContext = <WebGLRenderingContext> myCanvasObject.getContext("webgl", { antialias: false });
        renderer.Renderer.initGlExt(wgl);
        var gl = <renderer.WebGLExt>wgl;
        gl.viewport(0, 0, myCanvasObject.width, myCanvasObject.height);
        test1.init(gl);
        setInterval(() => { test1.onRender(gl); }, 15);    
    }
}


