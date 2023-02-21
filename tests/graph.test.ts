import { CompleteGraph, SquareMatrix } from "../src/graph"
describe("SquareMatrix works as intended", () => {
    test("from_2d_array_works", () => {
        let array = [
            [0, 100, 100],
            [100, 0, 100],
            [100, 100, 0],
        ];

        let matrix = SquareMatrix.from_2d_array(array);
        for (let row_i = 0; row_i < array.length; row_i++) {
            const row = array[row_i];
            for (let col_i = 0; col_i < array.length; col_i++) {
                const cell = row[col_i];
                expect(matrix.get(row_i, col_i)).toEqual(cell);
            }
        }
    })
})

describe("Throws when the graph is invalid", () => {
    test.each([
        { matrix: SquareMatrix.from_2d_array([[1]]), items: ["hello", "hi"] },
        { matrix: SquareMatrix.empty<number>(), items: ["thing"] }
    ])("Constructing incomplete throws. Case %#", ({ matrix, items }) => {
        expect(() => new CompleteGraph(matrix, items)).toThrow()
    })

    test("Too many edges throws", () => {
        const e = (node1: number, node2: number) => { return { node1, node2, weight: 1 } };
        const items = ["foo", "bar", "baz",]
        const edges = [
            e(0, 1),
            e(0, 2),
            e(1, 2),

            //the extra
            e(0, 3),
            e(0, 5),
            e(3, 5),
        ];
        expect(() => CompleteGraph.from_edges(edges, items)).toThrow()
    })

    test("Too large matrix throws", () => {
        const items = ["foo", "bar", "baz", "beep"];
        expect(() =>
            SquareMatrix.from_2d_array([
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
                [1, 1, 1, 1],
            ])
        ).toThrow();
    })
})

describe("Subgraph creation", () => {
    test("Can get empty subgraphs", () => {
        const items = [0, 1, 2, 3];

        const matrix = SquareMatrix.from_2d_array([
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
            [1, 2, 3, 4],
        ]);

        const graph = new CompleteGraph(matrix, items);
        const empty_subgraph = graph.subgraph((_) => false);
        expect(empty_subgraph.size()).toBe(0);
        expect(empty_subgraph.weight_matrix).toEqual(SquareMatrix.empty());
    });
})