'use strict';
var TypeSize = new Map();

export class VertexDesc {
    /**
     * 下面的定义要与gl相同。
     */
    static BYTE: number = 0x1400;
    static UNSIGNED_BYTE: number = 0x1401;
    static SHORT: number = 0x1402;
    static UNSIGNED_SHORT: number = 0x1403;
    static INT: number = 0x1404;
    static UNSIGNED_INT: number = 0x1405;
    static FLOAT: number = 0x1406;

    static FLOAT_VEC2: number = 0x8B50;
    static FLOAT_VEC3: number = 0x8B51;
    static FLOAT_VEC4: number = 0x8B52;
    static INT_VEC2: number = 0x8B53;
    static INT_VEC3: number = 0x8B54;
    static INT_VEC4: number = 0x8B55;
    static BOOL: number = 0x8B56;
    static BOOL_VEC2: number = 0x8B57;
    static BOOL_VEC3: number = 0x8B58;
    static BOOL_VEC4: number = 0x8B59;
    static FLOAT_MAT2: number = 0x8B5A;
    static FLOAT_MAT3: number = 0x8B5B;
    static FLOAT_MAT4: number = 0x8B5C;

    vertnum: number = 0;
    //为了转换方便的变量
    descNum: number = 0;
    descData: Array<number> = new Array();
    nameData: Array<string> = new Array();
    nameLen: number = 0;

    constructor(vertnum?:number,obj?:Object[]) {
        if(vertnum && obj){
            this.initByObject(vertnum,obj);
        }
        this.descData.push(0);			//这个表示个数。
        this.descData.push(0);			//vertdesc的实际长度。因为可能会对齐
    }

    /**
     * @param off 是在buffer中的偏移，一般在多流的情况下使用
     */
    initByObject(vertnum: number, objs: Object[]) {
        this.vertnum=vertnum;
        var soff=0;
        for (var oi = 0; oi < objs.length; oi++) {
            var cobj = objs[oi];
            var vertsz = 0;
            for (var name in cobj) {
                var type: number = cobj[name];
                this.add(<string>name, type, soff + vertsz,oi);
                var sz = TypeSize.get(type); if (!sz) throw 'unknown type![' + type + ']';
                vertsz += sz;
            }
            soff+=vertnum*vertsz;
        }
    }

    //var strDesc:string  = '';
    add(name: string, type: number, offset: number, streamid: number): void {
        //this[name] = { 'attribName':name, 'type':type, 'offset':offset, 'streamID':streamid }
        this[name] = [name, type, offset, streamid];
        this.descData.push(this.nameLen, type, offset, streamid);
        this.nameData.push(name);
        this.nameLen += name.length + 1;
        this.descNum++;
    }
    getVertexDesc(name: string): Array<number> {
        return this[name];
    }
    toAB(): ArrayBuffer {
        this.descData[0] = this.descNum;
        var dtlen: number = this.descData.length * 2;
        dtlen = (dtlen + 3) & 0xfffffffc;
        this.descData[1] = dtlen;
        var len: number = dtlen + this.nameLen;
        len = (len + 3) & 0xfffffffc;
        var retBuff: ArrayBuffer = new ArrayBuffer(len);
        var dataBuf: Uint16Array = new Uint16Array(retBuff, 0, this.descData.length);
        var strBuf: Uint8Array = new Uint8Array(retBuff, dtlen, this.nameLen);
        dataBuf.set(this.descData);
        var strpos: number = 0;
        for (var i: number = 0, sz: number = this.nameData.length; i < sz; i++) {
            for (var ci: number = 0, csz: number = this.nameData[i].length; ci < csz; ci++)
                strBuf[strpos++] = this.nameData[i].charCodeAt(ci);
            strBuf[strpos++] = 0;
        }
        return retBuff;
        /**
         * nameid:short
         * type:short
         * offset:short
         * stream:short
         * names
         */
    }
}

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
