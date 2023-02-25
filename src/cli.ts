import yargs from "yargs/yargs"
import { hideBin } from "yargs/helpers"
import { group } from "yargs";
enum NationName {
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

type CLIArguments = {
    nations: NationName[],
    algoritm: string,
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

//TODO Move this to some better place
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
            choices: ["naive"],
            default: "naive" //TODO: Choose the "best" by default
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

