"use strict";
class Color {
    constructor(r, g, b) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.r = r;
        this.g = g;
        this.b = b;
    }
    copy() { return new Color(this.r, this.g, this.b); }
    ;
    add(c) { return new Color(this.r + c.r, this.g + c.g, this.b + c.b); }
    ;
    multiply(s) { return new Color(this.r * s, this.g * s, this.b * s); }
    ;
    modulate(c) { return new Color(this.r * c.r, this.g * c.g, this.b * c.b); }
    ;
    saturate() { this.r = Math.min(this.r, 1); this.g = Math.min(this.g, 1); this.b = Math.min(this.b, 1); }
}
Color.white = new Color(1, 1, 1);
Color.black = new Color(0, 0, 0);
Color.red = new Color(1, 0, 0);
Color.blue = new Color(0, 0, 1);
exports.Color = Color;
