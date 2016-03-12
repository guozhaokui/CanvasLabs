'use strict';
import mesh = require('../webglRenderor/Mesh');
import vertDesc = require('../webglRenderor/VertexDesc');
import geobase = require('./geometryBase');


class geoPlane extends geobase.geometryBase {
    constructor(w: number, h: number, dir?: number) {
        super();
        super.type = 'plane';
        super.param = { width: w, height: h };
    }
    
    mapTexCoord(){
        
    }
    
    export(xseg:number, yseg:number):mesh.Mesh{
        var ret = new mesh.Mesh();
        var xvertnum=xseg+1;
        var yvertnum=yseg+1;
        ret.createVB(12,xvertnum*yvertnum);
        var vb = ret.getVB();
        var mb = vb.getMemBuffer(0);
        mb.fromFloatArray([]);
        return null;
    }
}