'use strict';
class simpURI {
    constructor(uri) {
        this.scheme = '';
        this.host = '';
        this.path = '';
        this.file = '';
        this.query = '';
        var sp = uri.indexOf('://');
        var left = uri;
        if (sp > 0) {
            this.scheme = uri.substr(0, sp);
            left = uri.substr(sp + 3);
        }
        var hp = left.indexOf('/');
        if (hp > 0) {
            this.host = left.substr(0, hp);
            left = left.substr(hp);
        }
        var qp = left.indexOf('?');
        if (qp > 0) {
            this.query = left.substr(qp + 1);
            left = left.substr(0, qp);
        }
        var pathes = left.split('/');
        //normalize
        var npathes = [];
        for (var i = 0; i < pathes.length; i++) {
            if (pathes[i] === '..') {
                npathes.pop();
                continue;
            }
            if (pathes[i] === '.')
                continue;
            npathes.push(pathes[i]);
        }
        this.path = npathes.join('/');
    }
    toString() {
        var s = '';
        if (this.scheme.length)
            s += this.scheme + '://';
        s += this.host + this.path;
        if (this.query.length) {
            s += '?' + this.query;
        }
        return s;
    }
}
function loadSyncByXHR(url, encode) {
    function isAbs(url) {
        return (url.indexOf('http://') === 0);
    }
    var curfile = document.currentScript.src; // document['currentScript'].src;
    var lastS = curfile.lastIndexOf('/');
    var hasPath = lastS > 0;
    url = isAbs(url) ?
        url :
        (hasPath ? curfile.substr(0, lastS + 1) + url : url);
    var xhr = new XMLHttpRequest();
    try {
        xhr.open('get', url, false); 
        xhr.send(null);
        var txt = encode === 'utf8';
        xhr.onerror = (ev) => {
            return null;
        };
        xhr.onload = (ev) => {
        };
        if (xhr.status == 404) {
            return null;
        }
        return txt ? xhr.responseText : xhr.response;
    }
    catch (e) {
        alert('k');
        return null;
    }
}
function setupRequire() {
    function url2path(p) {
        if (!p)
            return null;
        var lastpos = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
        var ret = lastpos < 0 ? p : p.substr(0, lastpos);
        return ret.replace(/\\/g, '/');
    }
    var mcache = {};
    window.requireOrig = function (file) {
        function evalreq(fc, fid) {
            if (!fc || fc.length <= 0)
                return null;
            try {
                var func = eval('(function(exports,global,require,__dirname,__filename){' + fc + ';\nreturn exports;})\n//@ sourceURL=' + fid);
                mcache[fid] = func;
                return func;
            }
            catch (e) {
                console.log('require error:' + e);
                return null;
            }
        }
        var mod = { dir: this.dir, file: file };
        if (file.substr(file.length - 3) != '.js')
            file += '.js';
        var modfile = this.dir ? (this.dir + '/' + file) : file;
        modfile = new simpURI(modfile).toString();
        console.log('require(' + modfile + ')');
        var extfunc = mcache[modfile] ||
            evalreq(loadSyncByXHR(modfile, 'utf8'), modfile);
        if (extfunc) {
            mod.dir = url2path(modfile); 
            mod.file = modfile;
        }
        else {
            throw ('require failed：' + file);
        }
        try {
            var ret = extfunc({}, window, window.requireOrig.bind(mod), mod.dir, mod.file);
            return ret;
        }
        catch (e) {
            throw 'eval script error in require:\n ' + file + '\n' + e.stack;
        }
    };
    var basepath = url2path(window.location.href);
    window.require = window.requireOrig.bind({ dir: basepath, file: null });
}
if (!window.hasNodeJS)
    setupRequire();
function myrequire(mod) {
    var fc = loadSyncByXHR(mod, 'utf8');
}
function loadTextFile(url) {
    if (window.hasNodeJS) {
        return require('fs').readFileSync(url, 'utf8');
    }
    else {
        return loadSyncByXHR(url, 'utf8');
    }
}
function startApp(app) {
    var appPath = (window.hasNodeJS ? (window['__dirname'] + '/') : '') + 'labs/apps/' + app;
    var appJson = appPath + '/app.json';
    var appcnfg = loadTextFile(appJson);
    if (!appcnfg)
        throw `app[${app}] 沒有配置文件`;
    var appConfig = JSON.parse(appcnfg);
    console.log('dir=' + appPath);
    var mainjs = appConfig.main;
    if (mainjs.substr(mainjs.length - 3) != '.js')
        mainjs += '.js';
    mainjs = appPath + '/' + mainjs;
    var base = document.getElementById("htmlbase");
    base.href = appPath + '/';
    var exp = require(mainjs);
    if (exp && exp.main) {
        var el = document.getElementById('content');
        var canv = document.getElementById('myCanvas');
        exp.main(canv);
    }
}
