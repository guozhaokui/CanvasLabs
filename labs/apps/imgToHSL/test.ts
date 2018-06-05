
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

let pencils:number[][]=[];
let pencilsHSL:number[][]=[];
pencils[801]=[255,255,255];
pencils[836]=[0,0,0];
pencils[813]= [155,38,38];
pencils[810]= [164,49,39]
pencils[845]= [129,47,35]
pencils[846]= [176,105,93]
pencils[812]= [185,105,79]
pencils[806]= [185,91,47]  
pencils[848]= [182,134,94] 
pencils[807]= [182,118,28] 
pencils[804]= [183,142,32] 
pencils[803]= [182,167,42] 
pencils[802]= [178,175,27] 
pencils[817]= [110,154,33] 
pencils[816]= [42,123,40] 
pencils[820]= [41,126,68]  
pencils[818]= [23,69,47]   
pencils[840]= [16,118,89]  
pencils[821]= [31,54,52]   
pencils[851]= [29,136,131] 
pencils[822]= [40,116,165] 
pencils[826]= [17,64,111]  
pencils[824]= [26,78,153]  
pencils[825]= [16,56,149]  
pencils[827]= [28,36,143]  
pencils[823]= [18,20,93]   
pencils[850]= [38,39,146]  
pencils[830]= [177,95,120] 

function initPencil(){
    pencils.forEach((v,idx)=>{
        pencilsHSL[idx]=rgbToHsl(v[0],v[1],v[2])
    })
}

function colorDist(r1:number,g1:number,b1:number, r2:number,g2:number,b2:number){
    let dr = r1-r2;
    let dg = g2-g1;
    let db = b2-b1;
    let dist1 = Math.sqrt(dr*dr+dg*dg+db*db);

    let [h1,s1,l1]=rgbToHsl(r1,g1,b1);
    let [h2,s2,l2]=rgbToHsl(r2,g2,b2);
    let dh=h2-h1;
    let ds=s2-s1;
    let dl=l2-l1;
    let dist2 = Math.sqrt(dh*dh+ds*ds+dl*dl);
    return Math.min(dist1,dist2);
}

function v3dist(x1:number,y1:number,z1:number,x2:number,y2:number,z2:number){
    let dx=x1-x2;
    let dy=y1-y2;
    let dz=z1-z2;
    return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

function selsectPencil(r:number, g:number, b:number,h:number,s:number,l:number){
    let mindist=100000;
    let minii=-1;
    for( let i=0; i<pencils.length; i++){
        if(!pencils[i])continue;
        let [pr,pg,pb]=pencils[i];
        let [ph,ps,pl]=pencilsHSL[i];
        let dist = Math.min( v3dist(pr,pg,pb,r,g,b), v3dist(h,s,l,ph,ps,pl));
        if(mindist>dist){
            mindist=dist;
            minii=i;
        }
    }
    return pencils[minii];
}

class ImageBuffer {
    imgdt: ImageData = null;
    hsldt:Float32Array;
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

    toHSL(){
        this.hsldt=new Float32Array(this.imgdt.width*this.imgdt.height*4);
        var buf = this.imgdt.data;
        var out = this.hsldt;
        var idx = 0;
        var r = 0,g=0,b=0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                //buf[idx+3];
                let [h,s,l] = rgbToHsl(r,g,b);
                out[idx] = h;
                out[idx + 1] = s;
                out[idx + 2] = l;
                idx += 4;
            }
        }
    }

    keepH(hsldt:Float32Array) {
        var buf = this.imgdt.data;
        var idx = 0;
        let r = 0,g = 0,b = 0,h=0,s=0,l=0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                h = hsldt[idx];
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

    keepS(hsldt:Float32Array) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0,s=0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                s = hsldt[idx + 1];
                //buf[idx+3];
                [r,g,b] = hslToRgb(0,s,0.5)
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }    

    keepHS(hsldt:Float32Array) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0,h=0,s=0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                h = hsldt[idx];
                s = hsldt[idx + 1];
                [r,g,b] = hslToRgb(h,s,0.5);
                //l+=0.5;
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
                idx += 4;
            }
        }
    }    

    keepL(hsldt:Float32Array) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0;
        var g = 0;
        var b = 0,l;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                l = hsldt[idx + 2];
                [r,g,b] = hslToRgb(0,1,l)
                buf[idx] = r;
                buf[idx + 1] = r;
                buf[idx + 2] = r;
                buf[idx+3]=255;
                idx += 4;
            }
        }
    }    

    toNearest(hsldt:Float32Array) {
        var buf = this.imgdt.data;
        var idx = 0;
        var r = 0,g = 0,b = 0;
        var h=0,s=0,l=0;
        for (var y = 0; y < this.imgdt.height; y++) {
            for (var x = 0; x < this.imgdt.width; x++) {
                r = buf[idx];
                g = buf[idx + 1];
                b = buf[idx + 2];
                h=hsldt[idx];
                s=hsldt[idx+1];
                l=hsldt[idx+2];
                [r,g,b]=selsectPencil(r,g,b,h,s,l);
                buf[idx] = r;
                buf[idx + 1] = g;
                buf[idx + 2] = b;
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

var gctx: CanvasRenderingContext2D = null;


var imglist:ImageBuffer[];

var srcImg:HTMLImageElement;
var imgHSL:ImageBuffer;

async function ff(canv:HTMLCanvasElement, ctx: CanvasRenderingContext2D,imgsrc:string) {
    gctx=ctx;
    
    var img = await async.loadImage(imgsrc);
    srcImg=img;
    canv.width=img.width*4;
    canv.height=img.height*2;
    imgHSL = new ImageBuffer(img, 0, 0, img.width , img.height);
    imgHSL.toHSL();
    gctx.drawImage(img,0,0);

    //ctx.putImageData(imgl.imgdt, 0, 0);
    let img1 = new ImageBuffer(img, 0, 0, img.width , img.height);
    img1.keepH(imgHSL.hsldt);
    gctx.putImageData(img1.imgdt, img.width, 0);

    let img2 = new ImageBuffer(img, 0, 0, img.width , img.height);
    img2.keepS(imgHSL.hsldt);
    gctx.putImageData(img2.imgdt, img.width*2, 0);

    let img4 = new ImageBuffer(img, 0, 0, img.width , img.height);
    img4.keepHS(imgHSL.hsldt);
    gctx.putImageData(img4.imgdt, 0, img.height);

    let img3 = new ImageBuffer(img, 0, 0, img.width , img.height);
    img3.keepL(imgHSL.hsldt);
    gctx.putImageData(img3.imgdt, img.width, img.height);

    let img5 = new ImageBuffer(img, 0, 0, img.width , img.height);
    img5.toNearest(imgHSL.hsldt);
    gctx.putImageData(img5.imgdt, img.width*2, img.height);


    imglist=[null,img1,img2,img4,img3];
    window.requestAnimationFrame(onRender);
}

var frm = 0;
var cc = 0;
function onRender() {
    
    window.requestAnimationFrame(onRender);
}

function main(window) {
    initPencil();
    var el = document.getElementById('content');
    var canv = <HTMLCanvasElement>document.getElementById('myCanvas');
    var ctx = canv.getContext('2d',{premultipliedAlpha:false});

    let fileEle = document.createElement('input') as HTMLInputElement;
    fileEle.type='file';
    //document.body.appendChild(fileEle);
    document.body.insertBefore(fileEle,document.getElementById('root'));
    //var fileEle = document.getElementById('file') as HTMLInputElement;
    ff(canv,ctx,'./imgs/test1.jpg');

    fileEle.onchange = function(e) {
        var file1 = e.target.files[0];
        var url1 = window.URL.createObjectURL(file1);
        ff(canv,ctx,url1);
    }

}

main(window);
document.addEventListener('mousemove', (e: MouseEvent) => {

})

var restoreImg:ImageBuffer;

document.addEventListener('click',(e:MouseEvent)=>{
    let gridx=(e.clientX/srcImg.width)|0;
    let gridy=(e.clientY/srcImg.height)|0;
    let id = gridx+gridy*3;
    if(id==0)
        return;
    gctx.save();
    gctx.globalAlpha=0.5;
    let sx = gridx*srcImg.width;
    let sy = gridy*srcImg.height;
    gctx.drawImage(srcImg,sx,sy);
    gctx.restore();
    let resImg = imglist[id];
    setTimeout(() => {
        gctx.putImageData(resImg.imgdt,sx,sy);
    }, (3000));

});

document.addEventListener('mousedown',(e:MouseEvent)=>{
});
document.addEventListener('mouseup',(e:MouseEvent)=>{
});
