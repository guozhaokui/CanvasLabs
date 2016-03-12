
import mesh = require('../webglRenderor/Mesh');
import vertDesc = require('../webglRenderor/VertexDesc');
import geobase = require('./geometryBase');

export class geoSphere extends geobase.geometryBase {
    constructor(r: number) {
        super();
        super.type = 'sphere';
        super.param = { radius: r };
    }
}

export class sphereBuilder {
    static build(r: number, seg: number, genTexcoord: boolean): mesh.Mesh {
        return null;
    }
}

/**
 * geo = new geoSphere(r)
 * mapTex(geo,type)
 */