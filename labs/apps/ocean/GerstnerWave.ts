
/*



*/
import {ComplexArray, FFT, FFT2D} from './fft1';

var π = Math.PI;

/**
 * 获取正态分布的随机数
 * http://www.cnblogs.com/zztt/p/4025207.html
 * 采用 Box-Muller 转换，用来把两个均匀分布的数变成正态分布
 * y1 = sqrt( - 2 ln(u) ) cos( 2 pi v ) 
 * y2 = sqrt( - 2 ln(u) ) sin( 2 pi v )
 * 下面的函数采用了极坐标形式
 * @param mean 期望值
 * @param std_dev 标准差 
 * 假如我们要获得均值为180，要68.26%左右的NPC身高都在[170,190]之内，即1个标准差范围内，因此标准差为10, getNumberInND(180,10) 调用
 */
function getNumberInND(mean,std_dev):number{
    return mean+(randND()*std_dev);
}

/**
 * 标准化的正态分布
 */
function randND():number{
    var u=0.0, v=0.0, w=0.0, c=0.0;
    do{
        //获得两个（-1,1）的独立随机变量
        u=Math.random()*2-1.0;
        v=Math.random()*2-1.0;
        w=u*u+v*v;
    }while(w==0.0||w>=1.0)
    //这里就是 Box-Muller转换
    c=Math.sqrt((-2*Math.log(w))/w);
    //返回2个标准正态分布的随机数，封装进一个数组返回
    //当然，因为这个函数运行较快，也可以扔掉一个
    //return [u*c,v*c];
    return u*c;
}

export function test1():Float32Array{
    var ret = new Float32Array(100);
    ret.forEach((v,i)=>{
        for(var n=0; n<100; n++){
            var v = randND();
            ret[50+Math.floor(v*10)]+=0.01;
        }
    });
    return ret;
}
/**
 * k决定了波长，所以k和A的关系决定了波形的形状
 */
export class GerstnerWave{
    U10=5.0;  //10米处的风速
    U10θ=0;//-π/4; //风向
    U10x=1;
    U10y=0;
    vertXNum=0;//2pi区间。
    vertYNum=0;
    worldWidth=6;//128;    //水面的x宽度。单位是m
    worldHeight=6;//128;   //水面的y宽度。单位是m
    boshupu:Float32Array;
    Ak:Float32Array;
    Hk:ComplexArray;
    HField:Float32Array;    //高度图
    bmpBuffer:ImageData;    //放在这里是为了提高效率，避免每次创建
    lastU10=-1;
    lastU10θ=-1;
    needReRnd=true;
    vertData:Float32Array;       //为了效率，这里保存格子的一些信息，例如长度，随机等信息。
    vertDataEleNum=7;       //每个顶点保存的float的个数
                            //0 length |k|
                            //1 k*k
                            //2 k^6
                            //3 Math.sqrt(9.8*k)
                            //4 λr
                            //5 λi
                            //6 dot(k,U10)
                            //128x128=xxxk

    constructor(width:number, height:number){
        this.vertXNum = width;
        this.vertYNum = height;
        var num = width*height;
        this.boshupu = new Float32Array(num);
        this.Ak = new Float32Array(num);
        this.Hk = new ComplexArray(num);
        this.HField = new Float32Array(num);
        this.bmpBuffer = new ImageData(width,height);
        this.vertData = new Float32Array(num*this.vertDataEleNum);
        this.preCalc();
    }

    preCalc(){
        if(this.lastU10θ==this.U10θ && this.lastU10==this.U10 )
            return ;
        this.lastU10=this.U10;
        this.lastU10θ=this.U10θ;
                
        //初始化预计算的数据
        var gg = 9.8*9.8;
        var U102=this.U10*this.U10;
        var U102π = U102*π;
        var U104=U102*U102;
        var g=9.8;
        var gg = g*g;
        var gg1 = gg*0.688;
        var gg2 = gg1/U104;
        
        var stx = -π;//TODO 不要限制为1 //如果每个格子是1的话，K向量的取值范围就是-π到π
        var dx = 2*π/(this.vertXNum-1);
        var sty = π;//上下颠倒
        var dy = -2*π/(this.vertYNum-1);
        var k=0;//波向量的长度
        var cx = stx;
        var cy = sty;
        var prei=0;
        for(var y=0; y<this.vertYNum; y++){
            var yy = cy*cy;
            for( var x=0; x<this.vertXNum; x++){
                var ll = cx*cx+yy;
                var l = Math.sqrt(ll);
                this.vertData[prei++]=l;
                this.vertData[prei++]=ll;
                this.vertData[prei++]=ll*ll*ll;
                this.vertData[prei++]=Math.sqrt(9.8*l);
                if(this.needReRnd){
                    this.vertData[prei++]=randND();
                    this.vertData[prei++]=randND();
                }else{
                    prei++;prei++;
                }
                this.vertData[prei++]=cx*this.U10x+cy*this.U10y;    //这个其实不用
                cx+=dx;
            }
            cy+=dy;
        }
        this.calcA(null);   //这个一次计算即可
        this.needReRnd=false;
    }

    changeDir(dir:number){
        //需要重新进行预计算
        this.U10θ=dir;
        this.U10x=this.U10*Math.cos(this.U10θ);
        this.U10y=this.U10*Math.sin(this.U10θ);
        this.preCalc();
    }

    /**
     * 计算波数谱。
     * 这个采用 http://wenku.baidu.com/link?url=PW4ae4SwoRIK4dtZ4DjDHh01e3KgLjOtKsJwBnSJI9U4ODVaEfGT9qHAMQ8t14fX6F7chQKwKQwdQdVxwV2Z4SLMz6Xe5YZh66HzTxeG7Um
     * 的公式。
     * 百度文库 基于FFT的海浪实时仿真方法_侯学隆
     */
    calcBoShuPu(info:{minv:number,maxv:number}):Float32Array{
        var width=this.vertXNum;
        var height = this.vertYNum;
        //如果每个格子是1的话，K向量的取值范围就是-π到π
        //否则就是 2*πp/Lx , p是格子数量，Lx是实际宽度
        var stx = -π;
        var dx = 2*π/(width-1);
        var sty = π;//上下颠倒
        var dy = -2*π/(height-1);;
        var k=0;//波向量的长度
        var kk = 0;
        var U10=this.U10; 
        var U10θ=this.U10θ;
        var U10x = U10*Math.cos(U10θ);
        var U10y = U10*Math.sin(U10θ);
        var U102=U10*U10;
        var U102π = U102*π;
        var U104=U102*U102;
        var g=9.8;
        var gg = g*g;
        var gg1 = gg*0.688;
        var gg2 = gg1/U104;
        var U102π1 = 0.0081/U102π;
        var dotv=0;//方向与主浪向的点积
        //var dotvx=0;
        //var dotvy=0;
        //var dotdx=0;
        //var dotdy;
        var ri=0;
        var minv=1e6;
        var maxv=-1e6;
        //x,y的范围都是2π
        var cx=stx;
        var cy=sty;
        for(var ny=0; ny<height; ny++){
            var yy = cy*cy;
            //dotvx=0;
            cx=stx;
            for( var nx=0; nx<width; nx++){
                //dotv = dotvy+dotvx;
                dotv = cx*U10x+cy*U10y;
                //问题：朝向与主浪向相反的时候怎么办
                if(dotv>=0){
                    var xx = cx*cx;
                    var kk = (xx+yy);//k^2
                    var k6 = kk*kk*kk;
                    /*
                    var v = 0.0081/(π*k6*U102)*
                        Math.exp(-(0.688*gg/U104/kk))*
                        (dotv*dotv);
                    */
                    var v = U102π1/k6*Math.exp(-(gg2/kk))*(dotv*dotv);
                    this.boshupu[ri++]=v;
                }else{
                    this.boshupu[ri++]=0;
                }
                if(minv>v)minv=v;
                if(maxv<v)maxv=v;
                //dotvx+=U10x;
                cx+=dx;
            }
            //dotvy+=U10y;
            cy+=dy;
        }
        if(info){
            info.minv=minv;
            info.maxv=maxv;
        }
        return this.boshupu;
    }

    /**
     * 计算振幅 A({kx,ky})
     * 
     */
    calcA(info:{minv:number,maxv:number}):Float32Array{
        this.calcBoShuPu(null);
        var minv=1e6;
        var maxv=-1e6;
        var bi=0;
        var deltaKx=2*π/this.worldWidth;
        var deltaKz=2*π/this.worldHeight;
        var dkxdkz = deltaKx*deltaKz;
        for(var ny=0; ny<this.vertYNum; ny++){
            for( var nx=0; nx<this.vertXNum; nx++){
                var v = this.boshupu[bi];
                v = Math.sqrt(v*dkxdkz);
                if(v>maxv)maxv=v;
                if(v<minv)minv=v;
                this.Ak[bi]=v;
                bi++;
            }
        }
        if( info){
            info.minv=minv;
            info.maxv=maxv;
        }
        return this.Ak;
    }

    /**
     * 计算傅里叶因子
     * 注意 这个生成的结果是以中心为原点的。实际使用的时候需要偏移
     * @param t {number} 时间
     */
    calcH(t:number,info:{minv:number,maxv:number}):ComplexArray{
        //直接使用已有的A
        var minv=1e6;
        var maxv=-1e6;
        var sqrt2 = Math.sqrt(2);
        var ai=0;
        var hi=0;
        var real=this.Hk.real;
        var imag=this.Hk.imag;
        var prei=0;
        for(var ny=0; ny<this.vertYNum; ny++){
            for( var nx=0; nx<this.vertXNum; nx++){
                var A = this.Ak[ai++];
                var λr=this.vertData[prei+4];
                var λi=this.vertData[prei+5];
                var gkt = this.vertData[prei+3]*t;
                var Cv = Math.cos(gkt);
                var Sv = Math.sin(gkt);
                var t1 = A/sqrt2;
                var Rv = t1*(λr*Cv-λi*Sv);//H的实数部分
                var Iv = t1*(λr*Sv+λi*Cv);//H的虚数部分
                real[hi]=Rv;
                imag[hi]=Iv;
                if(minv>Rv)minv=Rv;
                if(maxv<Rv)maxv=Rv;
                hi++;
                prei+=this.vertDataEleNum;
            }
        }
        if(info){
            info.minv=minv;
            info.maxv=maxv;
        }

        //偏移一下，把原点移到左上角
        var NH = new ComplexArray(this.Hk.length);
        var w = this.vertXNum;
        var off = w/2;          //TODO 这里不太好，而且要避免出现小数
        var nhi=0;
        for(var y=0; y<this.vertYNum; y++){
            for(var x=0; x<this.vertXNum; x++){
                var cx = (x+off)%w;
                var cy = (y+off)%w;
                var ci = cx+cy*w;
                NH.real[nhi]=this.Hk.real[ci];
                NH.imag[nhi]=this.Hk.imag[ci];
                nhi++;
            }
        }
        this.Hk = NH;
        return this.Hk;
    }

    /**
     * 计算高度场。
     * 
     */
    calcHField(t:number,info:{minv:number,maxv:number}):Float32Array{
        var H = this.calcH(t,null);
        var compHField = FFT2D(H,this.vertXNum,this.vertYNum,true);
        this.HField = compHField.real;
        var minv=1e6;
        var maxv=-1e6;
        this.HField.forEach((v,i,arr)=>{
            //v = Math.abs(v);
            arr[i]=v;
            if(v<minv)minv=v;
            if(v>maxv)maxv=v;
        });
        if(info){
            info.minv=minv;
            info.maxv=maxv;
        }
        return this.HField;
    }

    /**
     * 计算每个点的新的位置
     */
    calcX0Pos(t:number,info:{minv:number,maxv:number}){
        var H = this.calcH(t,null);
        var compHField = FFT2D(H,this.vertXNum,this.vertYNum,true);
        var pos = new Float32Array(compHField.real.length*3);//x,y,z
        var minv=1e6;
        var maxv=-1e6;
        /**
         * 水平面的两个点为x,z
         * x=x0+kx*compHField.imag
         * z=z0+kz*compHField.imag
         * 高度为
         * y=y0+compHField.real
         */

        for(var y=0; y<this.vertYNum; y++){
            for(var x=0; x<this.vertXNum; x++){
                //TODO
                //if(v<minv)minv=v;
                //if(v>maxv)maxv=v;
            }
        }        
        if(info){
            info.minv=minv;
            info.maxv=maxv;
        }
    }    
}