///<reference path='e:/tsdefination/node/node.d.ts' />
import * as fs from 'fs';

function loadTextFile(url){
    return fs.readFileSync(url,'utf8')
}
function startApp(app:string):void{
    var appPath = this.__dirname+'/labs/apps/'+app;
    var appJson = appPath+'/app.json';
    if(!fs.existsSync(appJson))
        throw `app[${app}] 沒有配置文件`;
    var appConfig = JSON.parse(loadTextFile(appJson));
    console.log('dir='+ appPath);
    var mainjs:string = appConfig.main;
    if(mainjs.substr(mainjs.length-3)!='.js')
        mainjs+='.js';
    mainjs = appPath+'/'+mainjs;
    var base = <HTMLBaseElement>document.getElementById("htmlbase");
    base.href=appPath+'/';
    require(mainjs);        
}
