
import {Ray3,IntersectResult} from '../math/Ray3';

export interface ShapeBase{
    initialize():void;
    intersect(ray:Ray3):IntersectResult;
}