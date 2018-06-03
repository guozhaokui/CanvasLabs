"use strict";
class MemClass {
    constructor() {
        this.bAlign = false;
        this.nBuffSize = 0;
        this.nDataSize = 0;
        this.nAdjustSz = 16;
        this.nReadPos = 0;
        this.bChanged = true;
    }
    getBuffer() {
        return this.arrayBuffer;
    }
    setBufferExpandStep(sz) {
        this.nAdjustSz = sz;
    }
    setAlign(b) {
        this.bAlign = b;
    }
    alignValue(v) {
        return this.bAlign ? (v + 3) & 0xfffffffc : v;
    }
    setSize(sz) {
        if (sz <= 0)
            return;
        this.expand(sz);
    }
    size() {
        return this.nDataSize;
    }
    setWritePos(p) {
        this.nDataSize = p;
    }
    expand(d) {
        if (d < 1)
            return;
        var nsz = d + this.nBuffSize + this.nAdjustSz;
        if (!this.arrayBuffer) {
            this.arrayBuffer = new ArrayBuffer(nsz);
            this.arrayBufferView = new Uint8Array(this.arrayBuffer);
            this.nBuffSize = nsz;
            this.bChanged = true;
            return;
        }
        var oldview = this.arrayBufferView;
        this.arrayBuffer = new ArrayBuffer(nsz);
        if (!this.arrayBuffer)
            return;
        else {
            this.arrayBufferView = new Uint8Array(this.arrayBuffer);
            this.arrayBufferView.set(oldview);
        }
        this.nBuffSize = nsz;
        this.bChanged = true;
    }
    appendArray(arr) {
        this.expand(this.nDataSize + arr.length - this.nBuffSize);
        arr.length;
    }
    fromFloatArray(arr) {
        if (this.nBuffSize / 4 > arr.length) {
            var arrayBufferView = new Float32Array(arr);
            this.arrayBuffer = arrayBufferView.buffer;
            this.arrayBufferView = new Uint8Array(this.arrayBuffer);
            this.nDataSize = arr.length * 4;
            this.bChanged = true;
        }
        else {
            console.log("fromeFloatArray 失败，大小不够");
            throw -1;
        }
        return true;
    }
    fromShortArray(arr) {
        if (this.nBuffSize / 2 > arr.length) {
            var arrayBufferView = new Uint16Array(arr);
            this.arrayBuffer = arrayBufferView.buffer;
            this.arrayBufferView = new Uint8Array(this.arrayBuffer);
            this.nDataSize = arr.length * 2;
            this.bChanged = true;
        }
        else {
            throw 'fromShortArray 失败，大小不够';
        }
        return true;
    }
    setAB(dt) {
        var len = dt.byteLength;
        this.arrayBuffer = dt;
        this.nBuffSize = len;
        this.nDataSize = len;
        this.arrayBufferView = new Uint8Array(this.arrayBuffer);
        this.bChanged = true;
    }
    appendFloat(v) {
        this.expand(this.nDataSize + 4 - this.nBuffSize);
    }
    appendnumber(v) {
    }
    appendShort(v) {
    }
    setChangedFlag(b) { this.bChanged = b; }
    ;
    getChangedFlag() { return this.bChanged; }
}
exports.MemClass = MemClass;
