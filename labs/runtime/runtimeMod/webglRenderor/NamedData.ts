'use strict';

/**
 * NamedData 返回的对象实例接口。
 */
export interface JSRunData{
    getAB():ArrayBuffer;
}

export class JSRunData1 implements JSRunData{
    private ab:ArrayBuffer=null;
    constructor(sz:number){
        this.ab = new ArrayBuffer(sz);
    }
    getAB(){
        return this.ab;
    }
}

//保存各种类型的大小和对应的ArrayBuffer类。
//typenum是类型的个数，例如vec3的类型是Float32Array，typenum=3
var TypeInfo=new Map<number,{len:number,cls:Function,typenum:number}>();

/**
 * 带描述的二进制数据块。
 */
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
    //总属性的个数。这个是为了转换方便用的。
    private descNum: number = 0;
    //这里的name保存的是偏移。
    private descData: Array<number> = [];
    //这个是保存name字符串的。
    private nameData: Array<string> = [];
    private nameLen: number = 0;
    //总数据的大小。创建对象的时候需要。
    dataSize=0; 
    //把名字属性等也保存到js对象中，因为js对象遍历起来方便一些。
    jsObjDesc = {}; 
    constructor() {
        this.descData.push(0);	//个数
        this.descData.push(0);	//对齐后的长度
    }
    /**
     * 根据对象构造一个NamedData。并返回一个绑定了NamedData的普通js对象
     */
    static createByObj(params: any[]): void{
    }

    add(name: string, offset: number, type: number, num: number): NamedData {
        //this[name] = [offset, type, num];
        this.descData.push(this.nameLen, offset, type, num);
        this.nameData.push(name);
        this.nameLen += name.length + 1;
        this.descNum++;
        this.dataSize += TypeInfo.get(type).len*num;
        this.jsObjDesc[name]=[offset,type,num];
        return this;
    }

    /**
     * 根据类型创建一个AB实例，并返回一个操作他的js对象。
     */
    createDataInstance():JSRunData {
        var ret = new JSRunData1(this.dataSize);
        var ab = ret.getAB();
        for(var a in this.jsObjDesc){
            var desc = <number[]>this.jsObjDesc[a];
            if(!desc) throw 'createJSInstance error! no this attrib:'+a;
            var ti = TypeInfo.get(desc[1]);
            var cls = ti.cls;
            ret[a] =  new (<any>cls)(ab,desc[0],ti.typenum*desc[2]);    //加any是为了能编译通过。
        }
        return ret;
    }

    def(desc: { name: string, type: number, num: number }[]) {
        //desc.forEach
    }

    /**
     * 结构是: short nameid, offset,type,num 
     * @return
     */
    toAB(): ArrayBuffer {
        this.descData[0] = this.descNum;
        var dtlen = 2 + this.descData.length * 2;
        dtlen = (dtlen + 3) & 0xfffffffc;
        this.descData[1] = dtlen;
        var len = dtlen + this.nameLen;
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
        return this.jsObjDesc[name];
    }
}

var N = NamedData;
TypeInfo.set(N.tp_int8,{len:1,cls:Int8Array,typenum:1}).
        set(N.tp_uint8,{len:1,cls:Uint8Array,typenum:1}).
        set(N.tp_int16,{len:2,cls:Int16Array,typenum:1}).
        set(N.tp_uint16,{len:2,cls:Uint16Array,typenum:1}).
        set(N.tp_int32,{len:4,cls:Int32Array,typenum:1}).
        set(N.tp_uint32,{len:4,cls:Uint32Array,typenum:1}).
        set(N.tp_f32,{len:4,cls:Float32Array,typenum:1}).
        set(N.tp_f64,{len:8,cls:Float64Array,typenum:1}).
        set(N.tp_fvec2,{len:8,cls:Float32Array,typenum:2}).
        set(N.tp_fvec3,{len:12,cls:Float32Array,typenum:3}).
        set(N.tp_fvec4,{len:16,cls:Float32Array,typenum:4}).
        set(N.tp_mat2,{len:16,cls:Float32Array,typenum:4}).
        set(N.tp_mat3,{len:36,cls:Float32Array,typenum:9}).
        set(N.tp_mat4,{len:64,cls:Float32Array,typenum:16});
