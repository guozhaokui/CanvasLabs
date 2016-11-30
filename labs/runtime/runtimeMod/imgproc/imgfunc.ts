
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
 * @param hs 高度值的缩放。
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
    for(var y=1;y<h-1; y++){
        ci=y*w;
        ti=y*w*4;
        ci++;
        ti+=4;
        for(var x=1; x<w-1; x++){
            var px = hmap[ci-1];
            var nx = hmap[ci+1];
            var py = hmap[ci-w];
            var ny = hmap[ci+2];
            vecs[0]=2;vecs[1]=0;vecs[0]=(nx-px)*hs;
            vect[0]=0;vect[1]=2;vect[0]=(ny-py)*hs;
            vec3.normalize( vecs, vecs);    //输入输出相同也没关系。
            vec3.normalize( vect, vect);  
            vec3.cross(vectmp, vecs,vect );
            ret[ti++]=(1.0+vectmp[0])/2.0*255.0;
            ret[ti++]=(1.0+vectmp[1])/2.0*255.0;
            ret[ti++]=(1.0+vectmp[2])/2.0*255.0;
            ret[ti++]=hmap[ci]/hmax*255;
            ci++;
        }
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
    var nimg = nativeImage.createEmpty();
    return nativeImage;
}