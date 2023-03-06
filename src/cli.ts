import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { coerce, group } from "yargs";
import { get_nation_name, NationGraph, NationName } from "./nation";
import { Algoritm } from "./tsp/utils";


export type CLIArguments = {
    nations: NationName[],
    algoritm: Algoritm,
    groups: number,
    slots: number,
    include: NationName[] | undefined,
    end: NationName | undefined,
}

/**
 * Checks all the names can be turned into NationName, throws otherwise 
 * @param nations the words to be checked
 * @returns The converted names
 */
function validate_nation_names(nations: string[]): NationName[] {
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
/**
 * Parses and checks if the parsed number is greater than 0, otherwise throws
 * @param text text to be parsed 
 * @returns a positve natural number
 */
function validates_postive_natural(text: string): number {
    const result = parseInt(text, 10);
    if (Number.isNaN(result)) {
        throw new Error(`Argument can't be parsed as a integer. Argument was '${text}'`)
    } else if (result < 1) {
        throw new Error(`Argument ${result} is less than one`);
    } else {
        return result;
    }

}

/**
 * Reads and parses the command line arguments
 * @returns the arguments passed from the commandline 
 */
export function get_arguments(): CLIArguments {
    //TODO add som proper agrument parsing

    const argv = yargs(hideBin(process.argv))
        .scriptName("pubrunda-name")
        .option("algoritm", {
            alias: ["a"],
            choices: ["naive", "naive-memo", "cyclic", "selfish"],
            default: Algoritm.Cyclic,
            coerce: (algoritm) => {
                switch (algoritm) {
                    case "naive": return Algoritm.Naive;
                    case "naive-memo": return Algoritm.NaiveMemo;
                    case "cyclic": return Algoritm.Cyclic;
                    case "selfish": return Algoritm.Selfish;
                    default: throw new Error(`${algoritm} is not an algorithm`);
                }
            }
        })
        .option("groups", {
            alias: "g",
            default: 1,
            coerce: validates_postive_natural,
        })
        .describe("groups", "Number of groups")
        .option("slots", {
            alias: "s",
            default: 1,
            coerce: validates_postive_natural,
        })
        .describe("slots", "Number of nations each group visits")
        .option("end", {
            alias: "e",
            coerce: (argument) => {
                const name = get_nation_name(argument);
                if (name === undefined) {
                    throw new Error("Endpoint needs to be a nation");
                }
                return name;
            },
        })
        .describe("end", "The nation you want to end up on")
        .array("nations")
        .coerce("nations", validate_nation_names)
        .describe("nations", "A list of the nations want to select from")
        .array("include")
        .describe("include", "The nations you must visit")
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
        for (let i = 0; i < names.length; i++) {
            if (rows[i] === undefined) {
                rows[i] = [];
            }

            rows[i].push(pad_to_right_length(names[i] ?? "ERROR"));
        }
    }

    const separator = " │ ";
    console.log(header.map(pad_to_right_length).join(separator))

    console.log(Array(num_groups).fill("─".repeat(padding_length)).join("─┼─"));

    for (const row of rows) {
        console.log(row.join(separator))
    }
}