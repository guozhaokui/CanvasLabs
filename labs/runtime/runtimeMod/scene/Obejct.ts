'use strict';

/**
 * 基本的抽象节点。
 */
export class Object{
    id:number;
    name:string;
    type:string;    //用guid的形式表示
    
    static getByID(id:number):Object{
        return null;
    }
}