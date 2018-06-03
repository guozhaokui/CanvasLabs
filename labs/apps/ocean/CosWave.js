"use strict";
var π = Math.PI;
class WaveData {
}
exports.WaveData = WaveData;
class CosWave {
    constructor(xnum, ynum, gridw, gridh, wavedatas) {
        this.xnum = 0;
        this.ynum = 0;
        this.gridw = 10;
        this.gridh = 10;
        this.z0 = 0;
        this.maxh = -100000;
        this.minh = 100000;
        this.waveDatas = wavedatas;
        this.waveDatas.forEach((v, i) => {
            v.k = 2 * π / v.λ;
            v.ω = 2 * π * v.f;
            v.kcosθ = v.k * Math.cos(v.θ);
            v.ksinθ = v.k * Math.sin(v.θ);
        });
        this.xnum = xnum;
        this.ynum = ynum;
        this.gridw = gridw;
        this.gridh = gridh;
        this.hfield = new Float32Array(xnum * ynum);
    }
    update(t) {
        var x0 = 0;
        var y0 = 0;
        var dtlen = this.waveDatas.length;
        var fi = 0;
        for (var cy = 0; cy < this.ynum; cy++) {
            y0 += this.gridh;
            x0 = 0;
            for (var cx = 0; cx < this.xnum; cx++) {
                var z = this.z0;
                for (var di = 0; di < dtlen; di++) {
                    var dt = this.waveDatas[di];
                    z += dt.A * Math.cos(dt.kcosθ * x0 + y0 * dt.ksinθ - dt.ω * t + dt.φ);
                }
                this.hfield[fi++] = z;
                if (this.maxh < z)
                    this.maxh = z;
                if (this.minh > z)
                    this.minh = z;
                x0 += this.gridw;
            }
        }
        return this.hfield;
    }
}
exports.CosWave = CosWave;
