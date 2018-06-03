class Road {
    constructor() {
        this.lanew = 3.7;
        this.lanenum = 4;
        this.len = 20000;
    }
    init(len, lanenum, trafficdesity) {
    }
}
function addcar(density) {
    return Math.random() <= (density / 500);
}
class Car {
    constructor() {
        this.l = 4.4;
        this.w = 1.7;
        this.h = 1.5;
    }
}
class SceneRender {
    constructor() {
    }
    render(ctx) {
    }
}
