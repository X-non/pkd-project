import { get_arguments, print_paths } from "./cli"
import { all_nations, select_nations } from "./nation";
import { find_short_path, Algoritm } from "./tsp/utils";

const passed_arguments = get_arguments();

const selected = select_nations(all_nations(), passed_arguments.nations);

const path = find_short_path(selected, passed_arguments.algoritm);

print_paths(selected, [path])