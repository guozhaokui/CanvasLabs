

class WebVR{
    stageSizeW = 2.0;
    stageSizeH = 2.0;
    frameData: VRFrameData = null;
    vrDisplay: VRDisplay = null;
    canvas: HTMLCanvasElement = null;
    viewMat = new Float32Array(16);
    renderLoop:()=>void=null;
    constructor(canvas:HTMLCanvasElement){
        this.canvas = canvas;
        if(canvas){
            this.init();
        }
    }

    init(){
        if (navigator.getVRDisplays) {
            var me = this;
            navigator.getVRDisplays().then( (displays: VRDisplay[])=>{
                console.log('support webvr!!');
                if (displays.length > 0) {
                    this.vrDisplay = displays[0];
                    this.vrDisplay.depthNear = 0.1;
                    this.vrDisplay.depthFar = 1024.0;
                    this.frameData = new VRFrameData();
                    //init WebGL
                    var stageInfo = this.vrDisplay.stageParameters;
                    if (stageInfo && stageInfo.sizeX > 0 && stageInfo.sizeZ > 0) {
                        //可玩区域
                        this.stageSizeW = stageInfo.sizeX;
                        this.stageSizeH = stageInfo.sizeZ;
                    } else {
                        console.log('no stage size info!')
                    }
                    if(this.vrDisplay.capabilities.hasPosition){
                        console.log('support position');
                    }
                    //vrDisplay.resetPose(); 设置当前位置为原点
                    if (this.vrDisplay.capabilities.canPresent) {
                        console.log('vrDisplay.capabilities.canPresent=true');//这个什么意思呢
                    }

                    window.addEventListener('vrdisplaypresentchange', this.onVRPresentChange, false);
                    window.addEventListener('vrdisplayactivate', this.onVRRequestPresent, false);
                    window.addEventListener('vrdisplaydeactivate', this.onVRExitPresent, false);

                    this.onResize();
                    window.addEventListener('keydown',(ev)=>{
                        if(ev.keyCode==32){
                            this.enterVRMode();
                        }
                    });
                }
            });
        } else {
            console.log('not support webvr!');
            this.onResize();
            this.startRender();                                        
        }
    }

    onVRPresentChange(){
        console.log('onVRPresentChange');
    }
    onVRRequestPresent(){
        console.log('onVRRequestPresent');
    }
    onVRExitPresent(){
        console.log('onVRExitPresent');
    }

    onResize() {
        var vrDisplay = this.vrDisplay;
        if (vrDisplay && vrDisplay.isPresenting) {
            var leftEye = vrDisplay.getEyeParameters('left');
            var rightEye = vrDisplay.getEyeParameters('right');
            this.canvas.width = leftEye.renderWidth * 2;
            this.canvas.height = leftEye.renderHeight;
            //this.viewPortL = new Laya.Viewport(0,0,leftEye.renderWidth, leftEye.renderHeight);
            //this.viewPortR = new Laya.Viewport(leftEye.renderWidth,0,rightEye.renderWidth, rightEye.renderHeight);
        } else {
            console.log('onResize ');
        }
    }
    
    startRender() {
        var reqLoop = window.requestAnimationFrame;
        var obj:any=window;
        if (this.vrDisplay) {
            //替换laya的循环
            reqLoop = this.vrDisplay.requestAnimationFrame;
            obj = this.vrDisplay;
        }
        function loop() {
            this.renderloop();
            this.vrDisplay.submitFrame();//把VRLayer的内容提交到头显。完了会清理，除非 preserveDrawingBuffer
            reqLoop.call(obj,loop);
        }
        reqLoop.call(obj,loop);
    }
    

    hasVRDev():boolean{
        return false;
    }
    enterVRMode(){

    }

    getCamLeft(){

    }

    getCamRight(){

    }

    getFrameData(){

    }
}

/*
var canv:HTMLCanvasElement;
var wv = new WebVR(canv);
var render = new Render();
var scene = new Scene();
wv.renderLoop=()=>{
    render.renderSce(scene,camleft,viewport)
}
*/