
export class Sampler{
    img:HTMLElement;
    width=0;
    height=0;
    imgdata:Uint8ClampedArray;
    pixnum=0;
    debug=false;
    constructor(img:HTMLImageElement){
        this.img = img;
        var canv = document.createElement('canvas');
        canv.width = this.width = img.width;
        canv.height = this.height = img.height;
        this.pixnum = this.width*this.height;
        var ctx = canv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.imgdata = ctx.getImageData(0,0,img.width,img.height).data;
        
        this.img.onload=()=>{
            alert('sample img onload');
        }
        if( this.debug ){
            this.sample = this.sampledbg;
        }
    }
    sampledbg(u:number,v:number,color:Uint8ClampedArray):void{
        var gridsz = 16;//每个格子大小
        var x = u*128;//假设最大128
        var y = v*128;
        var b = (Math.floor(x/gridsz)+Math.floor(y/gridsz))%2;
        b*=255-100;
        color[0]=b;
        color[1]=b;
        color[2]=b;
        color[3]=255;
    }

    /**
     * 先只做点采样
     */
    sample(u:number,v:number,color:Uint8ClampedArray):void{
        var x = Math.floor(u*this.width);
        var y = Math.floor(v*this.height);
        var p = y*this.width + x;
        if(p>=this.pixnum) p=this.pixnum-1;
        p*=4;
        color[0]=this.imgdata[p++];
        color[1]=this.imgdata[p++];
        color[2]=this.imgdata[p++];
        color[3]=this.imgdata[p++];
        return null;
    }

    dir2uv(){
        
    }
    /**
     * 上半球采样。
     * 朝下的返回黑色
     */
    sampleSemiSphere(x:number,y:number,z:number,color:Uint8ClampedArray):void{
        if(z<=0){
            color[0]=color[1]=color[2]=0;
            color[3]=255;
            return;
        }

    }
}