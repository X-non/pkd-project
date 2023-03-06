import { array } from "yargs";
import { select_nations, all_nations, NationName, set_cache, all_nation_names } from "../src/nation";
beforeAll(() => set_cache(
    {
        items: all_nation_names,
        matrix: Array(13).fill(Array(13).fill(0)),
    }
))

test("Can only select some graphs", () => {

    const selected = select_nations(all_nations(), [NationName.Stockholms, NationName.Västmanlands_Dala]);
    expect(selected.items).toContainEqual({ slots: [], name: NationName.Stockholms })
    expect(selected.items).toContainEqual({ slots: [], name: NationName.Västmanlands_Dala })
}) 