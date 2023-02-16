type WeightedEdge = { node1: number, node2: number, weight: number };

class CompleteGraph {
    weighted_adjacency_matrix: number[][];
    constructor(edges: WeightedEdge[]) {
        const matrix: number[][] = [];
        for (const { node1, node2, weight } of edges) {
            if (matrix[node1] === undefined) {
                matrix[node1] = [];
            }
            if (matrix[node2] === undefined) {
                matrix[node2] = [];
            }
            matrix[node1][node2] = weight;
            matrix[node2][node1] = weight;
        }
        if (matrix.every(row => row.every(element => element !== undefined))) {
            throw new Error("A complete graph needs a edge between all pair of nodes")
        }
        this.weighted_adjacency_matrix = matrix;
    }
}
