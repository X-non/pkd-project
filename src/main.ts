import { get_arguments, print_paths } from "./cli"
import { all_nations, select_nations, get_matrix, set_cache } from "./nation";
import { find_short_path } from "./tsp/utils";
import {selfish_selection, cycle_selection} from "./options"
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
    let include: Array<number> = [];

    if(passed_arguments.include !== undefined){
        const include_nations = passed_arguments.include.map(name =>  selected.items.find(nation => nation.name === name))
        include = include_nations.map( nation =>
            nation !== undefined
            ? selected.items.indexOf(nation)
            : -1
        );
    }

    const selfish = selfish_selection(selected, passed_arguments.slots, passed_arguments.groups, passed_arguments.end, include);

    const cyclic = cycle_selection(selected, passed_arguments.slots, passed_arguments.groups, passed_arguments.end, include);

    console.log("selfish");
    print_paths(selected, selfish);

    console.log("cyclic")
    print_paths(selected, cyclic);


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