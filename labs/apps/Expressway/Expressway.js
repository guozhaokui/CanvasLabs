'use strict';
const FPS2D = require('../common/FPS2D');
function startAnimation(renderFunc) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}
var updateFPS = new FPS2D.FPS2D().updateFPS;
class CanvasTest {
    constructor(canv) {
        this.fullWidth = 2984;
        this.fullHeight = 672;
        this.canv = null;
        this.ctx = null;
        this.img = null;
        this.onRender = () => {
            this.testLine();
            updateFPS(this.ctx);
        };
        this.canv = canv;
        this.ctx = canv.getContext("2d");
    }
    testLine() {
        this.ctx.save();
        this.ctx.fillStyle = '#777777';
        this.ctx.fillRect(0, 0, this.canv.width, this.canv.height);
        this.ctx.fillStyle = '#88aa88';
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = '#999999';
        this.ctx.beginPath();
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
}
function main(canv) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
exports.main = main;
