///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../common/FPS2D');

function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var updateFPS = new FPS2D.FPS2D().updateFPS;

class CanvasTest {
    left: HTMLDivElement;
    right: HTMLDivElement;
    fullWidth = 2984;
    fullHeight = 672;
    canv: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    img: HTMLImageElement = null;
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
    }

    testLine(){
        this.ctx.save();
        this.ctx.fillStyle = '#777777';
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        this.ctx.fillStyle = '#88aa88';
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#999999';
        this.ctx.beginPath();
        /*
        for (var i = 0; i < 80000; i++) {
            this.ctx.moveTo(Math.random() * 600, Math.random() * 600);
            this.ctx.lineTo(Math.random() * 600, Math.random() * 600);
        }
        */
        //this.ctx.fill();
        this.ctx.stroke();

        var tm = Date.now() / 1600;
        var x = Math.cos(tm) * 100;
        var y = Math.sin(tm) * 100;

        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = 40;
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.translate(200, 200);
        this.ctx.moveTo(100, 100);
        this.ctx.lineTo(200, 100);
        this.ctx.lineTo(200 + x, 100 + y);
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.moveTo(100, 100);
        this.ctx.lineTo(200, 100);
        this.ctx.lineTo(200 + x, 100 + y);
        this.ctx.stroke();

        this.ctx.restore();
    }

    testComposite(){
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle="red";
        ctx.fillRect(20,20,75,50);
        ctx.globalCompositeOperation="source-over";
        ctx.fillStyle="blue";
        ctx.fillRect(50,50,75,50);

        ctx.fillStyle="red";
        ctx.fillRect(150,20,75,50);
        ctx.globalCompositeOperation="destination-over";
        ctx.fillStyle="blue";
        ctx.fillRect(180,50,75,50);
        ctx.restore();
    }

    testVG(){
        var ctx = this.ctx;
        ctx.measureText('').width
        ctx.save();
        ctx.fillStyle='#ff0000';
        ctx.strokeStyle='#000000';
        ctx.beginPath();
        let k = Math.PI/180;
        ctx.arc(100,100,50,45*k,270*k);
        ctx.fill();
        ctx.beginPath();        
        ctx.fillStyle='#ffff00';
        ctx.rect(100,100,100,100);
        ctx.fill();
        ctx.stroke();
        ctx.restore();        
    }

    drawFocus(x:number, y:number){
        var ctx = this.ctx;
        ctx.moveTo(x-10,y);
        ctx.lineTo(x+10,y);
        ctx.moveTo(x,y-10);
        ctx.lineTo(x,y+10);
    }
    testFont(){
        var ctx = this.ctx;
        ctx.save();
        var fh=80;
        ctx.font=fh+'px Arial';
        ctx.textAlign='';
        ctx.fillStyle='#00ff00';
        ctx.strokeStyle='#ff0000';
        ctx.textBaseline='alphabetic';
        ctx.fillText('gbc的咖啡8屋IE',100,100);
        var mi = ctx.measureText('a');
        var mi1 = ctx.measureText('i');
        
        this.drawFocus(100,100);
        this.drawFocus(100,100-fh);
        ctx.stroke();
        ctx.restore();        
    }
    onRender = () => {
        //this.testLine();
        //this.testComposite();
        //this.testVG();
        this.testFont();
        //updateFPS(this.ctx);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
