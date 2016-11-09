
/**
 * 基本的2d余弦波
 * z = z0 + Σ(i=0,n)Ai*cos[ki*(x0*cos(θ)+y0*sin(θ))-ωi*t + φi]
 */

var π = Math.PI;

export class WaveData{
    A:number;   //振幅
    θ:number;   //传播方向。
    φ:number;   //初相
    f:number;   //频率
    λ:number;   //波长
    //下面的计算出来
    k?:number;   //波数。
    ω?:number;   
    kcosθ?:number;
    ksinθ?:number;
} 

export class CosWave{
    hfield:Float32Array;
    xnum=0;
    ynum=0;
    gridw=10;
    gridh=10;
    z0=0;
    maxh=-100000;
    minh=100000;
    waveDatas:WaveData[];
    constructor(xnum:number, ynum:number, gridw:number, gridh:number, wavedatas:WaveData[]){
        this.waveDatas = wavedatas;
        this.waveDatas.forEach((v,i)=>{
            v.k = 2*π/v.λ;
            v.ω = 2*π*v.f;
            v.kcosθ = v.k*Math.cos(v.θ);
            v.ksinθ = v.k*Math.sin(v.θ);
        });
        this.xnum=xnum;
        this.ynum=ynum;
        this.gridw=gridw;
        this.gridh=gridh;
        this.hfield = new Float32Array(xnum*ynum);
    }

    update(t:number):Float32Array{
        var x0=0;
        var y0=0;
        var dtlen=this.waveDatas.length;
        var fi=0;

        for(var cy=0; cy<this.ynum; cy++){
            y0+=this.gridh;
            x0=0;
            for(var cx=0; cx<this.xnum; cx++){
                var z=this.z0;
                //对每一个波形数据累加
                for(var di=0; di<dtlen; di++){
                    var dt = this.waveDatas[di];
                    z+=dt.A*Math.cos(dt.kcosθ*x0+y0*dt.ksinθ-dt.ω*t+dt.φ);
                }
                this.hfield[fi++]=z;
                if(this.maxh<z)this.maxh=z;
                if(this.minh>z)this.minh=z;
                x0+=this.gridw;
            }
        }
        return this.hfield;
    }

}