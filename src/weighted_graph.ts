type WeightedEdge = { node1: number, node2: number, weight: number };

class WeightedGraph<T> {
    weighted_adjacency_matrix: number[][];
    items: T[];

    constructor(edges: WeightedEdge[], items: T[]) {
        this.items = items;
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

        this.weighted_adjacency_matrix = matrix;
    }

}
