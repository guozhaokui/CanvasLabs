
import async = require('../../runtime/runtimeMod/common/Async');

function getImgData(img:HTMLImageElement):ImageData{
    var canvas = document.createElement("canvas");
    canvas.width=img.width;
    canvas.height = img.height;
    var ctx=canvas.getContext("2d");
    ctx.drawImage(img,0,0);
    return ctx.getImageData(0,0,canvas.width,canvas.height);
    //var dt = imgData.data;
    //每个像素4个
    //return dt;
}

async function ff(ctx:CanvasRenderingContext2D) {
    var img = await async.loadImage('./imgs/test.jpg');
    var dt = getImgData(img);
    ctx.putImageData(dt,0,0);
    window.requestAnimationFrame(onRender);
}

function onRender(){
    window.requestAnimationFrame(onRender);
}

function main(window) {
    var el = document.getElementById('content');
    var canv = <HTMLCanvasElement>document.getElementById('myCanvas');
    var ctx = canv.getContext('2d');
    ff(ctx);
}

main(window);

