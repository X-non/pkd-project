import { SquareMatrix, CompleteGraph } from "./graph";
/*
dynamic exact solution

*/
function Held_Karp(graph, cyclic) {
    const out = [];
    const start = 0;
    const record = [];
    const record_slice = Math.pow(2, graph.size() - 1);
    const set = graph.all_nodes();
    function get_length(set, end) {
        let shortest = Infinity;
        if (set.length === 0) {
            shortest = graph.edges_from(start)[set.indexOf(end)].weight;
        }
        else {
            for (const x of set) {
                const length = graph.edges_from(x)[set.indexOf(end)].weight + get_value(set.filter(a => a !== x), x);
                if (length < shortest) {
                    shortest = length;
                }
            }
        }
        return shortest;
    }
    function get_value(set, end) {
        let recordID = 0;
        for (const x of set) {
            recordID = recordID + Math.pow(2, set.indexOf(x));
        }
        recordID = recordID + record_slice * set.indexOf(end);
        if (record[recordID] === undefined) {
            record[recordID] = get_length(set, end);
            return record[recordID];
        }
        else {
            return record[recordID];
        }
    }
    get_length(set.slice(1, set.length), set[0]);
    return out;
}
const items = ["hei", "woop", "woop", "banana"];
const matrix = SquareMatrix.from_2d_array([
    [0, 2, 3, 4],
    [1, 0, 3, 4],
    [1, 2, 0, 4],
    [1, 2, 3, 0],
]);
const graph = new CompleteGraph(matrix, items);
console.log(graph.all_nodes);
