'use strict';
class Texture {
    constructor() {
        this.gltexture = null;
    }
}
exports.Texture = Texture;
function loadCubMap(gl, imgs) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    var faces = [[imgs[0], gl.TEXTURE_CUBE_MAP_POSITIVE_X],
        [imgs[1], gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
        [imgs[2], gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
        [imgs[3], gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
        [imgs[4], gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
        [imgs[5], gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.onload = function (texture, face, image) {
            return function () {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            };
        }(texture, face, image);
        image.src = faces[i][0];
    }
    return texture;
}
function useTexture(gl, tex) {
    gl.bindTexture(gl.SAMPLER_CUBE, tex);
}
