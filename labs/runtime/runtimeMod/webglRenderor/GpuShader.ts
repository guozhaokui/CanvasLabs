'use strict';
enum Status { nosrc = 0, notcompile, compiled, create_error, compile_error };
export class GpuShader {
    private nStatus: Status = Status.nosrc;
    nGLShader: WebGLShader;
    private nShaderType: number;
    private strSrc: string;

    constructor() {
    }

    setSrc(src: string): void {
        this.strSrc = src;
    }

    freeGLRes(gl: WebGLRenderingContext): void {
        if (this.nGLShader)
            gl.deleteShader(this.nGLShader);
    }

    build(gl: WebGLRenderingContext, shadertype: number): WebGLShader {
        this.nShaderType = shadertype;
        this.nGLShader = gl.createShader(this.nShaderType);
        if (this.nGLShader) {
            gl.shaderSource(this.nGLShader, this.strSrc);
            gl.compileShader(this.nGLShader);
            if (!gl.getShaderParameter(this.nGLShader, gl.COMPILE_STATUS)) {
                this.nStatus = Status.compile_error;
                //if ( gl.getShaderParameter(this.nGLShader, gl.INFO_LOG_LENGTH) > 0) {
                console.log("shader err:" + gl.getShaderInfoLog(this.nGLShader));
                //}else
                //	trace("error 2:ShaderObject"); 
                gl.deleteShader(this.nGLShader);
                return 0;
            } else {
                this.nStatus = Status.compiled;
            }
        } else {
            console.log("error 1");
        }
        return this.nGLShader;
    }

}
