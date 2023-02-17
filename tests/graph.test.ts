import { CompleteGraph } from "../src/graph"

describe("Throws when the graph is invalid", () => {
    test.each([
        { matrix: [[1]], items: ["hello", "hi"] },
        { matrix: [], items: ["thing"] }
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
        const matrix: number[][] = [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ];
        expect(() => new CompleteGraph(matrix, items)).toThrow();
    })
})
