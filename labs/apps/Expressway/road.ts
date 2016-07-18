

class Road{
    lanew=3.7;
    lanenum=4;
    len=20000;
    constructor(){

    }

    /**
     * @param trafficdesity num/Km
     */
    init(len:number,lanenum:number,trafficdesity:number){

    }


}

//2m每次
function addcar(density:number){
    return Math.random()<=(density/500);
}

class Car{
    l=4.4;
    w=1.7;
    h=1.5;
    constructor(){

    }
}


class SceneRender{
    constructor(){

    }

    render(ctx:CanvasRenderingContext2D){

    }
}