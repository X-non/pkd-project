import { select_nations, all_nations, NationName } from "../src/nation";

test("Can only select some graphs", () => {

    const selected = select_nations(all_nations(), [NationName.Stockholms, NationName.Västmanlands_Dala]);
    expect(selected.items).toContainEqual({ name: NationName.Stockholms })
    expect(selected.items).toContainEqual({ name: NationName.Västmanlands_Dala })
}) 