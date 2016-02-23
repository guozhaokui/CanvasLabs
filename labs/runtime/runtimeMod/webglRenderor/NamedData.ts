'use strict';
export class NamedData {
    static tp_unknown: number = 0;
    static tp_int8: number = 1;
    static tp_uint8: number = 2;
    static tp_int16: number = 3;
    static tp_uint16: number = 4;
    static tp_int32: number = 5;
    static tp_uint32: number = 6;
    static tp_f32: number = 7;
    static tp_f64: number = 8;
    static tp_fvec2: number = 9;
    static tp_fvec3: number = 10;
    static tp_fvec4: number = 11;
    static tp_mat2: number = 12;
    static tp_mat3: number = 13;
    static tp_mat4: number = 14;
    static tp_user: number = 15;	//自定义的都要大于这个
    //为了转换方便的变量
    private descNum: number = 0;
    //名字用的是偏移。
    private descData: Array<number> = new Array();
    //这个是保存字符串的。
    private nameData: Array<string> = new Array();
    private nameLen: number = 0;

    constructor() {
        this.descData.push(0);	//个数
        this.descData.push(0);	//对齐后的长度
    }

    add(name: string, offset: number, type: number, num: number): void {
        //this[name] = { 'offset':offset,'type':type,'num':num };
        this[name] = [offset, type, num];

        this.descData.push(this.nameLen, offset, type, num);
        this.nameData.push(name);
        this.nameLen += name.length + 1;
        this.descNum++;
    }
    
    def(desc:{name:string,type:number,num:number}[]){
        //desc.forEach
    }
		
    /**
     * 结构是: short nameid, offset,type,num 
     * @return
     */
    toAB(): ArrayBuffer {
        this.descData[0] = this.descNum;
        var dtlen: number = 2 + this.descData.length * 2;
        dtlen = (dtlen + 3) & 0xfffffffc;
        this.descData[1] = dtlen;
        var len: number = dtlen + this.nameLen;
        len = (len + 3) & 0xfffffffc;
        var retBuff: ArrayBuffer = new ArrayBuffer(len);
        var dataBuf: Uint16Array = new Uint16Array(retBuff, 0, 1 + this.descData.length);
        var strBuf: Uint8Array = new Uint8Array(retBuff, dtlen, this.nameLen);
        dataBuf.set(this.descData);
        var strpos: number = 0;
        for (var i: number = 0, sz: number = this.nameData.length; i < sz; i++) {
            for (var ci: number = 0, csz: number = this.nameData[i].length; ci < csz; ci++)
                strBuf[strpos++] = this.nameData[i].charCodeAt(ci);
            strBuf[strpos++] = 0;
        }
        return retBuff;
    }

    getDesc(name: string): number[] {
        return this[name];
    }
}

