import { describe, it, expect } from "vitest";
import { toStroops, fromStroops, ConversionError } from "./tributary";

describe("Token conversion functions", () => {
  describe("toStroops", () => {
    it("converts 7-decimal token correctly", () => {
      expect(toStroops("1", 7)).toBe(10_000_000n);
      expect(toStroops("0.5", 7)).toBe(5_000_000n);
      expect(toStroops("1.2345678", 7)).toBe(12_345_678n);
      expect(toStroops("0.0000001", 7)).toBe(1n);
    });

    it("converts 6-decimal token correctly", () => {
      expect(toStroops("1", 6)).toBe(1_000_000n);
      expect(toStroops("0.5", 6)).toBe(500_000n);
      expect(toStroops("1.234567", 6)).toBe(1_234_567n);
      expect(toStroops("0.000001", 6)).toBe(1n);
    });

    it("converts 18-decimal token correctly", () => {
      expect(toStroops("1", 18)).toBe(1_000_000_000_000_000_000n);
      expect(toStroops("0.5", 18)).toBe(500_000_000_000_000_000n);
      expect(toStroops("0.000000000000000001", 18)).toBe(1n);
    });

    it("handles zero", () => {
      expect(toStroops("0", 7)).toBe(0n);
      expect(toStroops("0", 6)).toBe(0n);
    });

    it("defaults to 7 decimals", () => {
      expect(toStroops("1")).toBe(10_000_000n);
      expect(toStroops("0.5")).toBe(5_000_000n);
    });

    it("handles padding correctly", () => {
      expect(toStroops("1.5", 7)).toBe(15_000_000n);
      expect(toStroops("1.50", 7)).toBe(15_000_000n);
      expect(toStroops("1.500", 7)).toBe(15_000_000n);
    });

    it("truncates excess decimals (7 decimal places max)", () => {
      expect(toStroops("1.12345678")).toBe(11_234_567n);
    });

    it("handles leading decimal point", () => {
      expect(toStroops(".5")).toBe(5_000_000n);
    });

    it("handles trailing decimal point", () => {
      expect(toStroops("5.")).toBe(50_000_000n);
    });

    it("rejects empty string", () => {
      expect(() => toStroops("")).toThrow(ConversionError);
    });

    it("rejects scientific notation (e.g. 1e5)", () => {
      expect(() => toStroops("1e5")).toThrow(ConversionError);
      expect(() => toStroops("1e-5")).toThrow(ConversionError);
    });

    it("rejects negative numbers", () => {
      expect(() => toStroops("-5")).toThrow(ConversionError);
      expect(() => toStroops("-0.5")).toThrow(ConversionError);
    });

    it("rejects multiple decimal points", () => {
      expect(() => toStroops("1.2.3")).toThrow(ConversionError);
    });

    it("rejects non-numeric strings", () => {
      expect(() => toStroops("abc")).toThrow(ConversionError);
    });

    it("rejects bare decimal point", () => {
      expect(() => toStroops(".")).toThrow(ConversionError);
    });
  });

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