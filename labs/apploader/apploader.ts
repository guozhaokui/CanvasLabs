///<reference path='../runtime/defination/node.d.ts' />
interface Window {
    hasNodeJS: boolean;
    require:(mod:string)=>Object;
    requireOrig:(mod:string)=>void;
}
/*
interface Document {
    currentScript: HTMLScriptElement;//不知道为什么定义中没有。
}
*/

/**
 * 同步加载文本文件
 */
function loadSyncByXHR(url: string, encode: string): string | ArrayBuffer {
    function isAbs(url: string): boolean {
        return (url.indexOf('http://') === 0);
    }
    var curfile = document['currentScript'].src;
    var lastS = curfile.lastIndexOf('/');
    var hasPath = lastS > 0;

    url = isAbs(url) ?
        url :
        (hasPath ? curfile.substr(0, lastS + 1) + url : url);
    var xhr = new XMLHttpRequest();
    //xhr.responseType=txt?'text':'arraybuffer'; 同步不能设置这个
    try {
        xhr.open('get', url, false);  //先同步
        xhr.send(null);
        var txt = encode === 'utf8';
        xhr.onerror = (ev) => {
            return null;
        }
        xhr.onload = (ev) => {

        }
        if(xhr.status==404){
            return null;
        }
        return txt ? xhr.responseText : xhr.response;
    } catch (e) {
        alert('k');
        return null;
    }
}

/**
 * 建立require函数
 */
function setupRequire(){
    function url2path(p) {
        if (!p) return null;
        var lastpos = Math.max(p.lastIndexOf('/'),
            p.lastIndexOf('\\'));
        var ret = lastpos < 0 ? p : p.substr(0, lastpos);
        return ret.replace(/\\/g, '/');
    }
    var mcache = {};
    /*起始路径总是这里，如果需要改变的话，就在这里通过require跳转。*/
    window.requireOrig = function (file:string) {
        function evalreq(fc:string, fid:string) {/*return function*/
            if (!fc || fc.length <= 0) return null;
            /*注意：并不是window.eval所以脚本中不能假设当前是在window上下文*/
            try {
                //注意 fc后面要加\n来关掉行注释
                var func = eval('(function(exports,global,require,__dirname,__filename){' + fc + ';\nreturn exports;})\n//@ sourceURL=' + fid);
                mcache[fid] = func;
                return func;
            }
            catch (e) {
                console.log('require error:' + e);
                return null;
            }
        }
        //调到这里的时候，this是一个临时构建的对象，包含 dir,file
        var mod = { dir: this.dir, file: file };
        if (file.substr(file.length - 3) != '.js')
            file += '.js';
        //简化：只处理相对路径        
        var modfile = this.dir ? (this.dir + '/' + file):file;         
        var extfunc = null;
        console.log('require(' + modfile + ')');
        var reqresult = mcache[modfile] ||
            (extfunc = evalreq(<string>loadSyncByXHR(modfile, 'utf8'), modfile));
        if (extfunc) {
            mod.dir = url2path(modfile);/*使用window的或者当前模块的*/
            mod.file = modfile;
        }
        if (!reqresult) {
            throw ('require failed：' + file);
            return null;
        }
        try {
            var ret = reqresult({}, window, window.requireOrig.bind(mod), mod.dir, mod.file);
            return ret;
        }
        catch (e) {
            throw 'eval script error in require:\n ' + file + '\n' + e.stack;
        }
        return null;
    }
    var basepath = url2path(window.location.href);
    window.require = window.requireOrig.bind({ dir: basepath, file: null })    
}
setupRequire();

function myrequire(mod:string){
    var fc = loadSyncByXHR(mod,'utf8');
}

function loadTextFile(url:string) {
    if(window.hasNodeJS){
        return require('fs').readFileSync(url,'utf8');
    }else{
        return loadSyncByXHR(url,'utf8');
    }
}

function startApp(app: string): void {
    var appPath = (window.hasNodeJS?this.__dirname:'') + '/labs/apps/' + app;
    var appJson = appPath + '/app.json';
    var appcnfg = loadTextFile(appJson);
    
    if (!appcnfg)
        throw `app[${app}] 沒有配置文件`;
    var appConfig = JSON.parse(appcnfg);
    console.log('dir=' + appPath);
    var mainjs: string = appConfig.main;
    if (mainjs.substr(mainjs.length - 3) != '.js')
        mainjs += '.js';
    mainjs = appPath + '/' + mainjs;
    var base = <HTMLBaseElement>document.getElementById("htmlbase");
    base.href = appPath + '/';
    require(mainjs);
}
