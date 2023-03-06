import { get_arguments, print_paths, CLIArguments } from "./cli"
import { all_nations, select_nations, get_matrix, set_cache, NationGraph, NationName } from "./nation";
import { Algoritm, find_short_path } from "./tsp/utils";
import { selfish_selection, cycle_selection } from "./options"
import * as dotenv from 'dotenv'
import { tsp_naive } from "./tsp/bruteforce";
import { nation_held_karp, tsp_held_karp } from "./tsp/held_karp";


//gets things from .env files and puts them in process.env
dotenv.config()

function rotate(path: number[], n: number): number[] {
    if (path.length === 0) {
        return [];
    }

    let copy = structuredClone(path);
    for (let i = 0; i < n; i++) {
        const last = copy.pop() as number;
        copy.unshift(last);
    }

    return copy;
}



/**
 * Kills the program with error message
 * intended for when the user makes invalid input but it's not a program bug
 * @param message the message to be displayed
 */
function exit_with_message(message: string): never {
    console.error(message);
    process.exit(1)
}

function main() {
    const passed_arguments = get_arguments();

    const selected = select_nations(all_nations(), passed_arguments.nations.concat(passed_arguments.end ?? []));
    let included: Array<number> = [];

    if (passed_arguments.include !== undefined) {
        const include_nations = passed_arguments.include.map(name => selected.items.find(nation => nation.name === name))
        included = include_nations.map(nation => {
            if (nation !== undefined) {
                return selected.items.indexOf(nation);
            } else {
                throw new Error("This shouldn't happen");
            }
        }
        );
    }

    if (passed_arguments.include !== undefined) {
        for (const included of passed_arguments.include) {
            if (!passed_arguments.nations.includes(included)) {
                exit_with_message(`${included} is not one of selected nations`);
            }
        }
    }

    if (passed_arguments.algoritm === Algoritm.NaiveMemo || passed_arguments.algoritm === Algoritm.Naive) {
        if (passed_arguments.groups > 1) {
            exit_with_message(`${Algoritm.NaiveMemo} and ${Algoritm.Naive} don't support multiple groups, try ${Algoritm.Cyclic} or ${Algoritm.Selfish}`);
        }
    }

    const endindex = selected.find_index(nation => nation.name === passed_arguments.end);
    if (endindex === undefined && passed_arguments.algoritm !== Algoritm.Naive) {
        exit_with_message(`The  ${passed_arguments.algoritm} algorithm needs --end to passed`);
    }
    const paths = run_algorithm(passed_arguments, selected, included, endindex);

    print_paths(selected, paths);
}
/**
 * Runs the specified algorithm returning the paths 
 * @param args the arguments form the cli 
 * @param selected the graph of selected nations
 * @param included the indices of the nations you must visit
 * @param endindex the index to end on 
 * @returns 
 */
function run_algorithm(args: CLIArguments, selected: NationGraph, included: number[], endindex: number | undefined): number[][] {

    //the functions don't count the endpoint
    const algo_slots = args.slots - 1;

    if (args.algoritm === Algoritm.Cyclic) {
        return cycle_selection(selected, algo_slots, args.groups, endindex as number, included);
    } else if (args.algoritm === Algoritm.Selfish) {
        return selfish_selection(selected, algo_slots, args.groups, endindex as number, included);
    } else if (Algoritm.NaiveMemo) {
        return [tsp_held_karp(selected, false, endindex as number)]
    } else if (args.algoritm === Algoritm.Naive) {
        return [tsp_naive(selected)];
    } else { throw new Error("This can't happen ") }
}

get_matrix()
    .then(graph => {
        if (graph === undefined) {
            throw new Error("The api did not respond")
        }
        set_cache(graph);
    }).catch(err => { throw err }).then((_) => {
        main();
    });