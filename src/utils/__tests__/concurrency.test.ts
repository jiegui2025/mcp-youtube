import { mapWithConcurrency } from "../concurrency";

describe("mapWithConcurrency", () => {
  it("preserves result order and limits concurrent operations", async () => {
    let active = 0;
    let peakActive = 0;

    const results = await mapWithConcurrency(
      [0, 1, 2, 3, 4, 5],
      async (value) => {
        active++;
        peakActive = Math.max(peakActive, active);
        await new Promise((resolve) =>
          setTimeout(resolve, value % 2 === 0 ? 5 : 1)
        );
        active--;
        return value * 2;
      },
      2
    );

    expect(results).toEqual([0, 2, 4, 6, 8, 10]);
    expect(peakActive).toBe(2);
  });

  it("handles an empty input array", async () => {
    const mapper = jest.fn();
    await expect(mapWithConcurrency([], mapper)).resolves.toEqual([]);
    expect(mapper).not.toHaveBeenCalled();
  });

  it("rejects invalid concurrency values", async () => {
    await expect(
      mapWithConcurrency([1], async (value) => value, 0)
    ).rejects.toThrow("Concurrency must be a positive integer.");
    await expect(
      mapWithConcurrency([1], async (value) => value, 1.5)
    ).rejects.toThrow("Concurrency must be a positive integer.");
  });
});
