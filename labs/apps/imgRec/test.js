"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const async = require('../../runtime/runtimeMod/common/Async');
class ImageBuffer {
    constructor(img, l, t, w, h) {
        this.imgdt = null;
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, l, t, w, h, 0, 0, w, h);
        this.imgdt = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    rgb2gray(R, G, B) {
        return (R * 30 + G * 59 + B * 11 + 50) / 100;
    }
    toGray() {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                var gray = this.rgb2gray(r, g, b);
                buf[idx] = gray;
                buf[idx + 1] = gray;
                buf[idx + 2] = gray;
                idx += 4;
            }
        }
    }
    get Buffer() {
        return this.imgdt.data;
    }
    getLine(y) {
        var ret = new ImageData(this.imgdt.width, 1);
        var buff = ret.data;
        var srcbuf = this.imgdt.data;
        for (var i = 0; i < this.imgdt.width; i++) {
            buff[i * 4 + 1] = 0;
            buff[i * 4 + 2] = 0;
            buff[i * 4 + 3] = 0;
        }
        return ret;
    }
}
var imgl = null;
var imgr = null;
var gctx = null;
function ff(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        gctx = ctx;
        var img = yield async.loadImage('./imgs/test.jpg');
        imgl = new ImageBuffer(img, 0, 0, img.width / 2, img.height);
        imgr = new ImageBuffer(img, img.width / 2, 0, img.width / 2, img.height);
        imgl.toGray();
        imgr.toGray();
        window.requestAnimationFrame(onRender);
    });
}
var frm = 0;
var cc = 0;
function onRender() {
    frm++;
    if (frm % 5 == 0)
        cc++;
    if (cc % 2 == 0)
        gctx.putImageData(imgl.imgdt, 0, 0);
    else
        gctx.putImageData(imgr.imgdt, 0, 0);
    window.requestAnimationFrame(onRender);
}
function main(window) {
    var el = document.getElementById('content');
    var canv = document.getElementById('myCanvas');
    var ctx = canv.getContext('2d');
    ff(ctx);
}
main(window);
document.addEventListener('mousemove', (e) => {
});
