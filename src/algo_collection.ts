import { boolean } from "yargs";
import { SquareMatrix, CompleteGraph, type Edge } from "./graph";


/**
 * will mutate original graph
 * @param graph graph to be modified
 * @returns a CompleteGraph with an added dummy point with all weights set to 0 and item duplicate of items[0] (not to be used)
 */
function add_dummy<T>(graph: CompleteGraph<T>): CompleteGraph<T>{
    const matrix: Array<Array<number>> = [];
    for(let i = 0; i < graph.size(); i++){
        matrix.push([]);
        for(let j = 0; j < graph.size(); j++){
            matrix[i].push(graph.weight_matrix.get(i,j));
        }
        matrix[i].push(0);
    }
    matrix.push([]);
    for(let i = 0; i < graph.size()+1; i++){
        matrix[matrix.length-1].push(0);
    }
    graph.items.push(graph.items[0]);
    graph.weight_matrix = SquareMatrix.from_2d_array(matrix);
    return graph;
}


/**
 * generates a CompleteGraph using random coordinates, symmetric and consistant in 2d (with a rounding error)
 * items are just 0
 * @param side_length : side length of matrix generated
 * @param x : span of x-coordinates nodes can land in
 * @param y : span of y-coordiantes nodes can land in
 * @returns SquareMatrix
 */
function random_coords<T>(side_length: number, x: number, y: number): CompleteGraph<number>{
    const coords: Array<Array<number>> = [];
    const matrix: Array<Array<number>> = [];
    for(let i = 0; i < side_length; i++){
            coords.push([Math.random()*x, Math.random()*y]);
    }
    for(let i = 0; i < side_length; i++){
        matrix.push([]);
        for(let j = 0; j < side_length; j++){
            const distance: number = Math.round(Math.sqrt(Math.pow(coords[i][0]-coords[j][0],2)));
            matrix[i].push(distance);
        }
    }
    const items: Array<number> = [];
    for(let i = 0; i < side_length; i++){
        items.push(0);
    }
     SquareMatrix.from_2d_array(matrix);
    const graph: CompleteGraph<number> = new CompleteGraph(SquareMatrix.from_2d_array(matrix), items);
    return graph;
}


/**
* Using memoization for exponential time complexity
* note: dummy should be false when finish is set
* @param graph CompleteGraph<T>, graph to be TSP analyzed
* @param dummy boolean, whether the path should return to origin or not, dummy node must be listed as last node
* @param finish option to lock the last node, will return acyclical traversal when called with
* @returns path
*/
export function Held_Karp<T>(graph: CompleteGraph<T>, dummy: boolean, finish?: number): Array<number> {
    let origin: number;
    if(finish == undefined){
        origin = 0
    }
    else{
        origin = finish;
    }
    
    let last_set: Array<number> = [];
    let last_node: number = 0;
    const record: Array<Array<number>> = [];
    const record_slice: number = Math.pow(2, graph.size());
    const full_set: Array<number> = graph.all_nodes();


    //used to calculate new values
    function get_length(set: Array<number>, end: number): Array<number> {
        let shortest: number = Infinity;
        let second_to_last: number = -1;
        if (set.length === 0) {
            shortest = graph.edges_from(origin)[end - 1].weight;
            second_to_last = 0;
        }
        if (finish !== undefined && set.length === 1){
            shortest = graph.weight_between(set[0], end);
            second_to_last = set[0];
        }
        else {
            for (const node of set) {
                const length = graph.weight_between(node, end) + get_value(set.filter(a => a !== node), node)[0];
                if (length < shortest) {
                    shortest = length;
                    second_to_last = node;
                }
            }
        }
        if (set.length + 1 === full_set.length) {
            last_set = set;
            last_node = end;
        }


        return [shortest, second_to_last];
    }

    // used to look up stored values
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
    // uses stored values to take the path backwards
    function construct_path(set: Array<number>, end: number): Array<number> {
        // returns reverse order tour
        function reverse(set: Array<number>, end: number): Array<number>{
            let path: Array<number> = [];
            const node: number = get_value(set, end)[1];
            path.push(node);
            if (set.length > 1) {
                return path.concat(reverse(set.filter(a => a !== node), node));
            }
            else {
                if(finish === undefined && dummy === false){
                    path = path.concat(origin);
                }
                return path;
            }
        }
        return reverse(set, end).reverse().concat(origin);
    }

    get_length(full_set.filter(a => a!== origin), origin);
    const path = construct_path(last_set, last_node);

    // remove dummy point from path
    if(dummy){
        const new_path: Array<number> = [];
        const origin = path.indexOf(graph.all_nodes()[graph.size()-1])+1;
        for(let i = 0; i < path.length-1; i++){
            new_path.push(path[(origin+i)%path.length]);
        }
        return new_path;
    }

    return path;

}

/**
 * 
 * @param graph graph the path is placed in
 * @param path path to be measured
 * @returns length of path
 */
function path_length<T>(graph: CompleteGraph<T>, path: Array<number>): number {
    let sum: number = 0;
    for(let i = 0; i < path.length-1; i++){
        console.log(sum);
        sum = sum+graph.weight_between(path[i],path[i+1]);
    }
    return sum;
}

function nearest_neighbor<T>(graph: CompleteGraph<T>, origin?: number): Array<number>{
    if(origin === undefined){
        origin = 0;
    }
    function step(edge_list: Array<number>, node: number): Array<number>{
        let shortest = -1;
        let compare = Infinity;
        for(const edge of edge_list){
            if(graph.weight_between(node, edge) < compare){
                compare = graph.weight_between(node, edge);
                shortest = edge;
            }
        }
        const new_list = edge_list.filter(a => a!== shortest);
        if(new_list.length <= 0){
            return [shortest];
        }
        else{
            return [shortest].concat(step(new_list, shortest));
        }
    }
    return step(graph.all_nodes(), origin);
}

const items = ["hei", "woop", "woop", "banana"];
const matrix = SquareMatrix.from_2d_array([
    [0, 2, 3, 1],
    [2, 0, 3, 4],
    [1, 3, 0, 4],
    [4, 4, 4, 0],
]);
const graph = new CompleteGraph(matrix, items);

const path_nearest = nearest_neighbor(graph,3);
console.log(path_nearest);
console.log(path_length(graph, path_nearest));


const path_exact = Held_Karp(add_dummy(graph), true);
console.log(path_exact);
console.log(path_length(graph, path_exact));


