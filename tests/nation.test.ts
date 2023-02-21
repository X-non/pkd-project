import { select_nations, all_nations } from "../src/nation";

test("Can only select some graphs", () => {

    const selected = select_nations(all_nations(), ["Stockholm", "V-dala"]);
    expect(selected).toContainEqual({ name: "Stockholm" })
    expect(selected).toContainEqual({ name: "V-dala" })
}) 