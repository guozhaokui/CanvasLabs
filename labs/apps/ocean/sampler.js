"use strict";
class Sampler {
    constructor(img) {
        this.width = 0;
        this.height = 0;
        this.pixnum = 0;
        this.debug = false;
        this.img = img;
        var canv = document.createElement('canvas');
        canv.width = this.width = img.width;
        canv.height = this.height = img.height;
        this.pixnum = this.width * this.height;
        var ctx = canv.getContext('2d');
        ctx.drawImage(img, 0, 0);
        this.imgdata = ctx.getImageData(0, 0, img.width, img.height).data;
        this.img.onload = () => {
            alert('sample img onload');
        };
        if (this.debug) {
            this.sample = this.sampledbg;
        }
    }
    sampledbg(u, v, color) {
        var gridsz = 16;
        var x = u * 128;
        var y = v * 128;
        var b = (Math.floor(x / gridsz) + Math.floor(y / gridsz)) % 2;
        b *= 255 - 100;
        color[0] = b;
        color[1] = b;
        color[2] = b;
        color[3] = 255;
    }
    sample(u, v, color) {
        var x = Math.floor(u * this.width);
        var y = Math.floor(v * this.height);
        x %= this.width;
        y %= this.height;
        var p = y * this.width + x;
        p *= 4;
        color[0] = this.imgdata[p++];
        color[1] = this.imgdata[p++];
        color[2] = this.imgdata[p++];
        color[3] = this.imgdata[p++];
        return null;
    }
    dir2uv() {
    }
    sampleSemiSphere(x, y, z, color) {
        if (z <= 0) {
            color[0] = color[1] = color[2] = 0;
            color[3] = 255;
            return;
        }
    }
}
exports.Sampler = Sampler;
