
import mesh = require('../webglRenderor/Mesh');

export class RenderableMesh {
    mesh: mesh.Mesh = null;
    texture;

}

export class Model {
    static idg=0;
    id: number;
    name: string;
    pos = new Float32Array(3);
    rotmat = new Float32Array[3 * 3];//没有位置信息
    meshes: mesh.Mesh[] = null;
    constructor(name: string) {
        this.id = Model.idg++;
        this.name=name;
    }
    /**
     * 返回一个引用。
     */
    copy(name:string): Model {
        var ret = new Model( name);
        //...
        ret.meshes = this.meshes;//mesh是引用
        return ret;
    }
}

import scene = require('./scene');
import sceR = require('../webglRenderor/SceneRender');
function test1(){
    var sce = new scene.Scene;
    var m1 = new Model('test1');
    sce.addMod(m1);
    var m2 = new Model('test2');
    sce.addMod(m2);
    sceR.SceneRender.render(sce);
    
}