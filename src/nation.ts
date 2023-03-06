import { CompleteGraph, SquareMatrix } from "./graph"
import * as fs from "node:fs/promises"


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
export const all_nation_names = [
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
/**
 * Tries to parse a NationName from `name´
 * @param name a nations name or nickname 
 * @returns parsed NationName or undefined  
 */
export function get_nation_name(name: string): NationName | undefined {
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

export type Nation = {
    name: NationName,
    slots: Array<boolean>,
}
export type NationGraph = CompleteGraph<Nation>;

export function set_cache(graph: SerializedGraph) {
    all_nations_cache = graph;
}
let all_nations_cache: SerializedGraph | undefined;
export function get_cache(): SerializedGraph {
    if (all_nations_cache === undefined) {
        throw new Error("You must set the value of the cache before reading it");
    } else {
        return all_nations_cache;
    }
}



export function all_nations(): NationGraph {
    const serialized_graph = get_cache();
    const nations: Nation[] = serialized_graph.items.map(name => { return { name, slots: [] } });

    const matrix = SquareMatrix.from_2d_array(serialized_graph.matrix);
    return new CompleteGraph(matrix, nations);
}

export function select_nations(nations: NationGraph, nation_names: NationName[]): NationGraph {
    return nations.subgraph(node => nation_names.includes(nations.items[node].name));
}





//https://www.uu.se/utbildning/studera-i-uppsala/nationer/
const nation_street_address = {
    [NationName.Gotlands]: "Östra Ågatan 13",
    [NationName.Gästrike_Hälsing]: "Trädgårdsgatan 9",
    [NationName.Göteborgs]: "Sankt Larsgatan 7",
    [NationName.Kalmar]: "Svartmangatan 3",
    [NationName.Norrlands]: "Västra Ågatan 14",
    [NationName.Smålands]: "Sankt Larsgatan 5",
    [NationName.Stockholms]: "Drottninggatan 11",
    [NationName.Södermanlands_Nerikes]: "Sankt Olofsgatan 16",
    [NationName.Uplands]: "Sankt Larsgatan 11",
    [NationName.Värmlands]: "Ingmar Bergmansgatan 2",
    [NationName.Västgöta]: "Västra Ågatan 18",
    [NationName.Västmanlands_Dala]: "Sankt Larsgatan 13",
    [NationName.Östgöta]: "Trädgårdsgatan 15",
};

/**
* Takes the API key from the stored file dotenv and returns it
* @throws if API key does not exist
* @returns API key
*/
function get_api_key(): string {
    const api_key = process.env.OPEN_ROUTES_SERVICE;
    if (api_key === undefined) {
        throw new Error("You have no enviorment variable or variable in .env file called OPEN_ROUTES_SERVICE");
    }
    return api_key;
}

type Coordinate = { latitude: number, longitude: number };
export enum WalkMetric {
    Distance,
    Time,
}

/**
* Gets the location of a nation
* @param {NationName} nation_name name of the nation to get location of
* @precondition that there is a api_key file or that API key is saved
* @returns coordinates for nation
*/
export async function get_location(nation_name: NationName): Promise<Coordinate> {
    const search_text = `${nation_street_address[nation_name]}, Uppsala`;

    const api_url = new URL("https://api.openrouteservice.org/geocode/search");
    api_url.searchParams.set("api_key", get_api_key());
    api_url.searchParams.set("text", search_text);
    api_url.searchParams.set("boundary.country", "SWE");

    const responce = await fetch(api_url, {
        method: "GET",
        headers: {
            "accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        }
    });

    const responce_json = await responce.json();
    return extract_pos_from_geocode_responce(responce_json, nation_street_address[nation_name]);
}

export type SerializedGraph = { matrix: number[][], items: NationName[] };

/**
* Gets graph of nations from disk
* @param {string} path - path to to graph
* @returns graph of nations
*/
async function get_matrix_from_disk(path: string): Promise<SerializedGraph | undefined> {
    let file: fs.FileHandle;
    try {
        file = await fs.open(path, "r");
    } catch {
        return undefined;
    }

    const json = JSON.parse(await file.readFile({ encoding: "utf8" }));
    file.close();
    const matrix = json.matrix;
    const items = json.items;
    if (!is_2d_array_of_number(matrix)) {
        return undefined;
    }
    if (!is_string_array(items)) {
        return undefined;
    }
    if (matrix.length !== items.length) {
        return undefined;
    }
    const nation_names = items.map(get_nation_name);

    if (!nation_names.every(i => i !== undefined)) {
        return undefined;
    }

    return { matrix, items: nation_names as NationName[] }
}
/**
* Checks if param is a string array
* @param {any} items - param to be checked
* @returns true or false if param is a string array or not
*/
function is_string_array(items: any): items is string[] {
    if (Array.isArray(items)) {
        return items.every(item => typeof item === "string")
    } else {
        return false
    }
}

/**
* Checks if param is 2d array of numbers
* @param {any} matrix - matrix to be checked
* @returns true or false if matrix is a 2d array of numbers or not
*/
function is_2d_array_of_number(matrix: any): matrix is number[][] {
    if (!Array.isArray(matrix)) {
        return false;
    }

    if (!matrix.every(Array.isArray)) {
        return false;
    }

    for (const row of matrix) {
        for (const item of row) {
            if (typeof item !== "number") {
                return false;
            }
        }
    }
    return true;
}

export async function get_matrix(): Promise<SerializedGraph | undefined> {
    const cache_path = "./nations_matrix.json";
    const disc_matrix = await get_matrix_from_disk(cache_path);
    if (disc_matrix !== undefined) {
        return disc_matrix;
    } else if (process.env.OPEN_ROUTES_SERVICE !== undefined) {
        const data = await get_matrix_from_api();
        await save_graph(cache_path, data);
        return data;
    } else {
        return undefined;
    }
}

async function save_graph(path: string, graph: SerializedGraph) {
    const file = await fs.open(path, "w");
    await file.writeFile(JSON.stringify(graph), { "encoding": "utf8" });
    file.close();
}

async function get_matrix_from_api(): Promise<SerializedGraph> {
    const nations = all_nation_names;
    const nation_coordinates_promices = nations.map(get_location);
    const results = await Promise.all(nation_coordinates_promices);

    const responce = await call_matrix_api(results, WalkMetric.Distance);
    const data = await responce.json();
    const distances = data["distances"];
    if (!is_2d_array_of_number(distances)) {
        throw new Error("Missing 'distances' field the responce");
    }
    return { matrix: distances, items: nations };
}

async function call_matrix_api(coordinates: Coordinate[], metric: WalkMetric): Promise<Response> {
    const url = new URL("https://api.openrouteservice.org/v2/matrix/foot-walking")

    const distance_metric = metric === WalkMetric.Distance ? "distance" : "duration";
    const request_body = {
        locations: coordinates.map(({ longitude, latitude }) => [longitude, latitude]),
        metrics: [distance_metric],
        resolve_locations: true,
    }

    return fetch(url, {
        method: "POST",
        body: JSON.stringify(request_body),
        headers: {
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Authorization': get_api_key(),
            'Content-Type': 'application/json; charset=utf-8'
        }
    });
}

function extract_pos_from_geocode_responce(json: any, street_address: string): Coordinate {
    const features = json["features"] as any[];

    const extracted: (Coordinate & { name: string })[] = [];
    for (const feature of features) {
        const geometry = feature["geometry"];
        const coordinates = geometry["coordinates"]
        const properties = feature["properties"];

        if (Array.isArray(coordinates) && coordinates.length == 2 && geometry["type"] === "Point" && properties["locality"] === "Uppsala") {
            //POSTIOONS 3.1.1 https://www.rfc-editor.org/rfc/rfc7946#section-3.1.1
            const [longitude, latitude] = coordinates;
            const name = properties["name"];
            if (typeof longitude === "number" && typeof latitude === "number") {
                extracted.push({ longitude, latitude, name });
            }
        }
    }

    if (extracted.length === 1) {
        return extracted[0];
    } else {
        const result = extracted.find(coord => coord.name === street_address);
        if (result !== undefined) {
            return { longitude: result.longitude, latitude: result.latitude };
        } else {
            return extracted[0];
            // throw new Error(`Recived to many matches to the query, got ${JSON.stringify(coordinates)}`);
        }

    }
}

