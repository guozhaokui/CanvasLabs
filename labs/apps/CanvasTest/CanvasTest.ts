///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var updateFPS: (ctx: CanvasRenderingContext2D) => void = (function () {
    var lasttm = 0;
    var fpsdata=new Int32Array(100);
    var stpos=0;
    var rect=new Int32Array([2,2,100,30]);
    function updateFPS(ctx: CanvasRenderingContext2D) {
        var curtm = Date.now();
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#331111';
        ctx.fillRect(rect[0], rect[1],rect[2],rect[3]);
        var dt = curtm - lasttm;
        fpsdata[stpos]=dt;
        stpos=(++stpos)%100;
        lasttm = curtm;
        var fps = Math.floor(1000 / dt);
        ctx.beginPath();
        //画曲线
        ctx.strokeStyle='#ff0000';
        var cx=0;
        ctx.moveTo(0,0);
        for(var x = stpos; x<100; x++){
            ctx.lineTo(cx++,rect[3]-fpsdata[x]);
        }
        for(var x=0;x<=stpos;x++){
            ctx.lineTo(cx++,rect[3]-fpsdata[x]);
        }
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('FPS:' + fps, 4, 20);
        ctx.restore();
    }
    return updateFPS;
})();


class CanvasTest {
    left: HTMLDivElement;
    right: HTMLDivElement;
    fullWidth = 2984;
    fullHeight = 672;
    canv: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    img: HTMLImageElement = null;
    constructor() {
        this.init();
    }

    init() {
        var el = document.getElementById('content');
        this.canv = <HTMLCanvasElement>document.getElementById('myCanvas');
        this.ctx = this.canv.getContext("2d");
    }

    onRot(r: number, p: number) {
    }
    onRender = () => {
        this.ctx.fillStyle = '#777777';
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        this.ctx.fillStyle = '#88aa88';
        this.ctx.globalAlpha=0.1;
        this.ctx.strokeStyle = '#999999';
        this.ctx.beginPath();
        for (var i = 0; i < 4000; i++) {
            this.ctx.moveTo(Math.random()*600, Math.random()*600);
            this.ctx.lineTo(Math.random()*600, Math.random()*600);
        }
            //this.ctx.fill();
            this.ctx.stroke();
        //        this.ctx.stroke()

        updateFPS(this.ctx);
    }
}

var app = new CanvasTest();
startAnimation(app.onRender);
