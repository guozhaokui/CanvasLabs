///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../../runtime/runtimeMod/common/FPS2D');
import {Ocean} from './ocean'
import {Sampler } from './sampler'
import {Plane} from '../../runtime/runtimeMod/shape/Plane';
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';
import {GerstnerWave} from './GerstnerWave'


function startAnimation(renderFunc: () => void) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}

var updateFPS = new FPS2D.FPS2D().updateFPS;

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
    tm=0;
    eyepos:Vector3;
    normValue='Normal:';
    curNorm=new Float32Array(3);
    testGW = new GerstnerWave(129,129);
    constructor(canv: HTMLCanvasElement) {
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.img.src='imgs/basecolor.png'
        var w = 300;
        var h = 300;
        this.eyepos = new Vector3(w/2,h/2,200); 
        var imgdata =this.imgData = this.ctx.getImageData(0, 0, w, h);
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

    render(){
        this.ctx.save();
        //this.ctx.drawImage(this.img,0,0);
        //this.ocean.genHeight(this.tm++);
        //this.ocean.genNormal();
        //this.ocean.renderHeight();
        //this.ocean.renderNormal();
        //this.ocean.render(this.eyepos);
        this.ocean.showXWave(this.ctx, 0,300);
        this.ctx.putImageData(this.imgData, 0, 0);
        this.ctx.fillStyle='white';
        this.ctx.fillRect(0,500,1000,200);
        this.ctx.fillStyle='black';
        this.ctx.font='30px Arial';
        this.ctx.fillText(this.normValue,0,600);
        this.ctx.restore();

        //TEST
        var ctx = this.ctx;
        ctx.save();
        ctx.translate(0,600);
        ctx.beginPath();
        ctx.fillStyle='white';
        ctx.fillRect(0,0,300,300);
        ctx.strokeStyle='red';
        ctx.moveTo(0,0);
        var st = 10;
        var a=10;
        var b = 20;
        for( var t=0; t<300; t++){
            var x = a*t - b*Math.cos(t/2);
            var y = a + b*Math.sin(t/2);
            ctx.lineTo(x,y); 
        }
        ctx.stroke();
        ctx.restore();
        //TEST
        //TEST
        var outxy = this.func_p_m_ittc_pu([0.3,0.01,4]);
        this.drawPlot(0,600,outxy[0],outxy[1],ctx);
        //TEST
        //this.testGW.U10+=0.01;
        var info={minv:0,maxv:0};
        var bp = this.testGW.getBoShuPu(info);
        console.log('min:'+info.minv+',max:'+info.maxv);
        this.drawFloatArray2(300,0,bp,this.testGW.vertXNum,this.testGW.vertYNum,info.minv,info.maxv,this.testGW.bmpBuffer, ctx);
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
