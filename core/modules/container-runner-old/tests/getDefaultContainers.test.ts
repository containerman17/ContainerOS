import assert from "assert";
import getDefaultContainers from "../getDefaultContainers";

describe("Default containers getter", () => {
    it("should return at least consul", async () => {
        const containers = await getDefaultContainers()
        assert(containers.length > 0)

        let hasConsul = false
        for (let container of containers) {
            if (container.name === 'consul') {
                hasConsul = true
            }
        }
        assert(hasConsul)
    });
});