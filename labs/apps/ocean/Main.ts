///<reference path="../../runtime/defination/gl-matrix.d.ts" />
'use strict'
import FPS2D = require('../../runtime/runtimeMod/common/FPS2D');
import {Ocean} from './ocean'
import {Sampler } from './sampler'
import {Plane} from '../../runtime/runtimeMod/shape/Plane';
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';


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

    render(){
        this.ctx.save();
        //this.ctx.drawImage(this.img,0,0);
        this.ocean.genHeight(this.tm++);
        //this.ocean.renderHeight();
        this.ocean.genNormal();
        //this.ocean.renderNormal();
        this.ocean.render(this.eyepos);
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
