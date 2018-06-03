'use strict';
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
function loadImage(src) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        img.src = src;
        img.onload = () => { resolve(img); };
        img.onerror = () => {
            reject('file load err:' + src);
        };
    });
}
exports.loadImage = loadImage;
function loadText(src) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', src);
        xhr.onload = () => { resolve(xhr.responseText); };
        xhr.onerror = (e) => { if (reject)
            reject('download xhr error:' + src + '. e=' + e); };
        xhr.send();
    });
}
exports.loadText = loadText;
