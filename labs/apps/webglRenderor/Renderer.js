'use strict';
const nd = require('./NamedData');
const mt = require('./Material');
class RenderGroup {
}
exports.RenderGroup = RenderGroup;
class ShaderAttribInfo {
    constructor() {
        this.nStream = 0;
        this.nLoc = 0;
        this.nSize = 0;
        this.nType = 0;
        this.nOffset = 0;
    }
}
class UniformInfo {
    constructor(groupid, proc, location, num, offset) {
        this.dataGroupID = groupid;
        this.uniformProc = proc;
        this.location = location;
        this.num = num;
        this.offset = offset;
    }
}
class ShaderLinkInfo {
    constructor() {
        this.program = null;
        this.attribInfo = new Array();
        this.textureBind = new Array();
        this.cubeTexBind = new Array();
        this.uniformInfo = new Array();
    }
}
function laya_glUniformMatrix4fv(gl, location, value) {
    gl.uniformMatrix4fv(location, false, value);
}
function laya_glUniformMatrix3fv(gl, location, value) {
    gl.uniformMatrix3fv(location, false, value);
}
function laya_glUniformMatrix2fv(gl, location, value) {
    gl.uniformMatrix2fv(location, false, value);
}
class Renderer extends WebGLRenderingContext {
    static initGlExt(webgl) {
        var gl = webgl;
        gl.MAXTEX2D = 4;
        gl.MAXCUBETEX = 2;
        var conch = null;
        if (conch) {
        }
        else {
            gl.renderMesh = function (groupData, rundata) {
                Renderer.renderMesh(gl, groupData, rundata);
            };
            gl.bindShaderFetch = function (vertexDesc, gpuProgram, namedData) {
                return Renderer.bindShaderFetch(gl, vertexDesc, gpuProgram, namedData);
            };
        }
    }
    static bindShaderFetch(webgl, vertexDesc, gpuProgram, namedData) {
        var gl = webgl;
        if (!gpuProgram) {
            console.log('gl program should be valid');
            return null;
        }
        var shaderLinkInfo = new ShaderLinkInfo();
        shaderLinkInfo.program = gpuProgram;
        var i = 0, sz = 0;
        var attribNum = gl.getProgramParameter(gpuProgram, gl.ACTIVE_ATTRIBUTES);
        for (i = 0; i < attribNum; i++) {
            var attrib = gl.getActiveAttrib(gpuProgram, i);
            var nAttribSize = 0, nAttribType = 0;
            switch (attrib.type) {
                case gl.INT:
                    nAttribSize = 1;
                    nAttribType = gl.INT;
                    break;
                case gl.INT_VEC2:
                    nAttribSize = 2;
                    nAttribType = gl.INT;
                    break;
                case gl.INT_VEC3:
                    nAttribSize = 3;
                    nAttribType = gl.INT;
                    break;
                case gl.INT_VEC4:
                    nAttribSize = 4;
                    nAttribType = gl.INT;
                    break;
                case gl.FLOAT:
                    nAttribSize = 1;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_VEC2:
                    nAttribSize = 2;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_VEC3:
                    nAttribSize = 3;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_VEC4:
                    nAttribSize = 4;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_MAT2:
                    nAttribSize = 4;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_MAT3:
                    nAttribSize = 9;
                    nAttribType = gl.FLOAT;
                    break;
                case gl.FLOAT_MAT4:
                    nAttribSize = 16;
                    nAttribType = gl.FLOAT;
                    break;
            }
            var vertdesc = vertexDesc.getVertexDesc(attrib.name);
            if (vertdesc && vertdesc[1] == attrib.type) {
                var aif = new ShaderAttribInfo();
                aif.nStream = vertdesc[3];
                aif.nLoc = gl.getAttribLocation(gpuProgram, attrib.name);
                aif.nSize = nAttribSize;
                aif.nType = nAttribType;
                aif.nOffset = vertdesc[2];
                shaderLinkInfo.attribInfo.push(aif);
            }
        }
        var nUniformNum = gl.getProgramParameter(gpuProgram, gl.ACTIVE_UNIFORMS);
        if (nUniformNum > 0 && (!namedData || namedData.length <= 0)) {
            console.log("renderer::getApplyCmds 出错。没有设置p_pNameData");
            return null;
        }
        for (i = 0; i < nUniformNum; i++) {
            var uniform = gl.getActiveUniform(gpuProgram, i);
            var location = gl.getUniformLocation(gpuProgram, uniform.name);
            var desc = null;
            var ni = 0;
            for (ni = 0; ni < namedData.length; ni++) {
                var namedData1 = namedData[ni];
                desc = namedData1.getDesc(uniform.name);
                if (desc) {
                    if (desc[2] == uniform.size)
                        break;
                    else {
                        desc = null;
                    }
                }
            }
            switch (uniform.type) {
                case gl.SAMPLER_2D:
                    if (uniform.name.substr(0, 5) == 'g_Tex') {
                        var id = +uniform.name.substr(5);
                        if (id > 15) {
                            console.log(uniform.name + " 不是有效的纹理id。");
                        }
                        if (id >= gl.MAXTEX2D) {
                            console.log('现在还不支持超过4个贴图。Material有限制');
                            throw ('现在还不支持超过4个贴图。Material有限制');
                        }
                        shaderLinkInfo.textureBind.push({ loc: location, id: id });
                    }
                    break;
                case gl.SAMPLER_CUBE:
                    var lname = uniform.name.substr(0, 9).toLowerCase();
                    if (lname == 'g_cubetex' || lname == 'cubetex') {
                        id = +uniform.name.substr(9);
                        if (id >= gl.MAXCUBETEX) {
                            console.log('现在还不支持超过2个cube贴图。Material有限制');
                            throw ('现在还不支持超过2个cube贴图。Material有限制');
                        }
                        shaderLinkInfo.cubeTexBind.push({ loc: location, id: id });
                    }
                    break;
                case gl.FLOAT:
                    if ((desc && desc[1] == nd.NamedData.tp_f32)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform1fv, location, 1, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_VEC2:
                    if ((desc && desc[1] == nd.NamedData.tp_fvec2)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform2fv, location, 1, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_VEC3:
                    if ((desc && desc[1] == nd.NamedData.tp_fvec3)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform3fv, location, 1, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_VEC4:
                    if ((desc && desc[1] == nd.NamedData.tp_fvec4)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, gl.uniform4fv, location, 1, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_MAT2:
                    if ((desc && desc[1] == nd.NamedData.tp_mat2)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix2fv, location, 2 * 2, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_MAT3:
                    if ((desc && desc[1] == nd.NamedData.tp_mat3)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix3fv, location, 3 * 3, desc[0]));
                    }
                    ;
                    break;
                case gl.FLOAT_MAT4:
                    if ((desc && desc[1] == nd.NamedData.tp_mat4)) {
                        shaderLinkInfo.uniformInfo.push(new UniformInfo(ni, laya_glUniformMatrix4fv, location, 4 * 4, desc[0]));
                    }
                    ;
                    break;
            }
        }
        return shaderLinkInfo;
    }
    static useMaterial(gl, mtl) {
    }
    static renderMesh(gl, groupData, rundata) {
        var material = groupData.material;
        var mesh = groupData.mesh;
        var vb = mesh.getVB();
        vb.upload(gl, gl.ARRAY_BUFFER);
        gl.bindBuffer(gl.ARRAY_BUFFER, vb.getVBO());
        var ib = mesh.getIB();
        if (ib) {
            ib.upload(gl, gl.ELEMENT_ARRAY_BUFFER);
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib.getVBO());
        switch (material.blendType) {
            case mt.Material.BLEND_TYPE_NORMAL:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                break;
            case mt.Material.BLEND_TYPE_LIGHTER:
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
                break;
            case mt.Material.BLEND_TYPE_DARK:
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
        }
        gl.useProgram(material.gpuProgram);
        if (groupData.shaderInfo) {
            var attribs = groupData.shaderInfo.attribInfo;
            var i = 0, sz = 0;
            for (i = 0, sz = attribs.length; i < sz; i++) {
                var aif = attribs[i];
                gl.enableVertexAttribArray(aif.nLoc);
                gl.vertexAttribPointer(aif.nLoc, aif.nSize, aif.nType, false, mesh.getStride(aif.nStream), aif.nOffset);
            }
            var curtex = 0;
            for (i = 0, sz = groupData.shaderInfo.textureBind.length; i < sz; i++) {
                gl.activeTexture(gl.TEXTURE0 + curtex);
                gl.bindTexture(gl.TEXTURE_2D, material.textures[groupData.shaderInfo.textureBind[i].id].gltexture);
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
            var uniforms = groupData.shaderInfo.uniformInfo;
            for (i = 0, sz = uniforms.length; i < sz; i++) {
                var uif = uniforms[i];
                if (uif.dataGroupID < rundata.length) {
                    var vv = new Float32Array(rundata[uif.dataGroupID], uif.offset, uif.num);
                    uif.uniformProc(gl, uif.location, vv);
                }
            }
        }
        var eleNum = groupData.end - groupData.begin;
        ib ? (gl.drawElements(gl.TRIANGLES, eleNum, gl.UNSIGNED_SHORT, groupData.begin * 2)) : (gl.drawArrays(gl.TRIANGLES, groupData.begin, eleNum));
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}
exports.Renderer = Renderer;
