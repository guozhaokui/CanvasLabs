'use strict';
import vb = require("./VertexBuffer");
import membuf = require('../common/MemClass');
import vd = require('./VertexDesc');
export class Mesh {
    vb: vb.VertexBuffer = null;
    ib: vb.VertexBuffer = null;
    vertNum: number = 0;
    idxNum: number = 0;
    vd:vd.VertexDesc;

    constructor() { }

    createVB(vertexSize: number, vertexNum: number): boolean {
        this.vb = new vb.VertexBuffer();
        if (!this.vb.create(vertexSize, vertexNum))
            return false;
        this.vertNum = vertexNum;
        return true;
    }

    createIB(num: number): Boolean {
        this.ib = new vb.VertexBuffer();
        if (!this.ib.create(2, num))
            return false;
        this.idxNum = num;
        return true;
    }

    createMultiStreamVB(vertNum: number, stride: Array<number>): boolean {
        var len: number = stride.length;
        this.vb = new vb.VertexBuffer();
        this.vertNum = vertNum;
        return this.vb.createMS(vertNum, stride);
    }

    addStream(vertexSize: number): Boolean {
        if (!this.vb)
            return false;
        this.vb.addStream(vertexSize);
        return true;
    }
		
    /**
     *	通过float数组来设置数据。 
     * 	要求先已经创建VB了
     * @param	verts
     * @param	streamid
     */
    setVertData(verts: Array<number>, streamid: number): void {
        if (!this.vb) {
            throw -2;
        }
        var membuf: membuf.MemClass = this.vb.getMemBuffer(streamid);
        if (membuf) {
            membuf.fromFloatArray(verts);
        }
    }

    getVB(): vb.VertexBuffer {
        return this.vb;
    }

    getIB(): vb.VertexBuffer {
        return this.ib;
    }

    copyToVB(v: ArrayBuffer, stream: number): void {
        //if (this.vb.getMemBuffer(stream).size() < v.byteLength)
        //	throw 'setVB 超过了创建的大小，不行！';
        this.vb.getMemBuffer(stream).setAB(v);
    }

    copyToIB(v: ArrayBuffer): void {
        this.ib.getMemBuffer(0).setAB(v);
    }

    getStride(id: number): number {
        return this.vb.getStride(id);
    }
}


