"use strict";
const fft1_1 = require('./fft1');
var π = Math.PI;
function getNumberInND(mean, std_dev) {
    return mean + (randND() * std_dev);
}
function randND() {
    var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
    do {
        u = Math.random() * 2 - 1.0;
        v = Math.random() * 2 - 1.0;
        w = u * u + v * v;
    } while (w == 0.0 || w >= 1.0);
    c = Math.sqrt((-2 * Math.log(w)) / w);
    return u * c;
}
function test1() {
    var ret = new Float32Array(100);
    ret.forEach((v, i) => {
        for (var n = 0; n < 100; n++) {
            var v = randND();
            ret[50 + Math.floor(v * 10)] += 0.01;
        }
    });
    return ret;
}
exports.test1 = test1;
class GerstnerWave {
    constructor(width, height) {
        this.U10 = 5.0;
        this.U10θ = 0;
        this.U10x = 1;
        this.U10y = 0;
        this.vertXNum = 0;
        this.vertYNum = 0;
        this.worldWidth = 6;
        this.worldHeight = 6;
        this.lastU10 = -1;
        this.lastU10θ = -1;
        this.needReRnd = true;
        this.vertDataEleNum = 7;
        this.vertXNum = width;
        this.vertYNum = height;
        var num = width * height;
        this.boshupu = new Float32Array(num);
        this.Ak = new Float32Array(num);
        this.Hk = new fft1_1.ComplexArray(num);
        this.HField = new Float32Array(num);
        this.bmpBuffer = new ImageData(width, height);
        this.vertData = new Float32Array(num * this.vertDataEleNum);
        this.preCalc();
    }
    preCalc() {
        if (this.lastU10θ == this.U10θ && this.lastU10 == this.U10)
            return;
        this.lastU10 = this.U10;
        this.lastU10θ = this.U10θ;
        var gg = 9.8 * 9.8;
        var U102 = this.U10 * this.U10;
        var U102π = U102 * π;
        var U104 = U102 * U102;
        var g = 9.8;
        var gg = g * g;
        var gg1 = gg * 0.688;
        var gg2 = gg1 / U104;
        var stx = -π;
        var dx = 2 * π / (this.vertXNum - 1);
        var sty = π;
        var dy = -2 * π / (this.vertYNum - 1);
        var k = 0;
        var cx = stx;
        var cy = sty;
        var prei = 0;
        for (var y = 0; y < this.vertYNum; y++) {
            var yy = cy * cy;
            for (var x = 0; x < this.vertXNum; x++) {
                var ll = cx * cx + yy;
                var l = Math.sqrt(ll);
                this.vertData[prei++] = l;
                this.vertData[prei++] = ll;
                this.vertData[prei++] = ll * ll * ll;
                this.vertData[prei++] = Math.sqrt(9.8 * l);
                if (this.needReRnd) {
                    this.vertData[prei++] = randND();
                    this.vertData[prei++] = randND();
                }
                else {
                    prei++;
                    prei++;
                }
                this.vertData[prei++] = cx * this.U10x + cy * this.U10y;
                cx += dx;
            }
            cy += dy;
        }
        this.calcA(null);
        this.needReRnd = false;
    }
    changeDir(dir) {
        this.U10θ = dir;
        this.U10x = this.U10 * Math.cos(this.U10θ);
        this.U10y = this.U10 * Math.sin(this.U10θ);
        this.preCalc();
    }
    calcBoShuPu(info) {
        var width = this.vertXNum;
        var height = this.vertYNum;
        var stx = -π;
        var dx = 2 * π / (width - 1);
        var sty = π;
        var dy = -2 * π / (height - 1);
        ;
        var k = 0;
        var kk = 0;
        var U10 = this.U10;
        var U10θ = this.U10θ;
        var U10x = U10 * Math.cos(U10θ);
        var U10y = U10 * Math.sin(U10θ);
        var U102 = U10 * U10;
        var U102π = U102 * π;
        var U104 = U102 * U102;
        var g = 9.8;
        var gg = g * g;
        var gg1 = gg * 0.688;
        var gg2 = gg1 / U104;
        var U102π1 = 0.0081 / U102π;
        var dotv = 0;
        var ri = 0;
        var minv = 1e6;
        var maxv = -1e6;
        var cx = stx;
        var cy = sty;
        for (var ny = 0; ny < height; ny++) {
            var yy = cy * cy;
            cx = stx;
            for (var nx = 0; nx < width; nx++) {
                dotv = cx * U10x + cy * U10y;
                if (dotv >= 0) {
                    var xx = cx * cx;
                    var kk = (xx + yy);
                    var k6 = kk * kk * kk;
                    var v = U102π1 / k6 * Math.exp(-(gg2 / kk)) * (dotv * dotv);
                    this.boshupu[ri++] = v;
                }
                else {
                    this.boshupu[ri++] = 0;
                }
                if (minv > v)
                    minv = v;
                if (maxv < v)
                    maxv = v;
                cx += dx;
            }
            cy += dy;
        }
        if (info) {
            info.minv = minv;
            info.maxv = maxv;
        }
        return this.boshupu;
    }
    calcA(info) {
        this.calcBoShuPu(null);
        var minv = 1e6;
        var maxv = -1e6;
        var bi = 0;
        var deltaKx = 2 * π / this.worldWidth;
        var deltaKz = 2 * π / this.worldHeight;
        var dkxdkz = deltaKx * deltaKz;
        for (var ny = 0; ny < this.vertYNum; ny++) {
            for (var nx = 0; nx < this.vertXNum; nx++) {
                var v = this.boshupu[bi];
                v = Math.sqrt(v * dkxdkz);
                if (v > maxv)
                    maxv = v;
                if (v < minv)
                    minv = v;
                this.Ak[bi] = v;
                bi++;
            }
        }
        if (info) {
            info.minv = minv;
            info.maxv = maxv;
        }
        return this.Ak;
    }
    calcH(t, info) {
        var minv = 1e6;
        var maxv = -1e6;
        var sqrt2 = Math.sqrt(2);
        var ai = 0;
        var hi = 0;
        var real = this.Hk.real;
        var imag = this.Hk.imag;
        var prei = 0;
        for (var ny = 0; ny < this.vertYNum; ny++) {
            for (var nx = 0; nx < this.vertXNum; nx++) {
                var A = this.Ak[ai++];
                var λr = this.vertData[prei + 4];
                var λi = this.vertData[prei + 5];
                var gkt = this.vertData[prei + 3] * t;
                var Cv = Math.cos(gkt);
                var Sv = Math.sin(gkt);
                var t1 = A / sqrt2;
                var Rv = t1 * (λr * Cv - λi * Sv);
                var Iv = t1 * (λr * Sv + λi * Cv);
                real[hi] = Rv;
                imag[hi] = Iv;
                if (minv > Rv)
                    minv = Rv;
                if (maxv < Rv)
                    maxv = Rv;
                hi++;
                prei += this.vertDataEleNum;
            }
        }
        if (info) {
            info.minv = minv;
            info.maxv = maxv;
        }
        var NH = new fft1_1.ComplexArray(this.Hk.length);
        var w = this.vertXNum;
        var off = w / 2;
        var nhi = 0;
        for (var y = 0; y < this.vertYNum; y++) {
            for (var x = 0; x < this.vertXNum; x++) {
                var cx = (x + off) % w;
                var cy = (y + off) % w;
                var ci = cx + cy * w;
                NH.real[nhi] = this.Hk.real[ci];
                NH.imag[nhi] = this.Hk.imag[ci];
                nhi++;
            }
        }
        this.Hk = NH;
        return this.Hk;
    }
    calcHField(t, info) {
        var H = this.calcH(t, null);
        var compHField = fft1_1.FFT2D(H, this.vertXNum, this.vertYNum, true);
        this.HField = compHField.real;
        var minv = 1e6;
        var maxv = -1e6;
        this.HField.forEach((v, i, arr) => {
            arr[i] = v;
            if (v < minv)
                minv = v;
            if (v > maxv)
                maxv = v;
        });
        if (info) {
            info.minv = minv;
            info.maxv = maxv;
        }
        return this.HField;
    }
    calcX0Pos(t, info) {
        var H = this.calcH(t, null);
        var compHField = fft1_1.FFT2D(H, this.vertXNum, this.vertYNum, true);
        var pos = new Float32Array(compHField.real.length * 3);
        var minv = 1e6;
        var maxv = -1e6;
        for (var y = 0; y < this.vertYNum; y++) {
            for (var x = 0; x < this.vertXNum; x++) {
            }
        }
        if (info) {
            info.minv = minv;
            info.maxv = maxv;
        }
    }
}
exports.GerstnerWave = GerstnerWave;
