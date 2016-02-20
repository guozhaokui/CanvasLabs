'use strict';
import Tt = require('./Texture');
type Texture = Tt.Texture;
import Nd = require('./NamedData');
type NamedData=Nd.NamedData;
export class Material {
    static BLEND_TYPE_NONE: number = 0;
    static BLEND_TYPE_NORMAL: number = 1;
    static BLEND_TYPE_LIGHTER: number = 2;
    static BLEND_TYPE_DARK: number = 3;
    static BLEND_TYPE_COPY: number = 4;
    static MAXTEX2D: number = 4;
    static MAXCUBETEX: number = 2;
		
    //LayaTexture* m_pTexture[LAYA_MAX_TEXTURE];	TODO 贴图怎么做
    textures = new Array<Texture>(Material.MAXTEX2D);//分组判定的时候，需要考虑这个。
    cubeTextures = new Array<Texture>(Material.MAXCUBETEX);
    gpuProgram: WebGLProgram = null;		//分组判定的时候，需要考虑这个。
    materialData: ArrayBuffer = null;// new ArrayBuffer(60);				
    alpha_: Float32Array;	//4
    blendType_: Float32Array; //4
    filterData: Float32Array//16;
    enableZ_: Float32Array//4
    color: Float32Array//16
    shaderParam1: Float32Array //16
    nKey: number = 0;
    namedData: NamedData = null;

    constructor() {
        this.materialData = new ArrayBuffer(60);
        this.alpha_ = new Float32Array(this.materialData, 0, 1);	//4
        this.blendType_ = new Uint32Array(this.materialData, 4, 1); //4
        this.filterData = new Float32Array(this.materialData, 8, 4);	//16;
        this.enableZ_ = new Uint32Array(this.materialData, 24, 1);	//4
        this.color = new Float32Array(this.materialData, 28, 4); //16
        this.shaderParam1 = new Float32Array(this.materialData, 44, 4);		//16
        var nd = this.namedData = new Nd.NamedData();
        nd.add('g_Alpha', 0, Nd.NamedData.tp_f32, 1);
        nd.add('g_Color', this.color.byteOffset, Nd.NamedData.tp_fvec4, 1);
        nd.add('g_TexRange', 0, Nd.NamedData.tp_fvec4, 1);		//没有
        nd.add('g_Filter', this.shaderParam1.byteOffset, Nd.NamedData.tp_fvec4, 1);
    }

    set alpha(v: number) {
        this.alpha_[0] = v;
    }
    get alpha(): number {
        return this.alpha_[0];
    }
    set blendType(v: number) {
        this.blendType_[0] = v;
    }
    get blendType(): number {
        return this.blendType_[0];
    }
    set enableZ(v: number) {
        this.enableZ_[0] = v;
    }
    get enableZ(): number {
        return this.enableZ_[0];
    }
    /**
     * 返回一个JS的ArrayBuffer，给渲染做运行时数据。
     */
    getRunData(): ArrayBuffer {
        return this.materialData;
    }

    getNamedData(): NamedData {
        return this.namedData;
    }
}
