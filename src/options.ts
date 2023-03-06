import { SquareMatrix, CompleteGraph, type Edge } from "./graph";
import { nation_held_karp, path_length, tsp_held_karp, random_coords } from "./tsp/held_karp";
import { all_nations, Nation, NationName } from "./nation";
import { group } from "yargs";


/**
 * Creates a path for each group by letting the groups pick the cheapest path in order
 * @param {CompleteGraph} graph graph to be traversed, all nations included in the graph will be considered
 * @param {number} slots number of visits per group, excluding finish
 * @param {number} groups number of groups participating
 * @param {number} end  index of the end point nation in graph.items
 * @param {Array<number>} include containing the indices of nations that must be included, excluding the end point
 * @precondition groups must not exceed slots if include is a non-empty arary, groups may never
 * exceed nations contained in graph.items
 * @returns {Array<Array<number>>} Returns one path for each group
 */
export function selfish_selection(graph: CompleteGraph<Nation>, slots: number, groups: number, end: number, include: Array<number>): Array<Array<number>> {
    graph.items.forEach(a => a.slots = Array(slots).fill(false));
    const group_routes: Array<Array<number>> = [];
    const permutations: Array<number> = [];
    const available: Array<number> = graph.all_nodes().filter(a => !include.concat(end).includes(a));

    // store all permutations as bitmasks in permutations
    const choices: number = slots - include.length;
    let current: number = Math.pow(2, choices) - 1;
    const last_bit: number = Math.pow(2, graph.size());
    const done: number = Math.pow(2, available.length) - 1;
    while (current < done) {
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

        // find shortest legal permutaion
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
            const new_path = nation_held_karp(sub_graph, sub_graph.items.indexOf(graph.items[end]));
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

/**
 * Creates a path for each group by letting the groups pick the cheapest path in order
 * @param {CompleteGraph} graph graph to be traversed, all nations included in the graph will be considered
 * @param {number} slots number of visits per group, excluding finish
 * @param {number} groups number of groups participating
 * @param {number} end  index of the end point nation in graph.items
 * @param {Array<number>} include containing the indices of nations that must be included, excluding the end point
 * @precondition groups must not exceed slots if include is a non-empty arary, groups may never
 * exceed nations contained in graph.items
 * @returns {Array<Array<number>>} Returns one path for each group, all on the same cycle
 */
export function cycle_selection(graph: CompleteGraph<Nation>, slots: number, groups: number, end: number, include: Array<number>): Array<Array<number>> {
    const group_routes: Array<Array<number>> = [];
    const permutations: Array<number> = [];
    const available: Array<number> = graph.all_nodes().filter(a => !include.concat(end).includes(a));

    // store all permutations as bitmasks in permutations
    const choices: number = Math.max(slots, groups) - include.length;
    let current: number = Math.pow(2, choices) - 1;
    const last_bit: number = Math.pow(2, graph.size());
    const done: number = Math.pow(2, available.length) - 1;
    if (current === 0 || current === Math.pow(2, graph.size() - 1) - 1) {
        permutations.push(current);
    }
    while (current < done && current !== 0) {
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
    let shortest = Infinity;
    let shortest_cycle: Array<number> = [];
    let end_nodes: Array<number> = [];
    for (const perm of permutations) {
        let binary = perm;
        let current_node = 0;
        let set: Array<number> = [];
        set = set.concat(include);
        while (binary > 0) {
            if (binary % 2 === 1) {
                set.push(available[current_node]);
            }
            current_node++;
            binary = binary >> 1;
        }
        const sub_graph = graph.subgraph(node => set.includes(node));
        const new_path = tsp_held_karp(sub_graph, false);
        const real_path = new_path.map(node => graph.items.indexOf(sub_graph.items[node]));
        let distance = path_length(graph, real_path);
        real_path.pop();
        const end_weights: Array<Array<number>> = [];
        for (const node of real_path) {
            end_weights.push([graph.weight_between(node, end), node])
        }

        end_weights.sort((a, b) => a[0] - b[0]);
        for (let weight = 0; weight < groups; weight++) {
            distance += end_weights[weight][0] / groups;
        }

        if (distance < shortest) {
            shortest = distance;
            shortest_cycle = real_path;
            for (let node = 0; node < end_weights.length; node++) {
                end_nodes[node] = end_weights[node][1];
            }
        }
    }
    for (let path = 0; path < groups; path++) {
        const new_path: Array<number> = [];
        const start = (shortest_cycle.indexOf(end_nodes[path]) - slots + shortest_cycle.length) % shortest_cycle.length + 1;
        for (let node = 0; node < slots; node++) {
            new_path.push(shortest_cycle[(start + node) % shortest_cycle.length]);
        }
        new_path.push(end);
        group_routes.push(new_path);
    }
    return group_routes;
}

// Testing

/*
const names: Array<NationName> = [NationName.Gotlands, NationName.Kalmar, NationName.Smålands, NationName.Västgöta, NationName.Uplands]
const items: Array<Nation> = [];
const all_graph = all_nations();
const groups = 6;
const slots = 4;
const include: Array<number> = []
for (let i = 0; i < 13; i++) {
    const nation_slots: Array<boolean> = [];
    for (let time = 0; time < slots; time++) {
        nation_slots.push(false);
    }
    all_graph.items[i].slots = nation_slots;
}

const matrix = SquareMatrix.from_2d_array([
    [0, 2, 3, 1, 5],
    [2, 0, 3, 4, 3],
    [1, 3, 0, 4, 3],
    [4, 4, 4, 0, 1],
    [1, 2, 3, 4, 0]
]);

const random = random_coords(13, 100, 100);
const graph = new CompleteGraph(random.weight_matrix, all_graph.items);

const selfish = selfish_selection(graph, slots, groups, 12, include);

const paths = cycle_selection(graph, slots, groups, 12, include);

console.log(paths, "cycle");

let sum_cycle = 0;
for (const path of paths) {
    const distance = path_length(graph, path);
    console.log(distance);
    console.log(graph.weight_between(path[path.length - 2], 12), "distance to end");
    sum_cycle += distance;
}
console.log(sum_cycle, "total")

console.log(selfish, "selfish");

let sum_selfish = 0;
for (const path of selfish) {
    const distance = path_length(graph, path);
    console.log(distance);
    sum_selfish += distance;
}
console.log(sum_selfish, "total");
*/



