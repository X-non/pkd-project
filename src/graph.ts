/**
 * A square matrix of some type
 */
export class SquareMatrix<T> {
    static empty<T>(): SquareMatrix<T> {
        return new SquareMatrix([], 0);
    }
    private data: T[];
    readonly side_length: number;
    /**
     * Creates a square matrix form a 2d array
     * @throws if the 2d array isn't actually square
     * @param array {T[][]} A 2d array reprecenting a square matrix
     * @returns 
     */
    static from_2d_array<T>(array: T[][]): SquareMatrix<T> {
        const side_length = array.length;
        const data: T[] = [];

        if (side_length === 0) {
            return SquareMatrix.empty();
        }

        for (const row of array) {
            if (row.length !== side_length) {
                throw new Error("The rows of the array must be the same length as each other and amount of rows");
            }
        }


        for (let row_i = 0; row_i < side_length; row_i++) {
            for (let col_i = 0; col_i < side_length; col_i++) {
                data[SquareMatrix.data_index(side_length, row_i, col_i)] = array[row_i][col_i];
            }
        }

        return new SquareMatrix(data, side_length)
    }
    /**
     * Raw initalisation of the baking buffer and side_length.
     * Not really intended to be used if something better can be used
     * e.g {@link SquareMatrix.from_2d_array()}.
     * @throws if the data cant fill a square of side_length * side_length
     * @param data {T[]} the backing data  
     * @param side_length {number} the side length of the matrix  
     */
    constructor(data: T[], side_length: number) {
        if (side_length * side_length !== data.length) {
            throw new Error(`The data fill a square in this case data.length === ${side_length * side_length} found data.length === ${data.length}`)
        }
        this.data = data;
        this.side_length = side_length;
    }

    private static data_index(side_length: number, row: number, column: number): number {
        return row + column * side_length
    }

    set(row: number, column: number, value: T) {
        this.data[SquareMatrix.data_index(this.side_length, row, column)] = value;
    }

    get(row: number, column: number): T {
        return this.data[SquareMatrix.data_index(this.side_length, row, column)];
    }

}
type Node = number;
export type Edge = { node1: Node, node2: Node, weight: number };
/**
 * A complete graph containing some items.
 */
export class CompleteGraph<T> {
    weight_matrix: SquareMatrix<Node>;
    items: T[]
    /**
     * Makes a new CompleteGraph from the matrix and its items  
     * @precondition the sidelength and length of items must match
     * @throws if preconditions are violated
     * @param weight_matrix matrix containing the weights
     * @param items items of the graph 
     */
    constructor(weight_matrix: SquareMatrix<Node>, items: T[]) {

        if (weight_matrix.side_length !== items.length) {
            throw new Error("The number of nodes and provided items don't match");
        }
        this.weight_matrix = weight_matrix;
        this.items = items;
    }

    /**
     * Makes a complete graph form its edges
     * @precondtion edges between items mustform a complete 
     * graph between all the items 
     * @throws if preconditons are violated 
     * @param edges 
     * @param items 
     */
    static from_edges<T>(edges: Edge[], items: T[]): CompleteGraph<T> {
        const weight_matrix: number[][] = [];
        const matrix_side_length = items.length;
        for (const { node1, node2, weight } of edges) {
            if (weight_matrix[node1] === undefined) {
                weight_matrix[node1] = Array(matrix_side_length);
            }
            if (weight_matrix[node2] === undefined) {
                weight_matrix[node2] = Array(matrix_side_length);
            }
            weight_matrix[node1][node2] = weight;
            weight_matrix[node2][node1] = weight;
        }

        for (const row of weight_matrix) {
            for (const slot of row) {
                if (slot === undefined) {
                    throw new Error("A complete graph needs edges between every pair of nodes");
                }
            }
        }

        const matrix = SquareMatrix.from_2d_array(weight_matrix);
        return new CompleteGraph(matrix, items);
    }
    /**
     * Gets all nodes in the graph
     */
    all_nodes(): number[] {
        return [...this.items.keys()];
    }
    /**
     * Gets the number of nodes in the graph
     */
    size(): number {
        return this.items.length;
    }

    /**
     * Get the weight a edge descibed by two nodes
     * @param node1 {Node} one end of the edge
     * @param node2 {Node} the other end of the edge
     * @returns {number} the weight of the edge 
     */
    weight_between(node1: Node, node2: Node): number {
        //needs fixing if we start to use a directed graph
        return this.weight_matrix.get(node1, node2);
    }

    /**
     * Gets all edges connected to `node`
     * @param node {number} 
     * @returns {Edge[]} Edges from `node` where `Edge.node1` is same as `node` and the other node is in `Edge.node2` 
     */
    edges_from(node: Node): Edge[] {
        const out: Edge[] = [];
        for (let other_node = 0; other_node < this.size(); other_node++) {
            if (other_node !== node) {
                const weight = this.weight_between(node, other_node);
                const edge = {
                    node1: node,
                    node2: other_node,
                    weight
                };
                out.push(edge);
            }
        }

        return out;
    }

    /**
     * Gets all nodes connected via an edge to `node` 
     * @param node {Node} the node in question
     * @returns 
     */
    nodes_connected_to(node: Node): Node[] {
        // This is a complete graph so all nodes except `node`
        return this.all_nodes().filter(graph_node => graph_node !== node);
    }

    /**
     * Finds the index of first item matching the `predicate`
     * @param predicate {function} a function that decides if the item is found
     */
    find_index(predicate: (item: T) => boolean): number | undefined {
        const index = this.items.findIndex(predicate);
        return index !== -1 ? index : undefined;
    }

    /**
     * Makes a new subgraph containing 
     * all the nodes matching `predicate`
     * 
     * **NOTE:** Indcies into the previous graph aren't preserved 
     * and certanly wrong
     * 
     * @param predicate {function} Predicate deciding if the 
     * node is to be put in the subgraph
     */
    subgraph(predicate: (node: Node) => boolean): CompleteGraph<T> {
        const kept_nodes = this.all_nodes().filter(predicate);
        const out: Node[][] = [];
        for (let out_row = 0; out_row < kept_nodes.length; out_row++) {
            out[out_row] = [];
            for (let out_col = 0; out_col < kept_nodes.length; out_col++) {
                const prev_row = kept_nodes[out_row];
                const prev_col = kept_nodes[out_col];
                out[out_row][out_col] = this.weight_matrix.get(prev_row, prev_col);
            }
        }

        const kept_items = kept_nodes.map(node => this.items[node]);
        return new CompleteGraph(SquareMatrix.from_2d_array(out), kept_items)
    }
}
