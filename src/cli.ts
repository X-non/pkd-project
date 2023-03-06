import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { coerce, group } from "yargs";
import { get_nation_name, NationGraph, NationName } from "./nation";
import { Algoritm } from "./tsp/utils";


type CLIArguments = {
    nations: NationName[],
    algoritm: Algoritm,
    groups: number,
    slots: number,
    include: NationName[] | undefined,
    end: number,
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
        .option("slots", {
            alias: "s",
            default: 1,
            coerce: (argument) => {
                const result = parseInt(argument, 10);
                if (Number.isNaN(result)) {
                    throw new Error(`Argument can't be parsed as a integer. Argument was '${argument}'`)
                }
                return result;
            },
        })
        .option("end", {
            alias: "e",
            default: 0,
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
        .array("include")
        .coerce("include", validate_nation_names)
        .alias("i", "include")
        .alias("n", "nations")
        .demandOption("nations");


    const parsed = argv.parseSync();
    return {
        nations: parsed.nations,
        algoritm: parsed.algoritm,
        groups: parsed.groups,
        slots: parsed.slots,
        include: parsed.include,
        end: parsed.end
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

    const num_groups = group_paths.length;
    const header = [...Array(num_groups).keys()].map(n => `Group ${n + 1}`);
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

    const separator = " │ ";
    console.log(header.map(pad_to_right_length).join(separator))

    console.log(Array(num_groups).fill("─".repeat(padding_length)).join("─┼─"));

    for (const row of rows) {
        console.log(row.join(separator))
    }
}