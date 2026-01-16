import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/core/ValueObject";

type WordTextProps = { value: string };

export class WordText extends ValueObject<WordTextProps> {
  public static readonly MAX_LENGTH = 20;

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
    if (value.length > WordText.MAX_LENGTH) {
      return Result.fail(`Word text is too long (max ${WordText.MAX_LENGTH} characters)`);
    }
    return Result.ok(new WordText({ value }));
  }
}

