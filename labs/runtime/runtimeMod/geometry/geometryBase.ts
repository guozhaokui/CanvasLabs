'use strict';
/**
 * 模型的中间状态。记录比较完整的信息。包括生成的点和对应的对象坐标。这个坐标可以用来计算其他顶点信息
 */
import mesh = require('../webglRenderor/Mesh');
import vertDesc = require('../webglRenderor/VertexDesc');

export class geometryBase{
    type:string;//plane,box,sphere,cone,...
    param:Object;
    
    mapTexCoord(type:number){
    }
    calcNormal(){
        
    }
}