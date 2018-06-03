'use strict';
const mesh = require('../webglRenderor/Mesh');
const vertDesc = require('../webglRenderor/VertexDesc');
const geobase = require('./geometryBase');
class geoBox extends geobase.geometryBase {
}
exports.geoBox = geoBox;
class boxBuilder {
    constructor(w, l, h) {
        this.bSepFace = true;
        this.bUV = true;
        this.bNorm = true;
        this.w = w;
        this.l = l;
        this.h = h;
    }
    sepFace(b) { this.bSepFace = b; return this; }
    needUV(b) { this.bUV = b; return this; }
    needNorm(b) { this.bNorm = b; return this; }
    build() {
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
        var xmin = -this.w / 2.0, xmax = -xmin;
        var ymin = -this.l / 2.0, ymax = -ymin;
        var zmin = -this.h / 2.0, zmax = -zmin;
        var vert0 = [
            xmin, ymin, zmax, 0.0, 1.0, 1.0, .0, 0.0, xmax, ymin, zmax, 1.0, 1.0, 1.0, .0, 0.0, xmax, ymin, zmin, 1.0, 0.0, 1.0, .0, 0.0, xmin, ymin, zmin, 0.0, 0.0, 1.0, .0, 0.0,
            xmax, ymin, zmax, 0.0, 1.0, .0, 1.0, 0.0, xmax, ymax, zmax, 1.0, 1.0, .0, 1.0, 0.0, xmax, ymax, zmin, 1.0, 0.0, .0, 1.0, 0.0, xmax, ymin, zmin, 0.0, 0.0, .0, 1.0, 0.0,
            xmax, ymax, zmax, 0.0, 1.0, 0.0, .0, 1.0, xmin, ymax, zmax, 1.0, 1.0, 0.0, .0, 1.0, xmin, ymax, zmin, 1.0, 0.0, 0.0, .0, 1.0, xmax, ymax, zmin, 0.0, 0.0, 0.0, .0, 1.0,
            xmin, ymax, zmax, 0.0, 1.0, 1.0, 1.0, 0.0, xmin, ymin, zmax, 1.0, 1.0, 1.0, 1.0, 0.0, xmin, ymin, zmin, 1.0, 0.0, 1.0, 1.0, 0.0, xmin, ymax, zmin, 0.0, 0.0, 1.0, 1.0, 0.0,
            xmin, ymin, zmin, 0.0, 1.0, 1.0, 0.0, 1.0, xmax, ymin, zmin, 1.0, 1.0, 1.0, 0.0, 1.0, xmax, ymax, zmin, 1.0, 0.0, 1.0, 0.0, 1.0, xmin, ymax, zmin, 0.0, 0.0, 1.0, 0.0, 1.0,
            xmin, ymin, zmax, 0.0, 1.0, 1.0, 1.0, 1.0, xmax, ymin, zmax, 1.0, 1.0, 1.0, 0.0, 0.0, xmax, ymax, zmax, 1.0, 0.0, 0.0, 0.0, 1.0, xmin, ymax, zmax, 0.0, 0.0, 0.0, 0.0, 1.0
        ];
        ms.setVertData(vert0, 0);
        ms.setVertData([1.0, 1.0, .0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0], 1);
        ms.getIB().getMemBuffer(0).fromShortArray([
            0, 1, 2, 2, 3, 0,
            0 + 4 * 1, 1 + 4 * 1, 2 + 4 * 1, 2 + 4 * 1, 3 + 4 * 1, 0 + 4 * 1,
            0 + 4 * 2, 1 + 4 * 2, 2 + 4 * 2, 2 + 4 * 2, 3 + 4 * 2, 0 + 4 * 2,
            0 + 4 * 3, 1 + 4 * 3, 2 + 4 * 3, 2 + 4 * 3, 3 + 4 * 3, 0 + 4 * 3,
            0 + 4 * 4, 1 + 4 * 4, 2 + 4 * 4, 2 + 4 * 4, 3 + 4 * 4, 0 + 4 * 4,
            0 + 4 * 5, 1 + 4 * 5, 2 + 4 * 5, 2 + 4 * 5, 3 + 4 * 5, 0 + 4 * 5,
        ]);
        var VertexDesc = vertDesc.VertexDesc;
        var vd = new VertexDesc(vertnum, [
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
exports.boxBuilder = boxBuilder;
