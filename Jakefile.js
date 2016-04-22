function runexe(cmd) {
    console.log('>exec ' + cmd);
    var ex = jake.createExec([cmd]);
    ex.addListener("stdout", function (output) {
        process.stdout.write(output);
    });
    ex.addListener("stderr", function (error) {
        process.stderr.write(error);
    });
    ex.addListener("cmdEnd", function () {
        complete();
    });
    ex.addListener("error", function () {
        //console.log('error');
        //fail("Compilation unsuccessful");
    });
    ex.run();
}

/**
 * 编译一个目录，目录下面需要有tsconfig.json
 */
function compileDir(path, outdir) {
    var f_outdir = (outdir && outdir.length > 0) ? ('--outDir ' + outdir) : '';
    var cmd = 'tsc -p ' + path + ' ' + f_outdir;
    runexe(cmd);
}

function compileApps(name){
    if(name)
        compileDir('labs/apps/'+name);
}

task('runtimeMod',[],function(){
    compileDir('labs/runtime/runtimeMod');
});
/*
task('webglRenderor',[],function(){
    compileDir('labs/runtime/runtimeMod/webglRenderor');
});
task('common',[],function(){
    compileDir('labs/runtime/runtimeMod/common');
});
task('geometry',[],function(){
    compileDir('labs/runtime/runtimeMod/geometry');
})
*/
task('runtime',['runtimeMod'],function(){});

task('buildLoader',[],function(){
    compileDir('labs/apploader');
});
task('allapp',[],function(){
    compileDir('labs/apps');
});
/*
task('buildEJAnimTest',[],function(){
    compileApps('EJAnimTest');
});
task('webglTest',[],function(){
    compileApps('webglTest');
});
task('accTest',[],function(){
    compileApps('accTest');
});
task('accTest',[],function(){
    compileApps('accTest');
});
*/

task('buildAllApps',['runtime','allapp'],function(){
    // ['buildEJAnimTest',
    // 'webglTest'].forEach(function(v,i,arr){
    //     compileApps(v);
    // });
});
task("local", ['buildLoader','buildAllApps'], function () {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i - 0] = arguments[_i];
    }
});

function getSourceFileName(name) {
    var ret = name;
    if (name.indexOf('out/') === 0) {
        ret = ret.substr(4);
    }
    return ret.substr(0, ret.length - 3) + ".ts";
}

rule(/.js/, getSourceFileName, [], function () {
    console.log('rule source:' + this.source + ',name:' + this.name);
    fs.writeFileSync(this.name, '');
});

jake.on('complete', function () {
    console.log('complete.');
});
