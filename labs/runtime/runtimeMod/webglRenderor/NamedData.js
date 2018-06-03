'use strict';
class JSRunData1 {
    constructor(sz) {
        this.ab = null;
        this.ab = new ArrayBuffer(sz);
    }
    getAB() {
        return this.ab;
    }
}
exports.JSRunData1 = JSRunData1;
var TypeInfo = new Map();
class NamedData {
    constructor() {
        this.descNum = 0;
        this.descData = [];
        this.nameData = [];
        this.nameLen = 0;
        this.dataSize = 0;
        this.jsObjDesc = {};
        this.descData.push(0);
        this.descData.push(0);
    }
    static createByObj(params) {
    }
    add(name, offset, type, num) {
        this.descData.push(this.nameLen, offset, type, num);
        this.nameData.push(name);
        this.nameLen += name.length + 1;
        this.descNum++;
        this.dataSize += TypeInfo.get(type).len * num;
        this.jsObjDesc[name] = [offset, type, num];
        return this;
    }
    createDataInstance() {
        var ret = new JSRunData1(this.dataSize);
        var ab = ret.getAB();
        for (var a in this.jsObjDesc) {
            var desc = this.jsObjDesc[a];
            if (!desc)
                throw 'createJSInstance error! no this attrib:' + a;
            var ti = TypeInfo.get(desc[1]);
            var cls = ti.cls;
            ret[a] = new cls(ab, desc[0], ti.typenum * desc[2]);
        }
        return ret;
    }
    def(desc) {
    }
    toAB() {
        this.descData[0] = this.descNum;
        var dtlen = 2 + this.descData.length * 2;
        dtlen = (dtlen + 3) & 0xfffffffc;
        this.descData[1] = dtlen;
        var len = dtlen + this.nameLen;
        len = (len + 3) & 0xfffffffc;
        var retBuff = new ArrayBuffer(len);
        var dataBuf = new Uint16Array(retBuff, 0, 1 + this.descData.length);
        var strBuf = new Uint8Array(retBuff, dtlen, this.nameLen);
        dataBuf.set(this.descData);
        var strpos = 0;
        for (var i = 0, sz = this.nameData.length; i < sz; i++) {
            for (var ci = 0, csz = this.nameData[i].length; ci < csz; ci++)
                strBuf[strpos++] = this.nameData[i].charCodeAt(ci);
            strBuf[strpos++] = 0;
        }
        return retBuff;
    }
    getDesc(name) {
        return this.jsObjDesc[name];
    }
}
NamedData.tp_unknown = 0;
NamedData.tp_int8 = 1;
NamedData.tp_uint8 = 2;
NamedData.tp_int16 = 3;
NamedData.tp_uint16 = 4;
NamedData.tp_int32 = 5;
NamedData.tp_uint32 = 6;
NamedData.tp_f32 = 7;
NamedData.tp_f64 = 8;
NamedData.tp_fvec2 = 9;
NamedData.tp_fvec3 = 10;
NamedData.tp_fvec4 = 11;
NamedData.tp_mat2 = 12;
NamedData.tp_mat3 = 13;
NamedData.tp_mat4 = 14;
NamedData.tp_user = 15;
exports.NamedData = NamedData;
var N = NamedData;
TypeInfo.set(N.tp_int8, { len: 1, cls: Int8Array, typenum: 1 }).
    set(N.tp_uint8, { len: 1, cls: Uint8Array, typenum: 1 }).
    set(N.tp_int16, { len: 2, cls: Int16Array, typenum: 1 }).
    set(N.tp_uint16, { len: 2, cls: Uint16Array, typenum: 1 }).
    set(N.tp_int32, { len: 4, cls: Int32Array, typenum: 1 }).
    set(N.tp_uint32, { len: 4, cls: Uint32Array, typenum: 1 }).
    set(N.tp_f32, { len: 4, cls: Float32Array, typenum: 1 }).
    set(N.tp_f64, { len: 8, cls: Float64Array, typenum: 1 }).
    set(N.tp_fvec2, { len: 8, cls: Float32Array, typenum: 2 }).
    set(N.tp_fvec3, { len: 12, cls: Float32Array, typenum: 3 }).
    set(N.tp_fvec4, { len: 16, cls: Float32Array, typenum: 4 }).
    set(N.tp_mat2, { len: 16, cls: Float32Array, typenum: 4 }).
    set(N.tp_mat3, { len: 36, cls: Float32Array, typenum: 9 }).
    set(N.tp_mat4, { len: 64, cls: Float32Array, typenum: 16 });
