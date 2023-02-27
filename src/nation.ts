import { CompleteGraph, Edge } from "./graph"

export type Nation = {
    name: NationName,
}
export type NationGraph = CompleteGraph<Nation>;
export enum NationName {
    Gotlands = "Gotlands",
    Gästrike_Hälsing = "Gästrike-Hälsing",
    Göteborgs = "Göteborgs",
    Kalmar = "Kalmar",
    Norrlands = "Norrlands",
    Smålands = "Smålands",
    Stockholms = "Stockholms",
    Södermanlands_Nerikes = "Södermanlands-Nerikes",
    Uplands = "Uplands",
    Värmlands = "Värmlands",
    Västgöta = "Västgöta",
    Västmanlands_Dala = "Västmanlands-Dala",
    Östgöta = "Östgöta",
}
const all_nation_names = [
    NationName.Gotlands,
    NationName.Gästrike_Hälsing,
    NationName.Göteborgs,
    NationName.Kalmar,
    NationName.Norrlands,
    NationName.Smålands,
    NationName.Stockholms,
    NationName.Södermanlands_Nerikes,
    NationName.Uplands,
    NationName.Värmlands,
    NationName.Västgöta,
    NationName.Västmanlands_Dala,
    NationName.Östgöta,
];
export function all_nations(): NationGraph {
    //TODO actually implemnet the correct thingy
    const nations: Nation[] = all_nation_names.map(name => { return { name } });

    let random_edges: Edge[] = [];
    for (let node1 = 0; node1 < nations.length; node1++) {
        for (let node2 = 0; node2 < nations.length; node2++) {
            if (node1 !== node2) {
                random_edges.push({ node1, node2, weight: 100 });
            } else {
                random_edges.push({ node1, node2, weight: 0 });
            }
        }
    }
    return CompleteGraph.from_edges(random_edges, nations);
}

export function select_nations(nations: NationGraph, nation_names: NationName[]): NationGraph {
    return nations.subgraph(node => nation_names.includes(nations.items[node].name));
}