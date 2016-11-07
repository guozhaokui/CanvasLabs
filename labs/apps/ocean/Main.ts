///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../../runtime/runtimeMod/common/FPS2D');
import {Ocean} from './ocean'

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
    img: HTMLImageElement = new Image();
    ocean:Ocean;
    imgData:ImageData;
    tm=0;
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.img.src='imgs/basecolor.png'
        var w = 300;
        var h = 300;
        var imgdata =this.imgData = this.ctx.getImageData(0, 0, w, h);
        var pix = imgdata.data;
        this.ocean = new Ocean(pix,w,h);
        var skyimg = new Image();
        this.ocean.sky = skyimg;
        skyimg.src='imgs/sky.png';
    }

    render(){
        //this.ctx.drawImage(this.img,0,0);
        this.ocean.genHeight(this.tm++);
        //this.ocean.renderHeight();
        this.ocean.genNormal();
        this.ocean.renderNormal();
        this.ctx.putImageData(this.imgData, 0, 0);
    }

    onRender = () => {
        this.render();
        updateFPS(this.ctx);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
