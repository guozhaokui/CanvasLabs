
import headTrack = require('../../runtime/runtimeMod/common/HeadTracker');

class accTest {
    left: HTMLDivElement;
    right: HTMLDivElement;
    fullWidth = 2984;
    headt = new headTrack.HeadTracker(window);
    radius=100;//假设半径为100m
    canv:HTMLCanvasElement=null;
    ctx:CanvasRenderingContext2D=null;
    img:HTMLImageElement=null;
    constructor() {
        this.init();
        this.onRot(0);
    }
    
    init(){
        var el = document.getElementById('content');
        this.canv = <HTMLCanvasElement> document.getElementById('myCanvas');
        this.ctx = this.canv.getContext("2d");
        this.img = new Image();
        this.img.src = '1.jpg';
        this.img.onload = () => {};
        this.img.onerror = () => {
            alert('err');
        }
    }

    onRot(r:number) {
        var canvw = this.canv.width;
        var canvh = this.canv.height;
        var center = (1+r/3.14)/2*this.fullWidth;
        var st = center-canvw/2/2;
        var m1 = this.headt.matRot;
        //this.ctx.setTransform(m1[0],m1[1],m1[4],m1[5],0,0); 
        this.ctx.drawImage(this.img,st,0,canvw/2,canvh,0,0,canvw/2,canvh);
        this.ctx.drawImage(this.img,st,0,canvw/2,canvh,canvw/2,0,canvw/2,canvh);
    }
    onRender=()=>{
        var mat = this.headt.matRot;
        var zx = mat[8];
        var zy = mat[9];
        var zz = mat[10];
        //console.log(`x:${zx},y:${zy},z:${zz}`);
        var r = Math.atan2(-zy,-zx);
        //console.log(parseInt(''+ r*180/3.14));
        this.onRot(-r);
        //this.onRot(this.gr);
        window.requestAnimationFrame(this.onRender);
    }

    static main(window: Window) {
        var acc = new accTest();
        //setInterval(() => { acc.onRender(); }, 15);
        window.requestAnimationFrame(acc.onRender);
    }
}

accTest.main(window);