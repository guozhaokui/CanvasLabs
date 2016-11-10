
/*



*/
var π = Math.PI;
/**
 * k决定了波长，所以k和A的关系决定了波形的形状
 */
export class GerstnerWave{
    A=10;   //半径
    k=1;    //波数
    ω=0;    //角频率
    φ=0;    //初相角
    U10=11.5;  //10米处的风速
    U10θ=0;//-π/4; //风向
    vertXNum=513;//2pi区间。n取值为[-256,256]
    vertYNum=513;
    boshupu:Float32Array;
    bmpBuffer:ImageData;    //放在这里是为了提高效率，避免每次创建
    constructor(width:number, height:number){
        this.vertXNum = width;
        this.vertYNum = height;
        this.boshupu = new Float32Array(width*height);
        this.bmpBuffer = new ImageData(width,height);
    }
    getZ(t:number){
        
    }


    /**
     * 这个采用 http://wenku.baidu.com/link?url=PW4ae4SwoRIK4dtZ4DjDHh01e3KgLjOtKsJwBnSJI9U4ODVaEfGT9qHAMQ8t14fX6F7chQKwKQwdQdVxwV2Z4SLMz6Xe5YZh66HzTxeG7Um
     * 的公式。
     * 百度文库 基于FFT的海浪实时仿真方法_侯学隆
     */
    getBoShuPu(info:{minv:number,maxv:number}):Float32Array{
        var width=this.vertXNum;
        var height = this.vertYNum;
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
        info.minv=minv;
        info.maxv=maxv;
        return this.boshupu;
    }

}