import { tsp_naive } from "../src/tsp/bruteforce";
import { tsp_held_karp } from "../src/tsp/held_karp";
import { CompleteGraph, SquareMatrix } from "../src/graph";

describe.each([
    tsp_naive,
    tsp_held_karp,
])("All tsp solvers", (tsp_function) => {
    test.each([
        {
            matrix: SquareMatrix.from_2d_array([
                [0, 2],
                [1, 0],
            ]),
            items: ["hi", "hello"]
        },
        {
            matrix: SquareMatrix.from_2d_array([
                [0, 1, 2],
                [1, 0, 2],
                [1, 5, 0],
            ]),
            items: ["hi", "hello", "Woow"]
        }

    ])(`Returned path from ${tsp_function.name}() is same length as input`, ({ matrix, items }) => {
        const graph = new CompleteGraph(matrix, items);
        const all_nodes = graph.all_nodes().sort();
        const path = tsp_function(graph);

        expect(path.sort()).toEqual(all_nodes);
    })
})