'use strict';

/**
 * +-HtmlElement
 * id
 * cls=class
 * val=innerHTML
 */

function createTag(tag: string, prop: Object): HTMLElement {
    var div = document.createElement(tag);

    const propHandle = {
        'cls': function (v: string) { this.setAttribute('class', v); },
        'id': function (v: string) { this.id = v; },
        'val': function (v: string|string[]) {
            if (tag == 'select') {
                //option直接写到val中了
                for(let vi=0; vi<v.length; vi++){
                    div.appendChild(new Option(v[vi]));
                }
            } else {
                this.innerHTML = v;
            }
        },
        'type': function (v: string) {
            this.type=v;
            if (v == 'input') {
                this.onfocuse = null;
                this.onblur = null;
            }
        }
    };
    for (var p in prop) {
        var h = propHandle[p];
        if(h){
            h.call(div,prop[p]);
        }else{
            //没有特殊表明的直接赋值
            div.setAttribute(p,prop[p]);
        }
    }

    //特殊处理
    //if(input )  div.styleBlur = className;
    return div;
}

class HtmlNodeBranch {
    root:HTMLElement=null;
    constructor(desc: string) {

    }
    createFromDesc(desc: string, createFunc: (tag: string, prop: Object) => HTMLElement) {
        if(!createFunc) createFunc =  createTag;
        var lines = desc.split('\n');
        var nodeLayer = new Array<HTMLElement>();
        for (let i in lines) {
            var l = lines[i];
            if (l.length <= 0) continue;
            var ldesc: { layer: number, tag: string, prop: string } = this.getLayer(l);
            var lprops = eval('new Object({' + ldesc.prop + '})');
            //console.log(JSON.stringify(lprops));
            var ele = createFunc(ldesc.tag, lprops);
            nodeLayer[ldesc.layer] = ele;
            if (ldesc.layer > 0) {
                nodeLayer[ldesc.layer - 1].appendChild(ele);
            }
        }
        this.root=nodeLayer[0];
    }
    /**
     * 提供一个节点字符串，获得这个节点在第几层，返回去掉头的字符串
     * 例如 ||+-div,cls='test' 则返回[2,div,`cls='test'`]
     */
    getLayer(desc: string): { layer: number, tag: string, prop: string } {
        var layer = 0;
        var i = 0;
        for (; i < desc.length; i++) {
            if (desc[i] == '|') layer++;
            else break;
        }
        if (desc.substr(i, 2) != '+-') {
            throw 'errror! bad format :' + desc;
        }
        var left = desc.substr(i + 2);
        var typepos = left.indexOf(' ');
        var tag = left;
        if (typepos > 0) {
            tag = left.substr(0, typepos);
            return { layer: layer, tag: tag, prop: left.substr(typepos + 1) };
        } else {
            return { layer: layer, tag: tag, prop: '' };
        }
    }
}


var desc = `
+-div      cls:'viewPanel'
|+-div     val:'打包工具'   
|+-div     cls:'selectcontainer'
||+-span   val:'平台'
||+-select val:['Android']
||+-div
|||+-input type:'checkbox'
|||+-span  style:'',val:'单机版app'
|+-div     cls:'selectcontainer'
||+-span   val:'输出目录:'
||+-input  cls:'packagetext'  
||+-button cls:'cusBtn',val:'浏览...'
||+-a      val:' (生成apk的目录)'
|+-div     cls:'selectcontainer'
||+-button cls:'cusBtn',style:'top:10px,left:200px;',val:'打包',onclick:()=>{}
`;

var gg = new HtmlNodeBranch(desc);
//var l = gg.getLayer(`||+-button   cls:'cusBtn',val:'浏览...'`);
//console.log(JSON.stringify(l));
gg.createFromDesc(desc,createTag);

document.body.appendChild(gg.root);


function gaussian(x) {
    return 1.0/Math.sqrt(2*Math.PI)*Math.exp(-x*x/2);
}

for(var i=-10; i<10; i++){
    console.log(i+','+gaussian(i));
}
