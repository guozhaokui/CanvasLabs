
export class Vector3 {
    x = 0;
    y = 0;
    z = 0;
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    copy():Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    length() :number{
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    sqrLength():number {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    normalize() {
        var inv = 1 / this.length(); return new Vector3(this.x * inv, this.y * inv, this.z * inv);
    }

    negate():Vector3 {
        return new Vector3(-this.x, -this.y, -this.z);
    }

    add(v:Vector3):Vector3 {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v:Vector3):Vector3 {
        return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(f:number):Vector3 {
        return new Vector3(this.x * f, this.y * f, this.z * f);
    }

    divide(f:number):Vector3 {
        var invf = 1 / f; 
        return new Vector3(this.x * invf, this.y * invf, this.z * invf);
    }
    dot(v:Vector3):number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v:Vector3):Vector3 {
        return new Vector3(-this.z * v.y + this.y * v.z, this.z * v.x - this.x * v.z, -this.y * v.x + this.x * v.y);
    }

}

