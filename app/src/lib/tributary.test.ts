describe("fromStroops", () => {
    it("converts 7-decimal token correctly", () => {
      expect(fromStroops(10_000_000n, 7)).toBe("1");
      expect(fromStroops(5_000_000n, 7)).toBe("0.5");
      expect(fromStroops(12_345_678n, 7)).toBe("1.2345678");
      expect(fromStroops(1n, 7)).toBe("0.0000001");
    });

    it("converts 6-decimal token correctly", () => {
      expect(fromStroops(1_000_000n, 6)).toBe("1");
      expect(fromStroops(500_000n, 6)).toBe("0.5");
      expect(fromStroops(1_234_567n, 6)).toBe("1.234567");
      expect(fromStroops(1n, 6)).toBe("0.000001");
    });

    it("converts 18-decimal token correctly", () => {
      expect(fromStroops(1_000_000_000_000_000_000n, 18)).toBe("1");
      expect(fromStroops(500_000_000_000_000_000n, 18)).toBe("0.5");
      expect(fromStroops(1n, 18)).toBe("0.000000000000000001");
    });

    it("handles zero", () => {
      expect(fromStroops(0n, 7)).toBe("0");
      expect(fromStroops(0n, 6)).toBe("0");
    });

    it("defaults to 7 decimals", () => {
      expect(fromStroops(10_000_000n)).toBe("1");
      expect(fromStroops(5_000_000n)).toBe("0.5");
    });
  });

  describe("round-trip conversion", () => {
    it("round-trips 7-decimal token correctly", () => {
      const original = "1.234567";
      const stroops = toStroops(original, 7);
      const back = fromStroops(stroops, 7);
      expect(back).toBe("1.234567");
    });

    it("round-trips 6-decimal token correctly", () => {
      const original = "1.234567";
      const stroops = toStroops(original, 6);
      const back = fromStroops(stroops, 6);
      expect(back).toBe("1.234567");
    });

    it("round-trips 18-decimal token correctly", () => {
      const original = "1.234567890123456789";
      const stroops = toStroops(original, 18);
      const back = fromStroops(stroops, 18);
      expect(back).toBe("1.234567890123456789");
    });

    it("round-trips USDC (6 decimals) correctly", () => {
      const original = "100.50";
      const stroops = toStroops(original, 6);
      expect(stroops).toBe(100_500_000n);
      const back = fromStroops(stroops, 6);
      expect(back).toBe("100.5");
    });

    it("round-trips XLM (7 decimals) correctly", () => {
      const original = "100.50";
      const stroops = toStroops(original, 7);
      expect(stroops).toBe(1_005_000_000n);
      const back = fromStroops(stroops, 7);
      expect(back).toBe("100.5");
    });
  });
});