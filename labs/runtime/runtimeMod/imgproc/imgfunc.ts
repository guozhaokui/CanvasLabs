
/// <reference path='../../defination/electron.d.ts' />
/// <reference path='../../defination/node.d.ts' />

import * as fs from 'fs';
const {nativeImage} = require('electron');


export function getImgBuf(img:HTMLImageElement):Uint8ClampedArray{
    var canv = document.createElement('canvas');
    canv.width=img.width;
    canv.height=img.height;
    var ctx = canv.getContext('2d');
    var imgdata = ctx.getImageData(0, 0, canv.width,canv.height);
    return imgdata.data;
}

/**
 * 返回的normalmap是4个通道。
 * @param hs 高度值的缩放。hs*h 与w,h单位一致的情况效果最好
 * @param xwrap 
 * @param ywrap
 */
export function HmapToNormalmap(hmap:Float32Array, w:number, h:number,hs:number, xwrap:number, ywrap:number, hmax:number ):ImageData{
    var ci = w;
    var vecs = vec3.create();
    var vect = vec3.create();
    var vectmp = vec3.create();
    var ret = new ImageData(w,h);
    var retbuf = ret.data;
    var ti=0;
    for(var y=0;y<h; y++){
        ci=y*w;
        ti=ci*4;
        for(var x=0; x<w; x++){
            var pxi = ci-1; if(pxi<0)pxi+=w;
            var nxi = ci+1; if(x>=w-1)nxi-=w;
            var px = hmap[pxi];
            var nx = hmap[nxi];
            var pyi = ci-w; if(pyi<0)pyi+=w*w;
            var nyi = ci+w; if(y>=h-1)nyi=x;
            var py = hmap[pyi];
            var ny = hmap[nyi];
            vecs[0]=2;vecs[1]=0;vecs[2]=(nx-px)*hs;
            vect[0]=0;vect[1]=2;vect[2]=(ny-py)*hs;
            //vec3.normalize( vecs, vecs);    //输入输出相同也没关系。
            //vec3.normalize( vect, vect);  
            vec3.cross(vectmp, vecs,vect );
            vec3.normalize(vectmp,vectmp);
            retbuf[ti++]=(1.0+vectmp[0])/2.0*255.0;
            retbuf[ti++]=(1.0+vectmp[1])/2.0*255.0;
            retbuf[ti++]=(1.0+vectmp[2])/2.0*255.0;
            retbuf[ti++]=255;//hmap[ci]/hmax*255;
            ci++;
        }
    }
    return ret;
}

/**
 * 生成一个半球的高度图。单位是1
 * 高度朝外，认为是z方向
 * @param d 格子个数。例如128则表示生成一个128x128的数据。如果要求法线，需要把高度x64。因为保存的是1.0
 * 
 */
function GenSphereHeight(d:number):Float32Array{
    var r = d/2;
    var dx = 1.0/r;
    var dy = -1.0/r;
    var fx = -1;
    var fy = 1;
    var yy=0;
    var ret = new Float32Array(d*d);
    var ci=0;
    for(var cy=0; cy<d; cy++){
        yy=fy*fy;
        fx=-1.0;
        for( var cx=0; cx<d; cx++){
            var xx = fx*fx;
            var dist = xx+yy;
            if(dist>1){
                ret[ci++]=0;
            }else{
                var z = Math.sqrt(1.0-dist);
                ret[ci++]=z;
            }
            fx+=dx;
        }
        fy+=dy;
    }
    return ret;
}


export function saveCanvas(canv:HTMLCanvasElement, outfile:string){
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
    var sz:{width:number,height:number} = nimg.getSize();
    fs.writeFileSync(outfile,nimg.toPng());
}

export function saveAsPng(data:ImageData,outfile:string){
    var canv = document.createElement('canvas');
    canv.width=data.width;
    canv.height=data.height;
    var ctx = canv.getContext('2d');
    ctx.putImageData(data,0,0);
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
    fs.writeFileSync(outfile,nimg.toPng());
    return nativeImage;
}