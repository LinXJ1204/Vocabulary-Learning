import { describe, expect, it } from "vitest";
import { Email } from "./Email";
import { User } from "./User";

describe("Identity Domain - Email", () => {
  it("rejects empty email", () => {
    const res = Email.create("");
    expect(res.isFailure).toBe(true);
  });

  it("normalizes email", () => {
    const res = Email.create("  Foo@Example.com ");
    expect(res.isSuccess).toBe(true);
    expect(res.getValue().value).toBe("foo@example.com");
  });
});

describe("Identity Domain - User", () => {
  it("creates with default role=user", () => {
    const res = User.create({ email: "a@b.com" });
    expect(res.isSuccess).toBe(true);
    expect(res.getValue().role).toBe("user");
  });

  it("can link google account", () => {
    const res = User.create({ email: "a@b.com" });
    const user = res.getValue();

    const link = user.linkGoogleAccount("gid_123");
    expect(link.isSuccess).toBe(true);
    expect(user.googleId).toBe("gid_123");
  });

  it("rejects empty googleId", () => {
    const res = User.create({ email: "a@b.com" });
    const user = res.getValue();
    const link = user.linkGoogleAccount("   ");
    expect(link.isFailure).toBe(true);
  });
});

