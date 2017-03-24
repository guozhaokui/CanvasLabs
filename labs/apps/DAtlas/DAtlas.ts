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

class DAtlas {
    canv: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
    }

    onRender = () => {
        var ctx = this.ctx;
        var img = new Image();
        img.src='a.png';
        ctx.drawImage(img,0,0);
        
        
                
        updateFPS(this.ctx);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new DAtlas(canv);
    startAnimation(app.onRender);
}
