
/// <reference path='../../runtime/defination/electron.d.ts' />
/// <reference path='../../runtime/defination/node.d.ts' />


import * as fs from 'fs';
import async = require('../../runtime/runtimeMod/common/Async');
//var canvasBuffer = require('electron-canvas-to-buffer');
const {nativeImage} = require('electron');
import {saveAsPng,saveCanvas,HmapToNormalmap,normalmapToHeightmap} from '../../runtime/runtimeMod/imgproc/imgfunc';

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

/**
 * 生成一个半球的法线图
 * 高度朝外，认为是z方向
 */
function GenSphereNorm(d:number, file:string){
    var r = d/2;
    var canv = document.createElement('canvas');
    canv.width=d;
    canv.height=d;
    var ctx = canv.getContext('2d');
    var imgdata = ctx.getImageData(0, 0, canv.width,canv.height);
    var pix = imgdata.data;

    var dx = 1.0/r;
    var dy = -1.0/r;
    var fx = -1.0;
    var fy = 1.0;
    var yy=0;
    var ci=0;
    for(var cy=0; cy<d; cy++){
        yy=fy*fy;
        fx=-1.0;
        for( var cx=0; cx<d; cx++){
            var xx = fx*fx;
            var dist = xx+yy;
            if(dist>1){
                pix[ci++] = 0.5*255;
                pix[ci++] = 0.5*255;
                pix[ci++] = 255;
                pix[ci++] = 255;
            }else{
                var z = Math.sqrt(1.0-xx-yy);
                pix[ci++]=(fx+1.0)/2.0*255; 
                pix[ci++]=(fy+1.0)/2.0*255;
                pix[ci++]=(z+1.0)/2.0*255;
                pix[ci++]=255;
            }
            fx+=dx;
        }
        fy+=dy;
    }
    ctx.putImageData(imgdata, 0, 0);
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
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

/**
 * vdc算法产生的序列。这个比random要均匀一些。
 */
 function radicalInverse_VdC(bits:number):number {
     //先颠倒前后16位
     bits = (bits << 16) | (bits >>> 16);
     //下面颠倒16位中的前后8位
     bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1);
     bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2);
     bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4);
     bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8);
     //必须是uint的
     return new Uint32Array([bits])[0] * 2.3283064365386963e-10; // / 0x100000000
 }

 function radicalInverse_VdC1(bits:number):number {
     //先颠倒前后16位
     bits = (bits << 16) | (bits >>> 16);
     //下面颠倒16位中的前后8位
     bits = ((bits & 0x55555555) << 1) | ((bits & 0xAAAAAAAA) >>> 1);
     bits = ((bits & 0x33333333) << 2) | ((bits & 0xCCCCCCCC) >>> 2);
     bits = ((bits & 0x0F0F0F0F) << 4) | ((bits & 0xF0F0F0F0) >>> 4);
     bits = ((bits & 0x00FF00FF) << 8) | ((bits & 0xFF00FF00) >>> 8);
     //必须是uint的
     return new Uint32Array([bits])[0] * 2.3283064365386963e-10; // / 0x100000000
 }

function saveasbmp(){
    var dt = new ImageData(32,32);
    var buf = dt.data;
    var ci=0;
    var uv = new Uint32Array(1);
    for(var y=0; y<32; y++){
        for(var x=0; x<32; x++){
            var v = radicalInverse_VdC1(ci++)*256*256*256;
            uv[0]=v;
            console.log(uv[0].toString(16));
            buf[ci++]=uv[0]&0xff;
            buf[ci++]=(uv[0]>>>8)&0xff;
            buf[ci++]=(uv[0]>>>16)&0xff;
            buf[ci++]=255;
        }
    }
    saveAsPng(dt,'d:/temp/Hammersley.png');
}

function getFromBmp(i:number,buf):number{
    return 0;
}

 /**

 function radicalInverse_VdC(bits:number):number {
     var constv = new Uint32Array([0x55555555,0xAAAAAAAA,0x33333333,0xCCCCCCCC,0x0F0F0F0F,0xF0F0F0F0,0x00FF00FF,0xFF00FF00]);
     bits = (bits << 16) | (bits >> 16);
     bits = ((bits & constv[0]) << 1) | ((bits & constv[1]) >> 1);
     bits = ((bits & constv[2]) << 2) | ((bits & constv[3]) >> 2);
     bits = ((bits & constv[4]) << 4) | ((bits & constv[5]) >> 4);
     bits = ((bits & constv[6]) << 8) | ((bits & constv[7]) >> 8);
     return bits * 2.3283064365386963e-10; // / 0x100000000
 }

  */


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
        //ResizeImg(this.img,100,100,'d:/temp/fuck.png');
        GenSphereNorm(256,'d:/temp/sphnrm.png');
saveasbmp();
        for(var i=0; i<1024; i++){
            var x = i/1024.0;
            var y = radicalInverse_VdC(i);
            x*=128;
            y*=128;
            //var x = Math.random()*128;
            //var y = Math.random()*128;
            this.ctx.fillRect(x,y,1,1);
        }
    }
    onRender() {
        if (!this.loaded)
            return;
        //this.ctx.drawImage(this.img,0,0);
    }
    
}

export function main(canv: HTMLCanvasElement) {
    var app = new ImgProc(canv);
    startAnimation(app.onRender.bind(app));
}

//
var vv = [];
for(var x=-10; x<10; x+=0.1){
    var y = Math.pow(Math.E,-x*x/2)/Math.sqrt(2*Math.PI);
    vv.push(y);
    //console.log(y);
}
