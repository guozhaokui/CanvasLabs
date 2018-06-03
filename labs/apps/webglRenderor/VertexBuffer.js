'use strict';
const membuf = require('../common/MemClass');
class VertexBuffer {
    constructor() {
        this.vbo = null;
        this.nVBLength = 0;
        this.nVertNum = 0;
        this.memBuffer = null;
        this.streamStart = null;
        this.stride = null;
        this.nStreamNum = 0;
    }
    create(stride, vertNum) {
        this.nVertNum = vertNum;
        this.nStreamNum = 1;
        this.memBuffer = new Array(1);
        this.memBuffer[0] = new membuf.MemClass();
        this.memBuffer[0].setSize(stride * vertNum);
        this.streamStart = new Array(1);
        this.streamStart[0] = 0;
        this.stride = new Array(1);
        this.stride[0] = stride;
        return true;
    }
    createMS(vertNum, stride) {
        this.nStreamNum = stride.length;
        this.stride = stride;
        this.memBuffer = new Array(this.nStreamNum);
        this.streamStart = new Array(this.nStreamNum);
        var start = 0;
        for (var i = 0; i < this.nStreamNum; i++) {
            this.streamStart[i] = start;
            var sz = this.stride[i] * this.nVertNum;
            this.memBuffer[i] = new membuf.MemClass();
            this.memBuffer[i].setSize(sz);
            start += sz;
        }
        return true;
    }
    addStream(stride) {
        var curend = this.streamStart[this.nStreamNum - 1] + this.stride[this.nStreamNum - 1] * this.nVertNum;
        this.nStreamNum++;
        var added = new membuf.MemClass();
        this.memBuffer.push(added);
        added.setSize(this.nVertNum * stride);
        this.streamStart.push(curend);
        this.stride.push(stride);
    }
    getVBO() {
        return this.vbo;
    }
    getMemBuffer(id) {
        if (id < this.memBuffer.length)
            return this.memBuffer[id];
        return null;
    }
    getStride(id) {
        if (id < this.nStreamNum)
            return this.stride[id];
        console.log('Error: vb.getStride id=' + id + ', streamNum=' + this.nStreamNum);
        return 0;
    }
    upload(gl, target) {
        if (this.nStreamNum <= 0)
            return;
        var membuf = null;
        var bufsz = 0;
        if (!this.vbo) {
            this.vbo = gl.createBuffer();
            if (this.nStreamNum > 1) {
                bufsz = this.streamStart[this.nStreamNum - 1] + this.stride[this.nStreamNum - 1] * this.nVertNum;
                gl.bindBuffer(target, this.vbo);
                gl.bufferData(target, bufsz, gl.DYNAMIC_DRAW);
                gl.bindBuffer(target, null);
            }
        }
        if (this.nStreamNum == 1) {
            membuf = this.memBuffer[0];
            bufsz = membuf.size();
            if (this.nVBLength < bufsz) {
                gl.deleteBuffer(this.vbo);
                this.vbo = gl.createBuffer();
            }
            if (this.vbo && membuf.getChangedFlag()) {
                gl.bindBuffer(target, this.vbo);
                gl.bufferData(target, membuf.getBuffer(), gl.DYNAMIC_DRAW);
                this.nVBLength = bufsz;
                gl.bindBuffer(target, null);
            }
            membuf.setChangedFlag(false);
        }
        else {
            var cursz = 0;
            for (var i = 0; i < this.nStreamNum; i++) {
                membuf = this.memBuffer[i];
                if (!membuf.getChangedFlag())
                    continue;
                gl.bindBuffer(target, this.vbo);
                var bufdata = membuf.getBuffer().slice(0, membuf.size());
                gl.bufferSubData(target, this.streamStart[i], bufdata);
                cursz += membuf.size();
                gl.bindBuffer(target, null);
                membuf.setChangedFlag(false);
            }
            if (this.nVBLength == 0)
                this.nVBLength = cursz;
            if (this.nVBLength < cursz) {
                console.log("错了。多流的vertexbuffer比对应的mem小了。" + this.nVBLength + "," + cursz);
                throw -2;
            }
        }
    }
    freeGLRes(gl) {
    }
}
exports.VertexBuffer = VertexBuffer;
