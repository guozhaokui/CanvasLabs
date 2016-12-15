///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../../runtime/runtimeMod/common/FPS2D');
import {Ocean} from './ocean'
import {Sampler } from './sampler'
import {Plane} from '../../runtime/runtimeMod/shape/Plane';
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';
import {GerstnerWave} from './GerstnerWave';
import {complex,fft,ifft,fft2} from './FFT';
import {ComplexArray, FFT, FFT2D} from './fft1';
import {saveAsPng,saveCanvas,HmapToNormalmap,normalmapToHeightmap} from '../../runtime/runtimeMod/imgproc/imgfunc';

function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var updateFPS = new FPS2D.FPS2D().updateFPS;

/**
 * 1024x1024的大图，保存128x128的法线动画。
 */
class NormalAnimCanv{
    curfrm=0;
    normalAnimCanv:HTMLCanvasElement;
    ctx:CanvasRenderingContext2D;
    cx=0;
    cy=0;
    gridw=128;
    constructor(){
        this.normalAnimCanv = document.createElement('canvas');
        this.normalAnimCanv.width=1024;
        this.normalAnimCanv.height=1024;
        this.ctx = this.normalAnimCanv.getContext('2d');
   }

   setCurFrmData(data:ImageData){
       if(data.width!=this.gridw)
            throw 'error size not match! should: 128';
       this.ctx.putImageData(data,this.cx,this.cy);
   }

   save(file:string){
       saveCanvas(this.normalAnimCanv,file);
   }

   /**
    * 如果超了就返回false
    */
   nextfrm():boolean{
       this.curfrm++;
       this.cx+=this.gridw;
       if(this.cx>=1024){
           this.cx=0;
           this.cy+=this.gridw;
       }
       return this.cy<=1024; 
   }
}

/**
 * 生成128x128的法线计算表
 */
class NormalTable{
    w=128;
    hmap:Float32Array;
    maxh=0;
    constructor(){
        this.hmap = new Float32Array(this.w*this.w);
        var ci=0;
        var d = 2.0*Math.PI/this.w;
        var cx=0,cy=0;
        for( var y=0; y<this.w; y++){
            cx=0;
            for(var x=0; x<this.w; x++){
                var h =this.getH(cx,cy);
                if(this.maxh<h) this.maxh=h;
                this.hmap[ci++]=h;
                cx+=d;
            }
            cy+=d;
        }
        console.log('maxh='+this.maxh);
        var data = HmapToNormalmap(this.hmap,this.w,this.w,10.0,0,0,this.maxh);
        saveAsPng(data, 'd:/temp/normaltable.png');
        //test
        var hbuf = normalmapToHeightmap('d:/temp/normaltable.png',1,1);
    }

    getH(x:number,y:number):number{
        var wvx = 1.0-Math.abs(Math.sin(x));
        var wvy = 1.0-Math.abs(Math.sin(y));
        var swvx = Math.abs(Math.cos(x));
        var swvy = Math.abs(Math.cos(y));    
        wvx = wvx*(1.0-wvx)+swvx*wvx;
        wvy = wvy*(1.0-wvy)+swvy*wvy;
        //return Math.pow(1.0-Math.pow(wvx*wvy,0.65),choppy);
        //return pow(1.0-pow(wv.x * wv.y,1.),choppy);
        return Math.pow(1.0-Math.pow(wvx * wvy,1.),2.0);;        
    }

    test(){

    }
}

new NormalTable();

class OceanTest {
    left: HTMLDivElement;
    right: HTMLDivElement;
    fullWidth = 2984;
    fullHeight = 672;
    canv: HTMLCanvasElement = null;
    ctx: CanvasRenderingContext2D = null;
    img: HTMLImageElement = new Image();
    ocean:Ocean;
    imgData:ImageData;
    tm=Date.now();
    tm1=0;
    eyepos:Vector3;
    normValue='Normal:';
    curNorm=new Float32Array(3);
    testGW = new GerstnerWave(128,128);
    datacanv :HTMLCanvasElement;
    savenum=0;
    normAnim:NormalAnimCanv=new NormalAnimCanv();
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.img.src='imgs/basecolor.png'
        this.datacanv = document.createElement('canvas');
        this.datacanv.width=128;
        this.datacanv.height=128;
        var w = 128;
        var h = 128;
        this.eyepos = new Vector3(w/2,h/2,200); 
        //var imgdata =this.imgData = this.ctx.getImageData(0, 0, w, h);
        var imgdata = this.imgData =this.datacanv.getContext('2d').getImageData(0,0,this.datacanv.width,this.datacanv.height); 
        var pix = imgdata.data;
        this.ocean = new Ocean(pix,w,h);
        var skyimg = new Image();
        skyimg.onload=()=>{
            this.ocean.sky = new Sampler(skyimg);
        }
        skyimg.src='imgs/sky1.jpg';
    }


    /**
     * 计算 ittc 谱
     * x 是 ω，结果是对应的频谱（能量谱）
     */
    func_p_m_ittc_pu(xrange:number[]):Float32Array[]{
        var xarr=[];
        var yarr=[];
        var a=0.0081;
        var g=9.8;
        var b=0.74;
        var U=11.5; //三一平均波幅 风速
        /**
         * 2.8怎么来的
         * U = 11.5 = 6.85*sqrt(h) 
         * h=2.8
         */
        var h = 2.8;
        for(var x=xrange[0]; x<xrange[2]; x+=xrange[1]){
            xarr.push(x);
            var sittc = (0.78/Math.pow(x,5)) *
                        Math.exp(-3.12/(h*h*Math.pow(x,4)));
            yarr.push(sittc);
        }
        return [new Float32Array(xarr),new Float32Array(yarr)];
    }

    /**
     * 把 xarr,yarr 画到x,y 范围300,300的地方。y向上。
     */
    drawPlot(x:number,y:number, xarr:Float32Array, yarr:Float32Array, ctx:CanvasRenderingContext2D){
        ctx.save();
        ctx.translate(x,y);
        ctx.fillStyle='white';
        var minx=1e6,miny=1e6;
        var maxx=-1e6,maxy=-1e6;
        xarr.forEach((v)=>{if(minx>v)minx=v; if(maxx<v)maxx=v;});
        yarr.forEach((v)=>{if(miny>v)miny=v; if(maxy<v)maxy=v;});

        ctx.fillRect(0,0,300,300);//画在固定大小的地方。
        //转换到画布空间
        var txarr=new Float32Array(xarr);   //复制一个。
        var tyarr=new Float32Array(yarr);
        var xw = maxx-minx;
        var yw = maxy-miny;
        txarr.forEach((v,i)=>{
            txarr[i]=300*(v-minx)/xw;
        });
        tyarr.forEach((v,i)=>{
            tyarr[i]=300-300*(v-miny)/yw;
        });

        ctx.strokeStyle='red';
        ctx.moveTo(txarr[0],tyarr[0]);
        for( var xi=1;xi<txarr.length; xi++){
            ctx.lineTo(txarr[xi], tyarr[xi]);
        }
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 用黑白色显示一个二维浮点数的值。
     * @param x 
     * @param y
     * @param v 
     * @param w {number} 数据的宽
     * @param h {number} 数据的高
     * @param minv {number} 这个值对应黑色
     * @param maxv {number} 这个值对应白色
     * @param bmpbuff {Uint8ClampedArray} 外部提供buffer，可以提高效率，不用每次都取屏幕的
     */
    drawFloatArray2(x:number, y:number, v:Float32Array, w:number, h:number, minv:number,maxv:number, bmpbuff:ImageData, ctx:CanvasRenderingContext2D){
        if( bmpbuff==null){
            bmpbuff=new ImageData(w,h);
        }
        var pix = bmpbuff.data;
        var dv =maxv-minv;
        dv=255/dv;
        if(dv<=0){
            console.error('err1');
            return;
        } 
        var vi=0;
        var ci=0;
        for(var cy=0; cy<h; cy++){
            for( var cx=0; cx<w; cx++){
                var cv = (v[vi]-minv)*dv;
                pix[ci++]=cv; 
                pix[ci++]=cv;
                pix[ci++]=cv;
                pix[ci++]=255;
                vi++;
            }
        }
        ctx.putImageData(bmpbuff, x, y);
    }

    testFFT1(){
        //制造一个白色方块
        var w=256;
        var cmparr = new ComplexArray(2)
        var data = new Float32Array(256*256);
        for( var y=128-16; y<=128+16; y++){
            for( var x=128-16; x<=128+16; x++){
                data[y*w+x]=1;
            }
        }

        var fftr = fft2(data,w,w);
        var fftrR = new Float32Array(256*256);
        var fi=0;
        var minv=1e6;
        var maxv=-1e6;
        var cx=w/2;
        var cy=w/2;
        for(var y=0; y<w; y++){
            var cyw=cy*w;
            for(var x=0; x<w; x++){
                var v = Math.abs(fftr[cx+cyw].real);
                if(minv>v)minv=v;
                if(maxv<v)maxv=v;
                fftrR[fi++]=v;
                cx++;
                cx%=w;
            }
            cy++;
            cy%=w;
        }
        this.drawFloatArray2(300,0,fftrR,w,w,minv,maxv/4,null, this.ctx);
    }

    testFFT(){
        //制造一个白色方块
        var w=256;
        var data = new Float32Array(256*256);
        for( var y=128-16; y<=128+16; y++){
            for( var x=128-16; x<=128+16; x++){
                data[y*w+x]=1;
            }
        }
        var cmparr = new ComplexArray(w*w);
        cmparr.real=data;
        var fftr0 = FFT2D(cmparr,w,w,false);
        var fftr1 = FFT2D(fftr0,w,w,true);
        var fftrR = new Float32Array(w*w);
        var fi=0;
        var minv=1e6;
        var maxv=-1e6;
        var cx=w/2;
        var cy=w/2;
        for(var y=0; y<w; y++){
            var cyw=cy*w;
            for(var x=0; x<w; x++){
                var v = Math.abs(fftr1.real[cx+cyw]);
                if(minv>v)minv=v;
                if(maxv<v)maxv=v;
                fftrR[fi++]=v;
                cx++;
                cx%=w;
            }
            cy++;
            cy%=w;
        }
        this.drawFloatArray2(300,0,fftrR,w,w,minv,maxv/4,null, this.ctx);
    }

    render(){
        this.ctx.save();
        //this.ctx.drawImage(this.img,0,0);
        var gconfig = (<any>window).tmpgconfig as {slide1:number, slide2:number};
        var windspeed=gconfig.slide1;
        var winddir = gconfig.slide2*Math.PI*2/100;
        this.ocean.waveGen2.U10 =windspeed;
        this.ocean.waveGen2.U10θ=winddir;
        this.ocean.waveGen2.preCalc();

        var tm = (Date.now()-this.tm)/20000;

        this.ocean.genHeight3(this.tm1);
        this.tm1+=0.015625;//这样正好64帧一循环
        this.ocean.genNormal();
        //this.ocean.renderHeight();
        this.ocean.renderNormal();
        this.datacanv.getContext('2d').putImageData(this.imgData,0,0);
        if(this.savenum<64){
            this.normAnim.setCurFrmData(this.imgData);
            if(!this.normAnim.nextfrm()){
                throw 'kkk';
            }
            //saveCanvas(this.datacanv,'d:/temp/ss'+this.savenum+'.png');
            this.savenum++;
        }else if(this.savenum==64){
            this.normAnim.save('d:/temp/normanim.png');
            alert('ok');
            this.savenum++;
        }
        this.ctx.drawImage(this.datacanv,0,0);
        //this.ocean.render(this.eyepos);
        this.ocean.showXWave(this.ctx, 0,300);
        //this.ctx.putImageData(this.imgData, 0, 0);
        this.ctx.fillStyle='white';
        this.ctx.fillRect(0,500,1000,200);
        this.ctx.fillStyle='black';
        this.ctx.font='20px Arial';
        this.ctx.fillText(this.normValue,0,600);
        this.ctx.restore();

        //TEST
        var ctx = this.ctx;
 
        //TEST
        //TEST
        //var outxy = this.func_p_m_ittc_pu([0.3,0.01,4]);
        //this.drawPlot(0,600,outxy[0],outxy[1],ctx);
        //TEST
        //this.testGW.U10+=0.01;
        this.testGW.U10=windspeed;
        this.testGW.U10θ=winddir;
        this.testGW.preCalc();
        var info={minv:0,maxv:0};
        //var bp = this.testGW.calcBoShuPu(info);
        //var bp = this.testGW.calcA(info);
        var bp = this.testGW.calcH(0,info).real;
        //var bp = this.testGW.calcHField(Date.now()/20000,info);
        console.log('min:'+info.minv+',max:'+info.maxv);
        this.drawFloatArray2(300,0,bp,this.testGW.vertXNum,this.testGW.vertYNum,0,0.001,this.testGW.bmpBuffer, ctx);
        //this.testFFT();
    }

    onRender = () => {
        this.render();
        updateFPS(this.ctx);
    }

    onmousemove(x:number,y:number){
        this.ocean.getNorm(x,y,this.curNorm);
        if(!isNaN(this.curNorm[0]) )
            this.normValue = 'NORM:  '+this.curNorm[0].toPrecision(4)+',  '+this.curNorm[1].toPrecision(4)+',  '+this.curNorm[2].toPrecision(4);
    }
}

export function main(canv: HTMLCanvasElement) {
    var app = new OceanTest(canv);
    startAnimation(app.onRender);
    canv.onmousemove=(e:MouseEvent)=>{
        app.onmousemove(e.clientX,e.clientY);
        //console.log('kkkk'+e.clientX+','+e.clientY);
    }
}
