///<reference path="../../defination/gl-matrix.d.ts" />

module util {
    export class ArcBall {
        private xs:number;  //用来把屏幕坐标缩放到[-1,1]的
        private ys:number;
        private lastPos:Float32Array = null;//上次的点的位置，是已经规格化的了
        private curPos = new Float32Array(3);
        private halfPos = new Float32Array(3);
        static e = 1e-6;
        //设置屏幕范围。可以不是方形的，对应的arcball也会变形。
        init(w:number,h:number){
            if(w<=ArcBall.e||h<=ArcBall.e) throw '设置大小不对，不能为0';
            this.xs = 2/w;  //要转成-1，到1所以是2
            this.ys = 2/h; //y要颠倒下么
        }
        setpos(x:number,y:number,z:number){            
        }
        //根据屏幕坐标返回一个arcball表面上的位置
        hitpos(x:number,y:number, out:Float32Array){
            var x1 = this.xs*x-1; 
            var y1 = this.ys*y-1;
            var l = x1*x1+y1*y1;
            var nl = Math.sqrt(l);
            if(l>1.0){//在球外面
                out[0]=x1/nl;
                out[1]=y1/nl;
                out[2]=0;
            }else{
                //在球面上了
                out[0]=x1;
                out[1]=y1;
                out[2]=Math.sqrt(1-nl);
            }
        }
        //这个使用的是half而不是实际的终点位置
        quatFromUnitV2V(out:Float32Array,vFrom:Float32Array, vTo:Float32Array){
            var cross = new Float32Array(3);    //TODO 这样会效率很低
            vec3.cross(cross,vFrom,vTo);
            out[0]=cross[0];out[1]=cross[1];out[2]=cross[2];
            out[3]=vec3.dot(vFrom,vTo);
        }
        quatFromV2V(out:Float32Array,vFrom:Float32Array, vTo:Float32Array){
            var vf=new Float32Array(3);  //TODO 这样会效率很低
            var vt=new Float32Array(3);
            vec3.normalize(vf,vFrom);
            vec3.normalize(vt,vTo);
            this.quatFromUnitV2V(out,vf,vt);
        }
        setTouchPos(x:number,y:number){
            if(this.lastPos==null){
                this.lastPos=new Float32Array(3);
            }   
            this.hitpos(x,y,this.lastPos);
        }
        //返回一个quat
        dragTo(x:number,y:number,out:Float32Array){
            this.hitpos(x,y,this.curPos);
            vec3.add(this.halfPos,this.lastPos,this.curPos);
            vec3.normalize(this.halfPos,this.halfPos);
            this.quatFromUnitV2V(out,this.lastPos,this.halfPos);
            var tmp = this.lastPos;
            this.lastPos=this.curPos;
            this.curPos=tmp;
        }
        /*
            返回的是一个quat
        */
        result():Float32Array{
            return quat.create();
        }
    }
}