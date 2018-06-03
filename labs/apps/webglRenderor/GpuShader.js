'use strict';
var Status;
(function (Status) {
    Status[Status["nosrc"] = 0] = "nosrc";
    Status[Status["notcompile"] = 1] = "notcompile";
    Status[Status["compiled"] = 2] = "compiled";
    Status[Status["create_error"] = 3] = "create_error";
    Status[Status["compile_error"] = 4] = "compile_error";
})(Status || (Status = {}));
;
class GpuShader {
    constructor() {
        this.nStatus = Status.nosrc;
    }
    setSrc(src) {
        this.strSrc = src;
    }
    freeGLRes(gl) {
        if (this.nGLShader)
            gl.deleteShader(this.nGLShader);
    }
    build(gl, shadertype) {
        this.nShaderType = shadertype;
        this.nGLShader = gl.createShader(this.nShaderType);
        if (this.nGLShader) {
            gl.shaderSource(this.nGLShader, this.strSrc);
            gl.compileShader(this.nGLShader);
            if (!gl.getShaderParameter(this.nGLShader, gl.COMPILE_STATUS)) {
                this.nStatus = Status.compile_error;
                console.log("shader err:" + gl.getShaderInfoLog(this.nGLShader));
                gl.deleteShader(this.nGLShader);
                return 0;
            }
            else {
                this.nStatus = Status.compiled;
            }
        }
        else {
            console.log("error 1");
        }
        return this.nGLShader;
    }
}
exports.GpuShader = GpuShader;
