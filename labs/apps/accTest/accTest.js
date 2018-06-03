"use strict";
const headTrack = require('../common/HeadTracker');
class accTest {
    constructor() {
        this.fullWidth = 2984;
        this.fullHeight = 672;
        this.headt = new headTrack.HeadTracker(window);
        this.radius = 100;
        this.canv = null;
        this.ctx = null;
        this.img = null;
        this.onRender = () => {
            var mat = this.headt.matRot;
            var zx = mat[8];
            var zy = mat[9];
            var zz = mat[10];
            var r = Math.atan2(-zy, -zx);
            var p = Math.atan2(-zz, -zx);
            this.onRot(-r, -p);
            window.requestAnimationFrame(this.onRender);
        };
        this.init();
        this.onRot(0, 0);
    }
    init() {
        var el = document.getElementById('content');
        this.canv = document.getElementById('myCanvas');
        this.ctx = this.canv.getContext("2d");
        this.img = new Image();
        this.img.src = '1.jpg';
        this.img.onload = () => { };
        this.img.onerror = () => {
            alert('err');
        };
    }
    onRot(r, p) {
        if (r < -3.14)
            r = -3.14;
        if (r > 3.14)
            r = 3.14;
        if (p > 3.14 / 2)
            p = 3.14 / 2;
        if (p < -3.14 / 2)
            p = -3.14 / 2;
        var pdeg = parseInt('' + p * 180 / 3.14);
        var canvw = this.canv.width;
        var canvh = this.canv.height;
        var centerx = (1 + r / 3.14) / 2 * this.fullWidth;
        var centery = (1 + p / 3.14) / 2 * this.fullHeight;
        var stx = centerx - canvw / 2 / 2;
        var sty = centery - 100;
        var m1 = this.headt.matRot;
        this.ctx.drawImage(this.img, stx, sty, canvw / 2, canvh, 0, 0, canvw / 2, canvh);
        this.ctx.drawImage(this.img, stx, sty, canvw / 2, canvh, canvw / 2, 0, canvw / 2, canvh);
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, 1000, 20);
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = "20px Arial";
        this.ctx.fillText('' + pdeg + ',' + centery, 0, 20);
        this.ctx.fillText('' + pdeg, canvw / 2, 20);
    }
    static main(window) {
        var acc = new accTest();
        window.requestAnimationFrame(acc.onRender);
    }
}
accTest.main(window);
