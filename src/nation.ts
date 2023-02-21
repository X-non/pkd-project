import { CompleteGraph, Edge } from "./graph"

export type Nation = {
    name: string,
}
export type NationGraph = CompleteGraph<Nation>;

export function all_nations(): NationGraph {
    //TODO actually implemnet the correct thingy
    const nations: Nation[] = ["Uppland", "Stockholm", "Kalmar", "V-dala"].map(name => { return { name } });

    let random_edges: Edge[] = [];
    for (let node1 = 0; node1 < nations.length; node1++) {
        for (let node2 = 0; node2 < nations.length; node2++) {
            if (node1 !== node2) {
                random_edges.push({ node1, node2, weight: Math.random() * 100 });
            }
        }
    }
    return CompleteGraph.from_edges(random_edges, nations);
}

export function select_nations(nations: NationGraph, nation_names: string[]): NationGraph {
    return nations.subgraph(node => nation_names.includes(nations.items[node].name));
}