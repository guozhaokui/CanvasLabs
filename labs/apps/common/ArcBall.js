'use strict';
class _ArcBall {
    constructor() {
        this.lastPos = null;
        this.curPos = new Float32Array(3);
        this.halfPos = new Float32Array(3);
        this.curQuat = quat.create();
        this.newQuat = quat.create();
    }
    init(w, h) {
        if (w <= ArcBall.e || h <= ArcBall.e)
            throw '设置大小不对，不能为0';
        this.xs = 2 / w;
        this.ys = 2 / h;
    }
    setpos(x, y, z) {
    }
    hitpos(x, y, out) {
        var x1 = this.xs * x - 1;
        var y1 = this.ys * y - 1;
        var l = x1 * x1 + y1 * y1;
        var nl = Math.sqrt(l);
        if (l > 1.0) {
            out[0] = x1 / nl;
            out[1] = y1 / nl;
            out[2] = 0;
        }
        else {
            out[0] = x1;
            out[1] = y1;
            out[2] = Math.sqrt(1 - nl);
        }
    }
    quatFromUnitV2V(out, vFrom, vTo) {
        var cross = new Float32Array(3);
        vec3.cross(cross, vFrom, vTo);
        out[0] = cross[0];
        out[1] = cross[1];
        out[2] = cross[2];
        out[3] = vec3.dot(vFrom, vTo);
    }
    quatFromV2V(out, vFrom, vTo) {
        var vf = new Float32Array(3);
        var vt = new Float32Array(3);
        vec3.normalize(vf, vFrom);
        vec3.normalize(vt, vTo);
        this.quatFromUnitV2V(out, vf, vt);
    }
    setTouchPos(x, y) {
        if (this.lastPos == null) {
            this.lastPos = new Float32Array(3);
        }
        this.hitpos(x, y, this.lastPos);
    }
    dragTo(x, y, out) {
        this.hitpos(x, y, this.curPos);
        quat.rotationTo(this.newQuat, this.lastPos, this.curPos);
        quat.mul(out, this.newQuat, this.curQuat);
        quat.copy(this.curQuat, out);
        vec3.copy(this.lastPos, this.curPos);
    }
    result() {
        return quat.create();
    }
}
_ArcBall.e = 1e-6;
exports._ArcBall = _ArcBall;
class ArcBall extends _ArcBall {
    constructor(window) {
        super();
        this.drag = false;
        this.quatResult = quat.create();
        window.addEventListener('mousedown', (e) => { this.onMouseDown(e); });
        window.addEventListener('mousemove', (e) => { this.onMouseMove(e); });
        window.addEventListener('mouseup', (e) => { this.onMouseUp(e); });
    }
    onMouseDown(e) {
        this.setTouchPos(e.layerX, e.layerY);
        this.drag = true;
    }
    onMouseUp(e) { this.drag = false; }
    onMouseMove(e) {
        if (this.drag) {
            this.dragTo(e.layerX, e.layerY, this.quatResult);
        }
    }
}
exports.ArcBall = ArcBall;
