"use strict";
var sqrt = Math.sqrt;
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var SQRT1_2 = Math.SQRT1_2;
class ComplexArray {
    constructor(n) {
        this.length = 0;
        this.real = new Float32Array(n);
        this.imag = new Float32Array(n);
        this.length = n;
    }
    map(mapper) {
        var i, n = this.length, c_value = { real: 0, imag: 0 };
        for (i = 0; i < n; i++) {
            c_value.real = this.real[i];
            c_value.imag = this.imag[i];
            mapper(c_value, i, n);
            this.real[i] = c_value.real;
            this.imag[i] = c_value.imag;
        }
        return this;
    }
}
exports.ComplexArray = ComplexArray;
function FFT(input, inverse) {
    var n = input.length;
    if (n & (n - 1)) {
        return FFT_Recursive(input, inverse);
    }
    else {
        return FFT_2_Iterative(input, inverse);
    }
}
exports.FFT = FFT;
function FFT_Recursive(input, inverse) {
    var n = input.length, i, j, output, f_r, f_i, del_f_r, del_f_i, p, m, normalisation, recursive_result, _swap, _real, _imag;
    if (n === 1) {
        return input;
    }
    output = new ComplexArray(n);
    p = LowestOddFactor(n);
    m = n / p;
    normalisation = 1 / sqrt(p);
    recursive_result = new ComplexArray(m);
    for (j = 0; j < p; j++) {
        for (i = 0; i < m; i++) {
            recursive_result.real[i] = input.real[i * p + j];
            recursive_result.imag[i] = input.imag[i * p + j];
        }
        if (m > 1) {
            recursive_result = FFT(recursive_result, inverse);
        }
        del_f_r = cos(2 * PI * j / n);
        del_f_i = (inverse ? -1 : 1) * sin(2 * PI * j / n);
        f_r = 1;
        f_i = 0;
        for (i = 0; i < n; i++) {
            _real = recursive_result.real[i % m];
            _imag = recursive_result.imag[i % m];
            output.real[i] += f_r * _real - f_i * _imag;
            output.imag[i] += f_r * _imag + f_i * _real;
            _swap = f_r * del_f_r - f_i * del_f_i;
            f_i = f_r * del_f_i + f_i * del_f_r;
            f_r = _swap;
        }
    }
    for (i = 0; i < n; i++) {
        input.real[i] = normalisation * output.real[i];
        input.imag[i] = normalisation * output.imag[i];
    }
    return input;
}
function FFT_2_Iterative(input, inverse) {
    var n = input.length, i, j, output, output_r, output_i, f_r, f_i, del_f_r, del_f_i, temp, l_index, r_index, left_r, left_i, right_r, right_i, width;
    output = BitReverseComplexArray(input);
    output_r = output.real;
    output_i = output.imag;
    width = 1;
    while (width < n) {
        del_f_r = cos(PI / width);
        del_f_i = (inverse ? -1 : 1) * sin(PI / width);
        for (i = 0; i < n / (2 * width); i++) {
            f_r = 1;
            f_i = 0;
            for (j = 0; j < width; j++) {
                l_index = 2 * i * width + j;
                r_index = l_index + width;
                left_r = output_r[l_index];
                left_i = output_i[l_index];
                right_r = f_r * output_r[r_index] - f_i * output_i[r_index];
                right_i = f_i * output_r[r_index] + f_r * output_i[r_index];
                output_r[l_index] = SQRT1_2 * (left_r + right_r);
                output_i[l_index] = SQRT1_2 * (left_i + right_i);
                output_r[r_index] = SQRT1_2 * (left_r - right_r);
                output_i[r_index] = SQRT1_2 * (left_i - right_i);
                temp = f_r * del_f_r - f_i * del_f_i;
                f_i = f_r * del_f_i + f_i * del_f_r;
                f_r = temp;
            }
        }
        width <<= 1;
    }
    return output;
}
function BitReverseIndex(index, n) {
    var bitreversed_index = 0;
    while (n > 1) {
        bitreversed_index <<= 1;
        bitreversed_index += index & 1;
        index >>= 1;
        n >>= 1;
    }
    return bitreversed_index;
}
function BitReverseComplexArray(array) {
    var n = array.length, flips = {}, swap, i;
    for (i = 0; i < n; i++) {
        var r_i = BitReverseIndex(i, n);
        if (flips.hasOwnProperty(i) || flips.hasOwnProperty(r_i))
            continue;
        swap = array.real[r_i];
        array.real[r_i] = array.real[i];
        array.real[i] = swap;
        swap = array.imag[r_i];
        array.imag[r_i] = array.imag[i];
        array.imag[i] = swap;
        flips[i] = flips[r_i] = true;
    }
    return array;
}
function LowestOddFactor(n) {
    var factor = 3, sqrt_n = sqrt(n);
    while (factor <= sqrt_n) {
        if (n % factor === 0)
            return factor;
        factor = factor + 2;
    }
    return n;
}
function FFT2D(input, nx, ny, inverse) {
    function _FFT(input) {
        return FFT(input, false);
    }
    function _InvFFT(input) {
        return FFT(input, true);
    }
    var i, j, transform = inverse ? _InvFFT : _FFT, output = new ComplexArray(input.length), row = new ComplexArray(nx), col = new ComplexArray(ny);
    for (j = 0; j < ny; j++) {
        row.map(function (v, i) {
            v.real = input.real[i + j * nx];
            v.imag = input.imag[i + j * nx];
        });
        var tmp = transform(row);
        tmp.real.forEach(function (v, i) {
            output.real[i + j * nx] = v;
        });
        tmp.imag.forEach(function (v, i) {
            output.imag[i + j * nx] = v;
        });
    }
    for (i = 0; i < nx; i++) {
        col.map(function (v, j) {
            v.real = output.real[i + j * nx];
            v.imag = output.imag[i + j * nx];
        });
        var tmp = transform(col);
        tmp.real.forEach(function (v, j) {
            output.real[i + j * nx] = v;
        });
        tmp.imag.forEach(function (v, j) {
            output.imag[i + j * nx] = v;
        });
    }
    return output;
}
exports.FFT2D = FFT2D;
