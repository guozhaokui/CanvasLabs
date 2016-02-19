function log(m){console.log(m);};

module util{
    export class test{
        desc:string;
        constructor(desc:string){
            this.desc=desc;
        }
        
		verifyEq(a:any,b:any,desc:string){
			if( a instanceof Array && b instanceof Array){
				if(a.length!=b.length)
					throw desc+' 数据长度不对！应该：'+b.length+' 实际：'+a.length;
				for(var i=0; i<a.length; i++){
					if(a[i]!=b[i])
						throw desc+' 第'+i+'个不一致';
				}
			}
			else{
				if( a==b ){}else{	//用==判断是为了防止NaN
					throw desc+' 应该：'+b+' 实际：'+a;
				}
			}
		}
		eq=this.verifyEq;
		
		verifyNEq(a,b,desc){
			if( a==b ){
				throw desc+' 不应该：'+b+' 实际：'+a;
			}
		}
		neq=this.verifyNEq;

		verifyEqRange(a,b,err,desc:string){
			if(typeof(a)=='number'){
				if( Math.abs(a-b)<err ){}else{//用==判断是为了防止NaN
					throw desc+' 应该：'+b+' 实际：'+a;
				}
			}else{
				if(a.length!=b.length)
					throw desc+' 数据长度不对！应该：'+b.length+' 实际：'+a.length;
				for(var i=0; i<a.length; i++){
					if(Math.abs(a[i]-b[i])>err)
						throw desc+' 第'+i+'个不一致';
				}
			}
		}
		eqr=this.verifyEqRange;
		
		verifyThrow(func,desc:string){
		}

		testall(all:Object,flag):void{
			var errnum=0;
			var oknum=0;
			var sum=0;
			for (var f in all ){
				sum++;
				var bIgnore=false;
				if(flag ){
					bIgnore=true;
					if(all[f][flag] )
						bIgnore=false;
				}
					
				try{ if(!bIgnore)all[f](this); oknum++;}catch(e){
					errnum++;
					if(!e.name)	//自定义的
						log("	用例"+f+"错误,"+e);
					else{
						log(e);
						log(e.stack);
					}
				}
			}
			log("测试结果："+this.desc);
			log("	正确: "+oknum);
			log("	错误: "+errnum);
		}
    }
}

