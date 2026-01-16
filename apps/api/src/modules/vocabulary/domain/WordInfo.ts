import { Result } from "../../../shared/core/Result";
import { ValueObject } from "../../../shared/core/ValueObject";

export type WordInfoProps = {
  definition: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
};

export class WordInfo extends ValueObject<WordInfoProps> {
  private constructor(props: WordInfoProps) {
    super(props);
  }

  get definition(): string {
    return this.props.definition;
  }

  get partOfSpeech(): string | null {
    return this.props.partOfSpeech ?? null;
  }

  get phonetic(): string | null {
    return this.props.phonetic ?? null;
  }

  public static create(props: WordInfoProps): Result<WordInfo> {
    const definition = props.definition?.trim();
    if (!definition) return Result.fail("Definition is required");
    return Result.ok(
      new WordInfo({
        definition,
        partOfSpeech: props.partOfSpeech?.trim() || null,
        phonetic: props.phonetic?.trim() || null
      })
    );
  }
}

