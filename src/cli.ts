import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { coerce, group } from "yargs";
import { NationGraph, NationName } from "./nation";
import { Algoritm } from "./tsp/utils";


type CLIArguments = {
    nations: NationName[],
    algoritm: Algoritm,
    groups: number,
}

function get_nation_name(name: string): NationName | undefined {

    switch (name.toLowerCase()) {

        case "gotlands":
            return NationName.Gotlands;

        case "gh":
        case "gästrike-hälsing":
            return NationName.Gästrike_Hälsing;

        case "gbg":
        case "göteborgs":
            return NationName.Göteborgs;

        case "kalmar":
            return NationName.Kalmar;

        case "norrlands":
            return NationName.Norrlands;

        case "smålands":
            return NationName.Smålands;

        case "stocken":
        case "stockholms":
            return NationName.Stockholms;

        case "snerkes":
        case "södermanlands-nerikes":
            return NationName.Södermanlands_Nerikes;

        case "uplands":
            return NationName.Uplands;

        case "värmlands":
            return NationName.Värmlands;

        case "västgöta":
            return NationName.Västgöta;

        case "v-dala":
        case "västmanlands-dala":
            return NationName.Västmanlands_Dala;

        case "östgöta":
            return NationName.Östgöta;

        default:
            return undefined;
    }
}

function validate_nation_names(nations: string[]): NationName[] {
    //TODO: mabye report all errors
    const out: NationName[] = [];
    for (const nation of nations) {
        const name = get_nation_name(nation)
        if (name === undefined) {
            throw new Error(`Error: '${nation}' is not the name of a nation`);
        }
        out.push(name);
    }
    return out;
}

export function get_arguments(): CLIArguments {
    //TODO add som proper agrument parsing

    const argv = yargs(hideBin(process.argv), "BLÄÄÄ")
        .scriptName("boring-name")
        .option("algoritm", {
            alias: ["a"],
            choices: ["naive", "naive-memo"],
            default: "naive", //TODO: Choose the "best" by default
            coerce: (algoritm) => {
                switch (algoritm) {
                    case "naive": return Algoritm.Naive;
                    case "naive-memo": return Algoritm.NaiveMemo;
                    default: throw new Error(`${algoritm} is not an algorithm`);
                }
            }
        })
        .option("groups", {
            alias: "g",
            default: 1,
            coerce: (argument) => {
                const result = parseInt(argument, 10);
                if (Number.isNaN(result)) {
                    throw new Error(`Argument can't be parsed as a integer. Argument was '${argument}'`)
                }
                return result;
            },
        })
        .array("nations")
        .coerce("nations", validate_nation_names)
        .alias("n", "nations")
        .demandOption("nations");


    const parsed = argv.parseSync();
    return {
        nations: parsed.nations,
        algoritm: parsed.algoritm,
        groups: parsed.groups,
    }
}

function length_of_longest_name(graph: NationGraph): number {
    let longest = -Infinity;

    for (const nation of graph.items) {
        longest = Math.max(longest, nation.name.length);
    }

    return longest;
}

export function print_paths(graph: NationGraph, group_paths: number[][]) {

    const header = [...Array(group_paths.length).keys()].map(n => `Group ${n + 1}`);
    const padding_length = length_of_longest_name(graph);
    const pad_to_right_length = (text: string) => text.padEnd(padding_length);

    const rows: string[][] = [];
    for (const group_path of group_paths) {
        const names = group_path.map(j => graph.items[j].name);
        for (let i = 0; i < graph.size(); i++) {
            if (rows[i] === undefined) {
                rows[i] = [];
            }

            rows[i].push(pad_to_right_length(names[i]));
        }
    }

    console.log(header.map(pad_to_right_length).join(" "))
    for (const row of rows) {
        console.log(row.join(" "))
    }
}