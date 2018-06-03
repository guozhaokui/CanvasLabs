'use strict';
const Nd = require('./NamedData');
class Material {
    constructor() {
        this.textures = new Array(Material.MAXTEX2D);
        this.cubeTextures = new Array(Material.MAXCUBETEX);
        this.gpuProgram = null;
        this.materialData = null;
        this.nKey = 0;
        this.namedData = null;
        this.materialData = new ArrayBuffer(60);
        this.alpha_ = new Float32Array(this.materialData, 0, 1);
        this.blendType_ = new Uint32Array(this.materialData, 4, 1);
        this.filterData = new Float32Array(this.materialData, 8, 4);
        this.enableZ_ = new Uint32Array(this.materialData, 24, 1);
        this.color = new Float32Array(this.materialData, 28, 4);
        this.shaderParam1 = new Float32Array(this.materialData, 44, 4);
        var nd = this.namedData = new Nd.NamedData();
        nd.add('g_Alpha', 0, Nd.NamedData.tp_f32, 1);
        nd.add('g_Color', this.color.byteOffset, Nd.NamedData.tp_fvec4, 1);
        nd.add('g_TexRange', 0, Nd.NamedData.tp_fvec4, 1);
        nd.add('g_Filter', this.shaderParam1.byteOffset, Nd.NamedData.tp_fvec4, 1);
    }
    set alpha(v) {
        this.alpha_[0] = v;
    }
    get alpha() {
        return this.alpha_[0];
    }
    set blendType(v) {
        this.blendType_[0] = v;
    }
    get blendType() {
        return this.blendType_[0];
    }
    set enableZ(v) {
        this.enableZ_[0] = v;
    }
    get enableZ() {
        return this.enableZ_[0];
    }
    getRunData() {
        return this.materialData;
    }
    getNamedData() {
        return this.namedData;
    }
}
Material.BLEND_TYPE_NONE = 0;
Material.BLEND_TYPE_NORMAL = 1;
Material.BLEND_TYPE_LIGHTER = 2;
Material.BLEND_TYPE_DARK = 3;
Material.BLEND_TYPE_COPY = 4;
Material.MAXTEX2D = 4;
Material.MAXCUBETEX = 2;
exports.Material = Material;
