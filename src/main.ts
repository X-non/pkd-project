import { get_arguments, print_paths } from "./cli"
import { all_nations, select_nations, get_matrix, set_cache } from "./nation";
import { find_short_path } from "./tsp/utils";
import * as dotenv from 'dotenv'


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

function main() {
    const passed_arguments = get_arguments();

    const selected = select_nations(all_nations(), passed_arguments.nations);

    const path = find_short_path(selected, passed_arguments.algoritm);

    const between_group_offset = Math.trunc(passed_arguments.nations.length / passed_arguments.groups);

    const group_paths: number[][] = [];
    for (let group_n = 0; group_n < passed_arguments.groups; group_n++) {
        const group_path = rotate(path, between_group_offset * group_n);
        group_paths.push(group_path);
    }

    print_paths(selected, group_paths);
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