
export class genotpe{
    gene:number[];//问题中的变量
    fitness=0;  //
    upper:number[];  //变量的上限
    lower:number[];  //变量的下限
    rfitness:number=0;  //relative fitness
    cfitness:number=0;  //cumulative fitness  累积的
}

var POPSIZE=50; //个体数量
var MAXGENS = 1000; //代数
var PXOVER = 0.8    //crossover的概率
var PMUTATION = 0.15 //mutation的概率
var generation=0;//第几代
var NVARS = 3;  

var population = new Array<genotpe>(POPSIZE+1); //最后一个用来保留最佳个体
var newpopulation = new Array<genotpe>(POPSIZE+1);

interface info{ 
    lower_bound:number;
    upper_bound:number;
}

function initialize(i:info[]){
    //TODO
    population.forEach((v)=>{
        v.fitness=0;
        v.cfitness=0;
        v.rfitness=0;
        v.upper=new Array<number>(i.length);
        v.lower=new Array<number>(i.length);
        v.gene = new Array<number>(i.length);
        v.upper.forEach((val,idx)=>{v.upper[idx]=i[idx].upper_bound});
        v.lower.forEach((val,idx)=>{v.lower[idx]=i[idx].lower_bound});
        v.gene.forEach((val,idx)=>{
            v.gene[idx]=Math.random()*(i[idx].upper_bound-i[idx].lower_bound)+i[idx].lower_bound;
        })
    });
}

function randval(low:number, high:number){
    return Math.random()*(high-low)+low;
}

/**
 * 评估函数
 * 先写一个 x1^2-x1*x2+x3
 */
function evaluate(){
    population.forEach((v)=>{
        v.fitness=v.gene[0]*v.gene[0]-v.gene[0]*v.gene[1]+v.gene[3];
    });
}

/**
 * 把最好的复制到最后
 */
function keep_the_best(){
    var besti=0;
    var bestkeep = population[population.length-1];
    for(var i=0; i<population.length-1; i++){
        var cur = population[i];
        if(cur.fitness>bestkeep.fitness){
            besti = i;
            bestkeep.fitness = cur.fitness;
        }
    }
    //找到最好的了，复制到最后
    population[besti].gene.forEach((v,i)=>{
        bestkeep.gene[i]=v;
    });
}

/**
 * 精英化。最后一个是本代或者上代最好的。如果本代的最好的也不如上代最好的，则用上代最好的替换本代最差的。
 */
function elitist(){
    var i;
    var best=0.0;
    var worst=0.0;
    var best_mem=0;
    var worst_mem=0;
    var popsize=population.length-1;
    best=population[0].fitness;
    worst = population[0].fitness;
    for( i=0; i<popsize; i++){
        if(population[i].fitness>population[i+1].fitness){
            if(population[i].fitness>=best){
                best=population[i].fitness;
                best_mem=i;
            }
            if(population[i+1].fitness<=worst){
                worst=population[i+1].fitness;
                worst_mem = i+1;
            }
        }else{
            if(population[i].fitness<=worst){
                worst=population[i].fitness;
                worst_mem=i;
            }
            if(population[i+1].fitness>=best){
                best=population[i+1].fitness;
                best_mem=i+1;
            }
        }
    }

    var nvars = population[0].gene.length;
    //如果现在的比上一代最好的要好
    if(best>=population[popsize].fitness){
        var last = population[popsize];
        var bestind = population[best_mem];
        var worstind = population[worst_mem];
        for(i=0; i<nvars; i++){
            last.gene[i]=bestind.gene[i];
        }
        last.fitness = bestind.fitness;
    }else{//如果比上一代差
        for( i=0; i<nvars;i++){
            worstind.gene[i]=last.gene[i];
        }
        worstind.fitness=last.fitness;
    }

}

/**
 * 保留好的，淘汰坏的
 */
function select(){
    var popsize = population.length-1;
    var sum=0;//整体的fitness
    population.forEach((v)=>{
        sum += v.fitness;
    });
    //计算相对fitness
    population.forEach((v)=>{
        v.rfitness = v.fitness/sum;
    })

    population[0].cfitness = population[0].rfitness;
    for(var i=1; i<popsize; i++){
        population[i].cfitness = population[i-1].cfitness+population[i].rfitness; 
    }

    //根据cfitness来选择幸存者
    //TODO 这一段不懂
    for( var i=0; i<popsize; i++){
        var p = Math.random();
        if(p<population[0].cfitness){
            newpopulation[i] = population[0];
        }else{
            for(var j=0; j<popsize; j++){
                if(p>=population[j].cfitness && p<population[j+1].cfitness){
                    newpopulation[i] = population[j+1];
                }
            }
        }
    }
    newpopulation.forEach((v,i)=>{
        population[i]=v;
    })

}

/**
 * 根据概率，取相邻的两个进行杂交。
 * 实现单点杂交
 */
function crossover(){
    var first = 0;
    var one,mem;
    for(mem=0; mem<population.length-1; mem++){
        if(Math.random()<PXOVER){
            ++first;
            if(first%2==0){
                Xover(one,mem);
            }else{
                one=mem;
            }
        }
    }
}

/**
 * crossover。
 * 取一个点，交换这个点之前的基因
 */
function Xover(one:number, two:number){
    var point=0;
    var varlen = population[0].gene.length;
    if( varlen>1){
        if(varlen==2){
            point=1;
        }else{
            point= Math.floor( Math.random()*(varlen-1)+1);
        }
    }
    var g1 = population[one].gene;
    var g2 = population[two].gene;
    for( var i=0; i<point; i++){
        var t = g1[i];
        g1[i]=g2[i];
        g2[i]=t;
    }
}

function swap(x:number, y:number){
//不要这个函数
}

/**
 * mutation 
 * 针对某个变量的突变（不是bit位）
 * 把选中的变量随机替换为一个上下限之间的值。
 */
function mutate(){
    var num = population.length-1;
    for( var i=0; i<num; i++){
        var cur = population[i];
        cur.gene.forEach((v,idx)=>{
            if( Math.random()<PMUTATION){
                var up = cur.upper[idx];
                var low = cur.lower[idx];
                cur.gene[idx]=Math.random()*(up-low)+low;
            }
        });
    }
}

/**
 * 打印过程
 */
function report(){
    var best_val=0;
    var avg=0;
    var stddev=0;
    var sum_square=0;
    var square_sum=0;
    var sum=0;
    population.forEach((v)=>{
        var f = v.fitness;
        sum+=f;
        sum_square += f*f;
    });
    var popsize = population.length-1;
    avg = sum/popsize;
    square_sum = avg*avg*popsize;
    stddev = Math.sqrt((sum_square-square_sum)/(popsize-1));
    best_val = population[popsize].fitness;
    console.log(`gen:${generation},bestval:${best_val},avg:${avg},stddev:${stddev}`);

}

function main(){
    generation = 0;
    initialize([/* TODO */]);
    evaluate();
    keep_the_best();
    while(generation<MAXGENS){
        generation++;
        select();
        crossover();
        mutate();
        report();
        evaluate();
        elitist();
    }

    console.log(`
Simulation completed
Best member:
`)
    var best =population[population.length-1]; 
    best.gene.forEach((v)=>{
        console.log('v');
    })
    console.log('best fitness='+best.fitness);
}