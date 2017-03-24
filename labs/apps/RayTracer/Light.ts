
import {Vector3} from '../math/Vector3';
import {Color} from './Color';

interface LightBase{
    color:Color;
}

export class PointLight{
    constructor(){

    }
}

export class DirLight{
    dir=new Vector3(0,0,0);
    color=new Color(1,1,1);
    constructor(dir:Vector3,color:Color){
        this.dir=dir;
        this.color=color;
    }
    /**
     * 获取某个点的灯光的颜色和朝向
     */
    getLight(pos:Vector3,dir:Vector3,color:Color){

    }
}