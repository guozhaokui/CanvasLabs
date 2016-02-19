
module util {
    //延时
    export function delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    //下载图片
    export function loadImage(src: string):Promise<HTMLImageElement> {
        return new Promise((resolve,reject) => {
            var img = new Image();
            img.src = src;
            img.onload = () => { resolve(img); };
            img.onerror = () => {
                reject('file load err:'+src);
            }
        });
    }
    //下载文本文件
    export function loadText(src: string): Promise<string> {
        return new Promise((resolve, reject) => {
            var xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('GET', src);
            xhr.onload = () => { resolve(xhr.responseText);};
            xhr.onerror = (e) => { if (reject) reject('download xhr error:' + src + '. e=' + e); };
            xhr.send();
        });
    }
}