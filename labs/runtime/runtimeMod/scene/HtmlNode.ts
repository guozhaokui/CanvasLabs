'use strict';
/**
 * apk打包工具界面
 * 
 */

/**
 * +-HtmlElement
 * id
 * cls=class
 * val=innerHTML
 */

class HtmlNodeBranch {
    constructor(desc: string) {

    }
    createFromDesc(desc: string) {
        var lines = desc.split('\n');
        var nodeLayer = new Array<HTMLElement>();
        for (let i in lines) {
            var l = lines[i];
            if (l.length <= 0) continue;
        }
    }
    /**
     * 提供一个节点字符串，获得这个节点在第几层，返回去掉头的字符串
     * 例如 ||+-div,cls='test' 则返回[2,div,`cls='test'`]
     */
    getLayer(desc:string):{layer:number,type:string,desc:string}{
        var layer=0;
        var i=0;
        for(; i<desc.length;i++){
            if(desc[i]=='|') layer++;
            else break;
        }
        if(desc.substr(i,2)!='+-'){
            throw 'errror!'
        }
        var left = desc.substr(i+2);
        var typepos=left.indexOf(',');
        var type = left.substr(0,typepos);
        return {layer:layer,type:type,desc:left.substr(typepos+1)};
    }
}


var desc = `
+-div,cls='viewPanel'
|+-div,val='打包工具'   #title
|+-div,cls='selectcontainer'
||+-span,val='平台'
||+-select,val=['Android']
||+-div
|||+-input,type='checkbox'
|||+-span,style='',val='单机版app'
|+-div,cls='selectcontainer'
||+-span,val='输出目录:'
||+-input,cls='packagetext'  
||+-button,cls='cusBtn',val='浏览...'
||+-a,val=' (生成apk的目录)'
|+-div,cls='selectcontainer'
||+-button,cls='cusBtn',style='top:10px,left:200px;',val='打包',onclick=StartExec
`;

var gg = new HtmlNodeBranch(desc);
var l = gg.getLayer(`+-button,cls='cusBtn',val='浏览...'`);
console.log(JSON.stringify(l));