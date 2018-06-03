'use strict';
function createTag(tag, prop) {
    var div = document.createElement(tag);
    const propHandle = {
        'cls': function (v) { this.setAttribute('class', v); },
        'id': function (v) { this.id = v; },
        'val': function (v) {
            if (tag == 'select') {
                for (let vi = 0; vi < v.length; vi++) {
                    div.appendChild(new Option(v[vi]));
                }
            }
            else {
                this.innerHTML = v;
            }
        },
        'type': function (v) {
            this.type = v;
            if (v == 'input') {
                this.onfocuse = null;
                this.onblur = null;
            }
        }
    };
    for (var p in prop) {
        var h = propHandle[p];
        if (h) {
            h.call(div, prop[p]);
        }
        else {
            div[p] = prop[p];
        }
    }
    return div;
}
class HtmlNodeBranch {
    constructor(desc) {
        this.root = null;
    }
    createFromDesc(desc, createFunc) {
        var lines = desc.split('\n');
        var nodeLayer = new Array();
        for (let i in lines) {
            var l = lines[i];
            if (l.length <= 0)
                continue;
            var ldesc = this.getLayer(l);
            var lprops = eval('new Object({' + ldesc.prop + '})');
            var ele = createFunc(ldesc.tag, lprops);
            nodeLayer[ldesc.layer] = ele;
            if (ldesc.layer > 0) {
                nodeLayer[ldesc.layer - 1].appendChild(ele);
            }
        }
        this.root = nodeLayer[0];
    }
    getLayer(desc) {
        var layer = 0;
        var i = 0;
        for (; i < desc.length; i++) {
            if (desc[i] == '|')
                layer++;
            else
                break;
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
        }
        else {
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
gg.createFromDesc(desc, createTag);
document.body.appendChild(gg.root);
