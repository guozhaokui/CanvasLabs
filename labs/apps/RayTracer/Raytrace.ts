
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {ShapeBase} from '../../runtime/runtimeMod/shape/ShapeBase';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';


function rayTraceRecursive(scene, ray, maxReflect) {
    var result = scene.intersect(ray);
    
    if (result.geometry) {
        var reflectiveness = result.geometry.material.reflectiveness;
        var color = result.geometry.material.sample(ray, result.position, result.normal);
        color = color.multiply(1 - reflectiveness);
        
        if (reflectiveness > 0 && maxReflect > 0) {
            var r = result.normal.multiply(-2 * result.normal.dot(ray.direction)).add(ray.direction);
            ray = new Ray3(result.position, r);
            var reflectedColor = rayTraceRecursive(scene, ray, maxReflect - 1);
            color = color.add(reflectedColor.multiply(reflectiveness));
        }
        return color;
    }
    else
        return Color.black;
}


export function raytrace(canvas:HTMLCanvasElement, scene, camera){
    if (!canvas || !canvas.getContext) 
        return;

    var ctx = canvas.getContext("2d");
    if (!ctx.getImageData)
        return;

    var w = canvas.width;
    var h = canvas.height;
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, 0, w, h);

    var imgdata = ctx.getImageData(0, 0, w, h);
    var pixels = imgdata.data;

    scene.initialize();
    camera.initialize();

    var i = 0;
    for (var y = 0; y < h; y++) {
        var sy = 1 - y / h;
        for (var x = 0; x < w; x++) {
            var sx = x / w;
            var ray = camera.generateRay(sx, sy);
            var result = scene.intersect(ray);
            if (result.geometry) {
                var color = result.geometry.material.sample(ray, result.position, result.normal);
                pixels[i] = color.r * 255;
                pixels[i + 1] = color.g * 255;
                pixels[i + 2] = color.b * 255;
                pixels[i + 3] = 255;
            }
            i += 4;
        }
    }
    ctx.putImageData(imgdata, 0, 0);
} 