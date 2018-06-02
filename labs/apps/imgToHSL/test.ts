
import async = require('../../runtime/runtimeMod/common/Async');

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   {number}  r       The red color value
 * @param   {number}  g       The green color value
 * @param   {number}  b       The blue color value
 * @return  {Array}           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

class ImageBuffer {
    imgdt: ImageData = null;
    constructor(img: HTMLImageElement, l: number, t: number, w: number, h: number) {
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, l, t, w, h, 0, 0, w, h);
        //每个像素4个
        this.imgdt = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    rgb2gray(R: number, G: number, B: number): number {
        return (R * 30 + G * 59 + B * 11 + 50) / 100
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
                //buf[idx+3];
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
                //buf[idx+3];
                let [h,s,l] = rgbToHsl(r,g,b);
                s=1;
                l=0.5;
                [r,g,b] = hslToRgb(h,s,l);
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
                //buf[idx+3];
                let [h,s,l] = rgbToHsl(r,g,b);
                [r,g,b] = hslToRgb(1,0.0,l)
                buf[idx] = r;
                buf[idx + 1] = r;
                buf[idx + 2] = r;
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
                //buf[idx+3];
                let [h,s,l] = rgbToHsl(r,g,b);
                [r,g,b] = hslToRgb(h,s,0.5);
                //l+=0.5;
                buf[idx] = r*l;
                buf[idx + 1] = g*l;
                buf[idx + 2] = b*l;
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
                //buf[idx+3];
                let [h,s,l] = rgbToHsl(r,g,b);
                l*=255;
                buf[idx] = l;
                buf[idx + 1] = l;
                buf[idx + 2] = l;
                idx += 4;
            }
        }
    }    

    get Buffer() {
        return this.imgdt.data;
    }

    getLine(y: number): ImageData {
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

var img1: ImageBuffer = null;
var gctx: CanvasRenderingContext2D = null;
async function ff(ctx: CanvasRenderingContext2D) {
    gctx=ctx;
    var img = await async.loadImage('./imgs/test.jpg');
    img1 = new ImageBuffer(img, 0, 0, img.width , img.height);
    //ctx.putImageData(imgl.imgdt, 0, 0);
    img1.toHS();
    window.requestAnimationFrame(onRender);
}

var frm = 0;
var cc = 0;
function onRender() {
    gctx.putImageData(img1.imgdt, 0, 0);
    window.requestAnimationFrame(onRender);
}

function main(window) {
    var el = document.getElementById('content');
    var canv = <HTMLCanvasElement>document.getElementById('myCanvas');
    var ctx = canv.getContext('2d');
    ff(ctx);
}

main(window);
document.addEventListener('mousemove', (e: MouseEvent) => {

})

