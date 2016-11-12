///<reference path="../../runtime/defination/gl-matrix.d.ts" />
/// <reference path="../../../typings/jquery/jquery.d.ts" />

'use strict'
import FPS2D = require('../../runtime/runtimeMod/common/FPS2D');

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
        this.ctx.restore();
    }

    onRender = () => {
        this.testLine();
        updateFPS(this.ctx);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new CanvasTest(canv);
    //$('canvas#myCanvas').on('click',()=>{alert('kk');});
    startAnimation(app.onRender);
}
