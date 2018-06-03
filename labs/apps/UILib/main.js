'use strict';
const FPS2D = require('../../runtime/runtimeMod/common/FPS2D');
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
        this.ctx.restore();
    }
}
function main(canv) {
    var app = new CanvasTest(canv);
    startAnimation(app.onRender);
}
exports.main = main;
