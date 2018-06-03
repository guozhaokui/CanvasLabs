class WebVR {
    constructor(canvas) {
        this.stageSizeW = 2.0;
        this.stageSizeH = 2.0;
        this.frameData = null;
        this.vrDisplay = null;
        this.canvas = null;
        this.viewMat = new Float32Array(16);
        this.renderLoop = null;
        this.canvas = canvas;
        if (canvas) {
            this.init();
        }
    }
    init() {
        if (navigator.getVRDisplays) {
            var me = this;
            navigator.getVRDisplays().then((displays) => {
                console.log('support webvr!!');
                if (displays.length > 0) {
                    this.vrDisplay = displays[0];
                    this.vrDisplay.depthNear = 0.1;
                    this.vrDisplay.depthFar = 1024.0;
                    this.frameData = new VRFrameData();
                    var stageInfo = this.vrDisplay.stageParameters;
                    if (stageInfo && stageInfo.sizeX > 0 && stageInfo.sizeZ > 0) {
                        this.stageSizeW = stageInfo.sizeX;
                        this.stageSizeH = stageInfo.sizeZ;
                    }
                    else {
                        console.log('no stage size info!');
                    }
                    if (this.vrDisplay.capabilities.hasPosition) {
                        console.log('support position');
                    }
                    if (this.vrDisplay.capabilities.canPresent) {
                        console.log('vrDisplay.capabilities.canPresent=true');
                    }
                    window.addEventListener('vrdisplaypresentchange', this.onVRPresentChange, false);
                    window.addEventListener('vrdisplayactivate', this.onVRRequestPresent, false);
                    window.addEventListener('vrdisplaydeactivate', this.onVRExitPresent, false);
                    this.onResize();
                    window.addEventListener('keydown', (ev) => {
                        if (ev.keyCode == 32) {
                            this.enterVRMode();
                        }
                    });
                }
            });
        }
        else {
            console.log('not support webvr!');
            this.onResize();
            this.startRender();
        }
    }
    onVRPresentChange() {
        console.log('onVRPresentChange');
    }
    onVRRequestPresent() {
        console.log('onVRRequestPresent');
    }
    onVRExitPresent() {
        console.log('onVRExitPresent');
    }
    onResize() {
        var vrDisplay = this.vrDisplay;
        if (vrDisplay && vrDisplay.isPresenting) {
            var leftEye = vrDisplay.getEyeParameters('left');
            var rightEye = vrDisplay.getEyeParameters('right');
            this.canvas.width = leftEye.renderWidth * 2;
            this.canvas.height = leftEye.renderHeight;
        }
        else {
            console.log('onResize ');
        }
    }
    startRender() {
        var reqLoop = window.requestAnimationFrame;
        var obj = window;
        if (this.vrDisplay) {
            reqLoop = this.vrDisplay.requestAnimationFrame;
            obj = this.vrDisplay;
        }
        function loop() {
            this.renderloop();
            this.vrDisplay.submitFrame();
            reqLoop.call(obj, loop);
        }
        reqLoop.call(obj, loop);
    }
    hasVRDev() {
        return false;
    }
    enterVRMode() {
    }
    getCamLeft() {
    }
    getCamRight() {
    }
    getFrameData() {
    }
}
