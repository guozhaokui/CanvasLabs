
//http://www.ituring.com.cn/article/121428

function fft(dataArray) {
    // 复数乘法
    this.mul = function(a, b) {
        if(typeof(a)!=='object') {
            a = {real: a, imag: 0}
        }
        if(typeof(b)!=='object') {
            b = {real: b, imag: 0}
        }
        return {
            real: a.real*b.real-a.imag*b.imag,
            imag: a.real*b.imag+a.imag*b.real
        };
    };

    // 复数加法
    this.add = function(a, b) {
        if(typeof(a)!=='object') {
            a = {real: a, imag: 0}
        }
        if(typeof(b)!=='object') {
            b = {real: b, imag: 0}
        }
        return {
            real: a.real+b.real,
            imag: a.imag+b.imag
        };
    };

    // 复数减法
    this.sub = function(a, b) {
        if(typeof(a)!=='object') {
            a = {real: a, imag: 0}
        }
        if(typeof(b)!=='object') {
            b = {real: b, imag: 0}
        }
        return {
            real: a.real-b.real,
            imag: a.imag-b.imag
        };
    };

    // 倒位序排列
    this.sort = function(data, r) {
        if(data.length <=2) {
            return data;
        }
        var index = [0,1];
        for(var i=0; i<r-1; i++) {
            var tempIndex = [];
            for(var j=0; j<index.length; j++) {
                tempIndex[j] = index[j]*2;
                tempIndex[j+index.length] = index[j]*2+1;
            }
            index = tempIndex;
        }
        var datatemp = [];
        for(var i=0; i<index.length; i++) {
            datatemp.push(data[index[i]]);
        }
        return datatemp;
    };

    var dataLen = dataArray.length;
    var r = 1; // 迭代次数
    var i = 1;
    while(i*2 < dataLen) {
        i *= 2;
        r++;
    }
    var count = 1<<r; // 相当于count=2^r

    // 如果数据dataArray的长度不是2^N，则开始补0
    for(i=dataLen; i<count; i++) {
        dataArray[i] = 0;
    }

    // 倒位序处理
    dataArray = this.sort(dataArray, r);

    // 计算加权系数w
    var w = [];
    for(i=0; i<count/2; i++) {
        var angle = -i*Math.PI*2/count;
        w.push({real: Math.cos(angle), imag: Math.sin(angle)});
    }

    for(i=0; i<r; i++) { // 级循环
        var group = 1<<(r-1-i);
        var distance = 1<<i;
        var unit = 1<<i;
        for(var j=0; j<group; j++) { // 组循环
            var step = 2*distance*j;
            for(var k=0; k<unit; k++) { // 计算单元循环
                var temp = this.mul(dataArray[step+k+distance], w[count*k/2/distance]);
                dataArray[step+k+distance] = this.sub(dataArray[step+k], temp);
                dataArray[step+k] = this.add(dataArray[step+k], temp);
            }
        }
    }
    return dataArray;
}


/**
 * 逆变换
 */
function ifft(dataArray) {
    for(var i=0, dataLen=dataArray.length; i<dataLen; i++) {
        if(typeof(dataArray[i])!='object'){
            dataArray[i] = {
                real: dataArray[i],
                imag: 0
            }
        }
        dataArray[i].imag *= -1;
    }
    dataArray = fft(dataArray);
    for(var i=0, dataLen=dataArray.length; i<dataLen; i++) {
        dataArray[i].real *= 1/dataLen;
        dataArray[i].imag *= -1/dataLen;
    }
    return dataArray;
}

/**
 * 二维FFT
 */
function fft2(dataArray, width:number, height:number) {
    var r = 1;
    var i = 1;
    while(i*2 < width) {
        i *= 2;
        r++;
    }
    var width2 = 1<<r;
    var r = 1;
    var i = 1;
    while(i*2 < height) {
        i *= 2;
        r++;
    }
    var height2 = 1<<r;

    var dataArrayTemp = [];
    for(var i=0; i<height2; i++) {
        for(var j=0; j<width2; j++) {
            if(i>=height || j>=width) {
                dataArrayTemp.push(0);
            }
            else {
                dataArrayTemp.push(dataArray[i*width+j]);
            }
        }
    }

    dataArray = dataArrayTemp;
    width = width2;
    height = height2;

    var dataTemp = [];
    var dataArray2 = [];
    for(var i=0; i<height; i++) {
        dataTemp = [];
        for(var j=0; j<width; j++) {
            dataTemp.push(dataArray[i*width+j]);
        }
        dataTemp = fft(dataTemp);
        for(var j=0; j<width; j++) {
            dataArray2.push(dataTemp[j]);
        }
    }
    dataArray = dataArray2;
    dataArray2 = [];
    for(var i=0; i<width; i++) {
        var dataTemp = [];
        for(var j=0; j<height; j++) {
            dataTemp.push(dataArray[j*width+i]);
        }
        dataTemp = fft(dataTemp);
        for(var j=0; j<height; j++) {
            dataArray2.push(dataTemp[j]);
        }
    }
    dataArray = [];
    for(var i=0; i<height; i++) {
        for(var j=0; j<width; j++) {
            dataArray[j*height+i] = dataArray2[i*width+j];
        }
    }
    return dataArray;
}