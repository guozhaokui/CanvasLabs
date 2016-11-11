
var π = Math.PI;
var sin = Math.sin;
var cos = Math.cos;

import {Sampler } from './sampler'
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {CosWave,WaveData} from './CosWave'
import {GerstnerWave} from './GerstnerWave';

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
    sky:Sampler;    //要求格式为360度全景图
    wavedata:WaveData[];
    waveGen1:CosWave;
    waveGen2 = new GerstnerWave(128,128);
    heightimg:Sampler;
    //θπφωλ
    constructor(buff:Uint8ClampedArray, w:number,h:number){
        this.data = buff;
        this.width=w;
        this.height=h;
        this.hfield = new Float32Array(w*h);
        this.nfield = new Float32Array(w*h*3);

        var b:WaveData;
        //b.A;b.k;b.θ;b.φ;b.ω;
        this.wavedata=[
            {A:20,θ:0,φ:0,f:10,λ:100},
            {A:6,θ:π/4,φ:0,f:30,λ:50},
            {A:2,θ:π/2,φ:0,f:50,λ:30}
        ];
        this.waveGen1 = new CosWave(300,300,1,1,this.wavedata);
        //temp
        var himg = new Image();
        himg.src = 'imgs/height.png';
        himg.onload=()=>{
            this.heightimg = new Sampler(himg);
        }
    }

    genHeight(t:number){
        if( !this.heightimg )
            return;
        var hi=0; 
        var hvalue=new Uint8ClampedArray(4);
        var cu = 0;
        var cv = 0;
        var du = 1/this.heightimg.width;
        var dv = 1/this.heightimg.height; 
        var t1 = t/1000;
        for( var y=0; y<this.height; y++){
            cu=0;
            for(var x=0; x<this.width; x++){
                this.heightimg.sample(cu+t1,cv,hvalue);
                var vh = hvalue[0]/255*5;

                this.hfield[hi++] = vh;
                if(this.minH>vh) this.minH=vh;
                if(this.maxH<vh) this.maxH=vh;
                cu+=du;
            }
            cv+=dv;
        }
    }
    genHeight2(t:number){
        var i=0;
        this.hfield = this.waveGen1.update(t/1000);
        this.minH = this.waveGen1.minh;
        this.maxH = this.waveGen1.maxh;
    }
    genHeight3(t:number){
        t/=20000;
        var info={minv:0,maxv:0};
        var hf = this.waveGen2.calcHField(t,info);
        var hi=0;
        var wavW=this.waveGen2.vertXNum;
        var scale = 500;
        for(var y=0; y<this.height;y++){
            for(var x=0; x<this.width;x++){
                this.hfield[hi++]=hf[x%wavW+(y%wavW)*wavW]*scale;
            }
        }
        this.minH = info.minv*scale;
        this.maxH = info.maxv*scale;
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

    render(eyepos:Vector3){
        if(!this.sky)
            return;
        var color = new Uint8ClampedArray(4);
        var ci = 0;
        var ni = 0;
        var pix = this.data;
        for( var y=0; y<this.height; y++){
            var yw = y*this.width;
            for(var x=0; x<this.width; x++){
                var nx = this.nfield[ni++];
                var ny = this.nfield[ni++];
                var nz = this.nfield[ni++];
                var enterx = eyepos.x-x;
                var entery = eyepos.y-y;
                var enterz = eyepos.z-this.hfield[yw++];
                var enterl = Math.sqrt(enterx*enterx+entery*entery+enterz*enterz);
                enterx/=enterl; 
                entery/=enterl; 
                enterz/=enterl;
                //求反射向量。 入射线在法线上的投影放大2倍-入射线
                var dotv2 = 2*(enterx*nx+entery*ny+enterz*nz);   //入射线在法线上的投影
                var outerx = nx*dotv2-enterx;
                var outery = ny*dotv2-entery;
                var outerz = nz*dotv2-enterz;
                /*
                var texc_u = x/this.width;
                var texc_v = y/this.height;
                */
                //球形贴图头顶是z,x朝左，y朝上，
                //法线在高度上的投影对应uv的v，从-1到1转成0到1
                var upisz = false;//北极为z轴
                var texc_u,texc_v;
                if( upisz){
                    texc_v = (1+outerz)/2;//这个也可以用y，那下面的就用x，z
                    //法线在赤道上的投影转到角度对应的是u坐标。这个投影是(nx,ny,0)
                    var ang = Math.atan2(outerx,outery);//这个得到的值是 -π到π， 0对应的是x坐标的时候，
                    //转到0到1。方向颠倒
                    texc_u = (-ang+π)/2/π;
                }else{
                    texc_v = (1+outery)/2;//这个也可以用y，那下面的就用x，z
                    //法线在赤道上的投影转到角度对应的是u坐标。这个投影是(nx,ny,0)
                    var ang = Math.atan2(outerx,outerz);//这个得到的值是 -π到π， 0对应的是x坐标的时候，
                    //转到0到1。方向颠倒
                    texc_u = (-ang+π)/2/π;
                }
                if(false){//texc_v<0.5){
                    // pix[ci++]=0; 
                    // pix[ci++]=0;
                    // pix[ci++]=0;
                    // pix[ci++]=255;//color[3];
                }else{
                    //偏移90度，让y指向的为0
                    //先不做。可以通过贴图转换来做
                    this.sky.sample(texc_u,texc_v,color);

                    pix[ci++]=color[0];//(1+outerx)/2*255;// 
                    pix[ci++]=color[1];//(1+outery)/2*255;//
                    pix[ci++]=color[2];//(1+outerz)/2*255;//
                    pix[ci++]=255;//color[3];
                }
            }
        }
    }

    showXWave(ctx:CanvasRenderingContext2D, x:number,y:number){
        var hi=0;
        var canvh = 100;
        ctx.save();
        ctx.strokeStyle='red';
        ctx.translate(x,y);
        ctx.fillStyle='#777777';
        ctx.fillRect(0,0,this.width,canvh);
        ctx.beginPath();
        var dh = this.maxH-this.minH;
        var h=canvh-(this.hfield[0]-this.minH)*canvh/dh;
        ctx.moveTo(0,h);
        for(var x=0; x<this.width; x++){
            h=canvh-(this.hfield[hi++]-this.minH)*canvh/dh;
            ctx.lineTo(x,h);
        }
        ctx.stroke();
        ctx.restore();
    }
    showYWave(ctx:CanvasRenderingContext2D, x:number,y:number){
    }

    getNorm(x:number,y:number, norm:Float32Array):void{
        if(x<this.width && y<this.height ){ 
            var ni = (this.width*y+x)*3;
            norm[0] = this.nfield[ni++];
            norm[1] = this.nfield[ni++];
            norm[2] = this.nfield[ni++];
        }
    }
}