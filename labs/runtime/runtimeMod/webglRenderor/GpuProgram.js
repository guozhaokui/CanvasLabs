'use strict';
const gpush = require('./GpuShader');
class GpuProgram {
    constructor() {
        this.program = 0;
        this.nFlag = 0;
    }
    setSrc(strVS, strPS) {
        this.vs = new gpush.GpuShader;
        this.ps = new gpush.GpuShader;
        this.vs.setSrc(strVS);
        this.ps.setSrc(strPS);
    }
    compile(gl) {
        this.program = gl.createProgram();
        if (this.program) {
            if (!this.vs.nGLShader)
                this.vs.build(gl, gl.VERTEX_SHADER);
            if (!this.ps.nGLShader)
                this.ps.build(gl, gl.FRAGMENT_SHADER);
            gl.attachShader(this.program, this.vs.nGLShader);
            gl.attachShader(this.program, this.ps.nGLShader);
            gl.linkProgram(this.program);
            var ecode = gl.getProgramParameter(this.program, gl.LINK_STATUS);
            if (!ecode) {
                if (gl.getProgramParameter(this.program, 0x8B84) > 0) {
                    console.log("link err:" + gl.getProgramInfoLog(this.program));
                }
                else
                    console.log("error: link program, ecode=" + ecode);
                gl.deleteProgram(this.program);
            }
        }
        else {
            console.log("createProgram error!");
        }
        return this.program;
    }
    freeGLRes(gl) {
        if (this.vs) {
            this.vs.freeGLRes(gl);
        }
        if (this.ps) {
            this.ps.freeGLRes(gl);
        }
    }
}
exports.GpuProgram = GpuProgram;
