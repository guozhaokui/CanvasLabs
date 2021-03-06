'use strict';
import mesh = require('../webglRenderor/Mesh');
import vertDesc = require('../webglRenderor/VertexDesc');
import geobase = require('./geometryBase');

export class geoBox extends geobase.geometryBase {

}

/*
    w x轴的长度，屏幕左右
    l y轴的长度，屏幕里外
    h z轴的长度，屏幕上下
*/
export class boxBuilder {
    private w: number;
    private l: number;
    private h: number;
    private bSepFace = true;
    private bUV = true;
    private bNorm = true;
    vertexNum: number;
    indexNum: number;
    //private mesh:renderer.Mesh;
    constructor(w: number, l: number, h: number) {
        this.w = w; this.l = l; this.h = h;
    }
    //每个面是独立的
    sepFace(b: boolean): boxBuilder { this.bSepFace = b; return this; }
    needUV(b: boolean): boxBuilder { this.bUV = b; return this; }
    needNorm(b: boolean): boxBuilder { this.bNorm = b; return this; }
    build(): mesh.Mesh {
        var sz = 12;
        sz += this.bUV ? 8 : 0;
        sz += this.bNorm ? 12 : 0;
        var ms = new mesh.Mesh();
        var vertnum = this.bSepFace ? 24 : 8;
        this.vertexNum = vertnum;
        var idxnum = 36;
        this.indexNum = idxnum;
        ms.createVB(sz, vertnum);
        ms.createIB(idxnum);
        ms.addStream(4);

        var xmin: number = -this.w / 2.0, xmax: number = -xmin;
        var ymin: number = -this.l / 2.0, ymax: number = -ymin;
        var zmin: number = -this.h / 2.0, zmax: number = -zmin;
        var vert0: Array<number> = [
            //x,y,z,u,v,nx,ny,nz
            xmin, ymin, zmax, 0.0, 1.0, 1.0, .0, 0.0, xmax, ymin, zmax, 1.0, 1.0, 1.0, .0, 0.0, xmax, ymin, zmin, 1.0, 0.0, 1.0, .0, 0.0, xmin, ymin, zmin, 0.0, 0.0, 1.0, .0, 0.0,//前面 0
            xmax, ymin, zmax, 0.0, 1.0, .0, 1.0, 0.0, xmax, ymax, zmax, 1.0, 1.0, .0, 1.0, 0.0, xmax, ymax, zmin, 1.0, 0.0, .0, 1.0, 0.0, xmax, ymin, zmin, 0.0, 0.0, .0, 1.0, 0.0,//右面 4
            xmax, ymax, zmax, 0.0, 1.0, 0.0, .0, 1.0, xmin, ymax, zmax, 1.0, 1.0, 0.0, .0, 1.0, xmin, ymax, zmin, 1.0, 0.0, 0.0, .0, 1.0, xmax, ymax, zmin, 0.0, 0.0, 0.0, .0, 1.0,//后面 8
            xmin, ymax, zmax, 0.0, 1.0, 1.0, 1.0, 0.0, xmin, ymin, zmax, 1.0, 1.0, 1.0, 1.0, 0.0, xmin, ymin, zmin, 1.0, 0.0, 1.0, 1.0, 0.0, xmin, ymax, zmin, 0.0, 0.0, 1.0, 1.0, 0.0,//左面 12
            xmin, ymin, zmin, 0.0, 1.0, 1.0, 0.0, 1.0, xmax, ymin, zmin, 1.0, 1.0, 1.0, 0.0, 1.0, xmax, ymax, zmin, 1.0, 0.0, 1.0, 0.0, 1.0, xmin, ymax, zmin, 0.0, 0.0, 1.0, 0.0, 1.0, //下面 16
            xmin, ymin, zmax, 0.0, 1.0, 1.0, 1.0, 1.0, xmax, ymin, zmax, 1.0, 1.0, 1.0, 0.0, 0.0, xmax, ymax, zmax, 1.0, 0.0, 0.0, 0.0, 1.0, xmin, ymax, zmax, 0.0, 0.0, 0.0, 0.0, 1.0//上面 20
        ];
        ms.setVertData(vert0, 0);
        ms.setVertData([1.0, 1.0, .0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], 1);	//alpha

        ms.getIB().getMemBuffer(0).fromShortArray([
            0, 1, 2, 2, 3, 0,
            0 + 4 * 1, 1 + 4 * 1, 2 + 4 * 1, 2 + 4 * 1, 3 + 4 * 1, 0 + 4 * 1,
            0 + 4 * 2, 1 + 4 * 2, 2 + 4 * 2, 2 + 4 * 2, 3 + 4 * 2, 0 + 4 * 2,
            0 + 4 * 3, 1 + 4 * 3, 2 + 4 * 3, 2 + 4 * 3, 3 + 4 * 3, 0 + 4 * 3,
            0 + 4 * 4, 1 + 4 * 4, 2 + 4 * 4, 2 + 4 * 4, 3 + 4 * 4, 0 + 4 * 4,
            0 + 4 * 5, 1 + 4 * 5, 2 + 4 * 5, 2 + 4 * 5, 3 + 4 * 5, 0 + 4 * 5,
        ]);

        var VertexDesc = vertDesc.VertexDesc;
        var vd = new VertexDesc(
            vertnum,
            [
                { 
                    g_Position: VertexDesc.FLOAT_VEC3, 
                    g_TexCoord0: VertexDesc.FLOAT_VEC2, 
                    g_Normal: VertexDesc.FLOAT_VEC3 
                },
                { 
                    g_alpha: VertexDesc.FLOAT 
                }
            ]);
        ms.vd = vd;
        return ms;
    }
}


