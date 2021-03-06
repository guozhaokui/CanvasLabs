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
let pencils = [];
pencils[801] = [[255, 255, 255]];
pencils[836] = [[0, 0, 0]];
pencils[813] = [[155, 38, 38]];
pencils[810] = [[164, 49, 39]];
pencils[845] = [[129, 47, 35]];
pencils[846] = [[176, 105, 93]];
pencils[812] = [[185, 105, 79]];
pencils[806] = [[185, 91, 47]];
pencils[848] = [[182, 134, 94]];
pencils[807] = [[182, 118, 28]];
pencils[804] = [[183, 142, 32]];
pencils[803] = [[182, 167, 42]];
pencils[802] = [[178, 175, 27]];
pencils[817] = [[110, 154, 33]];
pencils[816] = [[42, 123, 40]];
pencils[820] = [[41, 126, 68]];
pencils[818] = [[23, 69, 47]];
pencils[840] = [[16, 118, 89]];
pencils[821] = [[31, 54, 52]];
pencils[851] = [[29, 136, 131]];
pencils[822] = [[40, 116, 165]];
pencils[826] = [[17, 64, 111]];
pencils[824] = [[26, 78, 153]];
pencils[825] = [[16, 56, 149]];
pencils[827] = [[28, 36, 143]];
pencils[823] = [[18, 20, 93]];
pencils[850] = [[38, 39, 146]];
pencils[830] = [[177, 95, 120]];
pencils[831] = [[130, 66, 43]];
pencils[854] = [[73, 41, 62]];
pencils[808] = [[137, 80, 56]];
pencils[844] = [[79, 53, 45]];
pencils[839] = [[72, 43, 41]];
pencils[847] = [[117, 44, 47]];
pencils[829] = [[106, 25, 95]];
pencils[814] = [[111, 24, 37]];
pencils[853] = [[120, 46, 75]];
pencils[832] = [[62, 43, 36]];
pencils[833] = [[64, 57, 47]];
pencils[828] = [[76, 60, 130]];
pencils[835] = [[89, 88, 83]];
pencils[834] = [[43, 42, 50]];
function initPencil() {
    let tmpP = pencils.concat();
    tmpP.forEach((v, idx) => {
        let [r, g, b] = v[0];
        let id = idx % 100 + 200;
        pencils[id] = [[r / 2, g / 2, b / 2]];
        id = idx % 100 + 300;
        let nr = r + 50;
        if (nr > 255)
            nr = 255;
        let ng = g + 50;
        if (ng > 255)
            ng = 255;
        let nb = b + 50;
        if (nb > 255)
            nb = 255;
        pencils[id] = [[nr, ng, nb]];
    });
}
function v3dist(x1, y1, z1, x2, y2, z2) {
    let dx = x1 - x2;
    let dy = y1 - y2;
    let dz = z1 - z2;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
let gSelPen = '';
function selsectPencil(r, g, b, h, s, l) {
    let mindist = 100000;
    let minii = -1;
    let minli = 0;
    for (let i = 0; i < pencils.length; i++) {
        if (!pencils[i])
            continue;
        let [pr, pg, pb] = pencils[i][0];
        let dist = v3dist(pr, pg, pb, r, g, b);
        if (mindist > dist) {
            mindist = dist;
            minii = i;
        }
    }
    let sv = (minii / 100) | 0;
    gSelPen = '8' + minii % 100 + ':' + ['x', 'x', 'half', '+50', 'x', 'x', 'x', 'x', ''][sv];
    return pencils[minii][0];
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
    toHSL() {
        this.hsldt = new Float32Array(this.imgdt.width * this.imgdt.height * 4);
        var buf = this.imgdt.data;
        var out = this.hsldt;
        var idx = 0;
        var r = 0, g = 0, b = 0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                let [h, s, l] = rgbToHsl(r, g, b);
                out[idx] = h;
                out[idx + 1] = s;
                out[idx + 2] = l;
                idx += 4;
            }
        }
    }
    keepH(hsldt) {
        var buf = this.imgdt.data;
        var idx = 0;
        let r = 0, g = 0, b = 0, h = 0, s = 0, l = 0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                h = hsldt[idx];
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
    keepS(hsldt) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0, s = 0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                s = hsldt[idx + 1];
                [r, g, b] = hslToRgb(0, s, 0.5);
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }
    keepHS(hsldt) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0, h = 0, s = 0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                h = hsldt[idx];
                s = hsldt[idx + 1];
                [r, g, b] = hslToRgb(h, s, 0.5);
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }
    keepL(hsldt) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0, l;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                l = hsldt[idx + 2];
                [r, g, b] = hslToRgb(0, 1, l);
                buf[idx] = r;
                buf[idx + 1] = r;
                buf[idx + 2] = r;
                buf[idx + 3] = 255;
                idx += 4;
            }
        }
    }
    toNearest(hsldt) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0, g = 0, b = 0;
        var h = 0, s = 0, l = 0;
        let pendesc = '';
        let cpos = 0;
        this.penInfo = new Array(this.imgdt.width * this.imgdt.height);
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                h = hsldt[idx];
                s = hsldt[idx + 1];
                l = hsldt[idx + 2];
                [r, g, b] = selsectPencil(r, g, b, h, s, l);
                this.penInfo[cpos] = gSelPen;
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
                cpos++;
            }
        }
    }
    toNearest1() {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0, g = 0, b = 0;
        var h = 0, s = 0, l = 0;
        let cpos = 0;
        this.penInfo = new Array(this.imgdt.width * this.imgdt.height);
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                [r, g, b] = selsectPencil(r, g, b, 0, 0, 0);
                this.penInfo[cpos] = gSelPen;
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
                cpos++;
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
var imglist;
var srcImg;
var imgHSL;
var mouseDown = false;
function ff(canv, ctx, imgsrc) {
    return __awaiter(this, void 0, void 0, function* () {
        gctx = ctx;
        var img = yield async.loadImage(imgsrc);
        srcImg = img;
        canv.width = img.width * 4;
        canv.height = img.height * 2;
        imgHSL = new ImageBuffer(img, 0, 0, img.width, img.height);
        imgHSL.toHSL();
        gctx.drawImage(img, 0, 0);
        let img1 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img1.keepH(imgHSL.hsldt);
        gctx.putImageData(img1.imgdt, img.width, 0);
        let img2 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img2.keepS(imgHSL.hsldt);
        gctx.putImageData(img2.imgdt, img.width * 2, 0);
        let img4 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img4.keepHS(imgHSL.hsldt);
        gctx.putImageData(img4.imgdt, 0, img.height);
        let img3 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img3.keepL(imgHSL.hsldt);
        gctx.putImageData(img3.imgdt, img.width, img.height);
        let img5 = new ImageBuffer(img, 0, 0, img.width, img.height);
        img5.toNearest1();
        gctx.putImageData(img5.imgdt, img.width * 2, img.height);
        imglist = [null, img1, img2, img4, img3, img5];
        window.requestAnimationFrame(onRender);
    });
}
var frm = 0;
var cc = 0;
var penx = 0;
var peny = 0;
function onRender() {
    if (mouseDown) {
        let gridx = (penx / srcImg.width) | 0;
        let gridy = (peny / srcImg.height) | 0;
        let id = gridx + gridy * 3;
        if (id == 5) {
            let img = imglist[5];
            gctx.putImageData(img.imgdt, img.imgdt.width * 2, img.imgdt.height);
            let px = (penx % srcImg.width) | 0;
            let py = (peny % srcImg.height) | 0;
            let pos = px + py * srcImg.width;
            let color = 'rgb(' + img.imgdt.data.slice(pos * 4, pos * 4 + 3).join(',') + ')';
            gctx.fillStyle = color;
            gctx.fillRect(penx + 50, peny, 100, 20);
            gctx.fillStyle = '#000000';
            gctx.fillText(img.penInfo[px + py * srcImg.width], penx + 50, peny + 10);
        }
    }
    window.requestAnimationFrame(onRender);
}
function main(window) {
    initPencil();
    var el = document.getElementById('content');
    var canv = document.getElementById('myCanvas');
    var ctx = canv.getContext('2d', { premultipliedAlpha: false });
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
    if (mouseDown) {
        penx = e.clientX;
        peny = e.clientY;
    }
});
var restoreImg;
document.addEventListener('click', (e) => {
    let gridx = (e.clientX / srcImg.width) | 0;
    let gridy = (e.clientY / srcImg.height) | 0;
    let id = gridx + gridy * 3;
    if (id == 0 || id == 5)
        return;
    gctx.save();
    gctx.globalAlpha = 0.5;
    let sx = gridx * srcImg.width;
    let sy = gridy * srcImg.height;
    gctx.drawImage(srcImg, sx, sy);
    gctx.restore();
    let resImg = imglist[id];
    setTimeout(() => {
        gctx.putImageData(resImg.imgdt, sx, sy);
    }, (3000));
});
document.addEventListener('mousedown', (e) => {
    mouseDown = true;
});
document.addEventListener('mouseup', (e) => {
    mouseDown = false;
});
