'use strict';
const vb = require("./VertexBuffer");
class Mesh {
    constructor() {
        this.vb = null;
        this.ib = null;
        this.vertNum = 0;
        this.idxNum = 0;
    }
    createVB(vertexSize, vertexNum) {
        this.vb = new vb.VertexBuffer();
        if (!this.vb.create(vertexSize, vertexNum))
            return false;
        this.vertNum = vertexNum;
        return true;
    }
    createIB(num) {
        this.ib = new vb.VertexBuffer();
        if (!this.ib.create(2, num))
            return false;
        this.idxNum = num;
        return true;
    }
    createMultiStreamVB(vertNum, stride) {
        var len = stride.length;
        this.vb = new vb.VertexBuffer();
        this.vertNum = vertNum;
        return this.vb.createMS(vertNum, stride);
    }
    addStream(vertexSize) {
        if (!this.vb)
            return false;
        this.vb.addStream(vertexSize);
        return true;
    }
    setVertData(verts, streamid) {
        if (!this.vb) {
            throw -2;
        }
        var membuf = this.vb.getMemBuffer(streamid);
        if (membuf) {
            membuf.fromFloatArray(verts);
        }
    }
    getVB() {
        return this.vb;
    }
    getIB() {
        return this.ib;
    }
    copyToVB(v, stream) {
        this.vb.getMemBuffer(stream).setAB(v);
    }
    copyToIB(v) {
        this.ib.getMemBuffer(0).setAB(v);
    }
    getStride(id) {
        return this.vb.getStride(id);
    }
}
exports.Mesh = Mesh;
