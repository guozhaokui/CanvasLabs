///<reference path='e:/tsdefination/node/node.d.ts' />
import * as fs from 'fs';

function startApp(app:string):void{
    var appPath = this.__dirname+'/labs/apps/'+app;
    var appJson = appPath+'/app.json';
    if(!fs.exists(appJson))
        throw `app[${app}] 沒有配置文件`;
    var appConfig = JSON.parse(fs.readFileSync(appJson,'utf8'));
    console.log('dir='+ appPath)
}