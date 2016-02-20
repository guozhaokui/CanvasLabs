'use strict';
import gpush = require('./GpuShader');
export class GpuProgram {
    private vs: gpush.GpuShader;
    private ps: gpush.GpuShader;
    private program: WebGLProgram = 0;
    private nFlag: number = 0;

    constructor() {
    }

    setSrc(strVS: string, strPS: string): void {
        //this.vsSrc = strVS;
        //this.psSrc = strPS;
        this.vs = new gpush.GpuShader;
        this.ps = new gpush.GpuShader;
        this.vs.setSrc(strVS);
        this.ps.setSrc(strPS);
    }

    compile(gl: WebGLRenderingContext): WebGLProgram {
        //TODO 如果vsps已经存在了，应该先释放。可以根据状态来判断
        this.program = gl.createProgram();
        if (this.program) {
            if (!this.vs.nGLShader)
                this.vs.build(gl, gl.VERTEX_SHADER);
            if (!this.ps.nGLShader)
                this.ps.build(gl, gl.FRAGMENT_SHADER);
            gl.attachShader(this.program, this.vs.nGLShader);
            gl.attachShader(this.program, this.ps.nGLShader);
            gl.linkProgram(this.program);
            var ecode: number = gl.getProgramParameter(this.program, gl.LINK_STATUS);
            if (!ecode) {
                if (gl.getProgramParameter(this.program, 0x8B84/*gl.GL_INFO_LOG_LENGTH*/) > 0) {
                    console.log("link err:" + gl.getProgramInfoLog(this.program));
                } else
                    console.log("error: link program, ecode=" + ecode);
                gl.deleteProgram(this.program);
            }
        } else {
            console.log("createProgram error!");
        }
        return this.program;
    }

    freeGLRes(gl: WebGLRenderingContext): void {
        if (this.vs) {
            this.vs.freeGLRes(gl);
        }
        if (this.ps) {
            this.ps.freeGLRes(gl);
        }
    }
}
