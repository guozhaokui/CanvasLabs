"use strict"

module webglLab{
	/**
	* 组建一个JS的ArrayBuffer
	 * @author guo
	 */
    export class MemClass {
        private bAlign:boolean = false;
        private nBuffSize:number = 0;
        private nDataSize:number = 0;
        private nAdjustSz:number = 16;
        private nReadPos:number = 0;
        private bChanged:boolean = true;
        private arrayBuffer: ArrayBuffer;		//JS ArrayBuffer
        private arrayBufferView: Uint8Array; 	//JS DataView
		
        constructor() {    }
		
        /**
         * 返回一个JS的ArrayBuffer对象。
         */
        getBuffer(): ArrayBuffer {
            return this.arrayBuffer;
        }

        setBufferExpandStep(sz: number): void {
            this.nAdjustSz = sz;
        }

        setAlign(b: boolean): void {
            this.bAlign = b;
        }		

        /**
         * 把一个数值对齐到4字节。这个数值通常是一个地址
         * @param	var v
         */
        alignValue(v: number): number {
            return this.bAlign ? (v + 3) & 0xfffffffc : v;
        }		
		
        /**
         * 设置buffer的大小。不过此时还没有数据。
         * @param	var sz
         */
        setSize(sz: number): void {
            if (sz <= 0)
                return;
            this.expand(sz);
        }

        size(): number {
            return this.nDataSize;
        }

        setWritePos(p: number): void {
            this.nDataSize = p;
        }
		
        /**
         * 增加buffer大大小。
         * @param	var d
         */
        expand(d: number): void {
            if (d < 1) return;
            var nsz: number = d + this.nBuffSize + this.nAdjustSz;//需要按4对齐么
            if (!this.arrayBuffer) {
                this.arrayBuffer = new ArrayBuffer(nsz);
                this.arrayBufferView = new Uint8Array(this.arrayBuffer);
                this.nBuffSize = nsz;
                this.bChanged = true;
                return;
            }
            var oldview: Uint8Array = this.arrayBufferView;
            this.arrayBuffer = new ArrayBuffer(nsz);
            if (!this.arrayBuffer)
                return;
            else {
                //拷贝老的
                this.arrayBufferView = new Uint8Array(this.arrayBuffer);
                this.arrayBufferView.set(oldview);
            }
            this.nBuffSize = nsz;
            this.bChanged = true;
        }
		
        /**
         * 添加一个float数组
         * @param	arr
         */
        appendArray(arr: Array<number>): void {
            this.expand(this.nDataSize + arr.length - this.nBuffSize);
            arr.length;
        }
		
        //下面的两个函数可以做成通用的。
        /**
         * 直接从一个数组构建。
         * @param	arr
         * @return
         */
        fromFloatArray(arr: Array<number>): boolean {
            //TODO 这里没法做个数的校验。
            if (this.nBuffSize / 4 > arr.length) {
                var arrayBufferView:Float32Array = new Float32Array(arr);
                this.arrayBuffer = arrayBufferView.buffer;
                this.arrayBufferView = new Uint8Array(this.arrayBuffer);
                this.nDataSize = arr.length * 4;
                this.bChanged = true;
            } else {
                console.log("fromeFloatArray 失败，大小不够");
                throw -1;
            }
            return true;
        }
		
        /**
         * 
         * @param	arr
         * @return
         */
        fromShortArray(arr: Array<number>): boolean {
            if (this.nBuffSize / 2 > arr.length) {
                var arrayBufferView = new Uint16Array(arr);
                this.arrayBuffer = arrayBufferView.buffer;
                this.arrayBufferView = new Uint8Array(this.arrayBuffer);
                this.nDataSize = arr.length * 2;
                this.bChanged = true;
            } else {
                throw 'fromShortArray 失败，大小不够';
            }
            return true;
        }
		
        /**
         * 直接设置ArrayBuffer
         * @param	dt
         * @return
         */
        setAB(dt: ArrayBuffer): void {
            var len: number = dt.byteLength;
            this.arrayBuffer = dt;
            this.nBuffSize = len;
            this.nDataSize = len;
            this.arrayBufferView = new Uint8Array(this.arrayBuffer);
            this.bChanged = true;
        }

        appendFloat(v: Number): void {
            this.expand(this.nDataSize + 4 - this.nBuffSize);
        }
        appendnumber(v: number): void {

        }
        appendShort(v: number): void {

        }

        setChangedFlag(b: boolean): void { this.bChanged = b; };
        getChangedFlag(): boolean { return this.bChanged; }
    }

}
