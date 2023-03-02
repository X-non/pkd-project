import { SquareMatrix, CompleteGraph, type Edge } from "./graph";
import { Nation_Held_Karp, path_length } from "./algo_collection";
import { Nation, NationName } from "./nation";


/**
 * Creates a path for each group by letting the groups pick the cheapest path in order
 * @param graph {CompleteGraph} graph to be traversed, all nations included in the graph will be considered
 * @param slots {number} number of visits per group
 * @param groups {number} number of groups participating
 * @param end {number} index of the end point nation in graph.items
 * @param include {Array<number>} containing the indices of nations that must be included, excluding the end point
 * @precondition groups must not exceed slots if include is a non-empty arary, groups may never
 * exceed nations contained in graph.items
 * @returns 
 */
function selfish_selection(graph: CompleteGraph<Nation>, slots: number, groups: number, end: number, include: Array<number>): Array<Array<number>> {
    const group_routes: Array<Array<number>> = [];
    const permutations: Array<number> = [];
    const available: Array<number> = graph.all_nodes().filter(a => !include.concat(end).includes(a));

    // bitmasking all possible sets into permutations
    const choices: number = slots - include.length;
    let current: number = Math.pow(2, choices) - 1;
    const last_bit: number = Math.pow(2, graph.size());
    const done: number = Math.pow(2, available.length) - 1;
    while (current < done) {
        const at_start = current;
        let bit = 2;
        let right = current % 2 === 1;
        let left = false;
        while (bit < last_bit) {
            left = false;
            if (current % (bit * 2) >= bit) {
                left = true;
            }
            if (!left && right) {
                permutations.push(current);
                current = current + bit / 2;
                break;
            }
            right = left;
            bit = bit * 2;
        }
    }

    for (let group = 0; group < groups; group++) {
        let shortest = Infinity;
        let shortest_path: Array<number> = [];

        // compare the permutations
        for (const perm of permutations) {
            let binary = perm;
            let current_node = 0;
            let set: Array<number> = [];
            set = set.concat(end).concat(include);
            while (binary > 0) {
                if (binary % 2 === 1) {
                    set.push(available[current_node]);
                }
                current_node++;
                binary = binary >> 1;
            }
            const sub_graph = graph.subgraph(node => set.includes(node));
            const new_path = Nation_Held_Karp(sub_graph, sub_graph.items.indexOf(graph.items[end]));
            let distance = path_length(sub_graph, new_path);

            for (let node = 0; node < new_path.length - 1; node++) {
                if (sub_graph.items[new_path[node]].slots[node]) {
                    distance = Infinity;
                }
            }

            if (distance < shortest) {
                shortest = distance;
                shortest_path = new_path.map(node => graph.items.indexOf(sub_graph.items[node]));
            }
        }
        group_routes.push(shortest_path);
        for (let node = 0; node < shortest_path.length - 1; node++) {
            graph.items[shortest_path[node]].slots[node] = true;
        }
    }
    return group_routes;
}

// Testing

const names: Array<NationName> = [NationName.Gotlands, NationName.Kalmar, NationName.Smålands, NationName.Västgöta, NationName.Uplands]
const items: Array<Nation> = [];
for (let i = 0; i < 5; i++) {
    const nation_slots: Array<boolean> = [];
    for (let time = 0; time < 2; time++) {
        nation_slots.push(false);
    }
    const nation: Nation = { name: names[i], slots: nation_slots }
    items.push(nation);
}
const matrix = SquareMatrix.from_2d_array([
    [0, 2, 3, 1, 5],
    [2, 0, 3, 4, 3],
    [1, 3, 0, 4, 3],
    [4, 4, 4, 0, 1],
    [1, 2, 3, 4, 0]
]);
const graph = new CompleteGraph(matrix, items);

const paths = selfish_selection(graph, 3, 3, 2, [4]);

console.log(paths);

for (const path of paths) {
    console.log(path_length(graph, path));
}




