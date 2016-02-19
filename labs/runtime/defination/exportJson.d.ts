
interface _anim_Object{
    content_scale:number;
    armature_data:Array<Armature_data>;     //结构
    animation_data:Array<Animation_data>;   //动画
    texture_data:Array<Texture_data>;       //image
    config_file_path:Array<string>;         //大图集相关
}

interface Armature_data{
    strVersion:string;
    version:number;
    name:string;
    bone_data:Array<BoneData>;
}

interface BoneData{
    name:string;        //bone name
    parent:string;
    effectbyskeleton:boolean;
    z:number;
    display_data:Array<Display_data>;
}

interface Display_data{
    name:string;            //image name, tlb0012.png
    skin_data:Array<Skin_Data>;
}

interface Skin_Data{
    x:number;       //offset x
    y:number;
}

interface Animation_data{
    /**
     * animation name;
     */
    name:string;       
    /**
     * 可以保存多套动作。不过实际一般只用一套。
     */
    mov_data:Array<Mov_data>;
}

interface Mov_data{
    /**
     * 某个动作的名字,zbbshoujia.
     */
    name:string;   
    /**
     * 总帧数
     */
    dr:number;      
    lp:boolean;
    to:number;
    drTW:number;
    twE:number;
    sc:number;
    /**
     * 所有骨骼的所有动画
     */
    mov_bone_data:Array<Mov_bone_data>; 
}

interface Mov_bone_data{
    /**
     * 对应那块bone
     */
    name:string;        
    /**
     * frame number?
     */
    dl:number;          
    /**
     * 每一帧的数据。
     */
    frame_data:Array<Frame_data>;
}

interface Frame_data{
    /**
     * 帧动画的第几帧
     */
    dI:number;
    /**
     * frame id 
     */
    fi:number;
    mat:Array<number>;  //4x4matrix
}

interface Texture_data{
    name:string;            //没有扩展名
    width:number;
    height:number;          
}