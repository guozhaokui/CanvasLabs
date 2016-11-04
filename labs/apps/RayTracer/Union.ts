
import {Vector3} from '../../runtime/runtimeMod/math/Vector3';
import {ShapeBase} from '../../runtime/runtimeMod/shape/ShapeBase';
import {Ray3,IntersectResult} from '../../runtime/runtimeMod/math/Ray3';

/**
 * 就是scene
 */
class Union{
    geometries:ShapeBase[];
    constructor(geometries){
        this.geometries=geometries;
    }

    initialize(){
        for (var i in this.geometries)
            this.geometries[i].initialize();
    }

    intersect(ray:Ray3):IntersectResult{
        var minDistance = Infinity;
        var minResult = IntersectResult.noHit;
        for (var i in this.geometries) {
            var result = this.geometries[i].intersect(ray);
            if (result.geometry && result.distance < minDistance) {
                minDistance = result.distance;
                minResult = result;
            }
        }
        return minResult;
    }
}