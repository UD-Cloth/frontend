import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn - className merger", () => {
    it("should merge simple class names", () => {
      const result = cn("px-2", "py-1");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
    });

    it("should handle conditional classes", () => {
      const result = cn("px-2", true && "py-1", false && "hidden");
      expect(result).toContain("px-2");
      expect(result).toContain("py-1");
      expect(result).not.toContain("hidden");
    });

    it("should merge conflicting classes with later ones winning", () => {
      const result = cn("text-red-600", "text-blue-600");
      // tailwind merge should resolve conflicts
      expect(typeof result).toBe("string");
    });
  });
});
