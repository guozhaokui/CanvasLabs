'use strict';
const mesh = require('../webglRenderor/Mesh');
const geobase = require('./geometryBase');
class geoPlane extends geobase.geometryBase {
    constructor(w, h, dir) {
        super();
        super.type = 'plane';
        super.param = { width: w, height: h };
    }
    mapTexCoord() {
    }
    export(xseg, yseg) {
        var ret = new mesh.Mesh();
        var xvertnum = xseg + 1;
        var yvertnum = yseg + 1;
        ret.createVB(12, xvertnum * yvertnum);
        var vb = ret.getVB();
        var mb = vb.getMemBuffer(0);
        mb.fromFloatArray([]);
        return null;
    }
}
