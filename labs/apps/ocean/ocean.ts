
var π = Math.PI;
var sin = Math.sin;
var cos = Math.cos;

import {Sampler } from './sampler'

/**
 * x,y采用图像坐标
 * z指向屏幕外面
 */
export class Ocean{
    data:Uint8ClampedArray;
    width:number;
    height:number;
    maxH=0;
    minH=0;
    hfield:Float32Array;
    nfield:Float32Array;    //法线图
    θ=0;//传播方向。朝向x为0
    f=10;//频率
    ω=2*π*this.f;
    φ=0;//初相角
    Z0=0;//潮高
    A=10;//振幅
    λ=200;    //波长
    K=2*π/this.λ;
    sky:Sampler;
    //θπφωλ
    constructor(buff:Uint8ClampedArray, w:number,h:number){
        this.data = buff;
        this.width=w;
        this.height=h;
        this.hfield = new Float32Array(w*h);
        this.nfield = new Float32Array(w*h*3);
    }

    genHeight(t:number){
        var i=0;
        var pix = this.data;
        var A = 20;
        var K = this.K;
        this.maxH=-1000;
        this.minH=1000;
        var φ = this.φ;
        var ω = this.ω;
        var ωt= ω*t/1000;
        for(var y=0; y<this.height; y++){
            for(var x=0; x<this.width; x++){
                var v = A*cos(K*x-ωt+φ);
                this.hfield[i++] = v;
                if(this.maxH<v)this.maxH=v;
                if(this.minH>v)this.minH=v;
            }
        }
    }
    /**
     * 计算法线
     * 方法是：计算切空间的两个向量，叉乘后得到法线
     */
    genNormal(){
        var i=0;
        var ni=0;
        for(var y=1; y<this.height-1; y++){
            var yw=y*this.width;
            ni = 3*yw+3;//当前行的法线的起始位置.略过第一个x
            for(var x=1; x<this.width-1; x++){
                var yw_a_x = yw+x;
                var px = this.hfield[yw_a_x-1];//[x-1][y]
                var nx = this.hfield[yw_a_x+1];//[x+1][y]
                var py = this.hfield[yw_a_x-this.width];//[x][y-1]
                var ny = this.hfield[yw_a_x+this.width];//[x][y+1];
                var s =nx-px;
                var t =ny-py;
                //a = norm(2,0,s)
                //b = norm(0,2,t)
                var sl = Math.sqrt(2*2+s*s);
                var tl = Math.sqrt(2*2+t*t);
                //ay * bz - az * by = -az*by
                //az * bx - ax * bz = -ax*bz
                //ax * by - ay * bx = ax*by
                var nx = -(s/sl)*(2/tl);
                var ny = -(2/sl)*(t/tl);
                var nz = (2/sl)*(2/tl);
                var nl = Math.sqrt(nx*nx+ny*ny+nz*nz);
                this.nfield[ni++]= nx/nl;
                this.nfield[ni++]= ny/nl;
                this.nfield[ni++]= nz/nl;
            }
        }
        //左上角
        this.nfield[0]=this.nfield[this.width+1];this.nfield[1]=this.nfield[this.width+2];this.nfield[2]=this.nfield[this.width+2];
        //右上角
        var ci=(this.width-1)*3;
        this.nfield[0]=this.nfield[this.width+1];this.nfield[1]=this.nfield[this.width+2];this.nfield[2]=this.nfield[this.width+2];
        //左下角
        //右下角
        //上边
        for(x=0; x<this.width; x++){

        }
        //下边
        //左边
        //右边
    }

    renderHeight(){
        var d = this.maxH-this.minH;
        var i=0;
        var hi=0;
        var pix = this.data;
        for(var y=0; y<this.height; y++){
            for(var x=0; x<this.width; x++){
                var cd = this.hfield[hi++]-this.minH;
                var v = cd*255/d;
                pix[i++]=v;
                pix[i++]=v;
                pix[i++]=v;
                pix[i++]=255;
            }
        }
    }

    renderNormal(){
        var ni = 0;
        var ci = 0;
        var pix = this.data;
        for( var y=0; y<this.height; y++){
            for(var x=0; x<this.width; x++){
                pix[ci++]=(this.nfield[ni++]+1)/2*255;
                pix[ci++]=(this.nfield[ni++]+1)/2*255;
                pix[ci++]=(this.nfield[ni++]+1)/2*255;
                pix[ci++]=255;
            }
        }
    }

    render(){
        if(!this.sky)
            return;
        var color = new Uint8ClampedArray(4);
        var ci = 0;
        var pix = this.data;
        for( var y=0; y<this.height; y++){
            for(var x=0; x<this.width; x++){
                var u = x/this.width;
                var v = y/this.height;
                this.sky.sample(u,v,color);
                pix[ci++]=color[0];
                pix[ci++]=color[1];
                pix[ci++]=color[2];
                pix[ci++]=color[3];
            }
        }
    }

}