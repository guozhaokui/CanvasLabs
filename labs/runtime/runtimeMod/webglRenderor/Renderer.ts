'use strict';
import vb = require('./VertexBuffer');
type VertexBuffer = vb.VertexBuffer;
import nd = require('./NamedData');
type NamedData = nd.NamedData;
import mt = require('./Material');
import mesh = require('./Mesh');
import vd = require('./VertexDesc');
//扩展webgl
export interface WebGLExt extends WebGLRenderingContext {
    MAXTEX2D: number;
    MAXCUBETEX: number;
    createMesh(): void;
    renderMesh(groupData: RenderGroup, rundata: Array<ArrayBuffer>): void;
    bindShaderFetch(vertexDesc: vd.VertexDesc, gpuProgram: WebGLProgram, namedData: Array<NamedData>): ShaderLinkInfo;
    renderMesh1(mesh: mesh.Mesh, begin: number, end: number, gpuProgram: WebGLProgram,
        shaderInfo: ShaderLinkInfo, tex: Array<WebGLTexture>, cubetex: Array<WebGLTexture>, rundata: Array<ArrayBuffer>): void;
}


export class RenderGroup {
    mesh: mesh.Mesh;
    material: mt.Material;
    shaderInfo: ShaderLinkInfo;
    begin: number;
    end: number;
}

class ShaderAttribInfo {
    nStream: number = 0;	//这个与mesh的stream关联起来
    nLoc: number = 0;
    nSize: number = 0;
    nType: number = 0;
    nOffset: number = 0;
}

class UniformInfo {
    dataGroupID: number;
    uniformProc: Function;
    location: WebGLUniformLocation;
    num: number;
    offset: number;

    constructor(groupid: number, proc: Function, location: WebGLUniformLocation, num: number, offset: number) {
        this.dataGroupID = groupid;
        this.uniformProc = proc;
        this.location = location;
        this.num = num;
        this.offset = offset;
    }
}

interface texbind { loc: WebGLUniformLocation, id: number }
class ShaderLinkInfo {
    program: any = null;
    attribInfo: Array<ShaderAttribInfo> = new Array<ShaderAttribInfo>();
    textureBind: Array<texbind> = new Array<texbind>();	//每两个为 {location,sampler}
    cubeTexBind: Array<texbind> = new Array<texbind>();	//每两个为 {location,sampler}
    uniformInfo: Array<UniformInfo> = new Array<UniformInfo>();
    constructor() {
    }
}

function laya_glUniformMatrix4fv(gl: WebGLRenderingContext, location: WebGLUniformLocation, value: Float32Array): void {
    gl.uniformMatrix4fv(location, false, value);
}
function laya_glUniformMatrix3fv(gl: WebGLRenderingContext, location: WebGLUniformLocation, value: Float32Array): void {
    gl.uniformMatrix3fv(location, false, value);
}
function laya_glUniformMatrix2fv(gl: WebGLRenderingContext, location: WebGLUniformLocation, value: Float32Array): void {
    gl.uniformMatrix2fv(location, false, value);
}

export class Renderer extends WebGLRenderingContext {

    static initGlExt(webgl: WebGLRenderingContext): void {
        var gl = <WebGLExt>webgl;
        gl.MAXTEX2D = 4;
        gl.MAXCUBETEX = 2;
        var conch: any = null;
        //conch = window.conch;
        if (conch) {
            /*
            gl.createMesh = gl._createMeshRT;
            gl.bindShaderFetch = gl._bindShaderFetchRT;
            gl.renderMesh = gl._renderMeshRT;
            gl.renderMesh1 = gl._renderMesh1RT;
            */
        } else {
            gl.renderMesh = function(groupData: RenderGroup, rundata: Array<ArrayBuffer>): void {
                Renderer.renderMesh(gl, groupData, rundata);
            }
            gl.bindShaderFetch = function(vertexDesc: vd.VertexDesc, gpuProgram: WebGLProgram, namedData: Array<NamedData>): ShaderLinkInfo {
                return Renderer.bindShaderFetch(gl, vertexDesc, gpuProgram, namedData);
            }
        }
    }

    /**
     * 根据shader和顶点格式，以及需要用到的shader数据，创建一个shaderLinkInfo
     * @param	resultContainer 用来保留结果（ShaderLinkInfo）的对象。因为外部不需要关心结果的类型，所有只要提供一个容器，并且在渲染的时候也提供这个容器就行了。
     * @param	vertexDesc
     * @param	gpuProgram
     * @param	namedData
     */
    static bindShaderFetch(webgl: WebGLRenderingContext, vertexDesc: vd.VertexDesc, gpuProgram: WebGLProgram, namedData: Array<NamedData>): ShaderLinkInfo {
        var gl = <WebGLExt>webgl;
        if (!gpuProgram) {
            console.log('gl program should be valid');
            return null;
        }

        var shaderLinkInfo: ShaderLinkInfo = new ShaderLinkInfo();
        shaderLinkInfo.program = gpuProgram;
        //shaderLinkInfo.attribInfo.length = 0;
        //shaderLinkInfo.textureBind.length = 0;
        //shaderLinkInfo.uniformInfo.length = 0;
	
        var i: number = 0, sz: number = 0;
        //shader中的属性
        var attribNum: number = gl.getProgramParameter(gpuProgram, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < attribNum; i++) {
            var attrib: WebGLActiveInfo = gl.getActiveAttrib(gpuProgram, i);
            var nAttribSize: number = 0, nAttribType: number = 0;
            switch (attrib.type) {
                case gl.INT: nAttribSize = 1; nAttribType = gl.INT; break;
                case gl.INT_VEC2: nAttribSize = 2; nAttribType = gl.INT; break;
                case gl.INT_VEC3: nAttribSize = 3; nAttribType = gl.INT; break;
                case gl.INT_VEC4: nAttribSize = 4; nAttribType = gl.INT; break;
                case gl.FLOAT: nAttribSize = 1; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_VEC2: nAttribSize = 2; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_VEC3: nAttribSize = 3; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_VEC4: nAttribSize = 4; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_MAT2: nAttribSize = 4; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_MAT3: nAttribSize = 9; nAttribType = gl.FLOAT; break;
                case gl.FLOAT_MAT4: nAttribSize = 16; nAttribType = gl.FLOAT; break;
            }

            var vertdesc: number[] = vertexDesc.getVertexDesc(attrib.name);
            if (vertdesc && vertdesc[1] == attrib.type) {
                var aif: ShaderAttribInfo = new ShaderAttribInfo();
                aif.nStream = vertdesc[3];
                aif.nLoc = gl.getAttribLocation(gpuProgram, attrib.name);
                aif.nSize = nAttribSize;
                aif.nType = nAttribType;
                aif.nOffset = vertdesc[2];
                shaderLinkInfo.attribInfo.push(aif);
            }
        }

        //shader中的变量
        var nUniformNum: number = gl.getProgramParameter(gpuProgram, gl.ACTIVE_UNIFORMS);
        if (nUniformNum > 0 && (!namedData || namedData.length <= 0)) {
            console.log("renderer::getApplyCmds 出错。没有设置p_pNameData");
            return null;
        }

        for (i = 0; i < nUniformNum; i++) {
            var uniform: WebGLActiveInfo = gl.getActiveUniform(gpuProgram, i);
            var location: WebGLUniformLocation = gl.getUniformLocation(gpuProgram, uniform.name);
            //console.log("uniform:"+uniform.name+","+uniform.size+",len=%d\n", varName, type, length);
            //namedData::dataDesc* pDesc=0;
            var desc: number[] = null;
            var ni: number = 0;
            for (ni = 0; ni < namedData.length; ni++) {
                var namedData1: NamedData = namedData[ni];
                desc = namedData1.getDesc(uniform.name);
                if (desc) {
                    if (desc[2] == uniform.size)//找到了
                        break;
                    else {
                        desc = null;
                    }
                }
            }
            //不能这样。因为可能是贴图
            //if( !pDesc ){
            //	prnumberf("有个uniform没有找到 %s",varName);
            //	continue;
            //}
            switch (uniform.type) {
                case gl.SAMPLER_2D:
                    //g_Tex
                    if (uniform.name.substr(0, 5) == 'g_Tex') {
                        var id: number = +uniform.name.substr(5);
                        if (id > 15) {
                            console.log(uniform.name + " 不是有效的纹理id。");
                        }
                        if (id >= gl.MAXTEX2D) {
                            console.log('现在还不支持超过4个贴图。Material有限制');
                            throw ('现在还不支持超过4个贴图。Material有限制')
                        }
                        shaderLinkInfo.textureBind.push({ loc: location, id: id });
                    }
                    break;
                case gl.SAMPLER_CUBE:
                    var lname: String = uniform.name.substr(0, 9).toLowerCase();
                    if (lname == 'g_cubetex' || lname == 'cubetex') {
                        id = +uniform.name.substr(9);
                        if (id >= gl.MAXCUBETEX) {
                            console.log('现在还不支持超过2个cube贴图。Material有限制');
                            throw ('现在还不支持超过2个cube贴图。Material有限制')
                        }
                        shaderLinkInfo.cubeTexBind.push({ loc: location, id: id });
                    }
                    break;
                case gl.FLOAT:
                    if ((desc && desc[1] == nd.NamedData.tp_f32)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform1fv, location, 1, desc[0]));
                    }; break;
                case gl.FLOAT_VEC2: if ((desc && desc[1] == nd.NamedData.tp_fvec2)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform2fv, location, 1, desc[0]));
                }; break;
                case gl.FLOAT_VEC3: if ((desc && desc[1] == nd.NamedData.tp_fvec3)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform3fv, location, 1, desc[0]));
                }; break;
                case gl.FLOAT_VEC4: if ((desc && desc[1] == nd.NamedData.tp_fvec4)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform4fv, location, 1, desc[0]));
                }; break;
                case gl.FLOAT_MAT2: if ((desc && desc[1] == nd.NamedData.tp_mat2)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix2fv, location, 2 * 2, desc[0]));	//没有*4 因为下面是传入的Float32Array
                }; break;
                case gl.FLOAT_MAT3: if ((desc && desc[1] == nd.NamedData.tp_mat3)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix3fv, location, 3 * 3, desc[0]));
                }; break;
                case gl.FLOAT_MAT4: if ((desc && desc[1] == nd.NamedData.tp_mat4)) {
                    shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix4fv, location, 4 * 4, desc[0]));
                }; break;
            }
        }
        return shaderLinkInfo;
    }

    static useMaterial(gl: WebGLRenderingContext, mtl: mt.Material): void {
    }

    static renderMesh(gl: WebGLRenderingContext, groupData: RenderGroup, rundata: Array<ArrayBuffer>): void {
        var material: mt.Material = groupData.material;
        var mesh: mesh.Mesh = groupData.mesh;
        var vb: VertexBuffer = mesh.getVB();
        vb.upload(gl, gl.ARRAY_BUFFER);

        gl.bindBuffer(gl.ARRAY_BUFFER, vb.getVBO());

        var ib: VertexBuffer = mesh.getIB();
        if (ib) {
            ib.upload(gl, gl.ELEMENT_ARRAY_BUFFER);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib.getVBO());

        //应用非shader相关的设置
        switch (material.blendType) {
            case mt.Material.BLEND_TYPE_NORMAL:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
            case mt.Material.BLEND_TYPE_LIGHTER:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            case mt.Material.BLEND_TYPE_DARK:
                //TODO
                break;
            case mt.Material.BLEND_TYPE_COPY:
                gl.blendFunc(gl.SRC_ALPHA, gl.ZERO);
                break;
            default:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
        }

        if (material.enableZ > 0) {
            gl.enable(gl.DEPTH_TEST);
            //gl.depthFunc(gl.GL_LEQUAL);
        }

        gl.useProgram(material.gpuProgram);

        //应用材质的应用序列
        if (groupData.shaderInfo) {
            //属性
            var attribs: Array<ShaderAttribInfo> = groupData.shaderInfo.attribInfo;
            var i: number = 0, sz: number = 0;
            for (i = 0, sz = attribs.length; i < sz; i++) {
                var aif: ShaderAttribInfo = attribs[i];
                gl.enableVertexAttribArray(aif.nLoc);
                gl.vertexAttribPointer(aif.nLoc, aif.nSize, aif.nType, false, mesh.getStride(aif.nStream), aif.nOffset);
            }
				
            //贴图
            var curtex: number = 0;
            for (i = 0, sz = groupData.shaderInfo.textureBind.length; i < sz; i++) {
                gl.activeTexture(gl.TEXTURE0 + curtex);	//sampler
                //要先还原texture
                gl.bindTexture(gl.TEXTURE_2D, material.textures[groupData.shaderInfo.textureBind[i].id].gltexture);
                //TODO 这里不要每次都做
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.uniform1i(groupData.shaderInfo.textureBind[i].loc, curtex);
                curtex++;
            }
            for (i = 0, sz = groupData.shaderInfo.cubeTexBind.length; i < sz; i++) {
                var bdinfo = groupData.shaderInfo.cubeTexBind[i];
                gl.activeTexture(gl.TEXTURE0 + curtex);
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, material.cubeTextures[bdinfo.id].gltexture);
                gl.uniform1i(bdinfo.loc, curtex);
                curtex++;
            }

            //变量
            var uniforms: Array<UniformInfo> = groupData.shaderInfo.uniformInfo;
            for (i = 0, sz = uniforms.length; i < sz; i++) {
                var uif: UniformInfo = uniforms[i];
                if (uif.dataGroupID < rundata.length) {
                    var vv = new Float32Array(rundata[uif.dataGroupID], uif.offset, uif.num);
                    uif.uniformProc(gl, uif.location, vv);
                }
            }
        }

        //开始渲染
        var eleNum: number = groupData.end - groupData.begin;
        ib ? (gl.drawElements(gl.TRIANGLES, eleNum, gl.UNSIGNED_SHORT, groupData.begin * 2)) : (gl.drawArrays(gl.TRIANGLES, groupData.begin, eleNum));

        //应用材质的清理序列
        //TODO 这个是用假设的方法写死还是也用link得到结果
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
