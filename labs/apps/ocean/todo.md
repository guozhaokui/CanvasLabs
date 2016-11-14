
参考：
    http://wenku.baidu.com/link?url=PW4ae4SwoRIK4dtZ4DjDHh01e3KgLjOtKsJwBnSJI9U4ODVaEfGT9qHAMQ8t14fX6F7chQKwKQwdQdVxwV2Z4SLMz6Xe5YZh66HzTxeG7Um
        主要参考
    http://fileadmin.cs.lth.se/graphics/theses/projects/projgrid/projgrid-hq.pdf
    
    siggraph 2016
        http://advances.realtimerendering.com/s2016/


    js的fft
    http://www.ituring.com.cn/article/121428


合成方法  
![](docimg/普通合成.png)  
Θ是角度，例如朝向x为0。

Gerstner 模型  
![](docimg/gerstner.png)

扩展到二维  
![](docimg/gerstner2d.png)  
μ是用来调整波形的
xz为水平面，y向上
x0向量和t是自变量，x0向量对应水平面的任意点

范围  
空间范围是 Lx,Lz， 分成N，M格子

海浪的波长可达数百米，潮波的波长可以到数公里

周期：例如4到8秒


http://blog.csdn.net/jocyln9026/article/details/42103311

波速  
![](docimg/1.gif)    
这个表达式的极限情况 

![](docimg/ocwav3.gif)  

次摆线（trochoid）  
    海水粒子在原地做圆周运动，波峰的时候前进，波谷的时候后退。实际的会有一点的前进，但是相对于圆周运动来说范围较小。
    下一层的做小一点的反向圆周运动，再下一层，更小一点的正向圆周运动，大约1/9波长的时候，半径减半，2倍波长的时候只有前后晃动了。

    当波长不变，振幅增加的时候，次摆线的形状就会发生变化
    振幅和半径相同的时候，最尖，振幅再大就会出现交叠
    波高和波长之比为1:7的时候最尖，波高再大就不稳定了，会产生翻滚的海浪
    当靠近海岸的时候，底层的水速度降低，导致波长变短，波峰变高，形成浪花
    这时候还会有波浪的折射现象。

    方程：
    //α β θ
    x = aθ - bcos(θ)    
    y = a - bsin(θ) //这个改成 a+bsin(θ)的话，可以把波形颠倒过来
    b>a 长辐轮摆线
    b<a 短辐轮摆线 
    x会随着θ前进，y不会
    如果是每个粒子计算的话，不要前进，把aθ改成a


重力波
    海浪中的长波长部分。波长越大，波速越大
毛细波
     波长小于1.73cm的波，这时候表面张力的作用开始显现。这时候波速与波长成反比

     所以1.73cm的波长，波速最慢
![](docimg/10.gif)  
波长和波速的关系

行进波

驻波

速度
    波长/周期 = 频率*波长

高度场
![](docimg/高度场.png)        


正态分布
    标准差 δ : v= Σ(di-μ)^2 , δ = sqrt( v/n )
    平均值 μ
    几个获得方法
    1. 多几个随机数，例如3个，加起来，就会得到正态分布的数据
    2. Box–Muller 转换  https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
    3. ziggurat 算法

瑞利分布
    两个正态分布组成的向量的长度符合瑞利分布

参数
计算 H(k,t)

P-M谱


频率谱和方向谱
    频率谱只是能量在频率上的分布。
    方向谱是每个频率在各个方向上的能量分布
        能量随着频率和方向的分布
    实际海浪除了沿着主方向传播外，还向其他方向扩散，称为断峰不规则波。描述海浪沿着不同方向组成的波谱，称为方向谱。
    http://wenku.baidu.com/link?url=vBbgKwv82NiXko80UUFpIl2g8aODRwy7pKTY9broYVp5v7o9cXSy07lRO-2Ml1CbskLtZmobWn2bB1NueJmiM0g4E6sInqYxWH3ZeGpxpXy
    S(ω,θ) = S(ω)D(ω,θ)
    S(ω)是长峰不规则波的海浪谱,θ为组成波与主浪向的夹角
    D(ω,θ)也称为方向扩展函数，一般形式为  
    
![](docimg/zuchenglang.png)
    ISSC建议用以下两种n值：  
![](docimg/d_n.png)    
    比如取n为2


![](docimg/zhengtaifenbu.gif)  
如果μ=0，δ=1 就是标准化后的正态分布  
![](docimg/biaozhunhua.gif)

怎么根据波数谱得到振幅？
    简单的方法是直接对波数谱取平方根，为什么不知道可能是因为振幅的平方才是代表波的能量吧

欧拉公式
    e^ix = cosx+isinx
    左边通过泰勒展开后，实数部分正好是cos的泰勒展开，虚数部分正好是sin的泰勒展开

## 傅里叶变换
![](docimg/fourier.jpg)
相位谱的取值范围是 (-π, π]
为了能FFT，需要值为2^n
如果离散的话，可能会有栅栏效应
fft的结果也可以认为是周期的，所以可以把低频移到中心
k=0是直流分量 
k=1 的时候 n=0到N对应 0~2π 即一个周期
k=2的时候 n=0到N对应 0~4π

频域的取值范围
    假设空域范围为128，则最大频率范围应该是64
    把一个p,q大小的二维区域转换到m,n区域的话
一维和二维的
    二维积分。设二元函数f(a,b)，求积分
    如果先对b积分，
    g(a)=∫f(a,b)db
    ∫g(a)da
    如果先对a积分
    这两个虽然顺序不同，但是结果是相同的

二维的波形
    cos(k*(cosθ+sinθ)+ω*t+φ)
    当 θ = 0的时候，是沿着x方向，当 θ = π/2的时候，沿着y的方向。
    

我们用到的都是离散的，所以积分都是累加。
![](docimg/dfourier.jpg)  
    X(k)=Σ(n=0,N-1)x(n)Wn^nk; k=0,N-1
    Wn = e^(-j2π/N)  
    需要对每个k都根据这个式子计算    

在没有主浪的时候剩下的都是随机的

直接叠加
    为什么是不规则的
    因为累加的时候，波矢量方向不同
关于方向
    二维的话，假设x轴和y轴各有一个独立的运动，则必然合成一个斜着的运动，

参数控制
    什么参数影响振幅
    随机数的影响

平面
摄像机
深度
天空

船的反射


天空盒的反射
    当水平的时候，是镜面的
    不能直接根据法线，而是根据摄像机到交点的反射光线

把贴图转成半球形
    纬度 latitude 
    经度 longitude


黑色部分
    因为反射的亮度差距比较大，必须要有一面是暗的    

加上贴图的亮度


问题：
    幅度太小
    视角要能改
    现在高频成分速度太慢，感觉就像不动一样。很假。不知道是不是 有错
    