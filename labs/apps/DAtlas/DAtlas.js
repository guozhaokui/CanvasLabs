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
class DAtlas {
    constructor(canv) {
        this.canv = null;
        this.ctx = null;
        this.onRender = () => {
            var ctx = this.ctx;
            var img = new Image();
            img.src = 'a.png';
            ctx.drawImage(img, 0, 0);
            updateFPS(this.ctx);
        };
        this.canv = canv;
        this.ctx = canv.getContext("2d");
    }
}
function main(canv) {
    var app = new DAtlas(canv);
    startAnimation(app.onRender);
}
exports.main = main;
