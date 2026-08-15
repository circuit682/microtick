import { describe, expect, it } from "vitest";

import { AuthenticationMethod, NetworkIdentity } from "@domain";

describe("NetworkIdentity", () => {
  const validIdentity = {
    id: "identity-1",
    customerId: "254712345678",
    username: "mt_customer_1",
    credential: "test-credential",
    authenticationMethod: AuthenticationMethod.HOTSPOT,
  };

  describe("creation", () => {
    it("should create a valid Hotspot network identity", () => {
      const identity = NetworkIdentity.create(validIdentity);

      expect(identity.id).toBe("identity-1");
      expect(identity.customerId).toBe("254712345678");
      expect(identity.username).toBe("mt_customer_1");
      expect(identity.credential).toBe("test-credential");
      expect(identity.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
    });

    it("should trim identity fields that represent identifiers", () => {
      const identity = NetworkIdentity.create({
        ...validIdentity,
        id: "  identity-1  ",
        customerId: " 254712345678 ",
        username: " mt_customer_1 ",
      });

      expect(identity.id).toBe("identity-1");
      expect(identity.customerId).toBe("254712345678");
      expect(identity.username).toBe("mt_customer_1");
    });
  });

  describe("validation", () => {
    it("should reject an empty id", () => {
      expect(() =>
        NetworkIdentity.create({
          ...validIdentity,
          id: "   ",
        }),
      ).toThrow();
    });

    it("should reject an empty customer id", () => {
      expect(() =>
        NetworkIdentity.create({
          ...validIdentity,
          customerId: "   ",
        }),
      ).toThrow();
    });

    it("should reject an empty username", () => {
      expect(() =>
        NetworkIdentity.create({
          ...validIdentity,
          username: "   ",
        }),
      ).toThrow();
    });

    it("should reject an empty credential", () => {
      expect(() =>
        NetworkIdentity.create({
          ...validIdentity,
          credential: "",
        }),
      ).toThrow();
    });
  });

  describe("reconstitution", () => {
    it("should reconstitute an existing identity", () => {
      const identity = NetworkIdentity.reconstitute(validIdentity);

      expect(identity.id).toBe(validIdentity.id);
      expect(identity.customerId).toBe(validIdentity.customerId);
      expect(identity.username).toBe(validIdentity.username);
      expect(identity.credential).toBe(validIdentity.credential);
      expect(identity.authenticationMethod).toBe(AuthenticationMethod.HOTSPOT);
    });
  });
});
