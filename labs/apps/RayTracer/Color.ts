
export class Color{
    r=0;
    g=0;
    b=0;
    constructor(r:number,g:number,b:number){
        this.r=r;this.g=g;this.b=b;
    }
    copy():Color { return new Color(this.r, this.g, this.b); };
    add (c:Color):Color { return new Color(this.r + c.r, this.g + c.g, this.b + c.b); };
    multiply (s:number):Color { return new Color(this.r * s, this.g * s, this.b * s); };
    modulate(c:Color):Color { return new Color(this.r * c.r, this.g * c.g, this.b * c.b); };
    saturate () { this.r = Math.min(this.r, 1); this.g = Math.min(this.g, 1); this.b = Math.min(this.b, 1); }
    
    static white=new Color(1,1,1);
    static black = new Color(0,0,0);
}