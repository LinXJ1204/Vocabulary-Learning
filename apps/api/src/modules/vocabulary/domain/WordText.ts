import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/core/ValueObject";

type WordTextProps = { value: string };

export class WordText extends ValueObject<WordTextProps> {
  private constructor(props: WordTextProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  /**
   * Normalization: trim + collapse whitespace.
   * (We do NOT force lowercase here; keep original casing for display.)
   */
  public static create(raw: string): Result<WordText> {
    const value = raw?.trim().replace(/\s+/g, " ");
    if (!value) return Result.fail("Word text is required");
    return Result.ok(new WordText({ value }));
  }
}

