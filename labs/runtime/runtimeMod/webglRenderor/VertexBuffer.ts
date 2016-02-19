
///<reference path="../common/MemClass.ts" />

module renderer {
	/**
	 * VB。可以用在顶点buffer或者索引buffer
	 * @author guo
	 */
    import MemClass = webglLab.MemClass;
    export class VertexBuffer {
         vbo:WebGLBuffer= null;
         nVBLength:number = 0;
         nVertNum:number = 0;
         memBuffer: Array<MemClass> = null;
         streamStart: Array<number> = null;
         stride: Array<number> = null;
         nStreamNum: number = 0;

        constructor() {
        }

         create(stride: number, vertNum: number): Boolean {
            this.nVertNum = vertNum;
            this.nStreamNum = 1;
            this.memBuffer = new Array<MemClass>(1);
            this.memBuffer[0] = new MemClass();
            this.memBuffer[0].setSize(stride * vertNum);
            this.streamStart = new Array<number>(1);
            this.streamStart[0] = 0;
            this.stride = new Array<number>(1);
            this.stride[0] = stride;
            //先不创建vbo
            return true;
        }
		
        /**
         * 创建多流的buffer
         * @param	vertNum
         * @param	stride
         * @return
         */
         createMS(vertNum: number, stride: Array<number>): boolean {
            this.nStreamNum = stride.length;
            this.stride = stride;
            this.memBuffer = new Array<MemClass>(this.nStreamNum);
            this.streamStart = new Array<number>(this.nStreamNum);

            var start: number = 0;
            for (var i: number = 0; i < this.nStreamNum; i++) {
                this.streamStart[i] = start;
                var sz: number = this.stride[i] * this.nVertNum;
                this.memBuffer[i] = new MemClass();
                this.memBuffer[i].setSize(sz);
                start += sz;
            }
            return true;
        }

         addStream(stride: number): void {
            var curend: number = this.streamStart[this.nStreamNum - 1] + this.stride[this.nStreamNum - 1] * this.nVertNum;
            this.nStreamNum++;
            var added: MemClass = new MemClass();
            this.memBuffer.push(added);
            added.setSize(this.nVertNum * stride);
            this.streamStart.push(curend);
            this.stride.push(stride);
        }

         getVBO(): WebGLBuffer{
            return this.vbo;
        }

         getMemBuffer(id: number): MemClass {
            if (id < this.memBuffer.length)
                return this.memBuffer[id];
            return null;
        }

         getStride(id: number): number {
            if (id < this.nStreamNum)
                return this.stride[id];
            console.log('Error: vb.getStride id=' + id + ', streamNum=' + this.nStreamNum);
            return 0;
        }

         upload(gl: WebGLRenderingContext, target:number ): void {
            if (this.nStreamNum <= 0)
                return;
            var membuf: MemClass = null;
            var bufsz: number = 0;
            if (!this.vbo) {
                this.vbo = gl.createBuffer();
                if (this.nStreamNum > 1) {
                    //多流的要先分配空间。单流的话，直接就glBufferData了
                    bufsz = this.streamStart[this.nStreamNum - 1] + this.stride[this.nStreamNum - 1] * this.nVertNum;
                    gl.bindBuffer(target, this.vbo);
                    gl.bufferData(target, bufsz, gl.DYNAMIC_DRAW);//TODO dynamic or static
                    gl.bindBuffer(target, null);
                }
            }

            if (this.nStreamNum == 1) {
                membuf = this.memBuffer[0];
                bufsz = membuf.size();
                if (this.nVBLength < bufsz) {
                    gl.deleteBuffer(this.vbo);
                    this.vbo = gl.createBuffer();
                }
                if (this.vbo && membuf.getChangedFlag()) {
                    gl.bindBuffer(target, this.vbo);
                    gl.bufferData(target, membuf.getBuffer(), gl.DYNAMIC_DRAW);
                    this.nVBLength = bufsz;
                    gl.bindBuffer(target, null);
                }
                membuf.setChangedFlag(false);
            } else {
                var cursz: number = 0;
                for (var i: number = 0; i < this.nStreamNum; i++) {
                    membuf = this.memBuffer[i];
                    if (!membuf.getChangedFlag())
                        continue;

                    gl.bindBuffer(target, this.vbo);
                    var bufdata: ArrayBuffer = membuf.getBuffer().slice(0, membuf.size());
                    gl.bufferSubData(target, this.streamStart[i], bufdata);
                    cursz += membuf.size();
                    gl.bindBuffer(target, null);
                    membuf.setChangedFlag(false);
                }
                if (this.nVBLength == 0)
                    this.nVBLength = cursz;
                if (this.nVBLength < cursz) {
                    console.log("错了。多流的vertexbuffer比对应的mem小了。" + this.nVBLength + "," + cursz);
                    throw -2;
                }
            }
        }

         freeGLRes(gl: WebGLRenderingContext): void {

        }
    }

}