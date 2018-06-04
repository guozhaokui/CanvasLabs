/*
var compile = require('glsl-transpiler/stream');
var parse = require('glsl-parser/stream');
var tokenize = require('glsl-tokenizer/stream');
var fs = require('fs');

fs.createReadStream('F:/work/pbr/threejspbr/ps1.glsl')
.pipe(tokenize())
.pipe(parse())
.pipe(compile())
.once('end', function () {
    //this.source contains the actual version of the compiled code
    //and gets updated on each input chunk of data.
    console.log(this.source);
});
*/

var Compiler = require('glsl-transpiler');

var compile = Compiler({
    uniform: function (name) {
        return `uniforms.${name}`;
    },
    attribute: function (name) {
        return `attributes.${name}`;
    }
});
compile(`
    precision mediump float;
    attribute vec2 uv;
    attribute vec4 color;
    varying vec4 fColor;
    uniform vec2 uScreenSize;

    void main (void) {
        fColor = color;
        vec2 position = vec2(uv.x, -uv.y) * 1.0;
        position.x *= uScreenSize.y / uScreenSize.x;
        gl_Position = vec4(position, 0, 1);
    });
`);
//这个方法不行