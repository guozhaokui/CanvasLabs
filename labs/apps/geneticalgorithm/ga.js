"use strict";
class genotpe {
    constructor() {
        this.fitness = 0;
        this.rfitness = 0;
        this.cfitness = 0;
    }
}
exports.genotpe = genotpe;
var POPSIZE = 50;
var MAXGENS = 1000;
var PXOVER = 0.8;
var PMUTATION = 0.15;
var generation = 0;
var NVARS = 3;
var population = new Array(POPSIZE + 1);
var newpopulation = new Array(POPSIZE + 1);
function initialize(i) {
    population.forEach((v) => {
        v.fitness = 0;
        v.cfitness = 0;
        v.rfitness = 0;
        v.upper = new Array(i.length);
        v.lower = new Array(i.length);
        v.gene = new Array(i.length);
        v.upper.forEach((val, idx) => { v.upper[idx] = i[idx].upper_bound; });
        v.lower.forEach((val, idx) => { v.lower[idx] = i[idx].lower_bound; });
        v.gene.forEach((val, idx) => {
            v.gene[idx] = Math.random() * (i[idx].upper_bound - i[idx].lower_bound) + i[idx].lower_bound;
        });
    });
}
function randval(low, high) {
    return Math.random() * (high - low) + low;
}
function evaluate() {
    population.forEach((v) => {
        v.fitness = v.gene[0] * v.gene[0] - v.gene[0] * v.gene[1] + v.gene[3];
    });
}
function keep_the_best() {
    var besti = 0;
    var bestkeep = population[population.length - 1];
    for (var i = 0; i < population.length - 1; i++) {
        var cur = population[i];
        if (cur.fitness > bestkeep.fitness) {
            besti = i;
            bestkeep.fitness = cur.fitness;
        }
    }
    population[besti].gene.forEach((v, i) => {
        bestkeep.gene[i] = v;
    });
}
function elitist() {
    var i;
    var best = 0.0;
    var worst = 0.0;
    var best_mem = 0;
    var worst_mem = 0;
    var popsize = population.length - 1;
    best = population[0].fitness;
    worst = population[0].fitness;
    for (i = 0; i < popsize; i++) {
        if (population[i].fitness > population[i + 1].fitness) {
            if (population[i].fitness >= best) {
                best = population[i].fitness;
                best_mem = i;
            }
            if (population[i + 1].fitness <= worst) {
                worst = population[i + 1].fitness;
                worst_mem = i + 1;
            }
        }
        else {
            if (population[i].fitness <= worst) {
                worst = population[i].fitness;
                worst_mem = i;
            }
            if (population[i + 1].fitness >= best) {
                best = population[i + 1].fitness;
                best_mem = i + 1;
            }
        }
    }
    var nvars = population[0].gene.length;
    if (best >= population[popsize].fitness) {
        var last = population[popsize];
        var bestind = population[best_mem];
        var worstind = population[worst_mem];
        for (i = 0; i < nvars; i++) {
            last.gene[i] = bestind.gene[i];
        }
        last.fitness = bestind.fitness;
    }
    else {
        for (i = 0; i < nvars; i++) {
            worstind.gene[i] = last.gene[i];
        }
        worstind.fitness = last.fitness;
    }
}
function select() {
    var popsize = population.length - 1;
    var sum = 0;
    population.forEach((v) => {
        sum += v.fitness;
    });
    population.forEach((v) => {
        v.rfitness = v.fitness / sum;
    });
    population[0].cfitness = population[0].rfitness;
    for (var i = 1; i < popsize; i++) {
        population[i].cfitness = population[i - 1].cfitness + population[i].rfitness;
    }
    for (var i = 0; i < popsize; i++) {
        var p = Math.random();
        if (p < population[0].cfitness) {
            newpopulation[i] = population[0];
        }
        else {
            for (var j = 0; j < popsize; j++) {
                if (p >= population[j].cfitness && p < population[j + 1].cfitness) {
                    newpopulation[i] = population[j + 1];
                }
            }
        }
    }
    newpopulation.forEach((v, i) => {
        population[i] = v;
    });
}
function crossover() {
    var first = 0;
    var one, mem;
    for (mem = 0; mem < population.length - 1; mem++) {
        if (Math.random() < PXOVER) {
            ++first;
            if (first % 2 == 0) {
                Xover(one, mem);
            }
            else {
                one = mem;
            }
        }
    }
}
function Xover(one, two) {
    var point = 0;
    var varlen = population[0].gene.length;
    if (varlen > 1) {
        if (varlen == 2) {
            point = 1;
        }
        else {
            point = Math.floor(Math.random() * (varlen - 1) + 1);
        }
    }
    var g1 = population[one].gene;
    var g2 = population[two].gene;
    for (var i = 0; i < point; i++) {
        var t = g1[i];
        g1[i] = g2[i];
        g2[i] = t;
    }
}
function swap(x, y) {
}
function mutate() {
    var num = population.length - 1;
    for (var i = 0; i < num; i++) {
        var cur = population[i];
        cur.gene.forEach((v, idx) => {
            if (Math.random() < PMUTATION) {
                var up = cur.upper[idx];
                var low = cur.lower[idx];
                cur.gene[idx] = Math.random() * (up - low) + low;
            }
        });
    }
}
function report() {
    var best_val = 0;
    var avg = 0;
    var stddev = 0;
    var sum_square = 0;
    var square_sum = 0;
    var sum = 0;
    population.forEach((v) => {
        var f = v.fitness;
        sum += f;
        sum_square += f * f;
    });
    var popsize = population.length - 1;
    avg = sum / popsize;
    square_sum = avg * avg * popsize;
    stddev = Math.sqrt((sum_square - square_sum) / (popsize - 1));
    best_val = population[popsize].fitness;
    console.log(`gen:${generation},bestval:${best_val},avg:${avg},stddev:${stddev}`);
}
function main() {
    generation = 0;
    initialize([]);
    evaluate();
    keep_the_best();
    while (generation < MAXGENS) {
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
`);
    var best = population[population.length - 1];
    best.gene.forEach((v) => {
        console.log('v');
    });
    console.log('best fitness=' + best.fitness);
}
