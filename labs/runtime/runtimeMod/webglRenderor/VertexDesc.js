'use strict';
var TypeSize = new Map();
class VertexDesc {
    constructor(vertnum, obj) {
        this.vertnum = 0;
        this.descNum = 0;
        this.descData = new Array();
        this.nameData = new Array();
        this.nameLen = 0;
        if (vertnum && obj) {
            this.initByObject(vertnum, obj);
        }
        this.descData.push(0);
        this.descData.push(0);
    }
    initByObject(vertnum, objs) {
        this.vertnum = vertnum;
        var soff = 0;
        for (var oi = 0; oi < objs.length; oi++) {
            var cobj = objs[oi];
            var vertsz = 0;
            for (var name in cobj) {
                var type = cobj[name];
                this.add(name, type, soff + vertsz, oi);
                var sz = TypeSize.get(type);
                if (!sz)
                    throw 'unknown type![' + type + ']';
                vertsz += sz;
            }
            soff += vertnum * vertsz;
        }
    }
    add(name, type, offset, streamid) {
        this[name] = [name, type, offset, streamid];
        this.descData.push(this.nameLen, type, offset, streamid);
        this.nameData.push(name);
        this.nameLen += name.length + 1;
        this.descNum++;
    }
    getVertexDesc(name) {
        return this[name];
    }
    toAB() {
        this.descData[0] = this.descNum;
        var dtlen = this.descData.length * 2;
        dtlen = (dtlen + 3) & 0xfffffffc;
        this.descData[1] = dtlen;
        var len = dtlen + this.nameLen;
        len = (len + 3) & 0xfffffffc;
        var retBuff = new ArrayBuffer(len);
        var dataBuf = new Uint16Array(retBuff, 0, this.descData.length);
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
}
VertexDesc.BYTE = 0x1400;
VertexDesc.UNSIGNED_BYTE = 0x1401;
VertexDesc.SHORT = 0x1402;
VertexDesc.UNSIGNED_SHORT = 0x1403;
VertexDesc.INT = 0x1404;
VertexDesc.UNSIGNED_INT = 0x1405;
VertexDesc.FLOAT = 0x1406;
VertexDesc.FLOAT_VEC2 = 0x8B50;
VertexDesc.FLOAT_VEC3 = 0x8B51;
VertexDesc.FLOAT_VEC4 = 0x8B52;
VertexDesc.INT_VEC2 = 0x8B53;
VertexDesc.INT_VEC3 = 0x8B54;
VertexDesc.INT_VEC4 = 0x8B55;
VertexDesc.BOOL = 0x8B56;
VertexDesc.BOOL_VEC2 = 0x8B57;
VertexDesc.BOOL_VEC3 = 0x8B58;
VertexDesc.BOOL_VEC4 = 0x8B59;
VertexDesc.FLOAT_MAT2 = 0x8B5A;
VertexDesc.FLOAT_MAT3 = 0x8B5B;
VertexDesc.FLOAT_MAT4 = 0x8B5C;
exports.VertexDesc = VertexDesc;
TypeSize.set(VertexDesc.BYTE, 1);
TypeSize.set(VertexDesc.UNSIGNED_BYTE, 1);
TypeSize.set(VertexDesc.SHORT, 2);
TypeSize.set(VertexDesc.UNSIGNED_SHORT, 2);
TypeSize.set(VertexDesc.INT, 4);
TypeSize.set(VertexDesc.UNSIGNED_INT, 4);
TypeSize.set(VertexDesc.FLOAT, 4);
TypeSize.set(VertexDesc.FLOAT_VEC2, 8);
TypeSize.set(VertexDesc.FLOAT_VEC3, 12);
TypeSize.set(VertexDesc.FLOAT_VEC4, 16);
TypeSize.set(VertexDesc.INT_VEC2, 8);
TypeSize.set(VertexDesc.INT_VEC3, 12);
TypeSize.set(VertexDesc.INT_VEC4, 16);
TypeSize.set(VertexDesc.BOOL, 1);
TypeSize.set(VertexDesc.BOOL_VEC2, 2);
TypeSize.set(VertexDesc.BOOL_VEC3, 3);
TypeSize.set(VertexDesc.BOOL_VEC4, 4);
TypeSize.set(VertexDesc.FLOAT_MAT2, 16);
TypeSize.set(VertexDesc.FLOAT_MAT3, 36);
TypeSize.set(VertexDesc.FLOAT_MAT4, 64);
