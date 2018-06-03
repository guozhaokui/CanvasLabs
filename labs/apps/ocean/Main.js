'use strict';
const FPS2D = require('../common/FPS2D');
const ocean_1 = require('./ocean');
const sampler_1 = require('./sampler');
const Vector3_1 = require('../math/Vector3');
const GerstnerWave_1 = require('./GerstnerWave');
const FFT_1 = require('./FFT');
const fft1_1 = require('./fft1');
const imgfunc_1 = require('../imgproc/imgfunc');
function startAnimation(renderFunc) {
    function _render() {
        renderFunc();
        window.requestAnimationFrame(_render);
    }
    window.requestAnimationFrame(_render);
}
var updateFPS = new FPS2D.FPS2D().updateFPS;
class NormalAnimCanv {
    constructor() {
        this.curfrm = 0;
        this.cx = 0;
        this.cy = 0;
        this.gridw = 128;
        this.normalAnimCanv = document.createElement('canvas');
        this.normalAnimCanv.width = 1024;
        this.normalAnimCanv.height = 1024;
        this.ctx = this.normalAnimCanv.getContext('2d');
    }
    setCurFrmData(data) {
        if (data.width != this.gridw)
            throw 'error size not match! should: 128';
        this.ctx.putImageData(data, this.cx, this.cy);
    }
    save(file) {
        imgfunc_1.saveCanvas(this.normalAnimCanv, file);
    }
    nextfrm() {
        this.curfrm++;
        this.cx += this.gridw;
        if (this.cx >= 1024) {
            this.cx = 0;
            this.cy += this.gridw;
        }
        return this.cy <= 1024;
    }
}
class NormalTable {
    constructor() {
        this.w = 128;
        this.maxh = 0;
        this.hmap = new Float32Array(this.w * this.w);
        var ci = 0;
        var d = 2.0 * Math.PI / this.w;
        var cx = 0, cy = 0;
        for (var y = 0; y < this.w; y++) {
            cx = 0;
            for (var x = 0; x < this.w; x++) {
                var h = this.getH(cx, cy);
                if (this.maxh < h)
                    this.maxh = h;
                this.hmap[ci++] = h;
                cx += d;
            }
            cy += d;
        }
        console.log('maxh=' + this.maxh);
        var data = imgfunc_1.HmapToNormalmap(this.hmap, this.w, this.w, 10.0, 0, 0, this.maxh);
        imgfunc_1.saveAsPng(data, 'd:/temp/normaltable.png');
        var hbuf = imgfunc_1.normalmapToHeightmap('d:/temp/normaltable.png', 1, 1);
    }
    getH(x, y) {
        var wvx = 1.0 - Math.abs(Math.sin(x));
        var wvy = 1.0 - Math.abs(Math.sin(y));
        var swvx = Math.abs(Math.cos(x));
        var swvy = Math.abs(Math.cos(y));
        wvx = wvx * (1.0 - wvx) + swvx * wvx;
        wvy = wvy * (1.0 - wvy) + swvy * wvy;
        return Math.pow(1.0 - Math.pow(wvx * wvy, 1.), 2.0);
        ;
    }
    test() {
    }
}
new NormalTable();
class OceanTest {
    constructor(canv) {
        this.fullWidth = 2984;
        this.fullHeight = 672;
        this.canv = null;
        this.ctx = null;
        this.img = new Image();
        this.tm = Date.now();
        this.tm1 = 0;
        this.normValue = 'Normal:';
        this.curNorm = new Float32Array(3);
        this.testGW = new GerstnerWave_1.GerstnerWave(128, 128);
        this.savenum = 0;
        this.normAnim = new NormalAnimCanv();
        this.onRender = () => {
            this.render();
            updateFPS(this.ctx);
        };
        this.canv = canv;
        this.ctx = canv.getContext("2d");
        this.img.src = 'imgs/basecolor.png';
        this.datacanv = document.createElement('canvas');
        this.datacanv.width = 128;
        this.datacanv.height = 128;
        var w = 128;
        var h = 128;
        this.eyepos = new Vector3_1.Vector3(w / 2, h / 2, 200);
        var imgdata = this.imgData = this.datacanv.getContext('2d').getImageData(0, 0, this.datacanv.width, this.datacanv.height);
        var pix = imgdata.data;
        this.ocean = new ocean_1.Ocean(pix, w, h);
        var skyimg = new Image();
        skyimg.onload = () => {
            this.ocean.sky = new sampler_1.Sampler(skyimg);
        };
        skyimg.src = 'imgs/sky1.jpg';
    }
    func_p_m_ittc_pu(xrange) {
        var xarr = [];
        var yarr = [];
        var a = 0.0081;
        var g = 9.8;
        var b = 0.74;
        var U = 11.5;
        var h = 2.8;
        for (var x = xrange[0]; x < xrange[2]; x += xrange[1]) {
            xarr.push(x);
            var sittc = (0.78 / Math.pow(x, 5)) *
                Math.exp(-3.12 / (h * h * Math.pow(x, 4)));
            yarr.push(sittc);
        }
        return [new Float32Array(xarr), new Float32Array(yarr)];
    }
    drawPlot(x, y, xarr, yarr, ctx) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = 'white';
        var minx = 1e6, miny = 1e6;
        var maxx = -1e6, maxy = -1e6;
        xarr.forEach((v) => { if (minx > v)
            minx = v; if (maxx < v)
            maxx = v; });
        yarr.forEach((v) => { if (miny > v)
            miny = v; if (maxy < v)
            maxy = v; });
        ctx.fillRect(0, 0, 300, 300);
        var txarr = new Float32Array(xarr);
        var tyarr = new Float32Array(yarr);
        var xw = maxx - minx;
        var yw = maxy - miny;
        txarr.forEach((v, i) => {
            txarr[i] = 300 * (v - minx) / xw;
        });
        tyarr.forEach((v, i) => {
            tyarr[i] = 300 - 300 * (v - miny) / yw;
        });
        ctx.strokeStyle = 'red';
        ctx.moveTo(txarr[0], tyarr[0]);
        for (var xi = 1; xi < txarr.length; xi++) {
            ctx.lineTo(txarr[xi], tyarr[xi]);
        }
        ctx.stroke();
        ctx.restore();
    }
    drawFloatArray2(x, y, v, w, h, minv, maxv, bmpbuff, ctx) {
        if (bmpbuff == null) {
            bmpbuff = new ImageData(w, h);
        }
        var pix = bmpbuff.data;
        var dv = maxv - minv;
        dv = 255 / dv;
        if (dv <= 0) {
            console.error('err1');
            return;
        }
        var vi = 0;
        var ci = 0;
        for (var cy = 0; cy < h; cy++) {
            for (var cx = 0; cx < w; cx++) {
                var cv = (v[vi] - minv) * dv;
                pix[ci++] = cv;
                pix[ci++] = cv;
                pix[ci++] = cv;
                pix[ci++] = 255;
                vi++;
            }
        }
        ctx.putImageData(bmpbuff, x, y);
    }
    testFFT1() {
        var w = 256;
        var cmparr = new fft1_1.ComplexArray(2);
        var data = new Float32Array(256 * 256);
        for (var y = 128 - 16; y <= 128 + 16; y++) {
            for (var x = 128 - 16; x <= 128 + 16; x++) {
                data[y * w + x] = 1;
            }
        }
        var fftr = FFT_1.fft2(data, w, w);
        var fftrR = new Float32Array(256 * 256);
        var fi = 0;
        var minv = 1e6;
        var maxv = -1e6;
        var cx = w / 2;
        var cy = w / 2;
        for (var y = 0; y < w; y++) {
            var cyw = cy * w;
            for (var x = 0; x < w; x++) {
                var v = Math.abs(fftr[cx + cyw].real);
                if (minv > v)
                    minv = v;
                if (maxv < v)
                    maxv = v;
                fftrR[fi++] = v;
                cx++;
                cx %= w;
            }
            cy++;
            cy %= w;
        }
        this.drawFloatArray2(300, 0, fftrR, w, w, minv, maxv / 4, null, this.ctx);
    }
    testFFT() {
        var w = 256;
        var data = new Float32Array(256 * 256);
        for (var y = 128 - 16; y <= 128 + 16; y++) {
            for (var x = 128 - 16; x <= 128 + 16; x++) {
                data[y * w + x] = 1;
            }
        }
        var cmparr = new fft1_1.ComplexArray(w * w);
        cmparr.real = data;
        var fftr0 = fft1_1.FFT2D(cmparr, w, w, false);
        var fftr1 = fft1_1.FFT2D(fftr0, w, w, true);
        var fftrR = new Float32Array(w * w);
        var fi = 0;
        var minv = 1e6;
        var maxv = -1e6;
        var cx = w / 2;
        var cy = w / 2;
        for (var y = 0; y < w; y++) {
            var cyw = cy * w;
            for (var x = 0; x < w; x++) {
                var v = Math.abs(fftr1.real[cx + cyw]);
                if (minv > v)
                    minv = v;
                if (maxv < v)
                    maxv = v;
                fftrR[fi++] = v;
                cx++;
                cx %= w;
            }
            cy++;
            cy %= w;
        }
        this.drawFloatArray2(300, 0, fftrR, w, w, minv, maxv / 4, null, this.ctx);
    }
    render() {
        this.ctx.save();
        var gconfig = window.tmpgconfig;
        var windspeed = gconfig.slide1;
        var winddir = gconfig.slide2 * Math.PI * 2 / 100;
        this.ocean.waveGen2.U10 = windspeed;
        this.ocean.waveGen2.U10θ = winddir;
        this.ocean.waveGen2.preCalc();
        var tm = (Date.now() - this.tm) / 20000;
        this.ocean.genHeight3(this.tm1);
        this.tm1 += 0.015625;
        this.ocean.genNormal();
        this.ocean.renderNormal();
        this.datacanv.getContext('2d').putImageData(this.imgData, 0, 0);
        if (this.savenum < 64) {
            this.normAnim.setCurFrmData(this.imgData);
            if (!this.normAnim.nextfrm()) {
                throw 'kkk';
            }
            this.savenum++;
        }
        else if (this.savenum == 64) {
            this.normAnim.save('d:/temp/normanim.png');
            alert('ok');
            this.savenum++;
        }
        this.ctx.drawImage(this.datacanv, 0, 0);
        this.ocean.showXWave(this.ctx, 0, 300);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 500, 1000, 200);
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(this.normValue, 0, 600);
        this.ctx.restore();
        var ctx = this.ctx;
        this.testGW.U10 = windspeed;
        this.testGW.U10θ = winddir;
        this.testGW.preCalc();
        var info = { minv: 0, maxv: 0 };
        var bp = this.testGW.calcH(0, info).real;
        console.log('min:' + info.minv + ',max:' + info.maxv);
        this.drawFloatArray2(300, 0, bp, this.testGW.vertXNum, this.testGW.vertYNum, 0, 0.001, this.testGW.bmpBuffer, ctx);
    }
    onmousemove(x, y) {
        this.ocean.getNorm(x, y, this.curNorm);
        if (!isNaN(this.curNorm[0]))
            this.normValue = 'NORM:  ' + this.curNorm[0].toPrecision(4) + ',  ' + this.curNorm[1].toPrecision(4) + ',  ' + this.curNorm[2].toPrecision(4);
    }
}
function main(canv) {
    var app = new OceanTest(canv);
    startAnimation(app.onRender);
    canv.onmousemove = (e) => {
        app.onmousemove(e.clientX, e.clientY);
    };
}
exports.main = main;
