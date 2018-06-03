"use strict";
const fs = require('fs');
const { nativeImage } = require('electron');
function getImgBuf(img) {
    var canv = document.createElement('canvas');
    canv.width = img.width;
    canv.height = img.height;
    var ctx = canv.getContext('2d');
    var imgdata = ctx.getImageData(0, 0, canv.width, canv.height);
    return imgdata.data;
}
exports.getImgBuf = getImgBuf;
function HmapToNormalmap(hmap, w, h, hs, xwrap, ywrap, hmax) {
    var ci = w;
    var vecs = vec3.create();
    var vect = vec3.create();
    var vectmp = vec3.create();
    var ret = new ImageData(w, h);
    var retbuf = ret.data;
    var ti = 0;
    for (var y = 0; y < h; y++) {
        ci = y * w;
        ti = ci * 4;
        for (var x = 0; x < w; x++) {
            var pxi = ci - 1;
            if (pxi < 0)
                pxi += w;
            var nxi = ci + 1;
            if (x >= w - 1)
                nxi -= w;
            var px = hmap[pxi];
            var nx = hmap[nxi];
            var pyi = ci - w;
            if (pyi < 0)
                pyi += w * w;
            var nyi = ci + w;
            if (y >= h - 1)
                nyi = x;
            var py = hmap[pyi];
            var ny = hmap[nyi];
            vecs[0] = 2;
            vecs[1] = 0;
            vecs[2] = (nx - px) * hs;
            vect[0] = 0;
            vect[1] = 2;
            vect[2] = (ny - py) * hs;
            vec3.cross(vectmp, vecs, vect);
            vec3.normalize(vectmp, vectmp);
            retbuf[ti++] = (1.0 + vectmp[0]) / 2.0 * 255.0;
            retbuf[ti++] = (1.0 + vectmp[1]) / 2.0 * 255.0;
            retbuf[ti++] = (1.0 + vectmp[2]) / 2.0 * 255.0;
            retbuf[ti++] = 255;
            ci++;
        }
    }
    return ret;
}
exports.HmapToNormalmap = HmapToNormalmap;
function normalmapToHeightmap(nmfile, worldw, worldh) {
    var img = nativeImage.createFromPath(nmfile);
    if (!img) {
        throw 'open failed';
    }
    var buf = img.toBitmap();
    var sz = img.getSize();
    var w = sz.width;
    var h = sz.height;
    var hm = new Float32Array(w * h);
    saveFloatArray(hm, w, h, 'd:/temp/hm.png');
    debugger;
    return hm;
}
exports.normalmapToHeightmap = normalmapToHeightmap;
function saveFloatArray(data, w, h, outfile) {
    var imgdata = new ImageData(w, h);
    var minv = data[0];
    var maxv = data[0];
    data.forEach((v, i, arr) => {
        if (v < minv)
            minv = v;
        if (v > maxv)
            maxv = v;
    });
    var ci = 0;
    var dv = (maxv - minv) * 255;
    var cbuf = imgdata.data;
    data.forEach((v, i, arr) => {
        var cdv = (v - minv) * dv;
        cbuf[ci++] = cdv;
        cbuf[ci++] = cdv;
        cbuf[ci++] = cdv;
        cbuf[ci++] = 255;
    });
    saveAsPng(imgdata, outfile);
}
function GenSphereHeight(d) {
    var r = d / 2;
    var dx = 1.0 / r;
    var dy = -1.0 / r;
    var fx = -1;
    var fy = 1;
    var yy = 0;
    var ret = new Float32Array(d * d);
    var ci = 0;
    for (var cy = 0; cy < d; cy++) {
        yy = fy * fy;
        fx = -1.0;
        for (var cx = 0; cx < d; cx++) {
            var xx = fx * fx;
            var dist = xx + yy;
            if (dist > 1) {
                ret[ci++] = 0;
            }
            else {
                var z = Math.sqrt(1.0 - dist);
                ret[ci++] = z;
            }
            fx += dx;
        }
        fy += dy;
    }
    return ret;
}
function saveCanvas(canv, outfile) {
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
    var sz = nimg.getSize();
    fs.writeFileSync(outfile, nimg.toPng());
}
exports.saveCanvas = saveCanvas;
function saveAsPng(data, outfile) {
    var canv = document.createElement('canvas');
    canv.width = data.width;
    canv.height = data.height;
    var ctx = canv.getContext('2d');
    ctx.putImageData(data, 0, 0);
    var buf = canv.toDataURL('image/png');
    var nimg = nativeImage.createFromDataURL(buf);
    fs.writeFileSync(outfile, nimg.toPng());
    return nativeImage;
}
exports.saveAsPng = saveAsPng;
