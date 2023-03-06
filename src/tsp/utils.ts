import { CompleteGraph } from "../graph";
import { tsp_naive } from "./bruteforce";
import { tsp_held_karp } from "./held_karp";

export enum Algoritm {
    Naive = "naive",
    NaiveMemo = "naive-memo",
    Cyclic = "cyclic",
    Selfish = "selfish",
}

export function find_short_path<T>(graph: CompleteGraph<T>, algoritm: Algoritm): Array<number> {
    switch (algoritm) {
        case Algoritm.Naive: return tsp_naive(graph);
        case Algoritm.NaiveMemo: return tsp_held_karp(graph, false);
        default: throw new Error(`All cases of Algorithm should be handled fount '${algoritm}'`);
    }
}

export function* all_permutations_lazy<T>(permutation: T[]): Generator<T[]> {
    var length = permutation.length,
        c = Array(length).fill(0),
        i = 1, k, p;

    yield permutation.slice();
    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = permutation[i];
            permutation[i] = permutation[k];
            permutation[k] = p;
            ++c[i];
            i = 1;
            yield permutation.slice();
        } else {
            c[i] = 0;
            ++i;
        }
    }
}

export function cyclic_path_length<T>(graph: CompleteGraph<T>, path: Array<number>): number {
    let sum: number = 0;
    for (let i = 0; i < graph.size(); i++) {
        if (i < path.length - 1) {
            sum = sum + graph.weight_between(path[i], path[i + 1]);
        }
        else {
            sum = sum + graph.weight_between(path[i], path[0]);
        }
    }
    return sum;
}