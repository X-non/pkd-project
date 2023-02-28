import { CompleteGraph } from "../graph";
import { all_permutations_lazy, cyclic_path_length } from "./utils";

/**
 * Finds the shortest hamiltionian path through all nodes in
 * the provided graph
 * @param graph - the graph we want to find the shortest hamiltionian path  
 */
export function tsp_naive<T>(graph: CompleteGraph<T>): Array<number> {
    let shortest_path_length = Infinity;
    let shortest_path: Array<number> = [];
    const all_permutations = all_permutations_lazy(graph.all_nodes());

    for (const current_path of all_permutations) {
        const path_length = cyclic_path_length(graph, current_path);

        if (path_length < shortest_path_length) {
            shortest_path = current_path;
            shortest_path_length = path_length;
        }
    }

    return shortest_path;
}