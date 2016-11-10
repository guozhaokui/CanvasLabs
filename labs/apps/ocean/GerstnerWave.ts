
/*



*/
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


/**
 * k决定了波长，所以k和A的关系决定了波形的形状
 */
export class GerstnerWave{
    U10=11.5;  //10米处的风速
    U10θ=0;//-π/4; //风向
    vertXNum=0;//2pi区间。
    vertYNum=0;
    worldWidth=128;    //水面的x宽度。单位是m
    worldHeight=128;   //水面的y宽度。单位是m
    boshupu:Float32Array;
    Ak:Float32Array;
    Hk:Float32Array;
    bmpBuffer:ImageData;    //放在这里是为了提高效率，避免每次创建
    constructor(width:number, height:number){
        this.vertXNum = width;
        this.vertYNum = height;
        this.boshupu = new Float32Array(width*height);
        this.Ak = new Float32Array(width*height);
        this.Hk = new Float32Array(width*height);
        this.bmpBuffer = new ImageData(width,height);
    }
    getZ(t:number){
        
    }

    /**
     * 计算高度场。
     * 
     */
    calcHField(){

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
        for(var ny=0; ny<this.vertYNum; ny++){
            for( var nx=0; nx<this.vertXNum; nx++){
                var v = this.boshupu[bi];
                v = Math.sqrt(v*deltaKx*deltaKz);
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
     * @param t {number} 时间
     */
    calcH(t:number,info:{minv:number,maxv:number}):Float32Array{
        this.calcA(null);
        var minv=1e6;
        var maxv=-1e6;
        var stx = -π;//TODO 不要限制为1 //如果每个格子是1的话，K向量的取值范围就是-π到π
        var dx = 2*π/(this.vertXNum-1);
        var sty = π;//上下颠倒
        var dy = -2*π/(this.vertYNum-1);
        var k=0;//波向量的长度
        var cx = stx;
        var cy = sty;
        var yy = 0;
        var sqrt2 = Math.sqrt(2);
        var ai=0;
        for(var ny=0; ny<this.vertYNum; ny++){
            stx=cx;
            yy = cy*cy;
            for( var nx=0; nx<this.vertXNum; nx++){
                var A = this.Ak[ai++];
                var λr=randND();
                var λi=randND();
                k = Math.sqrt( cx*cx+yy);
                var gkt = Math.sqrt(9.8*k)*t;
                var Cv = Math.cos(gkt);
                var Sv = Math.sin(gkt);
                var Rv = A/sqrt2*(λr*Cv-λi*Sv);//H的实数部分
                var Iv = A/sqrt2*(λr*Sv+λi*Cv);//H的虚数部分
                cx+=dx;
            }
            cy+=dy;
        }
        return this.Hk;
    }
}