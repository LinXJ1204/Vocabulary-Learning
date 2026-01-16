import { describe, expect, it } from "vitest";
import { Word } from "./Word";

describe("Vocabulary Domain - Word", () => {
  it("rejects empty word text", () => {
    const res = Word.create({
      userId: "u1",
      text: "",
      info: { definition: "def" }
    });
    expect(res.isFailure).toBe(true);
  });

  it("creates a word with default stats", () => {
    const res = Word.create({
      userId: "u1",
      text: "hello",
      info: { definition: "a greeting" }
    });
    expect(res.isSuccess).toBe(true);
    const word = res.getValue();
    expect(word.text).toBe("hello");
    expect(word.stats.reviewCount).toBe(0);
    expect(word.stats.nextReviewDate).toBe(null);
  });

  it("adds and removes examples", () => {
    const word = Word.create({
      userId: "u1",
      text: "hello",
      info: { definition: "a greeting" }
    }).getValue();

    const add = word.addExample("Hello, world!", "哈囉，世界！");
    expect(add.isSuccess).toBe(true);
    expect(word.examples.length).toBe(1);

    const exId = add.getValue().id;
    const rm = word.removeExampleById(exId);
    expect(rm.isSuccess).toBe(true);
    expect(word.examples.length).toBe(0);
  });

  it("records review and schedules next date", () => {
    const word = Word.create({
      userId: "u1",
      text: "hello",
      info: { definition: "a greeting" }
    }).getValue();

    const now = new Date("2026-01-01T00:00:00.000Z");
    const r1 = word.recordReview(now);
    expect(r1.isSuccess).toBe(true);
    expect(word.stats.reviewCount).toBe(1);
    expect(word.stats.nextReviewDate?.toISOString()).toBe(
      "2026-01-02T00:00:00.000Z"
    );
  });
});

