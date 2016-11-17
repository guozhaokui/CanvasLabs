
/// <reference path='../../runtime/defination/electron.d.ts' />
/// <reference path='../../runtime/defination/node.d.ts' />

import * as fs from 'fs';
import async = require('../../runtime/runtimeMod/common/Async');
//var canvasBuffer = require('electron-canvas-to-buffer');
const {nativeImage} = require('electron');

function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

/**
 * 把一个图片缩放一下，保存到指定的文件中
 */
function ResizeImg(img:HTMLImageElement, nw:number,nh:number, file:string){
    //var nw = parseInt((img.width*scx).toString());
    //var nh = parseInt((img.height*scy).toString());
    var canv = document.createElement('canvas');
    canv.width=nw;
    canv.height=nh;
    var ctx = canv.getContext('2d');
    ctx.drawImage(img,0,0,img.width,img.height,0,0,nw,nh);
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
    var sz:{width:number,height:number} = nimg.getSize();
    console.log('new img:'+sz.width+','+sz.height);
    fs.writeFileSync(file,nimg.toPng());
}

class ImageBuffer {
    imgdt: ImageData = null;
    constructor(img: HTMLImageElement, l: number, t: number, w: number, h: number) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
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

class ImgProc {
    img: HTMLImageElement = null;
    ctx: CanvasRenderingContext2D = null;
    canv:HTMLCanvasElement=null;
    loaded = false;
    constructor(canv: HTMLCanvasElement) {
        this.canv=canv;
        this.ctx = canv.getContext('2d');
        this.img = new Image();
        this.img.src = './imgs/test.jpg';
        this.img.onload = function() { this.loaded = true; }.bind(this);
        canv.onclick=this.onCanvClick.bind(this);
    }

    onCanvClick(e:MouseEvent){
        //this.canv.toDataURL("image/png");
        ResizeImg(this.img,100,100,'d:/temp/fuck.png');
    }
    onRender() {
        if (!this.loaded)
            return;
        this.ctx.drawImage(this.img,0,0);
    }
    
}

export function main(canv: HTMLCanvasElement) {
    var app = new ImgProc(canv);
    startAnimation(app.onRender.bind(app));
}

