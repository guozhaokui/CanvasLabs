"use strict";
var π = Math.PI;
var sin = Math.sin;
var cos = Math.cos;
const sampler_1 = require('./sampler');
const CosWave_1 = require('./CosWave');
const GerstnerWave_1 = require('./GerstnerWave');
class Ocean {
    constructor(buff, w, h) {
        this.maxH = 0;
        this.minH = 0;
        this.waveGen2 = new GerstnerWave_1.GerstnerWave(128, 128);
        this.data = buff;
        this.width = w;
        this.height = h;
        this.hfield = new Float32Array(w * h);
        this.nfield = new Float32Array(w * h * 3);
        var b;
        this.wavedata = [
            { A: 20, θ: 0, φ: 0, f: 10, λ: 100 },
            { A: 6, θ: π / 4, φ: 0, f: 30, λ: 50 },
            { A: 2, θ: π / 2, φ: 0, f: 50, λ: 30 }
        ];
        this.waveGen1 = new CosWave_1.CosWave(300, 300, 1, 1, this.wavedata);
        var himg = new Image();
        himg.src = 'imgs/height.png';
        himg.onload = () => {
            this.heightimg = new sampler_1.Sampler(himg);
        };
    }
    genHeight(t) {
        if (!this.heightimg)
            return;
        var hi = 0;
        var hvalue = new Uint8ClampedArray(4);
        var cu = 0;
        var cv = 0;
        var du = 1 / this.heightimg.width;
        var dv = 1 / this.heightimg.height;
        var t1 = t / 1000;
        for (var y = 0; y < this.height; y++) {
            cu = 0;
            for (var x = 0; x < this.width; x++) {
                this.heightimg.sample(cu + t1, cv, hvalue);
                var vh = hvalue[0] / 255 * 5;
                this.hfield[hi++] = vh;
                if (this.minH > vh)
                    this.minH = vh;
                if (this.maxH < vh)
                    this.maxH = vh;
                cu += du;
            }
            cv += dv;
        }
    }
    genHeight2(t) {
        var i = 0;
        this.hfield = this.waveGen1.update(t / 1000);
        this.minH = this.waveGen1.minh;
        this.maxH = this.waveGen1.maxh;
    }
    genHeight3(t) {
        var info = { minv: 0, maxv: 0 };
        var hf = this.waveGen2.calcHField(t, info);
        var hi = 0;
        var wavW = this.waveGen2.vertXNum;
        var scale = 1;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.hfield[hi++] = hf[x % wavW + (y % wavW) * wavW] * scale;
            }
        }
        this.minH = info.minv * scale;
        this.maxH = info.maxv * scale;
    }
    genNormal() {
        var i = 0;
        var ni = 0;
        var dx = 2 * this.waveGen2.worldWidth / this.waveGen2.vertXNum;
        var dxdx = dx * dx;
        var dy = 2 * this.waveGen2.worldHeight / this.waveGen2.vertYNum;
        var dydy = dy * dy;
        var hk = 2.0;
        for (var y = 1; y < this.height - 1; y++) {
            var yw = y * this.width;
            ni = 3 * yw + 3;
            for (var x = 1; x < this.width - 1; x++) {
                var yw_a_x = yw + x;
                var px = this.hfield[yw_a_x - 1];
                var nx = this.hfield[yw_a_x + 1];
                var py = this.hfield[yw_a_x - this.width];
                var ny = this.hfield[yw_a_x + this.width];
                var s = hk * (nx - px);
                var t = hk * (ny - py);
                var sl = Math.sqrt(dxdx + s * s);
                var tl = Math.sqrt(dydy + t * t);
                var nx = -(s / sl) * (dy / tl);
                var ny = -(dx / sl) * (t / tl);
                var nz = (dx / sl) * (dy / tl);
                var nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
                this.nfield[ni++] = nx / nl;
                this.nfield[ni++] = ny / nl;
                this.nfield[ni++] = nz / nl;
            }
        }
        this.nfield[0] = this.nfield[this.width + 1];
        this.nfield[1] = this.nfield[this.width + 2];
        this.nfield[2] = this.nfield[this.width + 2];
        var ci = (this.width - 1) * 3;
        this.nfield[0] = this.nfield[this.width + 1];
        this.nfield[1] = this.nfield[this.width + 2];
        this.nfield[2] = this.nfield[this.width + 2];
        for (x = 0; x < this.width; x++) {
        }
    }
    renderHeight() {
        var d = this.maxH - this.minH;
        var i = 0;
        var hi = 0;
        var pix = this.data;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var cd = this.hfield[hi++] - this.minH;
                var v = cd * 255 / d;
                pix[i++] = v;
                pix[i++] = v;
                pix[i++] = v;
                pix[i++] = 255;
            }
        }
    }
    renderNormal() {
        var ni = 0;
        var ci = 0;
        var pix = this.data;
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                pix[ci++] = (this.nfield[ni++] + 1) / 2 * 255;
                pix[ci++] = (this.nfield[ni++] + 1) / 2 * 255;
                pix[ci++] = (this.nfield[ni++] + 1) / 2 * 255;
                pix[ci++] = 255;
            }
        }
    }
    render(eyepos) {
        if (!this.sky)
            return;
        var color = new Uint8ClampedArray(4);
        var ci = 0;
        var ni = 0;
        var pix = this.data;
        for (var y = 0; y < this.height; y++) {
            var yw = y * this.width;
            for (var x = 0; x < this.width; x++) {
                var nx = this.nfield[ni++];
                var ny = this.nfield[ni++];
                var nz = this.nfield[ni++];
                var enterx = eyepos.x - x;
                var entery = eyepos.y - y;
                var enterz = eyepos.z - this.hfield[yw++];
                var enterl = Math.sqrt(enterx * enterx + entery * entery + enterz * enterz);
                enterx /= enterl;
                entery /= enterl;
                enterz /= enterl;
                var dotv2 = 2 * (enterx * nx + entery * ny + enterz * nz);
                var outerx = nx * dotv2 - enterx;
                var outery = ny * dotv2 - entery;
                var outerz = nz * dotv2 - enterz;
                var upisz = false;
                var texc_u, texc_v;
                if (upisz) {
                    texc_v = (1 + outerz) / 2;
                    var ang = Math.atan2(outerx, outery);
                    texc_u = (-ang + π) / 2 / π;
                }
                else {
                    texc_v = (1 + outery) / 2;
                    var ang = Math.atan2(outerx, outerz);
                    texc_u = (-ang + π) / 2 / π;
                }
                if (false) {
                }
                else {
                    this.sky.sample(texc_u, texc_v, color);
                    pix[ci++] = color[0];
                    pix[ci++] = color[1];
                    pix[ci++] = color[2];
                    pix[ci++] = 255;
                }
            }
        }
    }
    showXWave(ctx, x, y) {
        var hi = 0;
        var canvh = 100;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.translate(x, y);
        ctx.fillStyle = '#777777';
        ctx.fillRect(0, 0, this.width, canvh);
        ctx.beginPath();
        var dh = this.maxH - this.minH;
        var h = canvh - (this.hfield[0] - this.minH) * canvh / dh;
        ctx.moveTo(0, h);
        for (var x = 0; x < this.width; x++) {
            h = canvh - (this.hfield[hi++] - this.minH) * canvh / dh;
            ctx.lineTo(x, h);
        }
        ctx.stroke();
        ctx.restore();
    }
    showYWave(ctx, x, y) {
    }
    getNorm(x, y, norm) {
        if (x < this.width && y < this.height) {
            var ni = (this.width * y + x) * 3;
            norm[0] = this.nfield[ni++];
            norm[1] = this.nfield[ni++];
            norm[2] = this.nfield[ni++];
        }
    }
}
exports.Ocean = Ocean;
