"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const async = require("../../runtime/runtimeMod/common/Async");
function hslToRgb(h, s, l) {
    var r, g, b;
    if (s == 0) {
        r = g = b = l;
    }
    else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0)
                t += 1;
            if (t > 1)
                t -= 1;
            if (t < 1 / 6)
                return p + (q - p) * 6 * t;
            if (t < 1 / 2)
                return q;
            if (t < 2 / 3)
                return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if (max == min) {
        h = s = 0;
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return [h, s, l];
}
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
    toH() {
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
                let [h, s, l] = rgbToHsl(r, g, b);
                s = 1;
                l = 0.5;
                [r, g, b] = hslToRgb(h, s, l);
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }
    toS() {
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
                let [h, s, l] = rgbToHsl(r, g, b);
                [r, g, b] = hslToRgb(0, s, 0.5);
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }
    toHS() {
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
                let [h, s, l] = rgbToHsl(r, g, b);
                [r, g, b] = hslToRgb(h, s, 0.5);
                buf[idx] = r * l;
                buf[idx + 1] = g * l;
                buf[idx + 2] = b * l;
                idx += 4;
            }
        }
    }
    toL() {
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
                let [h, s, l] = rgbToHsl(r, g, b);
                [r, g, b] = hslToRgb(0, 0, l);
                buf[idx] = r;
                buf[idx + 1] = r;
                buf[idx + 2] = r;
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
var gctx = null;
function ff(canv, ctx, imgsrc) {
    return __awaiter(this, void 0, void 0, function* () {
        gctx = ctx;
        var img = yield async.loadImage(imgsrc);
        canv.width = img.width * 4;
        canv.height = img.height;
        let img1 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img1.toH();
        gctx.drawImage(img, 0, 0);
        gctx.putImageData(img1.imgdt, img.width, 0);
        let img2 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img2.toS();
        gctx.putImageData(img2.imgdt, img.width * 2, 0);
        let img3 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img3.toL();
        gctx.putImageData(img3.imgdt, img.width * 3, 0);
        window.requestAnimationFrame(onRender);
    });
}
var frm = 0;
var cc = 0;
function onRender() {
    window.requestAnimationFrame(onRender);
}
function main(window) {
    var el = document.getElementById('content');
    var canv = document.getElementById('myCanvas');
    var ctx = canv.getContext('2d');
    let fileEle = document.createElement('input');
    fileEle.type = 'file';
    document.body.insertBefore(fileEle, document.getElementById('root'));
    ff(canv, ctx, './imgs/test1.jpg');
    fileEle.onchange = function (e) {
        var file1 = e.target.files[0];
        var url1 = window.URL.createObjectURL(file1);
        ff(canv, ctx, url1);
    };
}
main(window);
document.addEventListener('mousemove', (e) => {
});
