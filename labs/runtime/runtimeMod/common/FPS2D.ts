'use strict';
export class FPS2D{
    lasttm = 0;
    fpsdata = new Int32Array(100);
    stpos = 0;
    rect = new Int32Array([2, 2, 100, 100]);
    constructor(){
    }
    updateFPS=(ctx: CanvasRenderingContext2D):void=>{
        var curtm = Date.now();
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#331111';
        ctx.fillRect(this.rect[0], this.rect[1], this.rect[2], this.rect[3]);
        var dt = curtm - this.lasttm;
        this.fpsdata[this.stpos] = dt;
        this.stpos = (++this.stpos) % 100;
        this.lasttm = curtm;
        var fps = Math.floor(1000 / dt);
        ctx.beginPath();
        //画曲线
        ctx.strokeStyle = '#ff0000';
        ctx.moveTo(this.rect[0], this.rect[3] - 16);
        ctx.lineTo(this.rect[2], this.rect[3] - 16);
        ctx.stroke();

        ctx.beginPath();
        ctx.strokeStyle = '#66ff55';
        var cx = 0;
        ctx.moveTo(0, 0);
        for (var x = this.stpos; x < 100; x++) {
            ctx.lineTo(cx++, this.rect[3] - this.fpsdata[x]);
        }
        for (var x = 0; x <= this.stpos; x++) {
            ctx.lineTo(cx++, this.rect[3] - this.fpsdata[x]);
        }
        ctx.stroke();
        ctx.font = '16px Arial';
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('FPS:' + fps, 4, 20);
        ctx.restore();
    }
    
}