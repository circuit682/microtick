import { describe, expect, it } from "vitest";

import { NetworkProfile } from "@domain";

describe("NetworkProfile", () => {
  describe("creation", () => {
    it("should create a valid network profile", () => {
      const profile = NetworkProfile.create({
        name: "Residential",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      expect(profile.name).toBe("Residential");
      expect(profile.downloadMbps).toBe(5);
      expect(profile.uploadMbps).toBe(2);
    });

    it("should trim the profile name", () => {
      const profile = NetworkProfile.create({
        name: "  Residential  ",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      expect(profile.name).toBe("Residential");
    });
  });

  describe("validation", () => {
    it("should reject an empty profile name", () => {
      expect(() =>
        NetworkProfile.create({
          name: "   ",
          downloadMbps: 5,
          uploadMbps: 2,
        }),
      ).toThrow();
    });

    it("should reject a zero download speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: 0,
          uploadMbps: 2,
        }),
      ).toThrow();
    });

    it("should reject a negative download speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: -1,
          uploadMbps: 2,
        }),
      ).toThrow();
    });

    it("should reject a non-finite download speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: Number.NaN,
          uploadMbps: 2,
        }),
      ).toThrow();
    });

    it("should reject a zero upload speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: 5,
          uploadMbps: 0,
        }),
      ).toThrow();
    });

    it("should reject a negative upload speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: 5,
          uploadMbps: -1,
        }),
      ).toThrow();
    });

    it("should reject a non-finite upload speed", () => {
      expect(() =>
        NetworkProfile.create({
          name: "Residential",
          downloadMbps: 5,
          uploadMbps: Number.NaN,
        }),
      ).toThrow();
    });
  });

  describe("equality", () => {
    it("should consider identical profiles equal", () => {
      const first = NetworkProfile.create({
        name: "Residential",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      const second = NetworkProfile.create({
        name: "Residential",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      expect(first.equals(second)).toBe(true);
    });

    it("should consider profiles with different speeds unequal", () => {
      const first = NetworkProfile.create({
        name: "Residential",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      const second = NetworkProfile.create({
        name: "Residential",
        downloadMbps: 10,
        uploadMbps: 5,
      });

      expect(first.equals(second)).toBe(false);
    });
  });

  describe("reconstitution", () => {
    it("should reconstitute an existing profile", () => {
      const profile = NetworkProfile.reconstitute({
        name: "Residential",
        downloadMbps: 5,
        uploadMbps: 2,
      });

      expect(profile.name).toBe("Residential");
      expect(profile.downloadMbps).toBe(5);
      expect(profile.uploadMbps).toBe(2);
    });
  });
});
