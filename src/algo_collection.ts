import { SquareMatrix, CompleteGraph, type Edge } from "./graph";



/*
dynamic exact solution

*/
function Held_Karp<T>(graph: CompleteGraph<T>, cyclic: boolean): Array<number> {
    let last_set: Array<number> = [];
    let last_node: number = 0;
    const start: number = 0;
    const record: Array<Array<number>> = [];
    const record_slice: number = Math.pow(2, graph.size());
    const full_set: Array<number> = graph.all_nodes();

    function get_length(set: Array<number>, end: number): Array<number> {
        let shortest: number = Infinity;
        let second_to_last: number = -1;
        if (set.length === 0) {
            shortest = graph.edges_from(start)[end - 1].weight;
            second_to_last = 0;
        }
        else {
            for (const x of set) {
                let length = 0;
                if (x > end) {
                    length = graph.edges_from(x)[end].weight + get_value(set.filter(a => a !== x), x)[0];
                }
                else {
                    length = graph.edges_from(x)[end - 1].weight + get_value(set.filter(a => a !== x), x)[0];
                }

                if (length < shortest) {
                    shortest = length;
                    second_to_last = x;
                }
            }
        }
        if (set.length + 1 === full_set.length) {
            last_set = set;
            last_node = end;
        }


        return [shortest, second_to_last];
    }

    function get_value(set: Array<number>, end: number): Array<number> {
        let recordID = 0;
        for (const x of set) {
            recordID = recordID + Math.pow(2, x);
        }
        recordID = recordID + record_slice * end;
        if (record[recordID] === undefined) {
            record[recordID] = get_length(set, end);
            return record[recordID];
        }
        else {
            return record[recordID];
        }
    }
    function construct_path(set: Array<number>, end: number): Array<number> {
        function reverse(set: Array<number>, end: number): Array<number>{
            let path: Array<number> = [];
            const node: number = get_value(set, end)[1];
            path.push(node);
            if (set.length > 1) {
                return path.concat(reverse(set.filter(a => a !== node), node));
            }
            else {
                return path.concat(start);
            }
        }
        return reverse(set, end).reverse();
    }

    get_length(full_set.slice(1), full_set[0]);
    return construct_path(last_set, last_node);

}

function path_length<T>(graph: CompleteGraph<T>, path: Array<number>): number {
    let sum: number = 0;
    for(let i = 0; i < graph.size(); i++){
        if(i < path.length-1){
            sum = sum+graph.weight_between(path[i],path[i+1]);
        }
        else{
            sum = sum+graph.weight_between(path[i],path[0]);
        }
    }
    return sum;
}

const items = ["hei", "woop", "woop", "banana"];
const matrix = SquareMatrix.from_2d_array([
    [0, 2, 3, 4],
    [2, 0, 3, 4],
    [1, 3, 0, 4],
    [4, 4, 4, 0],
]);
const graph = new CompleteGraph(matrix, items);

const the_path = Held_Karp(graph, false);
console.log(the_path);

console.log(path_length(graph, the_path));