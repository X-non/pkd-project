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
        const size_length = array.length;
        const data: T[] = [];

        if (size_length === 0) {
            return SquareMatrix.empty();
        }

        for (const row of array) {
            if (row.length !== size_length) {
                throw new Error("The rows of the array must be the same length as each other and amount of rows");
            }

            data.push(...row);
        }
        return new SquareMatrix(data, size_length)
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

    private data_index(row: number, column: number): number {
        return row + column * this.side_length
    }

    set(row: number, column: number, value: T) {
        this.data[this.data_index(row, column)] = value;
    }

    get(row: number, column: number): T {
        return this.data[this.data_index(row, column)];
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

    constructor(weight_matrix: SquareMatrix<Node>, items: T[]) {

        if (weight_matrix.side_length !== items.length) {
            throw new Error("The number of nodes and provided items don't match");
        }
        this.weight_matrix = weight_matrix;
        this.items = items;
    }

    /**
     * Makes a complete graph form its edges
     * @throws If the edges between items dont 
     * form a complete graph between all the items 
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
                weight_matrix[node2] = [matrix_side_length];
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
        // This is a complete graph so all nodes except `node`
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
        // this can mabye be done 
        // smarter by directly picking stuff from the matrix
        const kept = this.all_nodes().filter(predicate);
        const kept_items = kept.map(node => this.items[node]);
        // this probobly needs to be 
        // reworked if we add directed graphs.
        const kept_edges = kept.flatMap(node => this.edges_from(node))
        return CompleteGraph.from_edges(kept_edges, kept_items)
    }
}
